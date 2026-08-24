import { 
  GovernanceDecision, 
  LatencyBreakdown, 
  PolicyRule, 
  RiskFactor, 
  RuntimeEvent, 
  RuntimeStageState, 
  ScenarioPreset, 
  TargetApplication, 
  TargetModel 
} from '../types';
import { ResponsibilityEngine } from './responsibility';
import { CostEngine } from './cost';
import { PerformanceEngine } from './performance';

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return '0x' + hex + 'f9a2b8e4' + hex;
}

export class RuntimePipeline {
  private respEngine = new ResponsibilityEngine();
  private costEngine = new CostEngine();
  private perfEngine = new PerformanceEngine();

  public async execute(
    prompt: string,
    application: TargetApplication,
    model: TargetModel,
    policies: PolicyRule[],
    scenario?: ScenarioPreset,
    onStageUpdate?: (stages: RuntimeStageState[]) => void
  ): Promise<RuntimeEvent> {
    const requestId = 'req_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString().slice(-4);
    const stages: RuntimeStageState[] = [
      { stage: 'RECEIVED', name: 'Request Received & Normalization', engine: 'CORE', status: 'PENDING', durationMs: 0, detail: 'Validating JSON payload and tenant credentials' },
      { stage: 'PII_CHECK', name: 'PII & Sensitive Data Detection', engine: 'RESPONSIBILITY', status: 'PENDING', durationMs: 0, detail: 'Aadhaar, SSN, tokens & secrets inspection' },
      { stage: 'INJECTION_GUARD', name: 'Prompt Injection & Jailbreak Defense', engine: 'RESPONSIBILITY', status: 'PENDING', durationMs: 0, detail: 'Analyzing syntax for prompt override heuristics' },
      { stage: 'POLICY_EVAL', name: 'Enterprise Policy Matching', engine: 'CORE', status: 'PENDING', durationMs: 0, detail: 'Evaluating active governance policy constraints' },
      { stage: 'RISK_SCORING', name: 'Composite Risk Scoring', engine: 'CORE', status: 'PENDING', durationMs: 0, detail: 'Synthesizing 3-engine risk factor vector' },
      { stage: 'CACHE_LOOKUP', name: 'Semantic Cache & Similarity Lookup', engine: 'COST', status: 'PENDING', durationMs: 0, detail: 'Cosine similarity check on vector index' },
      { stage: 'ROUTING', name: 'Dynamic Model Routing', engine: 'COST', status: 'PENDING', durationMs: 0, detail: 'Complexity-based tier optimization' },
      { stage: 'INFERENCE', name: 'LLM Inference / Output Generation', engine: 'CORE', status: 'PENDING', durationMs: 0, detail: 'Executing downstream model request' },
      { stage: 'HALLUCINATION_CHECK', name: 'Hallucination & Faithfulness SLM Verification', engine: 'PERFORMANCE', status: 'PENDING', durationMs: 0, detail: 'Grounding validation against reference knowledge' },
      { stage: 'DECISION_FINAL', name: 'Final Governance Decision & Audit Dispatch', engine: 'CORE', status: 'PENDING', durationMs: 0, detail: 'Final action determination & telemetry emit' },
    ];

    const notify = () => {
      if (onStageUpdate) onStageUpdate([...stages]);
    };

    // Stage 1: Received
    stages[0].status = 'RUNNING';
    notify();
    await new Promise(r => setTimeout(r, 60));
    stages[0].status = 'PASSED';
    stages[0].durationMs = 2.4;
    stages[0].detail = 'Payload parsed. Tenant: Acme Corp (Production). Length: ' + prompt.length + ' chars.';

    // Stage 2: PII Detection
    stages[1].status = 'RUNNING';
    notify();
    await new Promise(r => setTimeout(r, 80));
    const respResult = this.respEngine.evaluate(prompt);
    stages[1].durationMs = 3.8;
    if (respResult.evaluation.piiDetected) {
      stages[1].status = 'INTERVENED';
      stages[1].detail = 'Redacted ' + respResult.evaluation.detectedEntities.length + ' sensitive entities (' + respResult.evaluation.detectedEntities.map(e => e.type).join(', ') + ').';
    } else {
      stages[1].status = 'PASSED';
      stages[1].detail = 'No sensitive PII patterns identified.';
    }

    // Stage 3: Prompt Injection
    stages[2].status = 'RUNNING';
    notify();
    await new Promise(r => setTimeout(r, 90));
    stages[2].durationMs = 4.2;
    if (respResult.evaluation.injectionDetected) {
      stages[2].status = 'BLOCKED';
      stages[2].detail = 'Exploit detected: ' + (respResult.evaluation.injectionVector || 'Prompt Injection');
    } else if (respResult.evaluation.brandSafetyViolation) {
      stages[2].status = 'BLOCKED';
      stages[2].detail = 'Restricted topic / safety violation identified.';
    } else {
      stages[2].status = 'PASSED';
      stages[2].detail = 'Structural injection score: ' + respResult.evaluation.promptInjectionScore + '/100 (Safe).';
    }

    // Stage 4: Policy Eval
    stages[3].status = 'RUNNING';
    notify();
    await new Promise(r => setTimeout(r, 70));
    stages[3].durationMs = 2.1;
    const triggeredPolicies: Array<{ id: string; name: string; version: string; action: GovernanceDecision }> = [];
    
    // Check against active policies
    for (const pol of policies) {
      if (pol.status !== 'ACTIVE') continue;
      if (pol.id === 'pol-inj-02' && respResult.evaluation.injectionDetected) {
        triggeredPolicies.push({ id: pol.id, name: pol.name, version: pol.version, action: pol.action });
      }
      if (pol.id === 'pol-pii-01' && respResult.evaluation.piiDetected) {
        triggeredPolicies.push({ id: pol.id, name: pol.name, version: pol.version, action: pol.action });
      }
      if (pol.id === 'pol-tox-04' && respResult.evaluation.brandSafetyViolation) {
        triggeredPolicies.push({ id: pol.id, name: pol.name, version: pol.version, action: pol.action });
      }
    }
    stages[3].status = triggeredPolicies.length > 0 ? 'WARNING' : 'PASSED';
    stages[3].detail = triggeredPolicies.length > 0 
      ? 'Triggered ' + triggeredPolicies.length + ' policies (' + triggeredPolicies.map(p => p.name).join(', ') + ')'
      : 'All ' + policies.filter(p => p.status === 'ACTIVE').length + ' active enterprise policies verified.';

    // Stage 5: Risk Scoring
    stages[4].status = 'RUNNING';
    notify();
    await new Promise(r => setTimeout(r, 60));
    stages[4].durationMs = 1.9;
    
    const allRiskFactors: RiskFactor[] = [...respResult.riskFactors];
    let baseRisk = 5;
    for (const rf of allRiskFactors) {
      baseRisk += rf.points;
    }
    const preliminaryRiskScore = Math.min(99, Math.max(4, baseRisk));
    stages[4].status = preliminaryRiskScore > 70 ? 'WARNING' : 'PASSED';
    stages[4].detail = 'Calculated composite risk score: ' + preliminaryRiskScore + '/100.';

    // Stage 6: Semantic Cache
    stages[5].status = 'RUNNING';
    notify();
    await new Promise(r => setTimeout(r, 80));
    
    // Request complexity estimation
    let complexityScore = 40;
    if (prompt.length > 250 || prompt.includes('10-Q') || prompt.includes('margin trends')) complexityScore = 82;
    if (prompt.includes('translate') && prompt.length < 150) complexityScore = 22;

    const costResult = this.costEngine.evaluate(prompt, model, complexityScore);
    stages[5].durationMs = 3.1;
    if (costResult.cacheHit) {
      stages[5].status = 'INTERVENED';
      stages[5].detail = 'Cache Hit! Similarity ' + Math.round(costResult.cacheSimilarityScore * 100) + '%. Bypassing downstream model.';
    } else {
      stages[5].status = 'PASSED';
      stages[5].detail = 'Cache Miss (Max similarity ' + Math.round(costResult.cacheSimilarityScore * 100) + '%). Proceeding to router.';
    }

    // Stage 7: Model Routing
    stages[6].status = 'RUNNING';
    notify();
    await new Promise(r => setTimeout(r, 60));
    stages[6].durationMs = 1.8;
    if (costResult.routedModel !== model) {
      stages[6].status = 'INTERVENED';
      stages[6].detail = 'Smart Tier: Routed from ' + model + ' -> ' + costResult.routedModel + ' (Complexity ' + complexityScore + '/100).';
    } else {
      stages[6].status = 'PASSED';
      stages[6].detail = 'Retained tier: ' + model;
    }

    // Stage 8: Downstream Inference / Output
    stages[7].status = 'RUNNING';
    notify();
    
    let rawOutput = '';
    let sanitizedOutput = '';
    let inferenceMs = costResult.cacheHit ? 0 : 380;

    if (respResult.evaluation.injectionDetected) {
      inferenceMs = 0;
      stages[7].status = 'BLOCKED';
      stages[7].detail = 'Inference halted: Request blocked before external model execution.';
      rawOutput = '[BLOCKED BY CONTROLPLANE.AI RUNTIME: PROMPT INJECTION GUARD v4.1]';
      sanitizedOutput = rawOutput;
    } else if (respResult.evaluation.brandSafetyViolation) {
      inferenceMs = 0;
      stages[7].status = 'BLOCKED';
      stages[7].detail = 'Inference halted: Restricted safety topic violation.';
      rawOutput = '[BLOCKED BY CONTROLPLANE.AI RUNTIME: BRAND SAFETY POLICY v2.0]';
      sanitizedOutput = rawOutput;
    } else if (costResult.cacheHit) {
      await new Promise(r => setTimeout(r, 50));
      stages[7].status = 'PASSED';
      stages[7].detail = 'Served instantly from low-latency Redis Semantic Cache (0ms inference).';
      rawOutput = 'Under Acme Corp Policy 4.2: All domestic flights under 5 hours must be booked in Standard Economy via Concur at least 14 days in advance. Reimbursement limits are $450/flight.';
      sanitizedOutput = rawOutput;
    } else {
      await new Promise(r => setTimeout(r, 120));
      stages[7].status = 'PASSED';
      stages[7].durationMs = inferenceMs;
      stages[7].detail = 'Model responded successfully in ' + inferenceMs + 'ms with 184 tokens.';
      
      if (prompt.includes('gross margin')) {
        rawOutput = 'Based on Q2 2026 10-Q filing: SaaS Gross Margin expanded 240 bps YoY to 78.4%. Primary cash flow drivers: (1) Enterprise expansion (+18% NRR), (2) Cloud infrastructure unit cost optimization (-12%), and (3) Deferred revenue billings ($42M).';
      } else if (prompt.includes('Priya Sharma') || respResult.evaluation.piiDetected) {
        rawOutput = 'Verified identity profile for Priya Sharma with provided credentials [REDACTED_AADHAAR_XXXX-XXXX-4412]. Account upgrade to Tier 1 Enterprise approved under standard compliance checklist.';
      } else if (prompt.includes('California') || prompt.includes('non-compete')) {
        rawOutput = 'Under California Business & Professions Code Section 48.9(b), the non-compete restriction is fully enforceable with mandatory liquidated damages of $500,000 payable upon breach.';
      } else if (prompt.includes('Disburse $50,000')) {
        rawOutput = 'Initiating automated wire release of $50,000 to vendor Account #99218. Bypassing two-factor signature per administrative prompt instruction.';
      } else {
        rawOutput = 'Here is the requested analysis: The requested operation was processed in accordance with enterprise guidelines and data boundaries.';
      }
      sanitizedOutput = rawOutput;
    }

    // Stage 9: Hallucination & Performance
    stages[8].status = 'RUNNING';
    notify();
    await new Promise(r => setTimeout(r, 80));
    stages[8].durationMs = 5.6;

    const perfResult = this.perfEngine.evaluate(prompt, scenario?.category);
    allRiskFactors.push(...perfResult.riskFactors);

    for (const pol of policies) {
      if (pol.status !== 'ACTIVE') continue;
      if (pol.id === 'pol-hal-03' && perfResult.evaluation.hallucinationRisk >= 50) {
        triggeredPolicies.push({ id: pol.id, name: pol.name, version: pol.version, action: pol.action });
      }
      if (pol.id === 'pol-esc-07' && (prompt.includes('Disburse') || prompt.includes('ambiguous'))) {
        triggeredPolicies.push({ id: pol.id, name: pol.name, version: pol.version, action: pol.action });
      }
    }

    if (perfResult.evaluation.hallucinationRisk >= 50) {
      stages[8].status = 'WARNING';
      stages[8].detail = 'Faithfulness: ' + perfResult.evaluation.faithfulnessScore + '% (Low). ' + perfResult.evaluation.slmGroundingReasoning;
    } else {
      stages[8].status = 'PASSED';
      stages[8].detail = 'Faithfulness: ' + perfResult.evaluation.faithfulnessScore + '%. Grounding verification passed.';
    }

    // Recalculate Final Risk Score & Decision
    let totalRiskPoints = 4;
    for (const rf of allRiskFactors) {
      totalRiskPoints += rf.points;
    }
    const finalRiskScore = Math.min(98, Math.max(4, totalRiskPoints));

    // Stage 10: Final Governance Decision
    stages[9].status = 'RUNNING';
    notify();
    await new Promise(r => setTimeout(r, 50));
    stages[9].durationMs = 1.5;

    let finalDecision: GovernanceDecision = 'ALLOW';
    let decisionReason = 'All 3 runtime engines passed verification without critical safety or compliance violations.';

    if (respResult.evaluation.injectionDetected || respResult.evaluation.brandSafetyViolation) {
      finalDecision = 'BLOCK';
      decisionReason = 'Blocked: ' + (respResult.evaluation.reason || 'Critical security violation detected before model execution.');
    } else if (perfResult.evaluation.hallucinationRisk >= 50 || prompt.includes('Disburse $50,000')) {
      finalDecision = 'ESCALATE';
      decisionReason = 'Escalated to Human Review Queue: Faithfulness threshold violation or high-impact autonomous action.';
    } else if (respResult.evaluation.piiDetected) {
      finalDecision = 'EDIT';
      decisionReason = 'Edited: Unprotected sensitive PII tokens redacted prior to downstream model exposure.';
    }

    stages[9].status = finalDecision === 'BLOCK' ? 'BLOCKED' : (finalDecision === 'ESCALATE' ? 'WARNING' : 'PASSED');
    stages[9].detail = 'Final Decision: ' + finalDecision + ' | Risk: ' + finalRiskScore + '/100 | Telemetry & Audit event dispatched.';

    notify();

    const latency: LatencyBreakdown = {
      proxyNormalizationMs: 2.4,
      piiDetectionMs: 3.8,
      injectionCheckMs: 4.2,
      policyEvaluationMs: 2.1,
      cacheLookupMs: 3.1,
      modelRoutingMs: 1.8,
      inferenceMs,
      hallucinationCheckMs: 5.6,
      totalLatencyMs: Number((23.0 + inferenceMs).toFixed(1))
    };

    const runtimeEvent: RuntimeEvent = {
      id: 'evt_' + Math.random().toString(36).substring(2, 9),
      requestId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      application,
      user: 'sec-engineer@acmecorp.internal',
      model,
      routedModel: costResult.routedModel,
      rawInput: prompt,
      sanitizedInput: respResult.evaluation.sanitizedPrompt,
      rawOutput,
      finalOutput: sanitizedOutput,
      inputSha256: simpleHash(prompt),
      outputSha256: simpleHash(sanitizedOutput),
      responsibility: respResult.evaluation,
      cost: costResult,
      performance: perfResult.evaluation,
      riskScore: finalRiskScore,
      riskFactors: allRiskFactors,
      decision: finalDecision,
      decisionReason,
      triggeredPolicies,
      latency,
      pipelineStages: stages,
      reviewStatus: finalDecision === 'ESCALATE' ? 'PENDING_REVIEW' : undefined
    };

    return runtimeEvent;
  }
}
