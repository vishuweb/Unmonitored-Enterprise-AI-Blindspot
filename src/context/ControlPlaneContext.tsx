import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  AggregatedMetrics, 
  GovernanceDecision, 
  PolicyRule, 
  ReviewQueueItem, 
  RuntimeEvent, 
  RuntimeStageState, 
  ScenarioPreset, 
  TargetApplication, 
  TargetModel 
} from '../types';
import { DEFAULT_POLICIES } from '../engine/defaultPolicies';
import { SCENARIO_PRESETS } from '../engine/scenarios';
import { RuntimePipeline } from '../engine/runtimePipeline';
import { INITIAL_REVIEW_ITEMS, INITIAL_RUNTIME_EVENTS } from './seedData';
import { apiService } from '../services/api';

interface ControlPlaneContextType {
  // Runtime Pipeline state
  isExecuting: boolean;
  activePrompt: string;
  setActivePrompt: (prompt: string) => void;
  selectedApplication: TargetApplication;
  setSelectedApplication: (app: TargetApplication) => void;
  selectedModel: TargetModel;
  setSelectedModel: (model: TargetModel) => void;
  selectedScenario: ScenarioPreset | null;
  loadScenario: (scenario: ScenarioPreset) => void;
  activeStages: RuntimeStageState[];
  currentEvent: RuntimeEvent | null;
  executeProxyRequest: (customPrompt?: string) => Promise<RuntimeEvent>;
  
  // Data Collections
  runtimeEvents: RuntimeEvent[];
  policies: PolicyRule[];
  reviewQueue: ReviewQueueItem[];
  
  // Actions on Data
  updatePolicy: (updated: PolicyRule) => Promise<void>;
  togglePolicyStatus: (policyId: string) => Promise<void>;
  createPolicy: (policy: PolicyRule) => Promise<void>;
  
  // Review Queue Actions
  approveReviewItem: (itemId: string, notes?: string) => Promise<void>;
  rejectReviewItem: (itemId: string, notes?: string) => Promise<void>;
  editReviewItem: (itemId: string, editedRemediation: string, notes?: string) => Promise<void>;
  
  // Metrics & Observability
  metrics: AggregatedMetrics;
  
  // Navigation & Demo Tour
  activeTab: 'sandbox' | 'observability' | 'governance' | 'review' | 'audit' | 'architecture';
  setActiveTab: (tab: 'sandbox' | 'observability' | 'governance' | 'review' | 'audit' | 'architecture') => void;
  isTourActive: boolean;
  tourStepIndex: number;
  startDemoTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  endDemoTour: () => void;
  
  // Quick Search & Modals
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  
  // Backend Status
  backendConnected: boolean;
}

const ControlPlaneContext = createContext<ControlPlaneContextType | undefined>(undefined);
const localPipeline = new RuntimePipeline();

