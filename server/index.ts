import express, { Request, Response } from 'express';
import cors from 'cors';
import { 
  PolicyRule, 
  ReviewQueueItem, 
  RuntimeEvent, 
  TargetApplication, 
  TargetModel,
  GovernanceDecision,
  AggregatedMetrics 
} from '../src/types';
import { DEFAULT_POLICIES } from '../src/engine/defaultPolicies';
import { INITIAL_RUNTIME_EVENTS, INITIAL_REVIEW_ITEMS } from '../src/context/seedData';
import { RuntimePipeline } from '../src/engine/runtimePipeline';
import { SCENARIO_PRESETS } from '../src/engine/scenarios';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-Memory Persistent Store on Server
let policiesStore: PolicyRule[] = [...DEFAULT_POLICIES];
let runtimeEventsStore: RuntimeEvent[] = [...INITIAL_RUNTIME_EVENTS];
let reviewQueueStore: ReviewQueueItem[] = [...INITIAL_REVIEW_ITEMS];

const pipeline = new RuntimePipeline();

// Helper to recompute metrics
function calculateMetrics(): AggregatedMetrics {
  const total = runtimeEventsStore.length;
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

  let allowed = 0;
  let blocked = 0;
  let edited = 0;
  let escalated = 0;
  let hallucinations = 0;
  let piiCount = 0;
  let injectionCount = 0;
  let policyViolations = 0;
  let totalLatency = 0;
  let totalTokens = 0;
  let totalSpend = 0;
  let totalSavings = 0;
  let cacheHits = 0;

  for (const evt of runtimeEventsStore) {
    if (evt.decision === 'ALLOW') allowed++;
    if (evt.decision === 'BLOCK') blocked++;
    if (evt.decision === 'EDIT') edited++;
    if (evt.decision === 'ESCALATE') escalated++;

    if (evt.performance.hallucinationRisk > 40) hallucinations++;
    if (evt.responsibility.piiDetected) piiCount += evt.responsibility.detectedEntities.length || 1;
    if (evt.responsibility.injectionDetected) injectionCount++;
    if (evt.triggeredPolicies.length > 0) policyViolations += evt.triggeredPolicies.length;

    totalLatency += evt.latency.totalLatencyMs;
    totalTokens += evt.cost.totalTokens;
    totalSpend += evt.cost.estimatedCostWithControlPlane;
    totalSavings += evt.cost.savingsAmount;
    if (evt.cost.cacheHit) cacheHits++;
  }

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

// 1. Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    version: '2.4.0',
    proxyEngine: 'ControlPlane.ai Inline Real-Time Governance',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    activePoliciesCount: policiesStore.filter(p => p.status === 'ACTIVE').length
  });
});

// 2. Scenario Presets
app.get('/api/scenarios', (req: Request, res: Response) => {
  res.json(SCENARIO_PRESETS);
});

// 3. Evaluate Request via Real-Time Proxy
app.post('/api/proxy/evaluate', async (req: Request, res: Response) => {
  try {
    const { prompt, application, model, scenarioId } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required and must be a string' });
    }

    const appName: TargetApplication = application || 'Customer-Facing Support Bot';
    const modelName: TargetModel = model || 'GPT-4o (128K)';
    const scenario = SCENARIO_PRESETS.find(s => s.id === scenarioId);

    // Execute through 3 engines using active backend policies
    const event = await pipeline.execute(
      prompt,
      appName,
      modelName,
      policiesStore,
      scenario
    );

    // Save event to authoritative audit store
    runtimeEventsStore = [event, ...runtimeEventsStore];

    // If decision was ESCALATE, create item in Human Review Queue
    if (event.decision === 'ESCALATE') {
      const reviewItem: ReviewQueueItem = {
        id: 'rev_' + Math.random().toString(36).substring(2, 9),
        runtimeEventId: event.id,
        requestId: event.requestId,
        timestamp: event.timestamp,
        application: event.application,
        user: event.user,
        model: event.model,
        riskScore: event.riskScore,
        triggeredPolicies: event.triggeredPolicies.map(p => p.name + ' (' + p.version + ')'),
        inputPrompt: event.rawInput,
        originalOutput: event.rawOutput,
        proposedRemediation: '[SAFETY REMEDIATION REQUIRED]: Output held by ControlPlane.ai runtime pending safety review.',
        evidence: event.decisionReason,
        status: 'PENDING'
      };
      reviewQueueStore = [reviewItem, ...reviewQueueStore];
    }

    res.json({
      success: true,
      event,
      metrics: calculateMetrics()
    });
  } catch (err: any) {
    console.error('Evaluation error:', err);
    res.status(500).json({ error: err.message || 'Internal proxy evaluation error' });
  }
});

// 4. Governance Policies CRUD
app.get('/api/policies', (req: Request, res: Response) => {
  res.json(policiesStore);
});

