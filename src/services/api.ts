import { 
  AggregatedMetrics, 
  PolicyRule, 
  ReviewQueueItem, 
  RuntimeEvent, 
  ScenarioPreset, 
  TargetApplication, 
  TargetModel 
} from '../types';

const API_BASE = '/api';

export const apiService = {
  async checkHealth(): Promise<{ status: string; version: string; activePoliciesCount: number }> {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch {
      return { status: 'offline', version: '2.4.0', activePoliciesCount: 7 };
    }
  },

  async getScenarios(): Promise<ScenarioPreset[]> {
    const res = await fetch(`${API_BASE}/scenarios`);
    if (!res.ok) throw new Error('Failed to fetch scenarios');
    return await res.json();
  },

  async evaluateProxy(
    prompt: string, 
    application: TargetApplication, 
    model: TargetModel, 
    scenarioId?: string
  ): Promise<{ event: RuntimeEvent; metrics: AggregatedMetrics }> {
    const res = await fetch(`${API_BASE}/proxy/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, application, model, scenarioId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Evaluation failed' }));
      throw new Error(err.error || 'Evaluation failed');
    }
    return await res.json();
  },

  async getPolicies(): Promise<PolicyRule[]> {
    const res = await fetch(`${API_BASE}/policies`);
    if (!res.ok) throw new Error('Failed to fetch policies');
    return await res.json();
  },

  async createPolicy(policy: PolicyRule): Promise<PolicyRule> {
    const res = await fetch(`${API_BASE}/policies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policy)
    });
    if (!res.ok) throw new Error('Failed to create policy');
    return await res.json();
  },

  async updatePolicy(policy: PolicyRule): Promise<PolicyRule> {
    const res = await fetch(`${API_BASE}/policies/${policy.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policy)
    });
    if (!res.ok) throw new Error('Failed to update policy');
    return await res.json();
  },

  async togglePolicyStatus(id: string): Promise<PolicyRule> {
    const res = await fetch(`${API_BASE}/policies/${id}/status`, {
      method: 'PATCH'
    });
    if (!res.ok) throw new Error('Failed to toggle policy status');
    return await res.json();
  },

  async getReviews(): Promise<ReviewQueueItem[]> {
    const res = await fetch(`${API_BASE}/reviews`);
    if (!res.ok) throw new Error('Failed to fetch review queue');
    return await res.json();
  },

  async actionReview(
    id: string, 
    action: 'APPROVE' | 'REJECT' | 'EDIT', 
    remediation?: string, 
    notes?: string
  ): Promise<{ success: boolean; reviewItem: ReviewQueueItem; metrics: AggregatedMetrics }> {
    const res = await fetch(`${API_BASE}/reviews/${id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, remediation, notes })
    });
    if (!res.ok) throw new Error('Failed to execute review action');
    return await res.json();
  },

  async getEvents(): Promise<RuntimeEvent[]> {
    const res = await fetch(`${API_BASE}/events`);
    if (!res.ok) throw new Error('Failed to fetch audit events');
    return await res.json();
  },

  async getMetrics(): Promise<AggregatedMetrics> {
    const res = await fetch(`${API_BASE}/metrics`);
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return await res.json();
  }
};
