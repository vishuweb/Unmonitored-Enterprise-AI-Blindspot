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
  ArrowDown, 
  Clock,
  Sparkles,
  Radio
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
        return <span className="badge border-zinc-800 bg-zinc-900 text-zinc-500 text-[10px]">PENDING</span>;
      case 'RUNNING':
        return (
          <span className="badge border-indigo-500/40 bg-indigo-500/20 text-indigo-300 text-[10px] animate-pulse">
            <Radio className="w-2.5 h-2.5 animate-spin" /> RUNNING
          </span>
        );
      case 'PASSED':
        return (
          <span className="badge border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px]">
            <CheckCircle2 className="w-2.5 h-2.5" /> PASSED
          </span>
        );
      case 'WARNING':
        return (
          <span className="badge border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px]">
            <AlertTriangle className="w-2.5 h-2.5" /> FLAG
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="badge border-rose-500/30 bg-rose-500/10 text-rose-400 text-[10px]">
            <XCircle className="w-2.5 h-2.5" /> BLOCKED
          </span>
        );
      case 'INTERVENED':
        return (
          <span className="badge border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-[10px]">
            <Sparkles className="w-2.5 h-2.5" /> INTERVENED
          </span>
        );
    }
  };

  const getEngineIcon = (engine: RuntimeStageState['engine']) => {
    switch (engine) {
      case 'RESPONSIBILITY':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
      case 'COST':
        return <DollarSign className="w-3.5 h-3.5 text-emerald-400" />;
      case 'PERFORMANCE':
        return <Gauge className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Zap className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
            Runtime Evaluation Pipeline
          </h2>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400/80 inline-block" /> Responsibility</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400/80 inline-block" /> Cost</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400/80 inline-block" /> Performance</span>
        </div>
      </div>

      {/* Pipeline Sequence Cards */}
      <div className="space-y-2">
        {stagesToRender.map((st, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border transition-all ${
              st.status === 'RUNNING' 
                ? 'border-indigo-500 bg-indigo-950/30 shadow-md shadow-indigo-950/40 ring-1 ring-indigo-500/50' 
                : st.status === 'BLOCKED'
                ? 'border-rose-500/40 bg-rose-950/20'
                : st.status === 'INTERVENED'
                ? 'border-cyan-500/30 bg-cyan-950/20'
                : st.status === 'WARNING'
                ? 'border-amber-500/30 bg-amber-950/20'
                : 'border-zinc-800/80 bg-zinc-900/60'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[10px] font-mono text-zinc-500 w-4 shrink-0">0{idx + 1}</span>
                <div className="p-1 rounded bg-zinc-800/70 shrink-0">
                  {getEngineIcon(st.engine)}
                </div>
                <span className="text-xs font-semibold text-zinc-200 truncate">{st.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {st.durationMs > 0 && (
                  <span className="text-[10px] font-mono text-zinc-500">
                    {st.durationMs}ms
                  </span>
                )}
                {getStatusBadge(st.status)}
              </div>
            </div>

            <div className="mt-1.5 pl-6 text-[11px] text-zinc-400 font-sans">
              {st.detail}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
