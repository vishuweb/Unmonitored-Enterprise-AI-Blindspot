import express, { Request, Response } from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { AggregatedMetrics, PolicyRule, ReviewQueueItem } from '../src/types';
import { RuntimePipeline } from '../src/engine/runtimePipeline';
import { ControlPlaneRepository } from './repository';
import { createConfiguredProvider } from './provider';

const app = express();
const PORT = Number(process.env.PORT || 3001);
const repository = new ControlPlaneRepository();
const provider = createConfiguredProvider();
const pipeline = new RuntimePipeline(provider);

app.use(cors());
app.use(express.json());

function calculateMetrics(): AggregatedMetrics {
  const events = repository.listEvents();
  const total = events.length;
  if (total === 0) {
    return {
      totalRequests: 0,
      allowedRequests: 0,
      blockedRequests: 0,
      editedRequests: 0,
      escalatedRequests: 0,
      blockRatePercent: 0,
      hallucinationRatePercent: 0,
      piiIncidentsCount: 0,
      promptInjectionAttempts: 0,
      policyViolationsCount: 0,
      avgLatencyMs: 0,
      totalTokensUsed: 0,
      estimatedSpendUSD: 0,
      costSavedUSD: 0,
      cacheHitRatePercent: 0
    };
  }

  const allowed = events.filter(event => event.decision === 'ALLOW').length;
  const blocked = events.filter(event => event.decision === 'BLOCK').length;
  const edited = events.filter(event => event.decision === 'EDIT').length;
  const escalated = events.filter(event => event.decision === 'ESCALATE').length;
  const hallucinations = events.filter(event => event.performance.hallucinationRisk > 40).length;
  const piiCount = events.reduce((sum, event) =>
    sum + (event.responsibility.piiDetected ? Math.max(event.responsibility.detectedEntities.length, 1) : 0), 0);
  const injectionCount = events.filter(event => event.responsibility.injectionDetected).length;
  const policyViolations = events.reduce((sum, event) => sum + event.triggeredPolicies.length, 0);
  const totalLatency = events.reduce((sum, event) => sum + event.latency.totalLatencyMs, 0);
  const totalTokens = events.reduce((sum, event) => sum + event.cost.totalTokens, 0);
  const totalSpend = events.reduce((sum, event) => sum + event.cost.estimatedCostWithControlPlane, 0);
  const totalSavings = events.reduce((sum, event) => sum + event.cost.savingsAmount, 0);
  const cacheHits = events.filter(event => event.cost.cacheHit).length;

  return {
    totalRequests: total,
    allowedRequests: allowed,
    blockedRequests: blocked,
    editedRequests: edited,
    escalatedRequests: escalated,
    blockRatePercent: Number(((blocked / total) * 100).toFixed(1)),
    hallucinationRatePercent: Number(((hallucinations / total) * 100).toFixed(1)),
    piiIncidentsCount: piiCount,
    promptInjectionAttempts: injectionCount,
    policyViolationsCount: policyViolations,
    avgLatencyMs: Number((totalLatency / total).toFixed(1)),
    totalTokensUsed: totalTokens,
    estimatedSpendUSD: Number(totalSpend.toFixed(4)),
    costSavedUSD: Number(totalSavings.toFixed(4)),
    cacheHitRatePercent: Number(((cacheHits / total) * 100).toFixed(1))
  };
}

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    version: '2.4.0',
    proxyEngine: 'ControlPlane.ai Inline Real-Time Governance',
    downstreamProvider: provider?.name || null,
    downstreamModel: provider?.model || null,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    activePoliciesCount: repository.listPolicies().filter(policy => policy.status === 'ACTIVE').length
  });
});

app.post('/api/proxy/evaluate', async (req: Request, res: Response) => {
  try {
    const { prompt, application, model } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required and must be a string' });
    }

    const event = await pipeline.execute(
      prompt,
      application || 'Customer-Facing Support Bot',
      model || 'GPT-4o (128K)',
      repository.listPolicies()
    );
    repository.insertEvent(event);

    if (event.decision === 'ESCALATE') {
      repository.insertReview({
        id: `rev_${event.id}`,
        runtimeEventId: event.id,
        requestId: event.requestId,
        timestamp: event.timestamp,
        application: event.application,
        user: event.user,
        model: event.model,
        riskScore: event.riskScore,
        triggeredPolicies: event.triggeredPolicies.map(policy => `${policy.name} (${policy.version})`),
        inputPrompt: event.rawInput,
        originalOutput: event.rawOutput,
        proposedRemediation: '[SAFETY REMEDIATION REQUIRED]: Output held by ControlPlane.ai runtime pending safety review.',
        evidence: event.decisionReason,
        status: 'PENDING'
      });
    }

    res.json({ success: true, event, metrics: calculateMetrics() });
  } catch (error) {
    console.error('Evaluation error:', error);
    const message = error instanceof Error ? error.message : 'Internal proxy evaluation error';
    res.status(502).json({ error: message });
  }
});

