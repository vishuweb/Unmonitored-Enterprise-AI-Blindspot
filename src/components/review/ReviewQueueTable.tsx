import React, { useState } from 'react';
import { 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  ChevronRight, 
  Clock, 
  ShieldAlert 
} from 'lucide-react';
import { useControlPlane } from '../../context/ControlPlaneContext';
import { ReviewQueueItem } from '../../types';
import { ReviewDetailDrawer } from './ReviewDetailDrawer';

export const ReviewQueueTable: React.FC = () => {
  const { reviewQueue } = useControlPlane();
  const [selectedItem, setSelectedItem] = useState<ReviewQueueItem | null>(null);

  const pendingItems = reviewQueue.filter(r => r.status === 'PENDING');
  const resolvedItems = reviewQueue.filter(r => r.status !== 'PENDING');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-zinc-100 tracking-tight">AI Safety Operations & Escalation Queue</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Human-in-the-loop review console for hallucination flags, high-impact transfers, and sensitive queries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-semibold">
            {pendingItems.length} Awaiting Decision
          </span>
          <span className="badge border-zinc-700 bg-zinc-800 text-zinc-400 text-xs">
            {resolvedItems.length} Resolved
          </span>
        </div>
      </div>

      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-[10px] text-zinc-500 uppercase font-mono tracking-wider">
              <tr>
                <th className="p-3">Incident / Request ID</th>
                <th className="p-3">Application Context</th>
                <th className="p-3">Risk Score</th>
                <th className="p-3">Triggered Policy</th>
                <th className="p-3">Raw Prompt & Evidence</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {reviewQueue.map((item) => {
                const isPending = item.status === 'PENDING';
                return (
                  <tr 
                    key={item.id} 
                    onClick={() => setSelectedItem(item)}
                    className="hover:bg-zinc-850/40 cursor-pointer transition-colors"
                  >
                    <td className="p-3">
                      <div className="font-mono font-semibold text-zinc-200">{item.requestId}</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{item.timestamp}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-zinc-300">{item.application}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{item.model}</div>
                    </td>
                    <td className="p-3">
                      <span className={`badge text-[10px] font-mono font-bold ${
                        item.riskScore > 75 ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' :
                        'border-purple-500/30 bg-purple-500/10 text-purple-400'
                      }`}>
                        {item.riskScore}/100
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="text-[11px] text-zinc-300 font-medium">
                        {item.triggeredPolicies.join(', ')}
                      </div>
                    </td>
                    <td className="p-3 max-w-xs">
                      <div className="text-[11px] text-zinc-300 line-clamp-1 font-mono">{item.inputPrompt}</div>
                      <div className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">{item.evidence}</div>
                    </td>
                    <td className="p-3">
                      <span className={`badge text-[10px] font-bold ${
                        item.status === 'PENDING' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 animate-pulse' :
                        item.status === 'APPROVED' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
                        item.status === 'EDITED' ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400' :
                        'border-rose-500/30 bg-rose-500/10 text-rose-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs font-semibold ml-auto"
                      >
                        <span>{isPending ? 'Resolve' : 'View'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedItem && (
        <ReviewDetailDrawer
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};
