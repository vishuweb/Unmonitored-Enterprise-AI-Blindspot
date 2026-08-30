import { PolicyRule } from '../types';

/**
 * Policy Templates - Pre-configured bundles for quick setup
 * These can be applied directly to set up governance quickly for hackathon/demo
 */

export interface PolicyTemplate {
  id: string;
  name: string;
  description: string;
  policies: PolicyRule[];
  icon: string;
}

/**
 * SECURITY-FIRST TEMPLATE
 * Maximum protection against injection, jailbreaks, and data leaks
 * Best for: Finance, Healthcare, Government applications
 */
export const SECURITY_FIRST: PolicyTemplate = {
  id: 'tpl-security-first',
  name: 'Security-First',
  description: 'Maximum protection against injection, jailbreaks, data leaks, and brand safety violations.',
  icon: 'ShieldAlert',
  policies: [
    {
      id: 'pol-pii-01',
      name: 'PII & National ID Protection Guard',
      category: 'PRIVACY',
      engine: 'RESPONSIBILITY',
      description: 'Inspects and automatically redacts Aadhaar, SSN, Credit Cards, and Auth Tokens prior to model forwarding.',
      severity: 'CRITICAL',
      action: 'EDIT',
      threshold: 80,
      status: 'ACTIVE',
      version: 'v3.2',
      updatedAt: '2026-08-20 14:30 UTC',
      author: 'Security Team',
    },
    {
      id: 'pol-inj-02',
      name: 'Prompt Injection & Jailbreak Defense',
      category: 'SECURITY',
      engine: 'RESPONSIBILITY',
      description: 'Real-time structural detection of system prompt leaks, roleplay escapes, and indirect token overrides.',
      severity: 'CRITICAL',
      action: 'BLOCK',
      threshold: 75,
      status: 'ACTIVE',
      version: 'v4.1',
      updatedAt: '2026-08-22 09:15 UTC',
      author: 'AI Red Team',
    },
    {
      id: 'pol-tox-04',
      name: 'Brand Safety & Content Moderation',
      category: 'SECURITY',
      engine: 'RESPONSIBILITY',
      description: 'Blocks toxicity, hate speech, proprietary IP disclosure, and unsafe enterprise directives.',
      severity: 'HIGH',
      action: 'BLOCK',
      threshold: 65,
      status: 'ACTIVE',
      version: 'v2.0',
      updatedAt: '2026-08-10 11:20 UTC',
      author: 'Legal & Compliance',
    },
    {
      id: 'pol-res-06',
      name: 'Data Residency & Cross-Border Guard',
      category: 'COMPLIANCE',
      engine: 'RESPONSIBILITY',
      description: 'Ensures EU/India data residency compliance. Blocks routing to uncertified cloud regions.',
      severity: 'CRITICAL',
      action: 'BLOCK',
      threshold: 90,
      status: 'ACTIVE',
      version: 'v1.5',
      updatedAt: '2026-08-05 10:00 UTC',
      author: 'Data Privacy Officer',
    },
  ],
};

/**
 * COST-OPTIMIZED TEMPLATE
 * Focus on semantic caching, model routing, and spend optimization
 * Best for: High-volume customer service, internal automation
 */
export const COST_OPTIMIZED: PolicyTemplate = {
  id: 'tpl-cost-optimized',
  name: 'Cost-Optimized',
  description: 'Maximize semantic caching, dynamic model routing, and spend efficiency.',
  icon: 'DollarSign',
  policies: [
    {
      id: 'pol-cst-05',
      name: 'Semantic Cache & Dynamic Model Tiering',
      category: 'COST',
      engine: 'COST',
      description: 'Routes low-complexity requests to lightweight models and serves FAQ queries directly from Semantic Cache.',
      severity: 'MEDIUM',
      action: 'ALLOW',
      threshold: 88,
      status: 'ACTIVE',
      version: 'v1.8',
      updatedAt: '2026-08-15 16:45 UTC',
      author: 'FinOps AI Lead',
    },
    {
      id: 'pol-pii-01',
      name: 'PII & National ID Protection Guard',
      category: 'PRIVACY',
      engine: 'RESPONSIBILITY',
      description: 'Inspects and automatically redacts Aadhaar, SSN, Credit Cards, and Auth Tokens prior to model forwarding.',
      severity: 'CRITICAL',
      action: 'EDIT',
      threshold: 80,
      status: 'ACTIVE',
      version: 'v3.2',
      updatedAt: '2026-08-20 14:30 UTC',
      author: 'Security Team',
    },
    {
      id: 'pol-inj-02',
      name: 'Prompt Injection & Jailbreak Defense',
      category: 'SECURITY',
      engine: 'RESPONSIBILITY',
      description: 'Real-time structural detection of system prompt leaks, roleplay escapes, and indirect token overrides.',
      severity: 'CRITICAL',
      action: 'BLOCK',
      threshold: 75,
      status: 'ACTIVE',
      version: 'v4.1',
      updatedAt: '2026-08-22 09:15 UTC',
      author: 'AI Red Team',
    },
  ],
};

/**
 * COMPLIANCE-STRICT TEMPLATE
 * Enforce maximum governance for regulated industries
 * Best for: Financial services, Healthcare, Government
 */
