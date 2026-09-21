import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface InAppDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
  title: string;
  itemDescription?: string;
  thumbnailUrl?: string;
  itemType: 'Product' | 'Order' | 'Section';
}

export const InAppDeleteModal: React.FC<InAppDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
  title,
  itemDescription,
  thumbnailUrl,
  itemType,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div
        id="in-app-delete-confirmation-modal"
        className="relative w-full max-w-md bg-[#0e0e12] border border-rose-900/50 rounded-2xl shadow-2xl overflow-hidden z-10 p-6 space-y-5"
      >
        {/* Header with Warning Icon */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                Delete {itemType} Confirmation
              </h3>
              <p className="text-xs text-zinc-400">
                This action cannot be undone. Permanent deletion.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Item Thumbnail & Details Preview */}
        <div className="p-3.5 rounded-xl bg-[#141418] border border-zinc-800 flex items-center gap-3.5">
          {thumbnailUrl && (
            <div className="w-14 h-16 bg-[#0a0a0d] rounded-lg border border-zinc-800 p-1 shrink-0 flex items-center justify-center">
              <img
                src={thumbnailUrl}
                alt={title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-white truncate">{title}</h4>
            {itemDescription && (
              <p className="text-[11px] text-zinc-400 font-mono mt-0.5 truncate">
                {itemDescription}
              </p>
            )}
            <span className="inline-block mt-1 text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-300 border border-rose-900">
              Pending Permanent Removal
            </span>
          </div>
        </div>

        {/* Actions: Cancel or Permanent Delete */}
        <div className="flex items-center gap-3 pt-2">
          <button
            id="confirm-delete-cancel-btn"
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#18181b] hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            id="confirm-delete-execute-btn"
            type="button"
            onClick={() => {
              onConfirmDelete();
              onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/20 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Yes, Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
