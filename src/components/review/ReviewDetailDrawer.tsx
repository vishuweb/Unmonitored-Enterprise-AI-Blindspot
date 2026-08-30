import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ReviewQueueItem } from '../../types';
import { useControlPlane } from '../../context/ControlPlaneContext';

interface ReviewDetailDrawerProps {
  item: ReviewQueueItem;
  onClose: () => void;
}

export const ReviewDetailDrawer: React.FC<ReviewDetailDrawerProps> = ({ item, onClose }) => {
  const { approveReviewItem, rejectReviewItem, editReviewItem } = useControlPlane();
  const [editedText, setEditedText] = useState(item.proposedRemediation);
  const [notes, setNotes] = useState('');

  const isPending = item.status === 'PENDING';

  const handleApprove = () => {
    approveReviewItem(item.id, notes);
    onClose();
  };

  const handleReject = () => {
    rejectReviewItem(item.id, notes);
    onClose();
  };

  const handleEditAndRelease = () => {
    editReviewItem(item.id, editedText, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-zinc-900 border-l border-zinc-800 h-full flex flex-col shadow-2xl animate-slideLeft">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-zinc-100">Review Request Incident</span>
              <span className="font-mono text-xs text-indigo-400">({item.requestId})</span>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono mt-0.5">{item.timestamp} | {item.application}</div>
          </div>
          <button onClick={onClose} aria-label="Close review details" className="text-zinc-500 hover:text-zinc-300 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
          {/* Risk & Policy Banner */}
          <div className="p-3.5 rounded-lg bg-purple-950/20 border border-purple-500/30 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-purple-300">
                Triggered: {item.triggeredPolicies.join(', ')}
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">{item.evidence}</div>
            </div>
            <span className="badge border-purple-500/40 bg-purple-500/20 text-purple-300 font-mono font-bold text-xs">
              RISK {item.riskScore}/100
            </span>
          </div>

          {/* Raw Prompt Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-zinc-400 uppercase font-mono">Original User Prompt</label>
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono leading-relaxed">
              {item.inputPrompt}
            </div>
          </div>

          {/* Model Raw Response (Flagged) */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-rose-400 uppercase font-mono flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Flagged Downstream Output
            </label>
            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-300 font-mono leading-relaxed">
              {item.originalOutput}
            </div>
          </div>

          {/* Proposed Remediation / Safe Edit */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-emerald-400 uppercase font-mono flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Proposed Safe Remediation (Editable)
            </label>
            <textarea
              rows={4}
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              disabled={!isPending}
              className="input-base w-full p-3 font-mono leading-relaxed resize-none text-zinc-200"
            />
          </div>

          {/* Review Notes */}
          {isPending && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-zinc-400 uppercase font-mono">Safety Operator Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional decision notes for compliance audit log..."
                className="input-base w-full px-3 py-2 text-xs"
              />
            </div>
          )}

          {!isPending && item.reviewer && (
            <div className="p-3 rounded bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400">
              <span className="text-zinc-200 font-semibold">Resolution: </span>
              {item.status} by <span className="font-mono text-zinc-300">{item.reviewer}</span> at {item.reviewTimestamp}.
              {item.reviewNotes && <div className="mt-1 text-zinc-400">Notes: "{item.reviewNotes}"</div>}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {isPending ? (
          <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between gap-2 shrink-0">
            <button
              onClick={handleReject}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject Request</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleEditAndRelease}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Save Edit & Release</span>
              </button>

              <button
                onClick={handleApprove}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve Original</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 border-t border-zinc-800 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-semibold"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
