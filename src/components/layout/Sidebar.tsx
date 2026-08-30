import React from 'react';
import { 
  Terminal, 
  Activity, 
  ShieldAlert, 
  UserCheck, 
  FileSpreadsheet, 
  Cpu, 
  Layers,
} from 'lucide-react';
import { useControlPlane } from '../../context/ControlPlaneContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, reviewQueue } = useControlPlane();
  const pendingReviewCount = reviewQueue.filter(r => r.status === 'PENDING').length;

  const navItems = [
    {
      id: 'sandbox',
      label: 'Live Proxy Sandbox',
      sublabel: 'Hero Runtime Interceptor',
      icon: Terminal,
      badge: null
    },
    {
      id: 'observability',
      label: 'Observability & Metrics',
      sublabel: 'Operational Intelligence',
      icon: Activity,
      badge: null
    },
    {
      id: 'governance',
      label: 'Governance & Policies',
      sublabel: 'Active Rules & Thresholds',
      icon: ShieldAlert,
      badge: null
    },
    {
      id: 'review',
      label: 'Human Review Queue',
      sublabel: 'AI Safety Operations',
      icon: UserCheck,
      badge: pendingReviewCount > 0 ? pendingReviewCount : null
    },
    {
      id: 'audit',
      label: 'Audit Logs & Compliance',
      sublabel: 'Immutable Cryptographic Trail',
      icon: FileSpreadsheet,
      badge: null
    },
    {
      id: 'architecture',
      label: 'System Architecture',
      sublabel: 'Model-Agnostic Proxy Blueprint',
      icon: Layers,
      badge: null
    }
  ];

  return (
    <aside className="w-64 border-r border-zinc-800/80 bg-zinc-950/95 flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md shadow-indigo-600/20 text-white font-bold text-sm tracking-wider">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-zinc-100 tracking-tight">ControlPlane</span>
              <span className="text-xs font-semibold text-indigo-400">.ai</span>
            </div>
            <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              v2.4 Production
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-2.5 mb-2">
          Runtime Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative ${
                isActive 
                  ? 'bg-zinc-800/90 text-zinc-100 shadow-sm border border-zinc-750' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full" />
              )}
              <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
              <div className="flex-1 text-left min-w-0">
                <div className="truncate font-medium">{item.label}</div>
              </div>
              {item.badge !== null && (
                <span className="badge bg-rose-500/15 text-rose-400 border-rose-500/30 px-1.5 py-0 text-[10px] font-semibold tabular">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

    </aside>
  );
};
