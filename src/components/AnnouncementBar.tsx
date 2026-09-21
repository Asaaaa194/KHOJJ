import React from 'react';

export const AnnouncementBar: React.FC = () => {
  return (
    <div id="announcement-bar" className="w-full bg-[#121215] border-b border-[#27272a] text-xs text-zinc-400 py-2 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px]">
        <span className="tracking-wider uppercase text-zinc-300 font-medium">
          Complimentary Express Shipping in Pakistan on Orders Above PKR 15,000
        </span>
        <span className="hidden sm:inline font-mono text-zinc-500 uppercase">
          Cash on Delivery & Raast Available
        </span>
      </div>
    </div>
  );
};
