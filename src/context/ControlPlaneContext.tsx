import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AggregatedMetrics } from '../types';
import { useExecution } from './ExecutionContext';
import { usePolicies } from './PoliciesContext';
import { useReviewQueue } from './ReviewQueueContext';

interface ControlPlaneContextType {
  // Re-exported from child contexts (for backward compatibility)
  isExecuting: boolean;
  activePrompt: string;
  setActivePrompt: (prompt: string) => void;
  selectedApplication: ReturnType<typeof useExecution>['selectedApplication'];
  setSelectedApplication: ReturnType<typeof useExecution>['setSelectedApplication'];
  selectedModel: ReturnType<typeof useExecution>['selectedModel'];
  setSelectedModel: ReturnType<typeof useExecution>['setSelectedModel'];
  activeStages: ReturnType<typeof useExecution>['activeStages'];
  currentEvent: ReturnType<typeof useExecution>['currentEvent'];
  executeProxyRequest: (
    customPrompt?: string,
    options?: { application?: ReturnType<typeof useExecution>['selectedApplication']; model?: ReturnType<typeof useExecution>['selectedModel'] }
  ) => Promise<any>;
  runtimeEvents: ReturnType<typeof useExecution>['runtimeEvents'];
  policies: ReturnType<typeof usePolicies>['policies'];
  reviewQueue: ReturnType<typeof useReviewQueue>['reviewQueue'];
  updatePolicy: ReturnType<typeof usePolicies>['updatePolicy'];
  togglePolicyStatus: (policyId: string) => Promise<void>;
  createPolicy: ReturnType<typeof usePolicies>['createPolicy'];
  approveReviewItem: (itemId: string, notes?: string) => Promise<void>;
  rejectReviewItem: (itemId: string, notes?: string) => Promise<void>;
  editReviewItem: (itemId: string, editedRemediation: string, notes?: string) => Promise<void>;
  approveAllLowRisk?: () => Promise<void>;
  metrics: AggregatedMetrics;
  backendConnected: boolean;
  
  // Navigation
  activeTab: 'sandbox' | 'observability' | 'governance' | 'review' | 'audit' | 'architecture';
  setActiveTab: (tab: 'sandbox' | 'observability' | 'governance' | 'review' | 'audit' | 'architecture') => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  
  // New: Metrics computation
  computeMetrics: () => AggregatedMetrics;
}

const ControlPlaneContext = createContext<ControlPlaneContextType | undefined>(undefined);

export const ControlPlaneProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const execution = useExecution();
  const policiesCtx = usePolicies();
  const reviewQueueCtx = useReviewQueue();

  const [activeTab, setActiveTab] = useState<'sandbox' | 'observability' | 'governance' | 'review' | 'audit' | 'architecture'>('sandbox');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Compute aggregated metrics from runtime events
  const computeMetrics = (): AggregatedMetrics => {
    const events = execution.runtimeEvents;
    const policies = policiesCtx.policies;

    const totalInvocations = events.length;
    const blockedCount = events.filter(e => e.decision === 'BLOCK').length;
    const allowedCount = events.filter(e => e.decision === 'ALLOW').length;
    const editedCount = events.filter(e => e.decision === 'EDIT').length;
    const escalatedCount = events.filter(e => e.decision === 'ESCALATE').length;

    const blockRate = totalInvocations > 0 ? Math.round((blockedCount / totalInvocations) * 100) : 0;
    const hallucRateEvents = events.filter(e => e.performance.hallucinationRisk >= 40);
    const hallucRate = totalInvocations > 0 ? Math.round((hallucRateEvents.length / totalInvocations) * 100) : 0;

    const totalTokensSpent = events.reduce((sum, e) => sum + e.cost.totalTokens, 0);
    const cachedCount = events.filter(e => e.cost.cacheHit).length;

    const avgLatency = totalInvocations > 0
      ? Math.round(events.reduce((sum, e) => sum + e.latency.totalLatencyMs, 0) / totalInvocations)
      : 0;

    const threatCategoriesMap: { [key: string]: number } = {};
    events.forEach(e => {
      e.riskFactors?.forEach(rf => {
        threatCategoriesMap[rf.factor] = (threatCategoriesMap[rf.factor] || 0) + 1;
      });
    });

    const threatCategories = Object.entries(threatCategoriesMap).map(([name, count]) => ({
      name,
      count,
    }));

    return {
      totalRequests: totalInvocations,
      allowedRequests: allowedCount,
      blockedRequests: blockedCount,
      editedRequests: editedCount,
      escalatedRequests: escalatedCount,
      blockRatePercent: blockRate,
      hallucinationRatePercent: hallucRate,
      piiIncidentsCount: events.reduce((sum, e) => sum + e.responsibility.detectedEntities.length, 0),
      promptInjectionAttempts: events.filter(e => e.responsibility.injectionDetected).length,
      policyViolationsCount: events.reduce((sum, e) => sum + e.triggeredPolicies.length, 0),
      avgLatencyMs: avgLatency,
      totalTokensUsed: totalTokensSpent,
      estimatedSpendUSD: events.reduce((sum, e) => sum + e.cost.estimatedCostWithControlPlane, 0),
      costSavedUSD: events.reduce((sum, e) => sum + e.cost.savingsAmount, 0),
      cacheHitRatePercent: totalInvocations > 0 ? Math.round((cachedCount / totalInvocations) * 100) : 0,
    };
  };

  const metrics = computeMetrics();

  const value: ControlPlaneContextType = {
    // Execution context
    isExecuting: execution.isExecuting,
    activePrompt: execution.activePrompt,
    setActivePrompt: execution.setActivePrompt,
    selectedApplication: execution.selectedApplication,
    setSelectedApplication: execution.setSelectedApplication,
    selectedModel: execution.selectedModel,
    setSelectedModel: execution.setSelectedModel,
    activeStages: execution.activeStages,
    currentEvent: execution.currentEvent,
    runtimeEvents: execution.runtimeEvents,
    executeProxyRequest: (
      customPrompt?: string,
      options?: { application?: ReturnType<typeof useExecution>['selectedApplication']; model?: ReturnType<typeof useExecution>['selectedModel'] }
    ) => execution.executeProxyRequest(policiesCtx.policies, customPrompt, options),
    backendConnected: execution.backendConnected,

    // Policies context
    policies: policiesCtx.policies,
    updatePolicy: policiesCtx.updatePolicy,
    togglePolicyStatus: policiesCtx.togglePolicyStatus,
    createPolicy: policiesCtx.createPolicy,

    // Review queue context
    reviewQueue: reviewQueueCtx.reviewQueue,
    approveReviewItem: reviewQueueCtx.approveReviewItem,
    rejectReviewItem: reviewQueueCtx.rejectReviewItem,
    editReviewItem: reviewQueueCtx.editReviewItem,
    approveAllLowRisk: reviewQueueCtx.approveAllLowRisk,

    // Metrics
    metrics,
    computeMetrics,

    // Navigation
    activeTab,
    setActiveTab,
    isSearchOpen,
    setIsSearchOpen,
  };

  return (
    <ControlPlaneContext.Provider value={value}>
      {children}
    </ControlPlaneContext.Provider>
  );
};

export const useControlPlane = (): ControlPlaneContextType => {
  const context = useContext(ControlPlaneContext);
  if (!context) {
    throw new Error('useControlPlane must be used within ControlPlaneProvider');
  }
  return context;
};
