import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Activity,
  ShieldAlert,
  UserCheck,
  FileSpreadsheet,
  Cpu,
  Layers,
  Zap,
} from 'lucide-react';
import { useControlPlane } from '../../context/ControlPlaneContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, reviewQueue, metrics } = useControlPlane();
  const pendingReviewCount = reviewQueue.filter(r => r.status === 'PENDING').length;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const navItems = [
    {
      id: 'sandbox',
      label: 'Live Proxy Sandbox',
      sublabel: 'Runtime Interceptor',
      icon: Terminal,
      badge: null,
      color: 'indigo',
    },
    {
      id: 'observability',
      label: 'Observability',
      sublabel: 'Metrics & Intelligence',
      icon: Activity,
      badge: null,
      color: 'cyan',
    },
    {
      id: 'governance',
      label: 'Governance & Policies',
      sublabel: 'Rules & Thresholds',
      icon: ShieldAlert,
      badge: null,
      color: 'violet',
    },
    {
      id: 'review',
      label: 'Human Review Queue',
      sublabel: 'AI Safety Ops',
      icon: UserCheck,
      badge: pendingReviewCount > 0 ? pendingReviewCount : null,
      color: 'rose',
    },
    {
      id: 'audit',
      label: 'Audit & Compliance',
      sublabel: 'Cryptographic Trail',
      icon: FileSpreadsheet,
      badge: null,
      color: 'emerald',
    },
    {
      id: 'architecture',
      label: 'Architecture',
      sublabel: 'Proxy Blueprint',
      icon: Layers,
      badge: null,
      color: 'amber',
    },
  ];

  const colorMap: Record<string, { active: string; dot: string; glow: string; iconActive: string }> = {
    indigo:  { active: 'bg-indigo-500/10 border-indigo-500/30',   dot: 'bg-indigo-400',  glow: 'shadow-indigo-500/20',  iconActive: 'text-indigo-400' },
    cyan:    { active: 'bg-cyan-500/10 border-cyan-500/30',       dot: 'bg-cyan-400',    glow: 'shadow-cyan-500/20',    iconActive: 'text-cyan-400' },
    violet:  { active: 'bg-violet-500/10 border-violet-500/30',   dot: 'bg-violet-400',  glow: 'shadow-violet-500/20',  iconActive: 'text-violet-400' },
    rose:    { active: 'bg-rose-500/10 border-rose-500/30',       dot: 'bg-rose-400',    glow: 'shadow-rose-500/20',    iconActive: 'text-rose-400' },
    emerald: { active: 'bg-emerald-500/10 border-emerald-500/30', dot: 'bg-emerald-400', glow: 'shadow-emerald-500/20', iconActive: 'text-emerald-400' },
    amber:   { active: 'bg-amber-500/10 border-amber-500/30',     dot: 'bg-amber-400',   glow: 'shadow-amber-500/20',   iconActive: 'text-amber-400' },
  };

  return (
    <aside className="sidebar-glass w-64 flex flex-col shrink-0 select-none relative z-20">
      {/* Brand Header */}
      <div className={`p-5 border-b border-zinc-800/50 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
        <div className="flex items-center gap-3">
          {/* Animated Logo */}
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white animate-glow-pulse">
              <Cpu className="w-4.5 h-4.5" />
            </div>
            {/* Rotating ring */}
            <div className="absolute -inset-1 rounded-xl border border-indigo-500/30 animate-spin-slow" />
          </div>

          <div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm text-zinc-100 tracking-tight">ControlPlane</span>
              <span className="text-sm font-bold gradient-text">.ai</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/60" />
              <span className="text-[10px] text-zinc-500 font-mono">v2.4 · Runtime Active</span>
            </div>
          </div>
        </div>

        {/* Mini stats bar */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="bg-zinc-900/60 rounded-lg px-2.5 py-1.5 border border-zinc-800/50">
            <div className="text-[10px] text-zinc-500 font-mono">Evaluated</div>
            <div className="text-xs font-bold text-indigo-300 font-mono tabular mt-0.5">{metrics.totalRequests} reqs</div>
          </div>
          <div className="bg-zinc-900/60 rounded-lg px-2.5 py-1.5 border border-zinc-800/50">
            <div className="text-[10px] text-zinc-500 font-mono">Block Rate</div>
            <div className="text-xs font-bold text-rose-300 font-mono tabular mt-0.5">{metrics.blockRatePercent}%</div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest px-2.5 mb-3 flex items-center gap-2">
          <Zap className="w-3 h-3 text-indigo-500" />
          Navigation
        </div>

        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const c = colorMap[item.color];

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              style={{ animationDelay: `${index * 60}ms` }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group relative overflow-hidden
                ${mounted ? 'animate-slide-in-left' : 'opacity-0'}
                ${isActive
                  ? `${c.active} border shadow-md ${c.glow} nav-active-glow`
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/70 border border-transparent'
                }`}
            >
              {/* Active shimmer sweep */}
              {isActive && (
                <div className="absolute inset-0 shimmer rounded-xl opacity-50" />
              )}

              {/* Active left bar */}
              {isActive && (
                <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 ${c.dot} rounded-r-full shadow-sm`} />
              )}

              <Icon className={`w-4 h-4 shrink-0 transition-all duration-200 relative z-10 ${isActive ? c.iconActive : 'text-zinc-500 group-hover:text-zinc-300 group-hover:scale-110'}`} />

              <div className="flex-1 text-left min-w-0 relative z-10">
                <div className={`truncate font-semibold text-[11px] ${isActive ? 'text-zinc-100' : ''}`}>{item.label}</div>
                <div className={`truncate text-[9px] mt-0.5 ${isActive ? 'text-zinc-400' : 'text-zinc-600 group-hover:text-zinc-500'}`}>{item.sublabel}</div>
              </div>

              {item.badge !== null && (
                <span className="relative z-10 flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-md shadow-rose-500/40 animate-bounce-in">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom system status */}
      <div className="p-3 border-t border-zinc-800/50">
        <div className="bg-zinc-900/60 rounded-xl p-3 border border-zinc-800/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">System Health</span>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Nominal
            </span>
          </div>
          {/* Health bar */}
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 animate-shimmer"
              style={{ width: '94%', backgroundSize: '200% 100%' }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-mono text-zinc-600">
            <span>3 Engines Active</span>
            <span>94% Health</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
