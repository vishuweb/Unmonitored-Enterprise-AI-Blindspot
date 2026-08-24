import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { PolicyTable } from '../components/governance/PolicyTable';

export const GovernancePage: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Top Description */}
      <div className="border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-zinc-100 tracking-tight">Enterprise Governance & Runtime Control Center</h1>
          <span className="badge border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[10px]">
            Policy Engine v2.4
          </span>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          Configure safety thresholds, PII redaction rules, prompt injection defenses, and human escalation boundaries.
        </p>
      </div>

      <PolicyTable />
    </div>
  );
};
