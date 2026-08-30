import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Edit3, 
  Plus, 
  Power, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileCode,
  Sparkles
} from 'lucide-react';
import { useControlPlane } from '../../context/ControlPlaneContext';
import { PolicyRule } from '../../types';
import { PolicyModal } from './PolicyModal';

export const PolicyTable: React.FC = () => {
  const { policies, togglePolicyStatus } = useControlPlane();
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyRule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const handleEdit = (policy: PolicyRule) => {
    setSelectedPolicy(policy);
    setIsNew(false);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedPolicy({
      id: 'pol-new-' + Date.now(),
      name: 'New Enterprise Guardrail Rule',
      category: 'SECURITY',
      engine: 'RESPONSIBILITY',
      description: 'Describe runtime constraint and enforcement criteria...',
      severity: 'HIGH',
      action: 'BLOCK',
      threshold: 75,
      status: 'ACTIVE',
      version: 'v1.0',
      updatedAt: new Date().toISOString().substring(0, 16) + ' UTC',
      author: 'Security Admin'
    });
    setIsNew(true);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-zinc-100 tracking-tight">Active Enterprise Policies & Guardrails</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Runtime constraints enforced dynamically across all intercepted model requests.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Define Policy Rule</span>
        </button>
      </div>

      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-[10px] text-zinc-500 uppercase font-mono tracking-wider">
              <tr>
                <th className="p-3">Policy Name & Engine</th>
                <th className="p-3">Category</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Action</th>
                <th className="p-3">Threshold</th>
                <th className="p-3">Version</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {policies.map((p) => {
                const isActive = p.status === 'ACTIVE';
                return (
                  <tr key={p.id} className="hover:bg-zinc-850/40 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-zinc-200">{p.name}</div>
                      <div className="text-[11px] text-zinc-400 line-clamp-1 max-w-md mt-0.5">{p.description}</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-1">Author: {p.author}</div>
                    </td>
                    <td className="p-3">
                      <span className="badge border-zinc-700 bg-zinc-800 text-zinc-300 text-[10px]">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`badge text-[10px] font-semibold ${
                        p.severity === 'CRITICAL' ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' :
                        p.severity === 'HIGH' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' :
                        'border-blue-500/30 bg-blue-500/10 text-blue-400'
                      }`}>
                        {p.severity}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`badge text-[10px] font-bold ${
                        p.action === 'BLOCK' ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' :
                        p.action === 'EDIT' ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400' :
                        p.action === 'ESCALATE' ? 'border-purple-500/30 bg-purple-500/10 text-purple-400' :
                        'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {p.action}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-zinc-300">
                      {p.threshold}
                    </td>
                    <td className="p-3 font-mono text-zinc-400">
                      {p.version}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => togglePolicyStatus(p.id)}
                        className={`badge cursor-pointer transition-all text-[10px] font-bold ${
                          isActive 
                            ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25' 
                            : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-750'
                        }`}
                      >
                        <Power className="w-2.5 h-2.5 mr-1" />
                        {p.status}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleEdit(p)}
                        className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                        title="Edit Policy Parameters"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && selectedPolicy && (
        <PolicyModal
          policy={selectedPolicy}
          isNew={isNew}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
