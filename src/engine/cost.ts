import { CostEvaluation, TargetModel } from '../types';

export interface ModelPricing {
  inputPer1k: number; // USD
  outputPer1k: number; // USD
}

export const MODEL_PRICING: Record<TargetModel, ModelPricing> = {
  'GPT-4o (128K)': { inputPer1k: 0.005, outputPer1k: 0.015 },
  'Claude 3.5 Sonnet (200K)': { inputPer1k: 0.003, outputPer1k: 0.015 },
  'Llama-3-70B (8K)': { inputPer1k: 0.0008, outputPer1k: 0.001 },
  'GPT-4o-mini (128K)': { inputPer1k: 0.00015, outputPer1k: 0.0006 }
};

export class CostEngine {
  private semanticCacheStore: Array<{ query: string; response: string; key: string }> = [
    {
      query: 'What is the enterprise travel reimbursement policy for domestic flights in economy class?',
      response: 'Under Acme Corp Policy 4.2: All domestic flights under 5 hours must be booked in Standard Economy via Concur at least 14 days in advance. Reimbursement limits are $450/flight.',
      key: 'cache_faq_travel_402'
    },
    {
      query: 'How do I reset my multi-factor authentication hardware token on Okta?',
      response: 'To reset your MFA hardware token: Navigate to identity.acme.corp/mfa-recovery, authenticate using your temporary backup codes, or contact IT Helpdesk at ext #4357.',
      key: 'cache_faq_okta_mfa'
    },
    {
      query: 'What is the standard SLA for Sev-1 production incident resolution?',
      response: 'The standard Sev-1 resolution SLA is 15-minute response, 1-hour containment, and 4-hour post-incident review under Enterprise IT Service Level Agreements.',
      key: 'cache_faq_sla_sev1'
    }
  ];

  public evaluate(prompt: string, selectedModel: TargetModel, complexityScore: number): CostEvaluation {
    const inputTokens = Math.max(12, Math.round(prompt.length / 3.8));
    
    // 1. Semantic Cache Evaluation
    let cacheHit = false;
    let cacheSimilarityScore = 0.32;
    let cachedKey: string | undefined = undefined;

    const lower = prompt.toLowerCase();
    for (const item of this.semanticCacheStore) {
      if (
        lower.includes('travel reimbursement') ||
        lower.includes('reset my multi-factor') ||
        lower.includes('sla for sev-1') ||
        lower.includes('cached faq') ||
        lower.includes('onboarding query')
      ) {
        cacheHit = true;
        cacheSimilarityScore = 0.94;
        cachedKey = item.key;
        break;
      }
    }

    // 2. Dynamic Model Routing
    let routedModel = selectedModel;
    let routingReason = 'Retained selected model (' + selectedModel + ') based on standard governance policy.';

    if (cacheHit) {
      routedModel = selectedModel;
      routingReason = 'Semantic cache hit (Similarity ' + Math.round(cacheSimilarityScore * 100) + '%). Redundant LLM inference avoided.';
    } else if (complexityScore < 35 && selectedModel.includes('GPT-4o (128K)')) {
      routedModel = 'GPT-4o-mini (128K)';
      routingReason = 'Smart Routing: Request complexity = ' + complexityScore + ' (< 35). Routed to cost-efficient tier (GPT-4o-mini).';
    } else if (complexityScore > 75 && selectedModel.includes('Llama-3-70B')) {
      routedModel = 'GPT-4o (128K)';
      routingReason = 'Capability Escalation: High complexity reasoning (' + complexityScore + '/100) requires premier model architecture.';
    }

    const outputTokens = cacheHit ? 45 : Math.max(40, Math.round(inputTokens * 1.6));
    const totalTokens = inputTokens + outputTokens;

    // Pricing calculation
    const originalPrice = MODEL_PRICING[selectedModel];
    const routedPrice = MODEL_PRICING[routedModel];

    const costWithout = (inputTokens / 1000) * originalPrice.inputPer1k + (outputTokens / 1000) * originalPrice.outputPer1k;
    
    let costWith = (inputTokens / 1000) * routedPrice.inputPer1k + (outputTokens / 1000) * routedPrice.outputPer1k;
    if (cacheHit) {
      costWith = 0.00002; // Negligible vector lookup cost
    }

    const savingsAmount = Math.max(0, costWithout - costWith);
    const savingsPercentage = costWithout > 0 ? Math.round((savingsAmount / costWithout) * 100) : 0;

    let engineStatus: CostEvaluation['engineStatus'] = 'PASSED';
    if (cacheHit || savingsPercentage > 40) {
      engineStatus = 'INTERVENED';
    }

    return {
      inputTokens,
      outputTokens,
      totalTokens,
      cacheHit,
      cacheSimilarityScore,
      cachedQueryKey: cachedKey,
      originalModel: selectedModel,
      routedModel,
      routingReason,
      estimatedCostWithoutControlPlane: Number(costWithout.toFixed(5)),
      estimatedCostWithControlPlane: Number(costWith.toFixed(5)),
      savingsAmount: Number(savingsAmount.toFixed(5)),
      savingsPercentage,
      engineStatus
    };
  }
}
