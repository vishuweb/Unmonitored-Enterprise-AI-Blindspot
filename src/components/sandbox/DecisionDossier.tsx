import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Coins, 
  FileText, 
  CheckCircle2, 
  Sparkles,
  TrendingDown,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useControlPlane } from '../../context/ControlPlaneContext';
import { RuntimeEvent } from '../../types';

export const DecisionDossier: React.FC = () => {
  const { currentEvent } = useControlPlane();

  if (!currentEvent) {
    return (
      <div className="surface p-8 text-center text-zinc-500 text-xs">
        Run a request to generate real-time governance dossier
      </div>
    );
  }

  const decisionBadge = () => {
    switch (currentEvent.decision) {
      case 'ALLOW':
        return (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <div>
                <div className="text-sm font-bold tracking-tight">ALLOW EXECUTION</div>
                <div className="text-[10px] text-emerald-300/80">Responsibility checks passed; cost and performance were not measured</div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold bg-emerald-500/20 px-2 py-0.5 rounded">
              RISK {currentEvent.riskScore}/100
            </span>
          </div>
        );
      case 'BLOCK':
        return (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              <div>
                <div className="text-sm font-bold tracking-tight">BLOCK REQUEST</div>
                <div className="text-[10px] text-rose-300/80">Critical security / safety boundary violation</div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold bg-rose-500/20 px-2 py-0.5 rounded">
              RISK {currentEvent.riskScore}/100
            </span>
          </div>
        );
      case 'EDIT':
        return (
          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <div>
                <div className="text-sm font-bold tracking-tight">REDACT & DELIVER (EDIT)</div>
                <div className="text-[10px] text-cyan-300/80">Automated sensitive PII token sanitization</div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold bg-cyan-500/20 px-2 py-0.5 rounded">
              RISK {currentEvent.riskScore}/100
            </span>
          </div>
        );
      case 'ESCALATE':
        return (
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <div>
                <div className="text-sm font-bold tracking-tight">ESCALATE TO HUMAN REVIEW</div>
                <div className="text-[10px] text-purple-300/80">Semantic quality failure / high-risk directive</div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold bg-purple-500/20 px-2 py-0.5 rounded">
              RISK {currentEvent.riskScore}/100
            </span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Decision Header */}
      {decisionBadge()}

      {/* Decision Explainability (WHAT, WHY, WHICH POLICY, WHAT EVIDENCE, WHAT ACTION) */}
      <div className="surface p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
            Decision Explainability Dossier
          </div>
          <span className="text-[10px] font-mono text-zinc-500">{currentEvent.requestId}</span>
        </div>

        <div className="space-y-2.5 text-xs">
          <div>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase font-mono block">WHAT HAPPENED</span>
            <p className="text-zinc-300 mt-0.5 font-medium">{currentEvent.decisionReason}</p>
          </div>

          {currentEvent.triggeredPolicies.length > 0 && (
            <div>
              <span className="text-[10px] font-semibold text-zinc-500 uppercase font-mono block">TRIGGERED POLICY</span>
              <div className="mt-1 space-y-1">
                {currentEvent.triggeredPolicies.map((p: RuntimeEvent['triggeredPolicies'][number]) => (
                  <div key={p.id} className="p-1.5 rounded bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-zinc-200">{p.name} <span className="font-mono text-zinc-500">({p.version})</span></span>
                    <span className="badge text-[9px] border-zinc-700 bg-zinc-800 text-zinc-300">{p.action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentEvent.riskFactors.length > 0 && (
            <div>
              <span className="text-[10px] font-semibold text-zinc-500 uppercase font-mono block">RISK FACTOR WEIGHTS</span>
              <div className="mt-1 space-y-1 font-mono text-[11px]">
                {currentEvent.riskFactors.map((rf: RuntimeEvent['riskFactors'][number], i: number) => (
                  <div key={i} className="flex items-center justify-between p-1.5 rounded bg-zinc-950/50 border border-zinc-850">
                    <span className="text-zinc-300 font-sans">{rf.factor}</span>
                    <span className="text-rose-400 font-bold">+{rf.points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sanitized Model Output */}
      <div className="surface p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Downstream Governed Output</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">SHA-256 Verified</span>
        </div>

        <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 text-xs text-zinc-300 font-mono leading-relaxed break-words">
          {currentEvent.finalOutput}
        </div>
      </div>

      {/* Token & Cost Impact */}
      <div className="surface p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            <span>Token & Cost Impact</span>
          </div>
          {currentEvent.cost.savingsPercentage > 0 && (
            <span className="badge border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px]">
              <TrendingDown className="w-3 h-3" /> {currentEvent.cost.savingsPercentage}% SAVED
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase font-mono">Without pricing provider</div>
            <div className="text-sm font-bold text-zinc-300 mt-0.5 font-mono">
              Not measured
            </div>
            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
              {currentEvent.cost.originalModel}
            </div>
          </div>

          <div className="p-2.5 rounded bg-zinc-950/60 border border-emerald-500/30 bg-emerald-950/10">
            <div className="text-[10px] text-emerald-400 uppercase font-mono">With pricing provider</div>
            <div className="text-sm font-bold text-emerald-300 mt-0.5 font-mono">
              Not measured
            </div>
            <div className="text-[10px] text-emerald-400/80 font-mono mt-0.5 truncate">
              {currentEvent.cost.cacheHit ? 'Semantic Cache' : currentEvent.cost.routedModel}
            </div>
          </div>
        </div>

        <div className="text-[11px] text-zinc-400 bg-zinc-950/40 p-2 rounded border border-zinc-850">
          <span className="text-zinc-300 font-semibold">Router Rationale: </span>
          {currentEvent.cost.routingReason}
        </div>
      </div>

      {/* Latency Breakdown */}
      <div className="surface p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Proxy Latency Breakdown</span>
          </div>
          <span className="text-xs font-mono font-bold text-zinc-200">
            {currentEvent.latency.totalLatencyMs}ms
          </span>
        </div>

        <div className="space-y-1 text-[11px] font-mono text-zinc-400">
          <div className="flex justify-between">
            <span>PII & Security Inspection:</span>
            <span className="text-zinc-300">{(currentEvent.latency.piiDetectionMs + currentEvent.latency.injectionCheckMs).toFixed(1)}ms</span>
          </div>
          <div className="flex justify-between">
            <span>Cache Lookup & Routing:</span>
            <span className="text-zinc-300">{(currentEvent.latency.cacheLookupMs + currentEvent.latency.modelRoutingMs).toFixed(1)}ms</span>
          </div>
          <div className="flex justify-between">
            <span>LLM Downstream Inference:</span>
            <span className="text-zinc-300">{currentEvent.latency.inferenceMs}ms</span>
          </div>
          <div className="flex justify-between">
            <span>SLM Faithfulness Verification:</span>
            <span className="text-zinc-300">{currentEvent.latency.hallucinationCheckMs}ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};
