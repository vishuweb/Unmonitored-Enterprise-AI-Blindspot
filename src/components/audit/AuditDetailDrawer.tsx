import React, { useState } from 'react';
import { X, Copy, Check, ShieldCheck, Database, Layers, Clock } from 'lucide-react';
import { RuntimeEvent } from '../../types';

interface AuditDetailDrawerProps {
  event: RuntimeEvent;
  onClose: () => void;
}

export const AuditDetailDrawer: React.FC<AuditDetailDrawerProps> = ({ event, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(event, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-zinc-900 border-l border-zinc-800 h-full flex flex-col shadow-2xl animate-slideLeft">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-zinc-100">Cryptographic Audit Event Record</span>
              <span className="font-mono text-xs text-indigo-400">({event.requestId})</span>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono mt-0.5">{event.timestamp} | {event.application}</div>
          </div>
          <button onClick={onClose} aria-label="Close audit details" className="text-zinc-500 hover:text-zinc-300 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
          {/* Decision Summary */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase font-mono">Governance Action</div>
              <div className="text-sm font-bold text-zinc-200 mt-0.5">{event.decision}</div>
            </div>
            <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase font-mono">Composite Risk</div>
              <div className="text-sm font-bold text-zinc-200 mt-0.5">{event.riskScore}/100</div>
            </div>
            <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase font-mono">Total Latency</div>
              <div className="text-sm font-bold text-zinc-200 mt-0.5">{event.latency.totalLatencyMs}ms</div>
            </div>
          </div>

          {/* Cryptographic Hashes */}
          <div className="surface p-3.5 space-y-2 font-mono text-[11px]">
            <div className="text-xs font-bold text-zinc-300 font-sans uppercase">Cryptographic Integrity Hashes</div>
            <div className="space-y-1 text-zinc-400">
              <div><span className="text-zinc-500">Input SHA-256: </span><span className="text-zinc-200">{event.inputSha256}</span></div>
              <div><span className="text-zinc-500">Output SHA-256: </span><span className="text-zinc-200">{event.outputSha256}</span></div>
            </div>
          </div>

          {/* Triggered Policies */}
          {event.triggeredPolicies.length > 0 && (
            <div className="surface p-3.5 space-y-2">
              <div className="text-xs font-bold text-zinc-300 uppercase">Triggered Policy Snapshot</div>
              <div className="space-y-1 text-xs">
                {event.triggeredPolicies.map(p => (
                  <div key={p.id} className="p-2 rounded bg-zinc-950 border border-zinc-850 flex justify-between">
                    <span className="font-semibold text-zinc-200">{p.name} ({p.version})</span>
                    <span className="badge text-[10px]">{p.action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw JSON Payload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 uppercase">Complete Telemetry Object (JSON)</span>
              <button
                onClick={copyJson}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-[11px] transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>

            <pre className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-300 overflow-x-auto leading-relaxed max-h-80">
              {JSON.stringify(event, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
