import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { PolicyRule } from '../types';
import { DEFAULT_POLICIES } from '../engine/defaultPolicies';
import { apiService } from '../services/api';

interface PoliciesContextType {
  policies: PolicyRule[];
  updatePolicy: (updated: PolicyRule) => Promise<void>;
  togglePolicyStatus: (policyId: string) => Promise<void>;
  createPolicy: (policy: PolicyRule) => Promise<void>;
  deletePolicy: (policyId: string) => Promise<void>;
  applyPolicyTemplate: (templatePolicies: PolicyRule[]) => Promise<void>;
  activePoliciesCount: number;
}

const PoliciesContext = createContext<PoliciesContextType | undefined>(undefined);

export const PoliciesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [policies, setPolicies] = useState<PolicyRule[]>(() => {
    const saved = localStorage.getItem('controlplane_policies');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return DEFAULT_POLICIES;
  });

  // Sync to localStorage whenever policies change
  useEffect(() => {
    localStorage.setItem('controlplane_policies', JSON.stringify(policies));
  }, [policies]);

  // Memoized active policies count to avoid re-renders
  const activePoliciesCount = useMemo(() => {
    return policies.filter(p => p.status === 'ACTIVE').length;
  }, [policies]);

  const updatePolicy = async (updated: PolicyRule): Promise<void> => {
    setPolicies(prev => prev.map(p => p.id === updated.id ? updated : p));
    
    try {
      await apiService.updatePolicy(updated);
    } catch {
      // Revert on error
      const saved = localStorage.getItem('controlplane_policies');
      if (saved) {
        try { setPolicies(JSON.parse(saved)); } catch (e) { /* fallback */ }
      }
    }
  };

  const togglePolicyStatus = async (policyId: string): Promise<void> => {
    const policy = policies.find(p => p.id === policyId);
    if (!policy) return;

    const newStatus = policy.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
    const updated = { ...policy, status: newStatus as any };

    setPolicies(prev => prev.map(p => p.id === policyId ? updated : p));

    try {
      await apiService.updatePolicy(updated);
    } catch {
      const saved = localStorage.getItem('controlplane_policies');
      if (saved) {
        try { setPolicies(JSON.parse(saved)); } catch (e) { /* fallback */ }
      }
    }
  };

  const createPolicy = async (policy: PolicyRule): Promise<void> => {
    setPolicies(prev => [policy, ...prev]);

    try {
      await apiService.createPolicy(policy);
    } catch {
      const saved = localStorage.getItem('controlplane_policies');
      if (saved) {
        try { setPolicies(JSON.parse(saved)); } catch (e) { /* fallback */ }
      }
    }
  };

  const deletePolicy = async (policyId: string): Promise<void> => {
    setPolicies(prev => prev.filter(p => p.id !== policyId));

    try {
      // Note: Add delete endpoint to apiService if needed
      // await apiService.deletePolicy(policyId);
    } catch {
      const saved = localStorage.getItem('controlplane_policies');
      if (saved) {
        try { setPolicies(JSON.parse(saved)); } catch (e) { /* fallback */ }
      }
    }
  };

  const applyPolicyTemplate = async (templatePolicies: PolicyRule[]): Promise<void> => {
    // Merge template policies with existing ones, avoiding duplicates
    setPolicies(prev => {
      const merged = [...prev];
      templatePolicies.forEach(newPolicy => {
        const existingIndex = merged.findIndex(p => p.id === newPolicy.id);
        if (existingIndex >= 0) {
          merged[existingIndex] = newPolicy;
        } else {
          merged.push(newPolicy);
        }
      });
      return merged;
    });

    try {
      // Optionally sync to backend
      for (const policy of templatePolicies) {
        const exists = await apiService.getPolicies().then(ps => ps.some(p => p.id === policy.id));
        if (exists) {
          await apiService.updatePolicy(policy);
        } else {
          await apiService.createPolicy(policy);
        }
      }
    } catch {
      // Revert on error
      const saved = localStorage.getItem('controlplane_policies');
      if (saved) {
        try { setPolicies(JSON.parse(saved)); } catch (e) { /* fallback */ }
      }
    }
  };

  const value: PoliciesContextType = {
    policies,
    updatePolicy,
    togglePolicyStatus,
    createPolicy,
    deletePolicy,
    applyPolicyTemplate,
    activePoliciesCount,
  };

  return (
    <PoliciesContext.Provider value={value}>
      {children}
    </PoliciesContext.Provider>
  );
};

export const usePolicies = (): PoliciesContextType => {
  const context = useContext(PoliciesContext);
  if (!context) {
    throw new Error('usePolicies must be used within PoliciesProvider');
  }
  return context;
};
