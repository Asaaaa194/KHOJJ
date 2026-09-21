import React, { useState } from 'react';
import { X, Lock, Shield, KeyRound, ArrowRight, AlertCircle } from 'lucide-react';

interface StaffAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticateSuccess: () => void;
}

export const StaffAuthModal: React.FC<StaffAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticateSuccess,
}) => {
  if (!isOpen) return null;

  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Private store owner passcode (default: 724455 or 2025)
  const defaultPasscodes = ['724455', '2025', 'khojj'];
  const customPasscode = localStorage.getItem('khojj_owner_passcode');

  const handleVerify = (codeToVerify?: string) => {
    const code = (codeToVerify ?? passcode).trim();
    setError('');

    if (!code) {
      setError('Please enter access passcode.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (defaultPasscodes.includes(code) || (customPasscode && code === customPasscode)) {
        onAuthenticateSuccess();
        onClose();
        setPasscode('');
      } else {
        setError('Incorrect passcode. Access denied.');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Security Gate Card */}
      <div
        id="staff-auth-modal"
        className="relative w-full max-w-md bg-[#0e0e12] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden z-10 p-6 sm:p-7 space-y-6"
      >
        {/* Close Button */}
        <button
          id="close-staff-modal"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Security Crest Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#141418] border border-zinc-700 flex items-center justify-center mx-auto text-white shadow-lg shadow-black/50">
            <Lock className="w-5 h-5 text-zinc-200" />
          </div>

          <div className="space-y-0.5">
            <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-bold">
              RESTRICTED ACCESS
            </div>
            <h3 className="font-display font-extrabold text-xl text-white uppercase tracking-tight">
              Owner & Orders Portal
            </h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
              Order fulfillment pipeline, live customer details, and inventory control suite.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Passcode Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
              Owner Passcode Key
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                id="staff-passcode-input"
                type="password"
                placeholder="Enter passcode..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoFocus
                className="w-full bg-[#141418] border border-zinc-800 focus:border-zinc-400 rounded-xl pl-10 pr-3.5 py-3 text-sm font-mono text-white placeholder:text-zinc-600 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-1.5">
              <span>Authorized personnel only</span>
              <span className="font-mono text-zinc-500">Secure Pin Gate</span>
            </div>
          </div>

          {/* Unlock CTA */}
          <button
            id="staff-unlock-button"
            type="submit"
            disabled={isVerifying}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/10 cursor-pointer disabled:opacity-50"
          >
            {isVerifying ? (
              <span>Verifying Passcode...</span>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>Enter Owner Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-2 border-t border-zinc-800 text-[10px] text-zinc-500 text-center font-mono leading-relaxed">
            Hidden Store Owner Gate • Shortcut: <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-300">Alt + A</kbd> or append <span className="text-zinc-400 font-bold">#owner</span> to URL
          </div>
        </form>
      </div>
    </div>
  );
};
