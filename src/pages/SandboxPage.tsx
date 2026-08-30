import React from 'react';
import { ScenarioSelector } from '../components/sandbox/ScenarioSelector';
import { PipelineVisualizer } from '../components/sandbox/PipelineVisualizer';
import { DecisionDossier } from '../components/sandbox/DecisionDossier';

export const SandboxPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-zinc-100 tracking-tight">Live Proxy Runtime Sandbox</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Submit a prompt to inspect it with the Responsibility, Cost, and Performance engines.
          </p>
        </div>
      </div>

      {/* Hero 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Prompt input */}
        <div className="lg:col-span-4">
          <ScenarioSelector />
        </div>

        {/* Evaluation pipeline */}
        <div className="lg:col-span-4">
          <PipelineVisualizer />
        </div>

        {/* Decision dossier */}
        <div className="lg:col-span-4">
          <DecisionDossier />
        </div>
      </div>
    </div>
  );
};
