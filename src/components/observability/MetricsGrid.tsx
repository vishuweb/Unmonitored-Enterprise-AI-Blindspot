import React from 'react';
import { 
  Activity, 
  ShieldCheck, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Coins, 
  TrendingDown, 
  Zap, 
  Sparkles,
  Layers,
  Database
} from 'lucide-react';
import { useControlPlane } from '../../context/ControlPlaneContext';

export const MetricsGrid: React.FC = () => {
  const { metrics } = useControlPlane();

  const cards = [
    {
      title: 'Total AI Invocations',
      value: metrics.totalRequests.toLocaleString(),
      change: '+18.4% today',
      changeType: 'neutral',
      icon: Activity,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20'
    },
    {
      title: 'Interception Block Rate',
      value: metrics.blockRatePercent + '%',
      subtext: metrics.blockedRequests + ' malicious/unsafe calls',
      icon: XCircle,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20'
    },
    {
      title: 'Hallucination Flag Rate',
      value: metrics.hallucinationRatePercent + '%',
      subtext: 'Grounding score < 70%',
      icon: AlertTriangle,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20'
    },
    {
      title: 'Protected PII Entities',
      value: metrics.piiIncidentsCount.toString(),
      subtext: 'Aadhaar, SSN & credentials redacted',
      icon: ShieldCheck,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20'
    },
    {
      title: 'Estimated Cost Saved',
      value: '$' + metrics.costSavedUSD.toFixed(4),
      subtext: metrics.cacheHitRatePercent + '% Semantic Cache hit rate',
      icon: Coins,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      title: 'Mean Proxy Latency',
      value: metrics.avgLatencyMs + 'ms',
      subtext: 'Zero-overhead inline gateway',
      icon: Clock,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className="surface p-3.5 card-hover">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-mono truncate">
                {c.title}
              </span>
              <div className={`p-1.5 rounded border ${c.bg} shrink-0`}>
                <Icon className={`w-3.5 h-3.5 ${c.color}`} />
              </div>
            </div>
            <div className="text-xl font-bold text-zinc-100 mt-2 font-mono tabular">
              {c.value}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5 truncate">
              {c.subtext || c.change}
            </div>
          </div>
        );
      })}
    </div>
  );
};