export const COMPLIANCE_STRICT: PolicyTemplate = {
  id: 'tpl-compliance-strict',
  name: 'Compliance-Strict',
  description: 'Enforce maximum governance, data residency, and human-in-the-loop for regulated industries.',
  icon: 'CheckCircle2',
  policies: [
    {
      id: 'pol-pii-01',
      name: 'PII & National ID Protection Guard',
      category: 'PRIVACY',
      engine: 'RESPONSIBILITY',
      description: 'Inspects and automatically redacts Aadhaar, SSN, Credit Cards, and Auth Tokens prior to model forwarding.',
      severity: 'CRITICAL',
      action: 'EDIT',
      threshold: 80,
      status: 'ACTIVE',
      version: 'v3.2',
      updatedAt: '2026-08-20 14:30 UTC',
      author: 'Security Team',
    },
    {
      id: 'pol-hal-03',
      name: 'Hallucination & Faithfulness Threshold',
      category: 'QUALITY',
      engine: 'PERFORMANCE',
      description: 'Evaluates claim grounding against enterprise knowledgebase. Escalate to human review if faithfulness is below 70%.',
      severity: 'HIGH',
      action: 'ESCALATE',
      threshold: 70,
      status: 'ACTIVE',
      version: 'v2.4',
      updatedAt: '2026-08-18 17:00 UTC',
      author: 'Product Quality Guild',
    },
    {
      id: 'pol-res-06',
      name: 'Data Residency & Cross-Border Guard',
      category: 'COMPLIANCE',
      engine: 'RESPONSIBILITY',
      description: 'Ensures EU/India data residency compliance. Blocks routing to uncertified cloud regions.',
      severity: 'CRITICAL',
      action: 'BLOCK',
      threshold: 90,
      status: 'ACTIVE',
      version: 'v1.5',
      updatedAt: '2026-08-05 10:00 UTC',
      author: 'Data Privacy Officer',
    },
    {
      id: 'pol-esc-07',
      name: 'High-Impact Autonomous Action Escalation',
      category: 'COMPLIANCE',
      engine: 'PERFORMANCE',
      description: 'Forces human confirmation for financial disbursements, database deletions, or irreversible user actions.',
      severity: 'HIGH',
      action: 'ESCALATE',
      threshold: 60,
      status: 'ACTIVE',
      version: 'v3.0',
      updatedAt: '2026-08-24 08:30 UTC',
      author: 'Risk & Safety Committee',
    },
  ],
};

/**
 * QUALITY-FIRST TEMPLATE
 * Focus on hallucination detection, faithfulness scoring, and grounding validation
 * Best for: Knowledge management, research, analytics applications
 */
export const QUALITY_FIRST: PolicyTemplate = {
  id: 'tpl-quality-first',
  name: 'Quality-First',
  description: 'Prioritize accuracy, hallucination detection, and faithfulness scoring.',
  icon: 'Gauge',
  policies: [
    {
      id: 'pol-hal-03',
      name: 'Hallucination & Faithfulness Threshold',
      category: 'QUALITY',
      engine: 'PERFORMANCE',
      description: 'Evaluates claim grounding against enterprise knowledgebase. Escalate to human review if faithfulness is below 70%.',
      severity: 'HIGH',
      action: 'ESCALATE',
      threshold: 70,
      status: 'ACTIVE',
      version: 'v2.4',
      updatedAt: '2026-08-18 17:00 UTC',
      author: 'Product Quality Guild',
    },
    {
      id: 'pol-pii-01',
      name: 'PII & National ID Protection Guard',
      category: 'PRIVACY',
      engine: 'RESPONSIBILITY',
      description: 'Inspects and automatically redacts Aadhaar, SSN, Credit Cards, and Auth Tokens prior to model forwarding.',
      severity: 'CRITICAL',
      action: 'EDIT',
      threshold: 80,
      status: 'ACTIVE',
      version: 'v3.2',
      updatedAt: '2026-08-20 14:30 UTC',
      author: 'Security Team',
    },
    {
      id: 'pol-inj-02',
      name: 'Prompt Injection & Jailbreak Defense',
      category: 'SECURITY',
      engine: 'RESPONSIBILITY',
      description: 'Real-time structural detection of system prompt leaks, roleplay escapes, and indirect token overrides.',
      severity: 'CRITICAL',
      action: 'BLOCK',
      threshold: 75,
      status: 'ACTIVE',
      version: 'v4.1',
      updatedAt: '2026-08-22 09:15 UTC',
      author: 'AI Red Team',
    },
  ],
};

/**
 * All available templates
 */
export const POLICY_TEMPLATES: PolicyTemplate[] = [
  SECURITY_FIRST,
  COST_OPTIMIZED,
  COMPLIANCE_STRICT,
  QUALITY_FIRST,
];

/**
 * Utility function to get a template by ID
 */
export const getPolicyTemplate = (templateId: string): PolicyTemplate | undefined => {
  return POLICY_TEMPLATES.find(t => t.id === templateId);
};

/**
 * Utility function to get all template names (for UI dropdowns)
 */
export const getTemplateNames = (): { id: string; name: string; description: string }[] => {
  return POLICY_TEMPLATES.map(t => ({ id: t.id, name: t.name, description: t.description }));
};