app.post('/api/policies', (req: Request, res: Response) => {
  const newPolicy: PolicyRule = req.body;
  if (!newPolicy.name || !newPolicy.action) {
    return res.status(400).json({ error: 'Invalid policy payload' });
  }
  newPolicy.id = newPolicy.id || 'pol-' + Math.random().toString(36).substring(2, 7);
  newPolicy.updatedAt = new Date().toISOString().substring(0, 16) + ' UTC';
  policiesStore = [newPolicy, ...policiesStore];
  res.status(201).json(newPolicy);
});

app.put('/api/policies/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updated: PolicyRule = req.body;
  let found = false;
  policiesStore = policiesStore.map(p => {
    if (p.id === id) {
      found = true;
      return { ...updated, id, updatedAt: new Date().toISOString().substring(0, 16) + ' UTC' };
    }
    return p;
  });
  if (!found) {
    return res.status(404).json({ error: 'Policy not found' });
  }
  res.json(updated);
});

app.patch('/api/policies/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  let updatedPolicy: PolicyRule | null = null;
  policiesStore = policiesStore.map(p => {
    if (p.id === id) {
      const nextStatus = p.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
      updatedPolicy = { ...p, status: nextStatus, updatedAt: new Date().toISOString().substring(0, 16) + ' UTC' };
      return updatedPolicy;
    }
    return p;
  });
  if (!updatedPolicy) {
    return res.status(404).json({ error: 'Policy not found' });
  }
  res.json(updatedPolicy);
});

// 5. Human Review Queue Actions
app.get('/api/reviews', (req: Request, res: Response) => {
  res.json(reviewQueueStore);
});

app.post('/api/reviews/:id/action', (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, remediation, notes } = req.body; // action: 'APPROVE' | 'REJECT' | 'EDIT'
  const timestamp = new Date().toISOString().substring(0, 19) + ' UTC';
  const reviewer = 'ciso-lead@acmecorp.internal';

  let foundItem: ReviewQueueItem | null = null;

  reviewQueueStore = reviewQueueStore.map(item => {
    if (item.id === id) {
      foundItem = {
        ...item,
        status: action === 'APPROVE' ? 'APPROVED' : (action === 'REJECT' ? 'REJECTED' : 'EDITED'),
        proposedRemediation: remediation || item.proposedRemediation,
        reviewer,
        reviewTimestamp: timestamp,
        reviewNotes: notes || `Resolved as ${action} by safety reviewer.`
      };
      return foundItem;
    }
    return item;
  });

  if (!foundItem) {
    return res.status(404).json({ error: 'Review item not found' });
  }

  // Also update corresponding runtime event in audit log
  runtimeEventsStore = runtimeEventsStore.map(evt => {
    if (evt.id === (foundItem as ReviewQueueItem).runtimeEventId) {
      return {
        ...evt,
        decision: action === 'APPROVE' ? 'ALLOW' : (action === 'REJECT' ? 'BLOCK' : 'EDIT'),
        finalOutput: (action === 'EDIT' && remediation) ? remediation : evt.finalOutput,
        reviewStatus: action === 'APPROVE' ? 'APPROVED' : (action === 'REJECT' ? 'REJECTED' : 'EDITED_AND_RELEASED'),
        reviewer,
        reviewTimestamp: timestamp,
        reviewNotes: notes || `Resolved as ${action}`
      };
    }
    return evt;
  });

  res.json({
    success: true,
    reviewItem: foundItem,
    metrics: calculateMetrics()
  });
});

// 6. Audit Logs & Exports
app.get('/api/events', (req: Request, res: Response) => {
  res.json(runtimeEventsStore);
});

app.get('/api/events/export/json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=controlplane_audit_${Date.now()}.json`);
  res.send(JSON.stringify(runtimeEventsStore, null, 2));
});

app.get('/api/events/export/csv', (req: Request, res: Response) => {
  const headers = ['RequestID', 'Timestamp', 'Application', 'Model', 'Decision', 'RiskScore', 'InputSHA256', 'LatencyMs', 'SavingsUSD'];
  const rows = runtimeEventsStore.map(e => [
    e.requestId,
    e.timestamp,
    `"${e.application}"`,
    `"${e.model}"`,
    e.decision,
    e.riskScore,
    e.inputSha256,
    e.latency.totalLatencyMs,
    e.cost.savingsAmount
  ]);
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=controlplane_audit_${Date.now()}.csv`);
  res.send(csvContent);
});

// 7. Operational Metrics
app.get('/api/metrics', (req: Request, res: Response) => {
  res.json(calculateMetrics());
});

app.listen(PORT, () => {
  console.log(`[ControlPlane.ai] Runtime Gateway Server active on port ${PORT}`);
});
