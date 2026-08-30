import React, { useState } from 'react';
import { X, Command } from 'lucide-react';
import { getPlatformModifier } from '../../hooks/useKeyboardShortcuts';

export const KeyboardShortcutsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const modifier = getPlatformModifier();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-zinc-900 border border-zinc-700/60 rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between bg-zinc-900/95 backdrop-blur border-b border-zinc-700/60 p-4">
          <div className="flex items-center gap-2">
            <Command className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-zinc-100">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close keyboard shortcuts"
            className="p-1 hover:bg-zinc-800 rounded transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wider">
              Navigation
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Sandbox</span>
                <span className="font-mono text-zinc-500">{modifier} + S</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Governance</span>
                <span className="font-mono text-zinc-500">{modifier} + G</span>
              </div>
            </div>
          </div>

          {/* Search & Actions */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wider">
              Search & Actions
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Open quick search</span>
                <span className="font-mono text-zinc-500">{modifier} + K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Approve all low-risk</span>
                <span className="font-mono text-zinc-500">{modifier} + ⇧ + A</span>
              </div>
            </div>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wider">
              Help
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Show this help menu</span>
                <span className="font-mono text-zinc-500">?</span>
              </div>
            </div>
          </div>

          {/* Tip */}
          <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-lg">
            <p className="text-xs text-indigo-300">
              <span className="font-semibold">💡 Tip:</span> Press{' '}
              <span className="font-mono text-indigo-400">{modifier} + K</span> anywhere
              to quickly search policies and audit logs.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-zinc-900/95 backdrop-blur border-t border-zinc-700/60 p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium text-zinc-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
