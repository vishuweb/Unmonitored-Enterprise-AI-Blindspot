import React, { useState } from 'react';
import { Activity, Filter, Calendar, Layers, RefreshCw } from 'lucide-react';
import { MetricsGrid } from '../components/observability/MetricsGrid';
import { ObservabilityCharts } from '../components/observability/ObservabilityCharts';
import { useControlPlane } from '../context/ControlPlaneContext';
import { RuntimeEvent } from '../types';

export const ObservabilityPage: React.FC = () => {
  const { metrics, runtimeEvents } = useControlPlane();
  const [selectedAppFilter, setSelectedAppFilter] = useState('ALL');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-zinc-100 tracking-tight">Operational Intelligence & Observability</h1>
            <span className="badge border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px]">
              Live Telemetry Stream
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time metrics, risk distribution, threat vectors, and cost efficiency computed directly from proxy runtime events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span>Last 24 Hours</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <MetricsGrid />

      {/* Charts Grid */}
      <ObservabilityCharts />

      {/* Live Event Stream Teaser */}
      <div className="surface p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
            Latest Intercepted Invocations
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Top 5 Recent</span>
        </div>

        <div className="space-y-1.5">
          {runtimeEvents.slice(0, 5).map((evt: RuntimeEvent) => (
            <div
              key={evt.id}
              className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/70 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-zinc-400 shrink-0">{evt.requestId}</span>
                <span className="text-zinc-500">|</span>
                <span className="text-zinc-200 font-medium truncate">{evt.application}</span>
                <span className="text-zinc-500 hidden md:inline">|</span>
                <span className="text-zinc-400 text-[11px] truncate hidden md:inline">{evt.rawInput}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-mono text-zinc-400">{evt.latency.totalLatencyMs}ms</span>
                <span className={`badge text-[10px] font-bold ${
                  evt.decision === 'ALLOW' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
                  evt.decision === 'BLOCK' ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' :
                  evt.decision === 'EDIT' ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400' :
                  'border-purple-500/30 bg-purple-500/10 text-purple-400'
                }`}>{evt.decision}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};