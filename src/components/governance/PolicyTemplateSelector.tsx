import React, { useState } from 'react';
import { ShieldAlert, DollarSign, CheckCircle2, Gauge } from 'lucide-react';
import { usePolicies } from '../../context/PoliciesContext';
import { POLICY_TEMPLATES } from '../../engine/policyTemplates';

export const PolicyTemplateSelector: React.FC = () => {
  const { applyPolicyTemplate } = usePolicies();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const iconMap: { [key: string]: React.ReactNode } = {
    ShieldAlert: <ShieldAlert className="w-5 h-5" />,
    DollarSign: <DollarSign className="w-5 h-5" />,
    CheckCircle2: <CheckCircle2 className="w-5 h-5" />,
    Gauge: <Gauge className="w-5 h-5" />,
  };

  const handleApplyTemplate = async () => {
    const template = POLICY_TEMPLATES.find(t => t.id === selectedTemplate);
    if (!template) return;

    setIsLoading(true);
    try {
      await applyPolicyTemplate(template.policies);
      setSelectedTemplate('');
      alert(`✓ Applied "${template.name}" policy template successfully!`);
    } catch (err) {
      alert('Failed to apply policy template. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Policy Templates
        </label>
        <p className="text-xs text-zinc-400 mb-3">
          Quickly apply pre-configured policy bundles for common governance scenarios.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {POLICY_TEMPLATES.map(template => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedTemplate === template.id
                  ? 'border-indigo-500/60 bg-indigo-500/10'
                  : 'border-zinc-700/50 bg-zinc-900/30 hover:border-zinc-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-zinc-400">
                  {iconMap[template.icon]}
                </div>
                <div>
                  <div className="font-semibold text-sm text-zinc-200">
                    {template.name}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    {template.description}
                  </div>
                  <div className="text-xs text-zinc-500 mt-2">
                    {template.policies.length} policies
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedTemplate && (
        <div className="space-y-3 p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-lg">
          <div>
            <p className="text-xs font-medium text-indigo-300 mb-2">
              Template Details:
            </p>
            <ul className="text-xs text-indigo-200 space-y-1">
              {POLICY_TEMPLATES.find(t => t.id === selectedTemplate)?.policies.map(
                (policy, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-400">•</span>
                    <span>
                      {policy.name} ({policy.action})
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>

          <button
            onClick={handleApplyTemplate}
            disabled={isLoading}
            className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded text-sm font-medium transition-colors"
          >
            {isLoading ? 'Applying...' : 'Apply Template'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PolicyTemplateSelector;
