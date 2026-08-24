import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  AlertTriangle,
  ChevronRight,
  Filter,
  ShieldCheck
} from 'lucide-react';
import { useControlPlane } from '../../context/ControlPlaneContext';
import { RuntimeEvent } from '../../types';
import { AuditDetailDrawer } from './AuditDetailDrawer';

export const AuditTable: React.FC = () => {
  const { runtimeEvents } = useControlPlane();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDecision, setSelectedDecision] = useState<string>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<RuntimeEvent | null>(null);

  const filteredEvents = runtimeEvents.filter(e => {
    const matchSearch = e.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        e.application.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        e.rawInput.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDecision = selectedDecision === 'ALL' || e.decision === selectedDecision;
    return matchSearch && matchDecision;
  });

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(runtimeEvents, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `controlplane_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportCSV = () => {
    const headers = ['RequestID', 'Timestamp', 'Application', 'Model', 'Decision', 'RiskScore', 'InputSHA256', 'LatencyMs', 'SavingsUSD'];
    const rows = runtimeEvents.map(e => [
      e.requestId,
      e.timestamp,
      `"${e.application}"`,
      `"${e.model}"`,
      e.decision,
      e.riskScore,
      e.inputSha256,
      e.latency.totalLatencyMs,
      e.cost.savingsAmount
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `controlplane_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-zinc-100 tracking-tight">Immutable Cryptographic Audit Trail</h2>
            <span className="badge border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[10px]">
              Designed for SOC 2 Type II Alignment
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Every runtime proxy event is signed with SHA-256 hashes and policy version signatures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON Log</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="surface p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Request ID, app, or payload text..."
            className="bg-transparent text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'ALLOW', 'BLOCK', 'EDIT', 'ESCALATE'].map(d => (
            <button
              key={d}
              onClick={() => setSelectedDecision(d)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all ${
                selectedDecision === d 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-[10px] text-zinc-500 uppercase font-mono tracking-wider">
              <tr>
                <th className="p-3">Request ID & Timestamp</th>
                <th className="p-3">Application</th>
                <th className="p-3">Model</th>
                <th className="p-3">Decision</th>
                <th className="p-3">Risk Score</th>
                <th className="p-3">SHA-256 Input Hash</th>
                <th className="p-3">Latency</th>
                <th className="p-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {filteredEvents.map((evt) => (
                <tr
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="hover:bg-zinc-850/40 cursor-pointer transition-colors"
                >
                  <td className="p-3">
                    <div className="font-semibold text-zinc-200">{evt.requestId}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{evt.timestamp}</div>
                  </td>
                  <td className="p-3 font-sans text-zinc-300 font-medium">
                    {evt.application}
                  </td>
                  <td className="p-3 text-zinc-400">
                    {evt.model}
                  </td>
                  <td className="p-3">
                    <span className={`badge text-[10px] font-bold ${
                      evt.decision === 'ALLOW' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
                      evt.decision === 'BLOCK' ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' :
                      evt.decision === 'EDIT' ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400' :
                      'border-purple-500/30 bg-purple-500/10 text-purple-400'
                    }`}>
                      {evt.decision}
                    </span>
                  </td>
                  <td className="p-3 text-zinc-300 font-bold">
                    {evt.riskScore}/100
                  </td>
                  <td className="p-3 text-zinc-500 text-[10px] max-w-xs truncate" title={evt.inputSha256}>
                    {evt.inputSha256}
                  </td>
                  <td className="p-3 text-zinc-400">
                    {evt.latency.totalLatencyMs}ms
                  </td>
                  <td className="p-3 text-right">
                    <button className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs font-semibold ml-auto font-sans">
                      <span>Audit</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEvent && (
        <AuditDetailDrawer
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};
