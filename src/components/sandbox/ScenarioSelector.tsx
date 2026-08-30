import React, { useState } from 'react';
import { Send, RefreshCw, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { useControlPlane } from '../../context/ControlPlaneContext';
import { SCENARIO_PRESETS } from '../../engine/scenarios';

export const ScenarioSelector: React.FC = () => {
  const {
    activePrompt,
    setActivePrompt,
    executeProxyRequest,
    isExecuting,
    selectedApplication,
    setSelectedApplication,
    selectedModel,
    setSelectedModel,
  } = useControlPlane();

  const [showPresets, setShowPresets] = useState(false);

  const loadPreset = (preset: typeof SCENARIO_PRESETS[0]) => {
    setActivePrompt(preset.prompt);
    setSelectedApplication(preset.application);
    setSelectedModel(preset.model);
    setShowPresets(false);
  };

  return (
    <div className="space-y-3">
      {/* Prompt Card */}
      <div className="surface p-4 space-y-3 relative overflow-hidden">
        {/* Corner glow accent */}
        <div className="absolute -top-8 -left-8 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-indigo-500/10 border border-indigo-500/20">
              <Zap className="w-3 h-3 text-indigo-400" />
            </div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">
              Prompt Input
            </label>
          </div>
          <span className="text-[10px] text-zinc-600 font-mono tabular">{activePrompt.length} chars</span>
        </div>

        <textarea
          rows={6}
          value={activePrompt}
          onChange={(e) => setActivePrompt(e.target.value)}
          placeholder="Enter a prompt to intercept through the 3-engine runtime governance proxy…"
          className="input-base w-full px-3 py-2.5 text-xs font-mono leading-relaxed resize-none relative z-10"
        />

        <button
          onClick={() => executeProxyRequest()}
          disabled={isExecuting || !activePrompt.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-xs font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none relative z-10"
        >
          {isExecuting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Evaluating Through 3-Engine Proxy…</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Intercept & Execute Real-Time Proxy</span>
            </>
          )}
        </button>
      </div>

      {/* Scenario Presets */}
      <div className="surface overflow-hidden">
        <button
          onClick={() => setShowPresets(!showPresets)}
          className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors group"
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded">{SCENARIO_PRESETS.length}</span>
            <span>Demo Scenario Presets</span>
          </div>
          {showPresets
            ? <ChevronUp className="w-3.5 h-3.5 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
            : <ChevronDown className="w-3.5 h-3.5 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
          }
        </button>

        {showPresets && (
          <div className="border-t border-zinc-800/60 divide-y divide-zinc-800/40 animate-slide-up">
            {SCENARIO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => loadPreset(preset)}
                className="w-full text-left px-4 py-2.5 hover:bg-zinc-800/40 transition-all duration-150 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-zinc-300 group-hover:text-zinc-100 transition-colors truncate">
                    {preset.title}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${preset.tagColor}`}>
                    {preset.expectedDecision}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-600 mt-0.5 group-hover:text-zinc-500 transition-colors line-clamp-1">
                  {preset.description}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