app.get('/api/policies', (_req: Request, res: Response) => {
  res.json(repository.listPolicies());
});

app.post('/api/policies', (req: Request, res: Response) => {
  const newPolicy: PolicyRule = req.body;
  if (!newPolicy.name || !newPolicy.action) {
    return res.status(400).json({ error: 'Invalid policy payload' });
  }
  const policy = {
    ...newPolicy,
    id: newPolicy.id || `pol-new-${Date.now()}`,
    updatedAt: new Date().toISOString().substring(0, 16) + ' UTC'
  };
  repository.createPolicy(policy);
  res.status(201).json(policy);
});

app.put('/api/policies/:id', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const updated = {
    ...(req.body as PolicyRule),
    id,
    updatedAt: new Date().toISOString().substring(0, 16) + ' UTC'
  };
  const saved = repository.updatePolicy(id, updated);
  if (!saved) return res.status(404).json({ error: 'Policy not found' });
  res.json(saved);
});

app.patch('/api/policies/:id/status', (req: Request, res: Response) => {
  const updated = repository.togglePolicyStatus(req.params.id as string);
  if (!updated) return res.status(404).json({ error: 'Policy not found' });
  res.json(updated);
});

app.get('/api/reviews', (_req: Request, res: Response) => {
  res.json(repository.listReviews());
});

app.post('/api/reviews/:id/action', (req: Request, res: Response) => {
  const { action, remediation, notes } = req.body as {
    action?: 'APPROVE' | 'REJECT' | 'EDIT';
    remediation?: string;
    notes?: string;
  };
  if (!action || !['APPROVE', 'REJECT', 'EDIT'].includes(action)) {
    return res.status(400).json({ error: 'Invalid review action' });
  }

  const existing = repository.listReviews().find(review => review.id === (req.params.id as string));
  if (!existing) return res.status(404).json({ error: 'Review item not found' });

  const timestamp = new Date().toISOString().substring(0, 19) + ' UTC';
  const reviewer = 'ciso-lead@acmecorp.internal';
  const reviewItem: ReviewQueueItem = {
    ...existing,
    status: action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'EDITED',
    proposedRemediation: remediation || existing.proposedRemediation,
    reviewer,
    reviewTimestamp: timestamp,
    reviewNotes: notes || `Resolved as ${action} by safety reviewer.`
  };
  repository.updateReview(reviewItem.id, reviewItem);

  const event = repository.listEvents().find(item => item.id === reviewItem.runtimeEventId);
  if (event) {
    repository.updateEvent(event.id, {
      decision: action === 'APPROVE' ? 'ALLOW' : action === 'REJECT' ? 'BLOCK' : 'EDIT',
      finalOutput: action === 'EDIT' && remediation ? remediation : event.finalOutput,
      reviewStatus: action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'EDITED_AND_RELEASED',
      reviewer,
      reviewTimestamp: timestamp,
      reviewNotes: notes || `Resolved as ${action}`
    });
  }

  res.json({ success: true, reviewItem, metrics: calculateMetrics() });
});

app.get('/api/events', (_req: Request, res: Response) => {
  res.json(repository.listEvents());
});

app.get('/api/events/export/json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=controlplane_audit_${Date.now()}.json`);
  res.send(JSON.stringify(repository.listEvents(), null, 2));
});

app.get('/api/events/export/csv', (_req: Request, res: Response) => {
  const headers = ['RequestID', 'Timestamp', 'Application', 'Model', 'Decision', 'RiskScore', 'InputSHA256', 'LatencyMs', 'SavingsUSD'];
  const rows = repository.listEvents().map(event => [
    event.requestId,
    event.timestamp,
    `"${event.application}"`,
    `"${event.model}"`,
    event.decision,
    event.riskScore,
    event.inputSha256,
    event.latency.totalLatencyMs,
    event.cost.savingsAmount
  ]);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=controlplane_audit_${Date.now()}.csv`);
  res.send([headers.join(','), ...rows.map(row => row.join(','))].join('\n'));
});

app.get('/api/metrics', (_req: Request, res: Response) => {
  res.json(calculateMetrics());
});

// Serve built React frontend in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = join(__dirname, '../dist');

if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[ControlPlane.ai] Runtime Gateway Server active on port ${PORT}${provider ? ` with ${provider.name} provider` : ' without a downstream provider'}`);
});
