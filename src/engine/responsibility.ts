import { ResponsibilityEvaluation, RiskFactor } from '../types';

export class ResponsibilityEngine {
  /**
   * Deterministic PII Identification & Redaction Engine
   */
  public evaluate(prompt: string): { evaluation: ResponsibilityEvaluation; riskFactors: RiskFactor[] } {
    let sanitized = prompt;
    const detectedEntities: ResponsibilityEvaluation['detectedEntities'] = [];
    const riskFactors: RiskFactor[] = [];

    // 1. Aadhaar Number Pattern (India 12-digit)
    const aadhaarRegex = /\b[2-9]{1}[0-9]{3}[\s-]?[0-9]{4}[\s-]?[0-9]{4}\b/g;
    let aadhaarMatch;
    while ((aadhaarMatch = aadhaarRegex.exec(prompt)) !== null) {
      const raw = aadhaarMatch[0];
      const redacted = '[REDACTED_AADHAAR_XXXX-XXXX-' + raw.replace(/[\s-]/g, '').slice(-4) + ']';
      detectedEntities.push({
        type: 'AADHAAR',
        raw,
        redacted,
        location: 'prompt[chars ' + aadhaarMatch.index + '..' + (aadhaarMatch.index + raw.length) + ']'
      });
      sanitized = sanitized.replace(raw, redacted);
    }

    // 2. US SSN Pattern (9 digits)
    const ssnRegex = /\b(?!000|666|9\d{2})\d{3}[-\s]?(?!00)\d{2}[-\s]?(?!0000)\d{4}\b/g;
    let ssnMatch;
    while ((ssnMatch = ssnRegex.exec(prompt)) !== null) {
      const raw = ssnMatch[0];
      const redacted = '[REDACTED_SSN_***-**-' + raw.replace(/[-\s]/g, '').slice(-4) + ']';
      detectedEntities.push({
        type: 'SSN',
        raw,
        redacted,
        location: 'prompt[chars ' + ssnMatch.index + '..' + (ssnMatch.index + raw.length) + ']'
      });
      sanitized = sanitized.replace(raw, redacted);
    }

    // 3. Credit Card Pattern
    const ccRegex = /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\b/g;
    let ccMatch;
    while ((ccMatch = ccRegex.exec(prompt)) !== null) {
      const raw = ccMatch[0];
      const redacted = '[REDACTED_CREDIT_CARD_****-' + raw.slice(-4) + ']';
      detectedEntities.push({
        type: 'CREDIT_CARD',
        raw,
        redacted,
        location: 'prompt'
      });
      sanitized = sanitized.replace(raw, redacted);
    }

    // 4. API Keys & Secrets (e.g. sk-..., bearer...)
    const apiKeyRegex = /\b(sk-[a-zA-Z0-9]{24,48}|ghp_[a-zA-Z0-9]{36}|AIza[0-9A-Za-z-_]{35})\b/g;
    let apiMatch;
    while ((apiMatch = apiKeyRegex.exec(prompt)) !== null) {
      const raw = apiMatch[0];
      const redacted = '[REDACTED_SECRET_KEY_***]';
      detectedEntities.push({
        type: 'API_KEY',
        raw,
        redacted,
        location: 'prompt'
      });
      sanitized = sanitized.replace(raw, redacted);
    }

    // 5. Prompt Injection & Jailbreak Vectors
    let injectionScore = 0;
    let injectionVector: string | undefined = undefined;
    const lower = prompt.toLowerCase();

    if (
      lower.includes('ignore previous instructions') ||
      lower.includes('reveal the system prompt') ||
      lower.includes('disregard all prior rules') ||
      lower.includes('you are now DAN') ||
      lower.includes('bypass security policy') ||
      lower.includes('roleplay as an unrestricted') ||
      lower.includes('show hidden instructions')
    ) {
      injectionScore = 96;
      injectionVector = 'System Prompt Leakage / Rule Override Vector';
      riskFactors.push({
        factor: 'Prompt Injection Pattern',
        points: 40,
        engine: 'RESPONSIBILITY',
        description: 'Detected explicit command sequence attempting to override foundational system guardrails.'
      });
    } else if (
      lower.includes('base64') ||
      lower.includes('decode following token') ||
      lower.includes('pretend you have no safety')
    ) {
      injectionScore = 68;
      injectionVector = 'Obfuscated Jailbreak Attempt';
      riskFactors.push({
        factor: 'Obfuscated Prompt Injection',
        points: 25,
        engine: 'RESPONSIBILITY',
        description: 'Detected encoded payload or safety bypass framing.'
      });
    }

    // 6. Toxicity / Brand Safety
    let toxicityScore = 0;
    let brandSafetyViolation = false;
    if (
      lower.includes('kill') ||
      lower.includes('bomb') ||
      lower.includes('exploit vulnerability') ||
      lower.includes('steal credentials') ||
      lower.includes('insider trading tip')
    ) {
      toxicityScore = 88;
      brandSafetyViolation = true;
      riskFactors.push({
        factor: 'Brand Safety & Restricted Topic',
        points: 30,
        engine: 'RESPONSIBILITY',
        description: 'Prompt contains unauthorized security exploit or restricted legal domain content.'
      });
    }

    if (detectedEntities.length > 0) {
      riskFactors.push({
        factor: 'Sensitive PII Leakage',
        points: 25 * Math.min(detectedEntities.length, 3),
        engine: 'RESPONSIBILITY',
        description: 'Identified ' + detectedEntities.length + ' unprotected sensitive PII entity in payload.'
      });
    }

    const piiDetected = detectedEntities.length > 0;
    const injectionDetected = injectionScore >= 65;

    let engineStatus: ResponsibilityEvaluation['engineStatus'] = 'PASSED';
    let reason = 'Payload passed all deterministic PII and injection security boundaries.';

    if (injectionDetected || brandSafetyViolation) {
      engineStatus = 'BLOCKED';
      reason = injectionVector || 'Brand safety / restricted topic violation detected.';
    } else if (piiDetected) {
      engineStatus = 'INTERVENED';
      reason = 'Intervened with automated PII token redaction before model forwarding.';
    }

    return {
      evaluation: {
        piiDetected,
        detectedEntities,
        promptInjectionScore: injectionScore,
        injectionDetected,
        injectionVector,
        toxicityScore,
        brandSafetyViolation,
        sanitizedPrompt: sanitized,
        engineStatus,
        reason
      },
      riskFactors
    };
  }
}
