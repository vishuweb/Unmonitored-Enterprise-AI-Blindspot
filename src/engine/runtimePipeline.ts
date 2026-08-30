import {
  GovernanceDecision,
  LatencyBreakdown,
  OutputSafetyEvaluation,
  PolicyRule,
  ProviderUsage,
  RiskFactor,
  RuntimeEvent,
  RuntimeStageState,
  TargetApplication,
  TargetModel
} from '../types';
import { ResponsibilityEngine } from './responsibility';
import { CostEngine } from './cost';
import { PerformanceEngine } from './performance';

export interface RuntimeDownstreamProvider {
  readonly name: string;
  readonly model: string;
  complete(prompt: string): Promise<{
    output: string;
    usage?: ProviderUsage;
    model?: string;
  }>;
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

function stage(
  name: RuntimeStageState['stage'],
  engine: RuntimeStageState['engine'],
  detail: string,
  status: RuntimeStageState['status'] = 'PASSED',
  durationMs = 0
): RuntimeStageState {
  return { stage: name, name, engine, status, durationMs, detail };
}

function notEvaluatedOutputSafety(): OutputSafetyEvaluation {
  return {
    evaluated: false,
    piiDetected: false,
    injectionDetected: false,
    toxicityScore: 0,
    sanitizedOutput: '',
    engineStatus: 'NOT_EVALUATED',
    reason: 'Not evaluated: no downstream model response was provided.'
  };
}

export class RuntimePipeline {
  private readonly respEngine = new ResponsibilityEngine();
  private readonly costEngine = new CostEngine();
  private readonly perfEngine = new PerformanceEngine();
  private readonly provider?: RuntimeDownstreamProvider;

  public constructor(provider?: RuntimeDownstreamProvider) {
    this.provider = provider;
  }

