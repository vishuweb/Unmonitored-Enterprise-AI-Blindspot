import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PolicyRule, RuntimeEvent, RuntimeStageState, TargetApplication, TargetModel } from '../types';
import { RuntimePipeline } from '../engine/runtimePipeline';
import { apiService } from '../services/api';

interface ExecutionContextType {
  isExecuting: boolean;
  activePrompt: string;
  setActivePrompt: (prompt: string) => void;
  selectedApplication: TargetApplication;
  setSelectedApplication: (app: TargetApplication) => void;
  selectedModel: TargetModel;
  setSelectedModel: (model: TargetModel) => void;
  activeStages: RuntimeStageState[];
  currentEvent: RuntimeEvent | null;
  runtimeEvents: RuntimeEvent[];
  executeProxyRequest: (
    policies: PolicyRule[],
    customPrompt?: string,
    options?: { application?: TargetApplication; model?: TargetModel }
  ) => Promise<RuntimeEvent>;
  backendConnected: boolean;
}

const ExecutionContext = createContext<ExecutionContextType | undefined>(undefined);
const localPipeline = new RuntimePipeline();

export const ExecutionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activePrompt, setActivePrompt] = useState<string>('');
  const [selectedApplication, setSelectedApplication] = useState<TargetApplication>('Internal Knowledge Copilot');
  const [selectedModel, setSelectedModel] = useState<TargetModel>('Unconfigured downstream model');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [activeStages, setActiveStages] = useState<RuntimeStageState[]>([]);
  const [currentEvent, setCurrentEvent] = useState<RuntimeEvent | null>(null);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);

  const [runtimeEvents, setRuntimeEvents] = useState<RuntimeEvent[]>(() => {
    const saved = localStorage.getItem('controlplane_events_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.warn('Ignoring invalid persisted runtime events.', error);
      }
    }
    return [];
  });

  // Try to connect to backend on mount
  useEffect(() => {
    const initBackend = async () => {
      try {
        const health = await apiService.checkHealth();
        if (health.status === 'healthy') {
          setBackendConnected(true);
          const serverEvents = await apiService.getEvents().catch((error) => {
            console.warn('Unable to load server events; using local session events.', error);
            return runtimeEvents;
          });
          setRuntimeEvents(serverEvents);
        }
      } catch (error) {
        console.warn('Backend evaluation failed; running the local evaluation pipeline.', error);
        setBackendConnected(false);
      }
    };
    initBackend();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('controlplane_events_v2', JSON.stringify(runtimeEvents));
  }, [runtimeEvents]);

  // Execution Handler
  const executeProxyRequest = async (
    policies: PolicyRule[],
    customPrompt?: string,
    options?: { application?: TargetApplication; model?: TargetModel }
  ): Promise<RuntimeEvent> => {
    const promptToRun = customPrompt || activePrompt;
    const applicationToRun = options?.application || selectedApplication;
    const modelToRun = options?.model || selectedModel;
    setIsExecuting(true);

    try {
      if (backendConnected) {
        try {
          const { event } = await apiService.evaluateProxy(
            promptToRun,
            applicationToRun,
            modelToRun
          );
          setCurrentEvent(event);
          setRuntimeEvents(prev => [event, ...prev]);
          setIsExecuting(false);
          return event;
        } catch {
          // fallback to local execution
        }
      }

      const event = await localPipeline.execute(
        promptToRun,
        applicationToRun,
        modelToRun,
        policies,
        (stages) => setActiveStages(stages)
      );
      setCurrentEvent(event);
      setRuntimeEvents(prev => [event, ...prev]);
      setIsExecuting(false);
      return event;
    } catch (err) {
      setIsExecuting(false);
      throw err;
    }
  };

  const value: ExecutionContextType = {
    isExecuting,
    activePrompt,
    setActivePrompt,
    selectedApplication,
    setSelectedApplication,
    selectedModel,
    setSelectedModel,
    activeStages,
    currentEvent,
    runtimeEvents,
    executeProxyRequest,
    backendConnected,
  };

  return (
    <ExecutionContext.Provider value={value}>
      {children}
    </ExecutionContext.Provider>
  );
};

export const useExecution = (): ExecutionContextType => {
  const context = useContext(ExecutionContext);
  if (!context) {
    throw new Error('useExecution must be used within ExecutionProvider');
  }
  return context;
};
