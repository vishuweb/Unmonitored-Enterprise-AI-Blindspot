export type GovernanceDecision = 'ALLOW' | 'BLOCK' | 'EDIT' | 'ESCALATE';

export type PolicyStatus = 'ACTIVE' | 'TEST' | 'DRAFT' | 'ROLLBACK';

export type PolicySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type EngineType = 'RESPONSIBILITY' | 'COST' | 'PERFORMANCE';

export type TargetApplication = 
  | 'Customer-Facing Support Bot' 
  | 'Internal Knowledge Copilot' 
  | 'Decision-Support Agent'
  | 'Financial Intelligence Analyst'
  | 'Healthcare Clinical Assistant';

export type TargetModel = 
  | 'GPT-4o (128K)' 
  | 'Claude 3.5 Sonnet (200K)' 
  | 'Llama-3-70B (8K)' 
  | 'GPT-4o-mini (128K)';

export interface PolicyRule {
  id: string;
  name: string;
  category: 'SECURITY' | 'PRIVACY' | 'QUALITY' | 'COST' | 'COMPLIANCE';
  engine: EngineType;
  description: string;
  severity: PolicySeverity;
  action: GovernanceDecision;
  threshold: number; // e.g. 70 risk score or 0.85 similarity
  status: PolicyStatus;
  version: string;
  updatedAt: string;
  author: string;
  rulesConfig?: Record<string, any>;
}

export interface RiskFactor {
  factor: string;
  points: number;
  engine: EngineType;
  description: string;
}

export interface ResponsibilityEvaluation {
  piiDetected: boolean;
  detectedEntities: Array<{
    type: 'AADHAAR' | 'SSN' | 'CREDIT_CARD' | 'EMAIL' | 'PHONE' | 'API_KEY' | 'GOV_ID' | 'CUSTOM_PII';
    raw: string;
    redacted: string;
    location: string;
  }>;
  promptInjectionScore: number; // 0 - 100
  injectionDetected: boolean;
  injectionVector?: string;
  toxicityScore: number; // 0 - 100
  brandSafetyViolation: boolean;
  sanitizedPrompt: string;
  engineStatus: 'PASSED' | 'WARNING' | 'BLOCKED' | 'INTERVENED';
  reason: string;
}

export interface CostEvaluation {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cacheHit: boolean;
  cacheSimilarityScore: number; // 0.0 - 1.0
  cachedQueryKey?: string;
  originalModel: TargetModel;
  routedModel: TargetModel;
  routingReason: string;
  estimatedCostWithoutControlPlane: number; // USD
  estimatedCostWithControlPlane: number; // USD
  savingsAmount: number; // USD
  savingsPercentage: number; // 0 - 100%
  engineStatus: 'PASSED' | 'WARNING' | 'INTERVENED';
}

export interface PerformanceEvaluation {
  faithfulnessScore: number; // 0 - 100%
  hallucinationRisk: number; // 0 - 100%
  groundingConfidence: number; // 0 - 100%
  responseQualityScore: number; // 0 - 100
  slmGroundingReasoning: string;
  engineStatus: 'PASSED' | 'WARNING' | 'BLOCKED' | 'ESCALATED';
}

export interface LatencyBreakdown {
  proxyNormalizationMs: number;
  piiDetectionMs: number;
  injectionCheckMs: number;
  policyEvaluationMs: number;
  cacheLookupMs: number;
  modelRoutingMs: number;
  inferenceMs: number;
  hallucinationCheckMs: number;
  totalLatencyMs: number;
}

export interface RuntimeStageState {
  stage: 
    | 'RECEIVED'
    | 'PII_CHECK'
    | 'INJECTION_GUARD'
    | 'POLICY_EVAL'
    | 'RISK_SCORING'
    | 'CACHE_LOOKUP'
    | 'ROUTING'
    | 'INFERENCE'
    | 'HALLUCINATION_CHECK'
    | 'DECISION_FINAL';
  name: string;
  engine: EngineType | 'CORE';
  status: 'PENDING' | 'RUNNING' | 'PASSED' | 'WARNING' | 'BLOCKED' | 'INTERVENED';
  durationMs: number;
  detail: string;
}

export interface RuntimeEvent {
  id: string;
  requestId: string;
  timestamp: string;
  application: TargetApplication;
  user: string;
  model: TargetModel;
  routedModel: TargetModel;
  
  // Inputs & Outputs
  rawInput: string;
  sanitizedInput: string;
  rawOutput: string;
  finalOutput: string;
  inputSha256: string;
  outputSha256: string;
  
  // 3-Engine Evaluations
  responsibility: ResponsibilityEvaluation;
  cost: CostEvaluation;
  performance: PerformanceEvaluation;
  
  // Decision & Scoring
  riskScore: number; // 0 - 100
  riskFactors: RiskFactor[];
  decision: GovernanceDecision;
  decisionReason: string;
  triggeredPolicies: Array<{ id: string; name: string; version: string; action: GovernanceDecision }>;
  
  // Latency & Metrics
  latency: LatencyBreakdown;
  
  // Human Review context
  reviewer?: string;
  reviewStatus?: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'EDITED_AND_RELEASED';
  reviewTimestamp?: string;
  reviewNotes?: string;
  
  // Stages history for visualization
  pipelineStages: RuntimeStageState[];
}

export interface ScenarioPreset {
  id: string;
  title: string;
  category: 'COMPLIANT' | 'INJECTION' | 'PII' | 'HALLUCINATION' | 'HIGH_COST' | 'CACHE' | 'TOXICITY' | 'AMBIGUOUS';
  tag: string;
  tagColor: string;
  description: string;
  application: TargetApplication;
  model: TargetModel;
  prompt: string;
  expectedDecision: GovernanceDecision;
}

export interface ReviewQueueItem {
  id: string;
  runtimeEventId: string;
  requestId: string;
  timestamp: string;
  application: TargetApplication;
  user: string;
  model: TargetModel;
  riskScore: number;
  triggeredPolicies: string[];
  inputPrompt: string;
  originalOutput: string;
  proposedRemediation: string;
  evidence: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EDITED';
  reviewer?: string;
  reviewTimestamp?: string;
  reviewNotes?: string;
}

export interface AggregatedMetrics {
  totalRequests: number;
  allowedRequests: number;
  blockedRequests: number;
  editedRequests: number;
  escalatedRequests: number;
  blockRatePercent: number;
  hallucinationRatePercent: number;
  piiIncidentsCount: number;
  promptInjectionAttempts: number;
  policyViolationsCount: number;
  avgLatencyMs: number;
  totalTokensUsed: number;
  estimatedSpendUSD: number;
  costSavedUSD: number;
  cacheHitRatePercent: number;
}
