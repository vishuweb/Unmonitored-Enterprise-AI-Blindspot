import React, { useState, useEffect } from 'react';
import { Search, X, Terminal, ShieldAlert, Activity, FileSpreadsheet } from 'lucide-react';
import { useControlPlane } from '../../context/ControlPlaneContext';

export const QuickSearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, policies, runtimeEvents, setActiveTab, loadScenario } = useControlPlane();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const filteredPolicies = policies.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.description.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const filteredEvents = runtimeEvents.filter(e => 
    e.requestId.toLowerCase().includes(query.toLowerCase()) || 
    e.rawInput.toLowerCase().includes(query.toLowerCase()) ||
    e.decision.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
        <div className="p-3.5 border-b border-zinc-800 flex items-center gap-3">
          <Search className="w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search policies, request IDs, telemetry events, or prompts..."
            className="flex-1 bg-transparent border-none text-zinc-100 text-sm focus:outline-none placeholder-zinc-500"
            autoFocus
          />
          <button 
            onClick={() => setIsSearchOpen(false)}
            className="text-zinc-500 hover:text-zinc-300 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 max-h-96 overflow-y-auto space-y-4">
          {/* Quick Nav */}
          <div>
            <div className="text-[10px] font-semibold text-zinc-500 uppercase px-2 mb-1.5">Direct Navigation</div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => { setActiveTab('sandbox'); setIsSearchOpen(false); }}
                className="flex items-center gap-2 p-2 rounded-md bg-zinc-950/60 hover:bg-zinc-800/60 border border-zinc-800 text-xs text-zinc-300 text-left"
              >
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Live Proxy Sandbox</span>
              </button>
              <button
                onClick={() => { setActiveTab('observability'); setIsSearchOpen(false); }}
                className="flex items-center gap-2 p-2 rounded-md bg-zinc-950/60 hover:bg-zinc-800/60 border border-zinc-800 text-xs text-zinc-300 text-left"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Observability & Metrics</span>
              </button>
              <button
                onClick={() => { setActiveTab('governance'); setIsSearchOpen(false); }}
                className="flex items-center gap-2 p-2 rounded-md bg-zinc-950/60 hover:bg-zinc-800/60 border border-zinc-800 text-xs text-zinc-300 text-left"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Governance & Policies</span>
              </button>
              <button
                onClick={() => { setActiveTab('audit'); setIsSearchOpen(false); }}
                className="flex items-center gap-2 p-2 rounded-md bg-zinc-950/60 hover:bg-zinc-800/60 border border-zinc-800 text-xs text-zinc-300 text-left"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
                <span>Audit & Compliance Logs</span>
              </button>
            </div>
          </div>

          {/* Filtered Policies */}
          {filteredPolicies.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-zinc-500 uppercase px-2 mb-1.5">Matching Policies</div>
              <div className="space-y-1">
                {filteredPolicies.map(pol => (
                  <button
                    key={pol.id}
                    onClick={() => { setActiveTab('governance'); setIsSearchOpen(false); }}
                    className="w-full flex items-center justify-between p-2 rounded-md bg-zinc-950/40 hover:bg-zinc-800/50 border border-zinc-800/60 text-xs text-left"
                  >
                    <div>
                      <div className="font-semibold text-zinc-200">{pol.name} <span className="text-[10px] text-zinc-500 font-mono">({pol.version})</span></div>
                      <div className="text-[11px] text-zinc-400 line-clamp-1">{pol.description}</div>
                    </div>
                    <span className="badge border-zinc-700 bg-zinc-800 text-zinc-300 text-[10px]">
                      {pol.action}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filtered Events */}
          {filteredEvents.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-zinc-500 uppercase px-2 mb-1.5">Matching Audit Events</div>
              <div className="space-y-1">
                {filteredEvents.map(evt => (
                  <button
                    key={evt.id}
                    onClick={() => { setActiveTab('audit'); setIsSearchOpen(false); }}
                    className="w-full flex items-center justify-between p-2 rounded-md bg-zinc-950/40 hover:bg-zinc-800/50 border border-zinc-800/60 text-xs text-left"
                  >
                    <div>
                      <div className="font-mono text-zinc-300 font-medium">{evt.requestId} <span className="text-zinc-500 font-sans">({evt.application})</span></div>
                      <div className="text-[11px] text-zinc-400 line-clamp-1">{evt.rawInput}</div>
                    </div>
                    <span className={`badge text-[10px] font-semibold ${
                      evt.decision === 'ALLOW' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
                      evt.decision === 'BLOCK' ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' :
                      evt.decision === 'EDIT' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' :
                      'border-purple-500/30 bg-purple-500/10 text-purple-400'
                    }`}>
                      {evt.decision}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