  public async execute(
    prompt: string,
    application: TargetApplication,
    model: TargetModel,
    policies: PolicyRule[],
    onStageUpdate?: (stages: RuntimeStageState[]) => void
  ): Promise<RuntimeEvent> {
    const startedAt = performance.now();
    const inputSha256 = await sha256(prompt);
    const requestId = `req_${inputSha256.slice(0, 12)}`;
    const stages: RuntimeStageState[] = [];
    const notify = () => onStageUpdate?.([...stages]);

    stages.push(stage('RECEIVED', 'CORE', 'Request received by the runtime gateway.'));

    const responsibilityStarted = performance.now();
    const respResult = this.respEngine.evaluate(prompt);
    const piiDetectionMs = performance.now() - responsibilityStarted;
    stages.push(stage(
      'PII_CHECK',
      'RESPONSIBILITY',
      respResult.evaluation.piiDetected
        ? `Redacted ${respResult.evaluation.detectedEntities.length} detected sensitive entities.`
        : 'No sensitive PII patterns identified.',
      respResult.evaluation.piiDetected ? 'INTERVENED' : 'PASSED',
      piiDetectionMs
    ));

    const injectionStarted = performance.now();
    const injectionCheckMs = performance.now() - injectionStarted;
    stages.push(stage(
      'INJECTION_GUARD',
      'RESPONSIBILITY',
      respResult.evaluation.reason,
      respResult.evaluation.injectionDetected || respResult.evaluation.brandSafetyViolation ? 'BLOCKED' : 'PASSED',
      injectionCheckMs
    ));
    notify();

    const policyStarted = performance.now();
    const activePolicies = policies.filter(policy => policy.status === 'ACTIVE');
    const triggeredPolicies = activePolicies
      .filter(policy => policy.engine === 'RESPONSIBILITY')
      .filter(() => respResult.evaluation.injectionDetected || respResult.evaluation.brandSafetyViolation || respResult.evaluation.piiDetected)
      .map(policy => ({ id: policy.id, name: policy.name, version: policy.version, action: policy.action }));
    const policyEvaluationMs = performance.now() - policyStarted;
    stages.push(stage(
      'POLICY_EVAL',
      'CORE',
      triggeredPolicies.length
        ? `Triggered policies: ${triggeredPolicies.map(policy => policy.name).join(', ')}.`
        : 'No active policy matched this prompt.',
      triggeredPolicies.length ? 'WARNING' : 'PASSED',
      policyEvaluationMs
    ));

    const allRiskFactors: RiskFactor[] = [...respResult.riskFactors];
    let riskScore = Math.min(100, allRiskFactors.reduce((sum, factor) => sum + factor.points, 0));
    stages.push(stage('RISK_SCORING', 'CORE', `Risk factors detected: ${allRiskFactors.length}.`));
    notify();

    const costStarted = performance.now();
    const preflightCost = this.costEngine.evaluate(respResult.evaluation.sanitizedPrompt, model, undefined, Boolean(this.provider));
    const cacheLookupMs = performance.now() - costStarted;
    stages.push(stage('CACHE_LOOKUP', 'COST', preflightCost.routingReason, preflightCost.engineStatus, cacheLookupMs));
    const routingStarted = performance.now();
    const routingMs = performance.now() - routingStarted;
    stages.push(stage(
      'ROUTING',
      'COST',
      this.provider ? `Using configured ${this.provider.name} provider (${this.provider.model}).` : 'No downstream model is configured; routing was skipped.',
      this.provider ? 'PASSED' : 'WARNING',
      routingMs
    ));

    const blockedByPreflight = respResult.evaluation.injectionDetected || respResult.evaluation.brandSafetyViolation;
    let providerOutput: string | undefined;
    let providerUsage: ProviderUsage | undefined;
    let providerModel: string | undefined;
    let inferenceMs = 0;
    if (blockedByPreflight) {
      stages.push(stage('INFERENCE', 'CORE', 'Downstream inference was halted by the preflight responsibility check.', 'BLOCKED'));
    } else if (this.provider) {
      const inferenceStarted = performance.now();
      const response = await this.provider.complete(respResult.evaluation.sanitizedPrompt);
      inferenceMs = performance.now() - inferenceStarted;
      providerOutput = response.output;
      providerUsage = response.usage;
      providerModel = response.model;
      stages.push(stage('INFERENCE', 'CORE', `Downstream response received from ${this.provider.name}.`, 'PASSED', inferenceMs));
    } else {
      stages.push(stage('INFERENCE', 'CORE', 'No downstream model call was made because no provider is configured.', 'WARNING'));
    }
    notify();

    const output = blockedByPreflight
      ? '[BLOCKED BY CONTROLPLANE: responsibility policy violation]'
      : providerOutput ?? 'No downstream model is configured. The prompt was inspected but not generated.';

    let outputSafety = notEvaluatedOutputSafety();
    let performanceResult = this.perfEngine.evaluate();
    let hallucinationCheckMs = 0;
    if (providerOutput !== undefined) {
      const postflightSafetyStarted = performance.now();
      const outputSafetyResult = this.respEngine.evaluateOutput(providerOutput);
      outputSafety = outputSafetyResult.evaluation;
      allRiskFactors.push(...outputSafetyResult.riskFactors);
      const outputSafetyMs = performance.now() - postflightSafetyStarted;
      stages.push(stage(
        'HALLUCINATION_CHECK',
        'PERFORMANCE',
        'Postflight output safety and performance checks are running.',
        'RUNNING',
        outputSafetyMs
      ));

      const performanceStarted = performance.now();
      performanceResult = this.perfEngine.evaluate(providerOutput);
      hallucinationCheckMs = performance.now() - performanceStarted;
      stages[stages.length - 1] = stage(
        'HALLUCINATION_CHECK',
        'PERFORMANCE',
        `${outputSafety.reason} ${performanceResult.evaluation.slmGroundingReasoning}`,
        performanceResult.evaluation.engineStatus === 'ESCALATED' ? 'WARNING' : outputSafety.engineStatus === 'BLOCKED' ? 'BLOCKED' : performanceResult.evaluation.engineStatus,
        outputSafetyMs + hallucinationCheckMs
      );
      allRiskFactors.push(...performanceResult.riskFactors);
      riskScore = Math.min(100, allRiskFactors.reduce((sum, factor) => sum + factor.points, 0));
    } else {
      stages.push(stage(
        'HALLUCINATION_CHECK',
        'PERFORMANCE',
        'Not evaluated: no downstream model response was provided.',
        'WARNING'
      ));
    }

    const costResult = this.costEngine.evaluate(
      respResult.evaluation.sanitizedPrompt,
      model,
      providerUsage,
      Boolean(this.provider),
      providerModel
    );
    let decision: GovernanceDecision = 'ALLOW';
    let decisionReason = 'Responsibility and postflight checks passed.';
    if (blockedByPreflight) {
      decision = 'BLOCK';
      decisionReason = respResult.evaluation.reason;
    } else if (outputSafety.engineStatus === 'BLOCKED') {
      decision = 'BLOCK';
      decisionReason = outputSafety.reason;
    } else if (respResult.evaluation.piiDetected || outputSafety.engineStatus === 'INTERVENED') {
      decision = 'EDIT';
      decisionReason = respResult.evaluation.piiDetected
        ? 'Sensitive entities were redacted before downstream inference.'
        : 'Sensitive entities were redacted from the downstream output.';
    } else if (
      providerOutput !== undefined &&
      performanceResult.evaluation.engineStatus === 'ESCALATED' &&
      activePolicies.some(policy => policy.engine === 'PERFORMANCE' && policy.action === 'ESCALATE')
    ) {
      decision = 'ESCALATE';
      decisionReason = performanceResult.evaluation.slmGroundingReasoning;
    }
    stages.push(stage(
      'DECISION_FINAL',
      'CORE',
      `Final decision: ${decision}.`,
      decision === 'BLOCK' ? 'BLOCKED' : decision === 'ESCALATE' ? 'WARNING' : decision === 'EDIT' ? 'INTERVENED' : 'PASSED'
    ));
    notify();

    const finalOutput = decision === 'BLOCK'
      ? `[BLOCKED BY CONTROLPLANE: ${decisionReason}]`
      : outputSafety.engineStatus === 'INTERVENED'
        ? outputSafety.sanitizedOutput
        : output;
    const timestamp = new Date().toISOString();
    const outputSha256 = await sha256(output);
    const totalLatencyMs = performance.now() - startedAt;
    const latency: LatencyBreakdown = {
      proxyNormalizationMs: 0,
      piiDetectionMs,
      injectionCheckMs,
      policyEvaluationMs,
      cacheLookupMs,
      modelRoutingMs: routingMs,
      inferenceMs,
      hallucinationCheckMs,
      totalLatencyMs
    };

    return {
      id: `evt_${inputSha256.slice(0, 16)}`,
      requestId,
      timestamp,
      application,
      user: 'local-user',
      model,
      routedModel: model,
      rawInput: prompt,
      sanitizedInput: respResult.evaluation.sanitizedPrompt,
      rawOutput: output,
      finalOutput,
      inputSha256,
      outputSha256,
      responsibility: respResult.evaluation,
      outputSafety,
      cost: costResult,
      performance: performanceResult.evaluation,
      riskScore,
      riskFactors: allRiskFactors,
      decision,
      decisionReason,
      triggeredPolicies,
      latency,
      pipelineStages: stages,
      reviewStatus: decision === 'ESCALATE' ? 'PENDING_REVIEW' : undefined
    };
  }
}
