import React from 'react';
import { Terminal, Zap, Sparkles } from 'lucide-react';
import { ScenarioSelector } from '../components/sandbox/ScenarioSelector';
import { PipelineVisualizer } from '../components/sandbox/PipelineVisualizer';
import { DecisionDossier } from '../components/sandbox/DecisionDossier';

export const SandboxPage: React.FC = () => {
  return (
    <div className="p-6 space-y-5 min-h-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center animate-glow-pulse">
              <Terminal className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              <span className="gradient-text">Live Proxy</span>
              <span className="text-zinc-200"> Runtime Sandbox</span>
            </h1>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Submit a prompt · 10-stage inline evaluation · Governance decision in real time
            </p>
          </div>
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1.5 rounded-full">
            <Zap className="w-3 h-3" />
            3 Engines Active
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1.5 rounded-full">
            <Sparkles className="w-3 h-3" />
            Real-Time
          </div>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start stagger">
        <div className="lg:col-span-4">
          <ScenarioSelector />
        </div>
        <div className="lg:col-span-4">
          <PipelineVisualizer />
        </div>
        <div className="lg:col-span-4">
          <DecisionDossier />
        </div>
      </div>
    </div>
  );
};
