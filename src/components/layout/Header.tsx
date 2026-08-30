import React from 'react';
import { 
  Building2, 
  Search, 
  ShieldCheck, 
  Clock, 
  Radio
} from 'lucide-react';
import { useControlPlane } from '../../context/ControlPlaneContext';

export const Header: React.FC = () => {
  const { 
    metrics, 
    setIsSearchOpen 
  } = useControlPlane();

  return (
    <header className="h-14 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-5 flex items-center justify-between shrink-0 z-30 select-none">
      {/* Left: Organization & Cluster */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-zinc-200">Acme Global Enterprise</span>
          <span className="text-zinc-600">|</span>
          <span className="text-[11px] text-zinc-400 font-mono">aws-us-east-1</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full font-mono">
          <Radio className="w-3 h-3 animate-pulse" />
          <span>PROXY LIVE</span>
        </div>
      </div>

      {/* Center: Real-time Telemetry pill */}
      <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Avg Latency:</span>
          <span className="text-zinc-200 font-semibold">{metrics.avgLatencyMs}ms</span>
        </div>
        <div className="w-px h-3 bg-zinc-800" />
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Evaluated:</span>
          <span className="text-zinc-200 font-semibold">{metrics.totalRequests} reqs</span>
        </div>
      </div>

      {/* Right: Quick Search & Tour Action */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs text-zinc-400 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-zinc-500" />
          <span>Search events / policies…</span>
          <kbd className="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700">⌘K</kbd>
        </button>

      </div>
    </header>
  );
};
