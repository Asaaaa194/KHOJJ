import React from 'react';

interface KhojjLogoProps {
  className?: string;
  variant?: 'full' | 'mark' | 'badge';
  light?: boolean;
}

export const KhojjLogo: React.FC<KhojjLogoProps> = ({
  className = 'h-8 w-auto',
  variant = 'full',
}) => {
  if (variant === 'badge') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18110b] border border-[#3d2719] text-amber-200/90 text-[10px] font-mono tracking-wider uppercase">
        <span className="font-semibold text-amber-400">ATELIER</span>
        <span>KHOJJ / The Premium Closet</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-start justify-center ${className} select-none`}>
      <div className="flex flex-col leading-none">
        <span className="font-display font-black text-xl sm:text-2xl tracking-[0.22em] text-white uppercase">
          KHOJJ
        </span>
        {variant === 'full' && (
          <span className="text-[8.5px] font-mono tracking-[0.26em] text-zinc-400 uppercase mt-0.5 font-medium">
            The Premium Closet
          </span>
        )}
      </div>
    </div>
  );
};
