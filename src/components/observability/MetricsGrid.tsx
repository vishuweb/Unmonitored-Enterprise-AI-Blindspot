import React, { useEffect, useState } from 'react';
import {
  Activity,
  ShieldCheck,
  XCircle,
  AlertTriangle,
  Clock,
  Coins,
} from 'lucide-react';
import { useControlPlane } from '../../context/ControlPlaneContext';

function useCountUp(target: number | string, duration = 900): string {
  const num = parseFloat(String(target).replace(/[^0-9.]/g, ''));
  const suffix = String(target).replace(/[0-9.]/g, '');
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (isNaN(num) || num === 0) { setValue(0); return; }
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const raw = eased * num;
      setValue(Number.isInteger(num) ? Math.round(raw) : parseFloat(raw.toFixed(4)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [num, duration]);

  if (isNaN(num)) return String(target);
  return `${value}${suffix}`;
}

interface MetricCardProps {
  title: string;
  value: string;
  subtext?: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  glow: string;
  delay?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtext, icon: Icon, color, bg, border, glow, delay = 0 }) => {
  const [hovered, setHovered] = useState(false);
  const animatedVal = useCountUp(value);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ animationDelay: `${delay}ms` }}
      className={`surface card-3d p-4 relative overflow-hidden cursor-default animate-stagger-in ${hovered ? glow : ''} transition-all duration-300`}
    >
      {/* Shimmer sweep on hover */}
      {hovered && <div className="absolute inset-0 shimmer rounded-xl pointer-events-none" />}

      {/* Background accent glow */}
      <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full ${bg} blur-2xl opacity-50 pointer-events-none transition-opacity duration-300 ${hovered ? 'opacity-80' : 'opacity-30'}`} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest font-mono leading-tight">
            {title}
          </span>
          <div className={`p-2 rounded-lg border ${border} ${bg} transition-all duration-300 ${hovered ? 'scale-110 shadow-md' : ''}`}>
            <Icon className={`w-3.5 h-3.5 ${color}`} />
          </div>
        </div>

        <div className={`text-2xl font-bold font-mono tabular tracking-tight transition-colors duration-200 ${hovered ? color : 'text-zinc-100'}`}>
          {animatedVal}
        </div>

        {subtext && (
          <div className="text-[10px] text-zinc-500 mt-1.5 leading-snug line-clamp-1">{subtext}</div>
        )}

        {/* Tiny progress bar accent */}
        <div className="mt-3 h-0.5 bg-zinc-800/60 rounded-full overflow-hidden">
          <div className={`h-full ${color.replace('text-', 'bg-')} rounded-full transition-all duration-1000 ${hovered ? 'w-full' : 'w-0'}`} />
        </div>
      </div>
    </div>
  );
};

export const MetricsGrid: React.FC = () => {
  const { metrics } = useControlPlane();

  const cards = [
    {
      title: 'AI Invocations',
      value: metrics.totalRequests.toLocaleString(),
      subtext: 'Recorded this session',
      icon: Activity,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/15',
      border: 'border-indigo-500/25',
      glow: 'glow-indigo',
    },
    {
      title: 'Block Rate',
      value: metrics.blockRatePercent + '%',
      subtext: `${metrics.blockedRequests} blocked calls`,
      icon: XCircle,
      color: 'text-rose-400',
      bg: 'bg-rose-500/15',
      border: 'border-rose-500/25',
      glow: 'glow-rose',
    },
    {
      title: 'Hallucination Rate',
      value: metrics.totalRequests > 0 ? metrics.hallucinationRatePercent + '%' : '—',
      subtext: 'Requires downstream model',
      icon: AlertTriangle,
      color: 'text-purple-400',
      bg: 'bg-purple-500/15',
      border: 'border-purple-500/25',
      glow: 'glow-indigo',
    },
    {
      title: 'PII Protected',
      value: metrics.piiIncidentsCount.toString(),
      subtext: 'Aadhaar, SSN & credentials',
      icon: ShieldCheck,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/15',
      border: 'border-cyan-500/25',
      glow: 'glow-cyan',
    },
    {
      title: 'Cost Saved',
      value: metrics.costSavedUSD > 0 ? '$' + metrics.costSavedUSD.toFixed(4) : '—',
      subtext: 'Via caching & routing',
      icon: Coins,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-500/25',
      glow: 'glow-emerald',
    },
    {
      title: 'Avg Latency',
      value: metrics.avgLatencyMs + 'ms',
      subtext: 'Proxy processing time',
      icon: Clock,
      color: 'text-blue-400',
      bg: 'bg-blue-500/15',
      border: 'border-blue-500/25',
      glow: 'glow-indigo',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c, i) => (
        <MetricCard key={i} {...c} delay={i * 60} />
      ))}
    </div>
  );
};
