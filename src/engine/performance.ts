import { PerformanceEvaluation, RiskFactor } from '../types';

export class PerformanceEngine {
  public evaluate(output?: string): { evaluation: PerformanceEvaluation; riskFactors: RiskFactor[] } {
    if (!output) {
      return {
        evaluation: {
          faithfulnessScore: 0,
          hallucinationRisk: 0,
          groundingConfidence: 0,
          responseQualityScore: 0,
          slmGroundingReasoning: 'Not evaluated: no downstream model response was provided.',
          engineStatus: 'WARNING'
        },
        riskFactors: []
      };
    }

    const suspiciousClaim = /(?:made[- ]up|fabricated|fake statute|non-existent|guaranteed legal|100% guaranteed)/i.test(output);
    const lowQuality = output.trim().length < 8;
    const hallucinationRisk = suspiciousClaim ? 85 : lowQuality ? 55 : 10;
    const faithfulnessScore = 100 - hallucinationRisk;
    const riskFactors: RiskFactor[] = suspiciousClaim
      ? [{
          factor: 'Ungrounded downstream claim',
          points: 35,
          engine: 'PERFORMANCE',
          description: 'The postflight checker found language associated with fabricated or ungrounded claims.'
        }]
      : [];

    return {
      evaluation: {
        faithfulnessScore,
        hallucinationRisk,
        groundingConfidence: faithfulnessScore,
        responseQualityScore: lowQuality ? 45 : 90,
        slmGroundingReasoning: suspiciousClaim
          ? 'Postflight check identified potentially ungrounded claims in the model response.'
          : `Postflight response check passed for ${output.length}-character output.`,
        engineStatus: suspiciousClaim ? 'ESCALATED' : lowQuality ? 'WARNING' : 'PASSED'
      },
      riskFactors
    };
  }
}