export const ControlPlaneProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<'sandbox' | 'observability' | 'governance' | 'review' | 'audit' | 'architecture'>('sandbox');

  // Runtime Pipeline inputs
  const [activePrompt, setActivePrompt] = useState<string>(SCENARIO_PRESETS[0].prompt);
  const [selectedApplication, setSelectedApplication] = useState<TargetApplication>(SCENARIO_PRESETS[0].application);
  const [selectedModel, setSelectedModel] = useState<TargetModel>(SCENARIO_PRESETS[0].model);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioPreset | null>(SCENARIO_PRESETS[0]);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [activeStages, setActiveStages] = useState<RuntimeStageState[]>([]);
  const [currentEvent, setCurrentEvent] = useState<RuntimeEvent | null>(INITIAL_RUNTIME_EVENTS[0]);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);

  // Core Persistent State
  const [runtimeEvents, setRuntimeEvents] = useState<RuntimeEvent[]>(() => {
    const saved = localStorage.getItem('controlplane_events');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_RUNTIME_EVENTS;
  });

  const [policies, setPolicies] = useState<PolicyRule[]>(() => {
    const saved = localStorage.getItem('controlplane_policies');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return DEFAULT_POLICIES;
  });

  const [reviewQueue, setReviewQueue] = useState<ReviewQueueItem[]>(() => {
    const saved = localStorage.getItem('controlplane_review_queue');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_REVIEW_ITEMS;
  });

  // Tour State
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [tourStepIndex, setTourStepIndex] = useState<number>(0);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Try to connect to backend on mount
  useEffect(() => {
    const initBackend = async () => {
      try {
        const health = await apiService.checkHealth();
        if (health.status === 'healthy') {
          setBackendConnected(true);
          const [serverPolicies, serverEvents, serverReviews] = await Promise.all([
            apiService.getPolicies().catch(() => policies),
            apiService.getEvents().catch(() => runtimeEvents),
            apiService.getReviews().catch(() => reviewQueue)
          ]);
          setPolicies(serverPolicies);
          setRuntimeEvents(serverEvents);
          setReviewQueue(serverReviews);
        }
      } catch {
        setBackendConnected(false);
      }
    };
    initBackend();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('controlplane_events', JSON.stringify(runtimeEvents));
  }, [runtimeEvents]);

  useEffect(() => {
    localStorage.setItem('controlplane_policies', JSON.stringify(policies));
  }, [policies]);

  useEffect(() => {
    localStorage.setItem('controlplane_review_queue', JSON.stringify(reviewQueue));
  }, [reviewQueue]);

  // Scenario Loader
  const loadScenario = (scenario: ScenarioPreset) => {
    setSelectedScenario(scenario);
    setActivePrompt(scenario.prompt);
    setSelectedApplication(scenario.application);
    setSelectedModel(scenario.model);
  };

  // Execution Handler
  const executeProxyRequest = async (customPrompt?: string): Promise<RuntimeEvent> => {
    const promptToRun = customPrompt || activePrompt;
    setIsExecuting(true);

    try {
      // If backend is connected, use backend evaluate endpoint
      if (backendConnected) {
        try {
          const { event } = await apiService.evaluateProxy(
            promptToRun,
            selectedApplication,
            selectedModel,
            selectedScenario?.id
          );
          setCurrentEvent(event);
          setRuntimeEvents(prev => [event, ...prev]);

          if (event.decision === 'ESCALATE') {
            const serverReviews = await apiService.getReviews().catch(() => null);
            if (serverReviews) {
              setReviewQueue(serverReviews);
            }
          }
          setIsExecuting(false);
          return event;
        } catch {
          // fallback to local execution
        }
      }

      // Local / Offline Execution
      const event = await localPipeline.execute(
        promptToRun,
        selectedApplication,
        selectedModel,
        policies,
        selectedScenario || undefined,
        (stages) => setActiveStages(stages)
      );

      setCurrentEvent(event);
      setRuntimeEvents(prev => [event, ...prev]);

      if (event.decision === 'ESCALATE') {
        const newReviewItem: ReviewQueueItem = {
          id: 'rev_' + Math.random().toString(36).substring(2, 9),
          runtimeEventId: event.id,
          requestId: event.requestId,
          timestamp: event.timestamp,
          application: event.application,
          user: event.user,
          model: event.model,
          riskScore: event.riskScore,
          triggeredPolicies: event.triggeredPolicies.map(p => p.name + ' (' + p.version + ')'),
          inputPrompt: event.rawInput,
          originalOutput: event.rawOutput,
          proposedRemediation: '[SAFETY REMEDIATION REQUIRED]: Output held by ControlPlane.ai runtime pending review.',
          evidence: event.decisionReason,
          status: 'PENDING'
        };
        setReviewQueue(prev => [newReviewItem, ...prev]);
      }

      setIsExecuting(false);
      return event;
    } catch (err) {
      setIsExecuting(false);
      throw err;
    }
  };

  // Policy Management Actions
  const updatePolicy = async (updated: PolicyRule) => {
    setPolicies(prev => prev.map(p => p.id === updated.id ? updated : p));
    if (backendConnected) {
      await apiService.updatePolicy(updated).catch(() => {});
    }
  };

  const togglePolicyStatus = async (policyId: string) => {
    setPolicies(prev => prev.map(p => {
      if (p.id === policyId) {
        const nextStatus = p.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
        return { ...p, status: nextStatus, updatedAt: new Date().toISOString().substring(0, 16) + ' UTC' };
      }
      return p;
    }));
    if (backendConnected) {
      await apiService.togglePolicyStatus(policyId).catch(() => {});
    }
  };

  const createPolicy = async (newPolicy: PolicyRule) => {
    setPolicies(prev => [newPolicy, ...prev]);
    if (backendConnected) {
      await apiService.createPolicy(newPolicy).catch(() => {});
    }
  };

  // Human Review Actions
  const approveReviewItem = async (itemId: string, notes?: string) => {
    const timestamp = new Date().toISOString().substring(0, 19) + ' UTC';
    setReviewQueue(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          status: 'APPROVED',
          reviewer: 'ciso-lead@acmecorp.internal',
          reviewTimestamp: timestamp,
          reviewNotes: notes || 'Approved by security operations officer.'
        };
      }
      return item;
    }));

    setRuntimeEvents(prev => prev.map(evt => {
      const match = reviewQueue.find(i => i.id === itemId);
      if (match && evt.id === match.runtimeEventId) {
        return {
          ...evt,
          decision: 'ALLOW',
          reviewStatus: 'APPROVED',
          reviewer: 'ciso-lead@acmecorp.internal',
          reviewTimestamp: timestamp,
          reviewNotes: notes || 'Approved in review queue.'
        };
      }
      return evt;
    }));

    if (backendConnected) {
      await apiService.actionReview(itemId, 'APPROVE', undefined, notes).catch(() => {});
    }
  };

  const rejectReviewItem = async (itemId: string, notes?: string) => {
    const timestamp = new Date().toISOString().substring(0, 19) + ' UTC';
    setReviewQueue(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          status: 'REJECTED',
          reviewer: 'ciso-lead@acmecorp.internal',
          reviewTimestamp: timestamp,
          reviewNotes: notes || 'Rejected and permanently dropped.'
        };
      }
      return item;
    }));

    setRuntimeEvents(prev => prev.map(evt => {
      const match = reviewQueue.find(i => i.id === itemId);
      if (match && evt.id === match.runtimeEventId) {
        return {
          ...evt,
          decision: 'BLOCK',
          reviewStatus: 'REJECTED',
          reviewer: 'ciso-lead@acmecorp.internal',
          reviewTimestamp: timestamp,
          reviewNotes: notes || 'Rejected during safety review.'
        };
      }
      return evt;
    }));

    if (backendConnected) {
      await apiService.actionReview(itemId, 'REJECT', undefined, notes).catch(() => {});
    }
  };

  const editReviewItem = async (itemId: string, editedRemediation: string, notes?: string) => {
    const timestamp = new Date().toISOString().substring(0, 19) + ' UTC';
    setReviewQueue(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          status: 'EDITED',
          proposedRemediation: editedRemediation,
          reviewer: 'ciso-lead@acmecorp.internal',
          reviewTimestamp: timestamp,
          reviewNotes: notes || 'Remediated and released.'
        };
      }
      return item;
    }));

    setRuntimeEvents(prev => prev.map(evt => {
      const match = reviewQueue.find(i => i.id === itemId);
      if (match && evt.id === match.runtimeEventId) {
        return {
          ...evt,
          decision: 'EDIT',
          finalOutput: editedRemediation,
          reviewStatus: 'EDITED_AND_RELEASED',
          reviewer: 'ciso-lead@acmecorp.internal',
          reviewTimestamp: timestamp,
          reviewNotes: notes || 'Edited and safely released.'
        };
      }
      return evt;
    }));

    if (backendConnected) {
      await apiService.actionReview(itemId, 'EDIT', editedRemediation, notes).catch(() => {});
    }
  };

  // Dynamic Aggregated Metrics from runtime events
  const metrics: AggregatedMetrics = useMemo(() => {
    const total = runtimeEvents.length;
    if (total === 0) {
      return {
        totalRequests: 0,
        allowedRequests: 0,
        blockedRequests: 0,
        editedRequests: 0,
        escalatedRequests: 0,
        blockRatePercent: 0,
        hallucinationRatePercent: 0,
        piiIncidentsCount: 0,
        promptInjectionAttempts: 0,
        policyViolationsCount: 0,
        avgLatencyMs: 0,
        totalTokensUsed: 0,
        estimatedSpendUSD: 0,
        costSavedUSD: 0,
        cacheHitRatePercent: 0
      };
    }

    let allowed = 0;
    let blocked = 0;
    let edited = 0;
    let escalated = 0;
    let hallucinations = 0;
    let piiCount = 0;
    let injectionCount = 0;
    let policyViolations = 0;
    let totalLatency = 0;
    let totalTokens = 0;
    let totalSpend = 0;
    let totalSavings = 0;
    let cacheHits = 0;

    for (const evt of runtimeEvents) {
      if (evt.decision === 'ALLOW') allowed++;
      if (evt.decision === 'BLOCK') blocked++;
      if (evt.decision === 'EDIT') edited++;
      if (evt.decision === 'ESCALATE') escalated++;

      if (evt.performance.hallucinationRisk > 40) hallucinations++;
      if (evt.responsibility.piiDetected) piiCount += evt.responsibility.detectedEntities.length || 1;
      if (evt.responsibility.injectionDetected) injectionCount++;
      if (evt.triggeredPolicies.length > 0) policyViolations += evt.triggeredPolicies.length;

      totalLatency += evt.latency.totalLatencyMs;
      totalTokens += evt.cost.totalTokens;
      totalSpend += evt.cost.estimatedCostWithControlPlane;
      totalSavings += evt.cost.savingsAmount;
      if (evt.cost.cacheHit) cacheHits++;
    }

    return {
      totalRequests: total,
      allowedRequests: allowed,
      blockedRequests: blocked,
      editedRequests: edited,
      escalatedRequests: escalated,
      blockRatePercent: Number(((blocked / total) * 100).toFixed(1)),
      hallucinationRatePercent: Number(((hallucinations / total) * 100).toFixed(1)),
      piiIncidentsCount: piiCount,
      promptInjectionAttempts: injectionCount,
      policyViolationsCount: policyViolations,
      avgLatencyMs: Number((totalLatency / total).toFixed(1)),
      totalTokensUsed: totalTokens,
      estimatedSpendUSD: Number(totalSpend.toFixed(4)),
      costSavedUSD: Number(totalSavings.toFixed(4)),
      cacheHitRatePercent: Number(((cacheHits / total) * 100).toFixed(1))
    };
  }, [runtimeEvents]);

  // Demo Tour Navigation Handlers
  const startDemoTour = () => {
    setIsTourActive(true);
    setTourStepIndex(0);
    setActiveTab('sandbox');
    loadScenario(SCENARIO_PRESETS[0]);
  };

  const nextTourStep = () => {
    const next = tourStepIndex + 1;
    if (next < 8) {
      setTourStepIndex(next);
      if (next === 1) {
        setActiveTab('sandbox');
        loadScenario(SCENARIO_PRESETS[1]);
      } else if (next === 2) {
        setActiveTab('sandbox');
        loadScenario(SCENARIO_PRESETS[2]);
      } else if (next === 3) {
        setActiveTab('sandbox');
        loadScenario(SCENARIO_PRESETS[3]);
      } else if (next === 4) {
        setActiveTab('review');
      } else if (next === 5) {
        setActiveTab('observability');
      } else if (next === 6) {
        setActiveTab('audit');
      } else if (next === 7) {
        setActiveTab('architecture');
      }
    } else {
      setIsTourActive(false);
    }
  };

  const prevTourStep = () => {
    if (tourStepIndex > 0) {
      const prev = tourStepIndex - 1;
      setTourStepIndex(prev);
      if (prev <= 3) {
        setActiveTab('sandbox');
        loadScenario(SCENARIO_PRESETS[prev]);
      } else if (prev === 4) {
        setActiveTab('review');
      } else if (prev === 5) {
        setActiveTab('observability');
      } else if (prev === 6) {
        setActiveTab('audit');
      }
    }
  };

  const endDemoTour = () => {
    setIsTourActive(false);
  };

  return (
    <ControlPlaneContext.Provider
      value={{
        isExecuting,
        activePrompt,
        setActivePrompt,
        selectedApplication,
        setSelectedApplication,
        selectedModel,
        setSelectedModel,
        selectedScenario,
        loadScenario,
        activeStages,
        currentEvent,
        executeProxyRequest,
        runtimeEvents,
        policies,
        reviewQueue,
        updatePolicy,
        togglePolicyStatus,
        createPolicy,
        approveReviewItem,
        rejectReviewItem,
        editReviewItem,
        metrics,
        activeTab,
        setActiveTab,
        isTourActive,
        tourStepIndex,
        startDemoTour,
        nextTourStep,
        prevTourStep,
        endDemoTour,
        isSearchOpen,
        setIsSearchOpen,
        backendConnected
      }}
    >
      {children}
    </ControlPlaneContext.Provider>
  );
};

export const useControlPlane = (): ControlPlaneContextType => {
  const context = useContext(ControlPlaneContext);
  if (!context) {
    throw new Error('useControlPlane must be used within a ControlPlaneProvider');
  }
  return context;
};
