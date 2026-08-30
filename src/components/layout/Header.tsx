import React, { useEffect, useRef, useState } from 'react';
import {
  Building2,
  Search,
  ShieldCheck,
  Clock,
  Radio,
  Zap,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';
import { useControlPlane } from '../../context/ControlPlaneContext';

// Simple hook to animate a number from 0 to target
function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

export const Header: React.FC = () => {
  const { metrics, setIsSearchOpen, backendConnected } = useControlPlane();
  const animatedLatency = useCountUp(metrics.avgLatencyMs);
  const animatedRequests = useCountUp(metrics.totalRequests);
  const animatedBlock = useCountUp(metrics.blockRatePercent);

  return (
    <header className="header-glass h-14 px-5 flex items-center justify-between shrink-0 z-30 select-none animate-fade-in">
      {/* Left: Org & status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60 text-xs text-zinc-300 backdrop-blur-sm">
          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-zinc-200">Acme Global</span>
          <span className="text-zinc-700">|</span>
          <span className="text-[11px] text-zinc-500 font-mono">aws-us-east-1</span>
        </div>

        {/* Live badge with ripple */}
        <div className="relative hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full font-mono">
          {/* ripple rings */}
          <span className="absolute inset-0 rounded-full border border-emerald-400/30 animate-ripple" />
          <Radio className="w-3 h-3 animate-pulse-fast" />
          <span className="font-semibold tracking-wide">PROXY LIVE</span>
        </div>
      </div>

      {/* Center: Real-time telemetry */}
      <div className="hidden lg:flex items-center gap-5 text-xs font-mono">
        {/* Latency */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/40 border border-zinc-800/40 group hover:border-indigo-500/30 transition-all duration-200">
          <Clock className="w-3.5 h-3.5 text-indigo-400 group-hover:animate-spin-slow" />
          <span className="text-zinc-500">Latency</span>
          <span className="text-zinc-100 font-bold tabular metric-value">{animatedLatency}ms</span>
        </div>

        <div className="w-px h-4 bg-zinc-800/60" />

        {/* Requests */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/40 border border-zinc-800/40 group hover:border-cyan-500/30 transition-all duration-200">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-zinc-500">Evaluated</span>
          <span className="text-zinc-100 font-bold tabular metric-value">{animatedRequests}</span>
        </div>

        <div className="w-px h-4 bg-zinc-800/60" />

        {/* Block Rate */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 ${
          metrics.blockRatePercent > 20
            ? 'bg-rose-950/20 border-rose-500/25 group hover:border-rose-500/40'
            : 'bg-zinc-900/40 border-zinc-800/40 group hover:border-emerald-500/30'
        }`}>
          <AlertCircle className={`w-3.5 h-3.5 ${metrics.blockRatePercent > 20 ? 'text-rose-400 animate-pulse-fast' : 'text-emerald-400'}`} />
          <span className="text-zinc-500">Block Rate</span>
          <span className={`font-bold tabular metric-value ${metrics.blockRatePercent > 20 ? 'text-rose-300' : 'text-zinc-100'}`}>
            {animatedBlock}%
          </span>
        </div>
      </div>

      {/* Right: Search */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/60 hover:border-indigo-500/30 text-xs text-zinc-400 hover:text-zinc-200 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/5"
        >
          <Search className="w-3.5 h-3.5 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
          <span className="hidden sm:inline">Search events…</span>
          <kbd className="hidden sm:inline text-[10px] font-mono bg-zinc-800/80 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-700/80 group-hover:border-indigo-500/30 group-hover:text-indigo-400 transition-all">⌘K</kbd>
        </button>

        {/* Backend status dot */}
        <div
          title={backendConnected ? 'Backend connected' : 'Running in offline mode'}
          className={`w-2 h-2 rounded-full transition-all ${backendConnected ? 'bg-emerald-400 shadow-sm shadow-emerald-400/60 animate-pulse' : 'bg-amber-400 shadow-sm shadow-amber-400/60'}`}
        />
      </div>
    </header>
  );
};
