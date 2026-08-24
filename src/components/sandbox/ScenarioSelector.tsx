import React from 'react';
import { 
  Terminal, 
  Send, 
  Layers, 
  Bot, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useControlPlane } from '../../context/ControlPlaneContext';
import { SCENARIO_PRESETS } from '../../engine/scenarios';
import { TargetApplication, TargetModel } from '../../types';

export const ScenarioSelector: React.FC = () => {
  const { 
    activePrompt, 
    setActivePrompt, 
    selectedApplication, 
    setSelectedApplication, 
    selectedModel, 
    setSelectedModel, 
    selectedScenario, 
    loadScenario, 
    executeProxyRequest, 
    isExecuting 
  } = useControlPlane();

  const applications: TargetApplication[] = [
    'Customer-Facing Support Bot',
    'Internal Knowledge Copilot',
    'Decision-Support Agent',
    'Financial Intelligence Analyst',
    'Healthcare Clinical Assistant'
  ];

  const models: TargetModel[] = [
    'GPT-4o (128K)',
    'Claude 3.5 Sonnet (200K)',
    'Llama-3-70B (8K)',
    'GPT-4o-mini (128K)'
  ];

  return (
    <div className="space-y-4">
      {/* Application & Target Model Configuration */}
      <div className="surface p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          <Bot className="w-3.5 h-3.5 text-indigo-400" />
          <span>Target AI Client Context</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="text-[10px] text-zinc-500 uppercase font-mono">Enterprise Application</label>
            <select
              value={selectedApplication}
              onChange={(e) => setSelectedApplication(e.target.value as TargetApplication)}
              className="input-base w-full mt-1 px-2.5 py-1.5 text-xs text-zinc-200"
            >
              {applications.map(app => (
                <option key={app} value={app} className="bg-zinc-900 text-zinc-200">{app}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 uppercase font-mono">Downstream LLM</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as TargetModel)}
              className="input-base w-full mt-1 px-2.5 py-1.5 text-xs text-zinc-200 font-mono"
            >
              {models.map(m => (
                <option key={m} value={m} className="bg-zinc-900 text-zinc-200">{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Preset Scenarios */}
      <div className="surface p-4">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Preset Runtime Scenarios</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">8 Scenarios</span>
        </div>

        <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto pr-1">
          {SCENARIO_PRESETS.map((sc) => {
            const isSelected = selectedScenario?.id === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => loadScenario(sc)}
                className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                  isSelected 
                    ? 'border-indigo-500/60 bg-indigo-950/30 shadow-sm' 
                    : 'border-zinc-800/80 bg-zinc-950/50 hover:bg-zinc-850/60 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-zinc-200 truncate">{sc.title}</span>
                  <span className={`badge text-[10px] ${sc.tagColor}`}>
                    {sc.expectedDecision}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                  {sc.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Prompt Editor & Send Button */}
      <div className="surface p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
            Client Raw Payload / Prompt
          </label>
          <span className="text-[10px] text-zinc-500 font-mono">{activePrompt.length} chars</span>
        </div>

        <textarea
          rows={5}
          value={activePrompt}
          onChange={(e) => setActivePrompt(e.target.value)}
          placeholder="Enter prompt or select a preset scenario above to test the 3-engine runtime pipeline..."
          className="input-base w-full px-3 py-2.5 text-xs font-mono leading-relaxed resize-none"
        />

        <button
          onClick={() => executeProxyRequest()}
          disabled={isExecuting || !activePrompt.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all"
        >
          {isExecuting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Evaluating Through 3-Engine Proxy...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Intercept & Execute Real-Time Proxy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
