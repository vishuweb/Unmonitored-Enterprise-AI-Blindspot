import React from 'react';
import { Send, RefreshCw } from 'lucide-react';
import { useControlPlane } from '../../context/ControlPlaneContext';

export const ScenarioSelector: React.FC = () => {
  const { 
    activePrompt, 
    setActivePrompt, 
    executeProxyRequest, 
    isExecuting 
  } = useControlPlane();

  return (
    <div className="space-y-4">
      <div className="surface p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
            Prompt
          </label>
          <span className="text-[10px] text-zinc-500 font-mono">{activePrompt.length} chars</span>
        </div>

        <textarea
          rows={5}
          value={activePrompt}
          onChange={(e) => setActivePrompt(e.target.value)}
          placeholder="Enter a prompt to inspect with the Responsibility, Cost, and Performance engines..."
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
