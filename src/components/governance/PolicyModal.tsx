import React, { useState } from 'react';
import { X, ShieldAlert, Check } from 'lucide-react';
import { PolicyRule, GovernanceDecision, PolicySeverity, PolicyStatus, EngineType } from '../../types';
import { useControlPlane } from '../../context/ControlPlaneContext';

interface PolicyModalProps {
  policy: PolicyRule;
  isNew: boolean;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ policy, isNew, onClose }) => {
  const { updatePolicy, createPolicy } = useControlPlane();
  const [formData, setFormData] = useState<PolicyRule>({ ...policy });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNew) {
      createPolicy(formData);
    } else {
      updatePolicy(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-zinc-100">
              {isNew ? 'Create New Governance Policy' : 'Configure Policy Parameters'}
            </h3>
          </div>
          <button onClick={onClose} aria-label="Close policy editor" className="text-zinc-500 hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-4 space-y-3.5 text-xs">
          <div>
            <label className="text-[10px] uppercase font-mono text-zinc-400">Policy Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-base w-full mt-1 px-3 py-2 text-xs"
              required
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-zinc-400">Description & Rationale</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-base w-full mt-1 px-3 py-2 text-xs resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-mono text-zinc-400">Engine Layer</label>
              <select
                value={formData.engine}
                onChange={(e) => setFormData({ ...formData, engine: e.target.value as EngineType })}
                className="input-base w-full mt-1 px-2.5 py-2 text-xs"
              >
                <option value="RESPONSIBILITY">Responsibility Engine</option>
                <option value="COST">Cost Engine</option>
                <option value="PERFORMANCE">Performance Engine</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-zinc-400">Enforcement Action</label>
              <select
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value as GovernanceDecision })}
                className="input-base w-full mt-1 px-2.5 py-2 text-xs"
              >
                <option value="BLOCK">BLOCK (Intercept)</option>
                <option value="EDIT">EDIT (Redact/Sanitize)</option>
                <option value="ESCALATE">ESCALATE (Human Review)</option>
                <option value="ALLOW">ALLOW (Permit)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase font-mono text-zinc-400">Severity</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as PolicySeverity })}
                className="input-base w-full mt-1 px-2 py-2 text-xs"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-zinc-400">Threshold Score</label>
              <input
                type="number"
                value={formData.threshold}
                onChange={(e) => setFormData({ ...formData, threshold: Number(e.target.value) })}
                className="input-base w-full mt-1 px-2.5 py-2 text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-zinc-400">Lifecycle Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as PolicyStatus })}
                className="input-base w-full mt-1 px-2 py-2 text-xs font-mono"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="TEST">TEST</option>
                <option value="DRAFT">DRAFT</option>
                <option value="ROLLBACK">ROLLBACK</option>
              </select>
            </div>
          </div>

          <div className="p-3 border-t border-zinc-800 flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save & Enforce</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
