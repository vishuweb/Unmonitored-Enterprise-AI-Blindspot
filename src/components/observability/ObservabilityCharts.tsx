import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  ShieldAlert, 
  TrendingUp, 
  Zap, 
  Layers, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { useControlPlane } from '../../context/ControlPlaneContext';

export const ObservabilityCharts: React.FC = () => {
  const { metrics, runtimeEvents } = useControlPlane();

  // Dynamic distribution computations
  const decisions = {
    allow: runtimeEvents.filter(e => e.decision === 'ALLOW').length,
    block: runtimeEvents.filter(e => e.decision === 'BLOCK').length,
    edit: runtimeEvents.filter(e => e.decision === 'EDIT').length,
    escalate: runtimeEvents.filter(e => e.decision === 'ESCALATE').length,
  };

  const threatCategories = {
    injection: runtimeEvents.filter(e => e.responsibility.injectionDetected).length,
    pii: runtimeEvents.filter(e => e.responsibility.piiDetected).length,
    hallucination: runtimeEvents.filter(e => e.performance.hallucinationRisk > 40).length,
    brandSafety: runtimeEvents.filter(e => e.responsibility.brandSafetyViolation).length,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. Governance Decision Distribution */}
      <div className="surface p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200 uppercase tracking-wider">
            <PieChart className="w-3.5 h-3.5 text-indigo-400" />
            <span>Governance Decisions</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Current session</span>
        </div>

        <div className="space-y-2 pt-1">
          <div>
            <div className="flex justify-between text-xs mb-1 font-mono">
              <span className="text-emerald-400 font-semibold">ALLOW (Passed)</span>
              <span className="text-zinc-300">{decisions.allow} ({Math.round((decisions.allow / Math.max(1, metrics.totalRequests)) * 100)}%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(decisions.allow / Math.max(1, metrics.totalRequests)) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1 font-mono">
              <span className="text-rose-400 font-semibold">BLOCK (Interception)</span>
              <span className="text-zinc-300">{decisions.block} ({Math.round((decisions.block / Math.max(1, metrics.totalRequests)) * 100)}%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div 
                className="h-full bg-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${(decisions.block / Math.max(1, metrics.totalRequests)) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1 font-mono">
              <span className="text-cyan-400 font-semibold">EDIT (PII Redacted)</span>
              <span className="text-zinc-300">{decisions.edit} ({Math.round((decisions.edit / Math.max(1, metrics.totalRequests)) * 100)}%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div 
                className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${(decisions.edit / Math.max(1, metrics.totalRequests)) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1 font-mono">
              <span className="text-purple-400 font-semibold">ESCALATE (Human Review)</span>
              <span className="text-zinc-300">{decisions.escalate} ({Math.round((decisions.escalate / Math.max(1, metrics.totalRequests)) * 100)}%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${(decisions.escalate / Math.max(1, metrics.totalRequests)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Threat & Policy Violation Breakdown */}
      <div className="surface p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200 uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Threat Category Frequency</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Security Events</span>
        </div>

        <div className="space-y-2.5 pt-1 text-xs">
          <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span className="text-zinc-200 font-medium">Prompt Injection & Jailbreak</span>
            </div>
            <span className="font-mono font-bold text-rose-400">{threatCategories.injection} incidents</span>
          </div>

          <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-zinc-200 font-medium">Aadhaar / SSN / PII Leak</span>
            </div>
            <span className="font-mono font-bold text-cyan-400">{threatCategories.pii} incidents</span>
          </div>

          <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="text-zinc-200 font-medium">Ungrounded Hallucinations</span>
            </div>
            <span className="font-mono font-bold text-purple-400">{threatCategories.hallucination} incidents</span>
          </div>

          <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-zinc-200 font-medium">Brand Safety & Vulnerability</span>
            </div>
            <span className="font-mono font-bold text-amber-400">{threatCategories.brandSafety} incidents</span>
          </div>
        </div>
      </div>

      {/* 3. Cost ROI & Efficiency Impact */}
      <div className="surface p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>FinOps Savings Breakdown</span>
          </div>
          <span className="badge border-zinc-700 bg-zinc-800 text-zinc-400 text-[10px]">
            Cost data unavailable
          </span>
        </div>

        <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-1">
          <div className="text-[10px] text-emerald-400 font-mono uppercase">Cumulative Spend Avoidance</div>
          <div className="text-2xl font-bold text-zinc-300 font-mono">
            {metrics.costSavedUSD > 0 ? `$${metrics.costSavedUSD.toFixed(4)}` : 'Not measured'}
          </div>
          <p className="text-[11px] text-zinc-400">
            Cost savings require a configured model pricing and cache provider.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2 rounded bg-zinc-950/50 border border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase">Cache Hit Rate</div>
            <div className="text-sm font-bold text-zinc-200 mt-0.5">{metrics.cacheHitRatePercent}%</div>
          </div>
          <div className="p-2 rounded bg-zinc-950/50 border border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase">Tokens Processed</div>
            <div className="text-sm font-bold text-zinc-200 mt-0.5">{metrics.totalTokensUsed} tokens</div>
          </div>
        </div>
      </div>
    </div>
  );
};
