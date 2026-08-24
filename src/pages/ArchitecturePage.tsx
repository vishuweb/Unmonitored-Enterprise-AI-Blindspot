import React from 'react';
import { 
  Layers, 
  Cpu, 
  ShieldCheck, 
  DollarSign, 
  Gauge, 
  ArrowRight, 
  Server, 
  Lock, 
  Database,
  Sparkles
} from 'lucide-react';

export const ArchitecturePage: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-zinc-100 tracking-tight">
            ControlPlane.ai Architecture Blueprint
          </h1>
          <span className="badge border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px]">
            Model-Agnostic Inline Proxy
          </span>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          How ControlPlane transforms enterprise AI from passive post-hoc observability to proactive real-time runtime governance.
        </p>
      </div>

      {/* Visual Topology Diagram */}
      <div className="surface p-6 space-y-6">
        <div className="text-xs font-bold text-zinc-200 uppercase tracking-wider text-center">
          Continuous Real-Time Runtime Inspection Pipeline
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Source Client */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-center space-y-2">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
              <Server className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-zinc-200">Enterprise Applications</div>
            <div className="text-[11px] text-zinc-400 leading-snug">
              Customer Support Bots, Internal Copilots, Autonomous Decision Agents
            </div>
          </div>

          {/* ControlPlane Core Proxy */}
          <div className="p-5 rounded-xl bg-indigo-950/30 border-2 border-indigo-500/60 text-center space-y-3 relative shadow-xl shadow-indigo-950/50">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 badge bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5">
              CONTROLPLANE.AI RUNTIME
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="p-2 rounded bg-rose-950/30 border border-rose-500/30 text-rose-300">
                <div className="text-[10px] font-bold">Responsibility</div>
                <div className="text-[9px] text-zinc-400 mt-0.5">PII & Jailbreak</div>
              </div>
              <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-300">
                <div className="text-[10px] font-bold">Cost Engine</div>
                <div className="text-[9px] text-zinc-400 mt-0.5">Cache & Routing</div>
              </div>
              <div className="p-2 rounded bg-purple-950/30 border border-purple-500/30 text-purple-300">
                <div className="text-[10px] font-bold">Performance</div>
                <div className="text-[9px] text-zinc-400 mt-0.5">Hallucinations</div>
              </div>
            </div>
            <div className="text-[11px] text-zinc-300 font-semibold">
              ALLOW • BLOCK • EDIT • ESCALATE
            </div>
          </div>

          {/* Downstream Models */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-center space-y-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-zinc-200">Downstream AI Models</div>
            <div className="text-[11px] text-zinc-400 leading-snug">
              OpenAI (GPT-4o), Anthropic (Claude 3.5), Meta (Llama 3), Custom Fine-tuned SLMs
            </div>
          </div>
        </div>
      </div>

      {/* 3 Engines Deep Dive */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="surface p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Responsibility Engine</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Deterministic PII identification (Aadhaar, SSN, Credit Cards, API Keys) with automated redaction, prompt injection & jailbreak structural heuristics, and brand safety compliance.
          </p>
        </div>

        <div className="surface p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <DollarSign className="w-4 h-4" />
            <span>Cost Engine</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Vector Semantic Caching to eliminate redundant queries (0ms inference), complexity-based dynamic model routing (e.g. routing simple queries to mini-models), and automated token spend accounting.
          </p>
        </div>

        <div className="surface p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
            <Gauge className="w-4 h-4" />
            <span>Performance Engine</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Deterministic fact-checking and small language model (SLM) verification to score faithfulness, detect semantic hallucinations before user delivery, and escalate low-grounding decisions to human review.
          </p>
        </div>
      </div>
    </div>
  );
};
