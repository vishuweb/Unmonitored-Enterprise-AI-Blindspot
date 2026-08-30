import { CostEvaluation, ProviderUsage, TargetModel } from '../types';

export class CostEngine {
  public evaluate(
    prompt: string,
    selectedModel: TargetModel,
    usage?: ProviderUsage,
    providerConfigured = false,
    providerModel?: string
  ): CostEvaluation {
    if (usage) {
      const pricing = this.pricingFor(providerModel || selectedModel);
      const reportedCost = usage.costUsd;
      const calculatedCost = pricing
        ? (usage.inputTokens / 1000) * pricing.input + (usage.outputTokens / 1000) * pricing.output
        : undefined;
      const cost = reportedCost ?? calculatedCost ?? 0;
      const costMeasured = reportedCost !== undefined || calculatedCost !== undefined;
      return {
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
        cacheHit: false,
        cacheSimilarityScore: 0,
        originalModel: selectedModel,
        routedModel: selectedModel,
        routingReason: costMeasured
          ? 'Usage and cost measured from the configured downstream provider.'
          : 'Provider usage was reported, but no pricing configuration is available for this model.',
        estimatedCostWithoutControlPlane: cost,
        estimatedCostWithControlPlane: cost,
        savingsAmount: 0,
        savingsPercentage: 0,
        engineStatus: costMeasured ? 'PASSED' : 'WARNING'
      };
    }

    return {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      cacheHit: false,
      cacheSimilarityScore: 0,
      originalModel: selectedModel,
      routedModel: selectedModel,
      routingReason: providerConfigured
        ? 'Downstream provider is configured, but it did not report token usage. Cost was not measured.'
        : `No downstream model or pricing provider is configured. Cost was not measured for this ${prompt.length}-character prompt.`,
      estimatedCostWithoutControlPlane: 0,
      estimatedCostWithControlPlane: 0,
      savingsAmount: 0,
      savingsPercentage: 0,
      engineStatus: 'WARNING'
    };
  }

  private pricingFor(model: string): { input: number; output: number } | undefined {
    if (/gpt-4o(?!-mini)/i.test(model) || model === 'GPT-4o (128K)') return { input: 0.005, output: 0.015 };
    if (/gpt-4o-mini/i.test(model) || model === 'GPT-4o-mini (128K)') return { input: 0.00015, output: 0.0006 };
    if (/claude.*sonnet/i.test(model) || model === 'Claude 3.5 Sonnet (200K)') return { input: 0.003, output: 0.015 };
    if (/llama-3-70b/i.test(model) || model === 'Llama-3-70B (8K)') return { input: 0.0009, output: 0.0009 };
    return undefined;
  }
}
