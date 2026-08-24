import React from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Play, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import { useControlPlane } from '../../context/ControlPlaneContext';

const TOUR_STEPS = [
  {
    step: 1,
    title: 'Step 1: Compliant Analytical Request (ALLOW)',
    desc: 'Shows standard valid enterprise request. Evaluates grounding, passes PII check, and calculates accurate token cost.',
    actionLabel: 'Run Sandbox Request'
  },
  {
    step: 2,
    title: 'Step 2: Prompt Injection & Jailbreak Attack (BLOCK)',
    desc: 'Responsibility Engine intercepts system prompt override attempt, blocking it before downstream LLM execution.',
    actionLabel: 'Execute Injection Attack'
  },
  {
    step: 3,
    title: 'Step 3: PII Leakage / Aadhaar & SSN Redaction (EDIT)',
    desc: 'Detects unmasked government ID tokens and automatically replaces them with sanitized hashes before model exposure.',
    actionLabel: 'Test PII Redaction'
  },
  {
    step: 4,
    title: 'Step 4: Semantic Hallucination (ESCALATE)',
    desc: 'Performance Engine flags non-existent statutory legal clauses and low faithfulness (< 40%), dispatching to Review Queue.',
    actionLabel: 'Trigger Hallucination'
  },
  {
    step: 5,
    title: 'Step 5: Human Review Operations Console',
    desc: 'AI safety operator inspects flagged hallucination, reviews evidence, approves safe remediation, and updates audit records.',
    actionLabel: 'Open Review Console'
  },
  {
    step: 6,
    title: 'Step 6: Operational Observability Dashboard',
    desc: 'All runtime metrics (Block rate, Hallucination %, Latency, Token spend) update dynamically from shared runtime event stream.',
    actionLabel: 'View Observability'
  },
  {
    step: 7,
    title: 'Step 7: Immutable Audit & Compliance Trail',
    desc: 'Cryptographic SHA-256 hashes, policy signatures, and complete event timelines ready for SOC 2 / EU AI Act alignment.',
    actionLabel: 'Inspect Audit Trail'
  },
  {
    step: 8,
    title: 'Step 8: Model-Agnostic Proxy Architecture & ROI',
    desc: 'Measurable cost savings: Semantic Cache hits (0ms inference) and complexity tiering saving up to 95% on unnecessary inference spend.',
    actionLabel: 'Finish Tour'
  }
];

export const DemoTourBanner: React.FC = () => {
  const { 
    isTourActive, 
    tourStepIndex, 
    nextTourStep, 
    prevTourStep, 
    endDemoTour, 
    executeProxyRequest, 
    isExecuting,
    activeTab
  } = useControlPlane();

  if (!isTourActive) return null;

  const current = TOUR_STEPS[tourStepIndex];

  const handleAction = async () => {
    if (activeTab === 'sandbox') {
      await executeProxyRequest();
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-950 via-zinc-900 to-indigo-950 border-b border-indigo-500/40 px-5 py-2.5 flex items-center justify-between shadow-lg shadow-indigo-950/40 shrink-0 z-20 select-none animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow">
          {current.step}/8
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-200">{current.title}</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
              Interactive Guide
            </span>
          </div>
          <p className="text-[11px] text-zinc-300 max-w-3xl leading-snug">
            {current.desc}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {activeTab === 'sandbox' && (
          <button
            onClick={handleAction}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-semibold shadow transition-all"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isExecuting ? 'Processing...' : 'Run Pipeline'}</span>
          </button>
        )}

        <button
          onClick={prevTourStep}
          disabled={tourStepIndex === 0}
          className="p-1.5 rounded-md bg-zinc-850 hover:bg-zinc-800 disabled:opacity-40 text-zinc-300 border border-zinc-700 text-xs"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={nextTourStep}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all"
        >
          <span>Next Step</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={endDemoTour}
          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
