import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  DollarSign,
  Gauge,
  Zap,
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Sparkles,
  Radio,
} from 'lucide-react';
import { useControlPlane } from '../../context/ControlPlaneContext';
import { RuntimeStageState } from '../../types';

export const PipelineVisualizer: React.FC = () => {
  const { isExecuting, activeStages, currentEvent } = useControlPlane();

  const stagesToRender: RuntimeStageState[] = isExecuting && activeStages.length > 0
    ? activeStages
    : (currentEvent?.pipelineStages || []);

  const getStatusBadge = (status: RuntimeStageState['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="badge border-zinc-800 bg-zinc-900/80 text-zinc-500 text-[10px]">
            PENDING
          </span>
        );
      case 'RUNNING':
        return (
          <span className="badge border-indigo-500/50 bg-indigo-500/15 text-indigo-300 text-[10px] animate-pulse shadow-sm shadow-indigo-500/20">
            <Radio className="w-2.5 h-2.5 animate-spin" /> RUNNING
          </span>
        );
      case 'PASSED':
        return (
          <span className="badge border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-[10px]">
            <CheckCircle2 className="w-2.5 h-2.5" /> PASSED
          </span>
        );
      case 'WARNING':
        return (
          <span className="badge border-amber-500/40 bg-amber-500/10 text-amber-400 text-[10px]">
            <AlertTriangle className="w-2.5 h-2.5" /> FLAG
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="badge border-rose-500/40 bg-rose-500/10 text-rose-400 text-[10px] shadow-sm shadow-rose-500/20">
            <XCircle className="w-2.5 h-2.5" /> BLOCKED
          </span>
        );
      case 'INTERVENED':
        return (
          <span className="badge border-cyan-500/40 bg-cyan-500/10 text-cyan-400 text-[10px]">
            <Sparkles className="w-2.5 h-2.5" /> EDITED
          </span>
        );
    }
  };

  const getEngineIcon = (engine: RuntimeStageState['engine']) => {
    switch (engine) {
      case 'RESPONSIBILITY': return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
      case 'COST':           return <DollarSign className="w-3.5 h-3.5 text-emerald-400" />;
      case 'PERFORMANCE':    return <Gauge className="w-3.5 h-3.5 text-purple-400" />;
      default:               return <Zap className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  const getStageClasses = (status: RuntimeStageState['status']) => {
    switch (status) {
      case 'RUNNING':    return 'stage-running border-indigo-500/60 bg-indigo-950/40';
      case 'BLOCKED':    return 'stage-blocked border-rose-500/40 bg-rose-950/25';
      case 'INTERVENED': return 'border-cyan-500/35 bg-cyan-950/20 shadow-sm shadow-cyan-500/10';
      case 'WARNING':    return 'border-amber-500/35 bg-amber-950/20 shadow-sm shadow-amber-500/10';
      case 'PASSED':     return 'stage-passed border-emerald-500/20 bg-zinc-900/50';
      default:           return 'border-zinc-800/60 bg-zinc-900/40';
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <h2 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
            Evaluation Pipeline
          </h2>
          {isExecuting && (
            <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full animate-pulse">
              Processing…
            </span>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono text-zinc-600">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-400/80 shadow-sm shadow-rose-400/40" /> Resp</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 shadow-sm shadow-emerald-400/40" /> Cost</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-400/80 shadow-sm shadow-purple-400/40" /> Perf</span>
        </div>
      </div>

      {/* Empty state */}
      {stagesToRender.length === 0 && (
        <div className="surface p-8 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center animate-float">
            <Layers className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-300">Pipeline Idle</div>
            <div className="text-[11px] text-zinc-600 mt-1">Submit a prompt to see the 10-stage evaluation</div>
          </div>
        </div>
      )}

      {/* Pipeline stages — staggered */}
      <div className={`space-y-1.5 ${stagesToRender.length > 0 ? 'pipeline-stagger' : ''}`}>
        {stagesToRender.map((st, idx) => (
          <div
            key={idx}
            className={`rounded-xl border transition-all duration-300 overflow-hidden ${getStageClasses(st.status)}`}
          >
            {/* Running shimmer */}
            {st.status === 'RUNNING' && (
              <div className="absolute inset-0 shimmer pointer-events-none" />
            )}

            <div className="p-2.5 relative">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[9px] font-mono text-zinc-600 w-4 shrink-0 tabular">{String(idx + 1).padStart(2, '0')}</span>
                  <div className={`p-1 rounded-md shrink-0 transition-all duration-200 ${
                    st.status === 'RUNNING' ? 'bg-indigo-500/20 shadow-sm shadow-indigo-500/30 scale-110' :
                    st.status === 'BLOCKED' ? 'bg-rose-500/15' :
                    'bg-zinc-800/60'
                  }`}>
                    {getEngineIcon(st.engine)}
                  </div>
                  <span className="text-xs font-semibold text-zinc-200 truncate">{st.name}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {st.durationMs > 0 && (
                    <span className="text-[10px] font-mono text-zinc-600 tabular">{st.durationMs}ms</span>
                  )}
                  {getStatusBadge(st.status)}
                </div>
              </div>

              {/* Detail text */}
              <div className={`mt-1.5 pl-[22px] text-[11px] leading-snug transition-colors duration-200 ${
                st.status === 'BLOCKED' ? 'text-rose-300/80' :
                st.status === 'RUNNING' ? 'text-indigo-300/80' :
                st.status === 'INTERVENED' ? 'text-cyan-300/80' :
                'text-zinc-500'
              }`}>
                {st.detail}
              </div>
            </div>

            {/* Bottom colored accent bar for non-pending */}
            {st.status !== 'PENDING' && (
              <div className={`h-0.5 w-full ${
                st.status === 'PASSED' ? 'bg-gradient-to-r from-emerald-500/60 to-transparent' :
                st.status === 'BLOCKED' ? 'bg-gradient-to-r from-rose-500/60 to-transparent' :
                st.status === 'RUNNING' ? 'bg-gradient-to-r from-indigo-500 via-violet-500 to-transparent animate-shimmer bg-size-200' :
                st.status === 'INTERVENED' ? 'bg-gradient-to-r from-cyan-500/60 to-transparent' :
                'bg-gradient-to-r from-amber-500/60 to-transparent'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
