import React from 'react';
import { ArrowDown } from 'lucide-react';

interface HeroBannerProps {
  onScrollToCatalog: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onScrollToCatalog,
}) => {
  return (
    <section className="relative border-b border-[#27272a] bg-[#09090b] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 md:py-24 relative z-10">
        <div className="max-w-2xl space-y-6">
          <div className="text-[11px] uppercase tracking-[0.25em] text-zinc-400 font-mono font-medium">
            KHOJJ • THE PREMIUM CLOSET • NEW DROP
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl md:text-6xl tracking-tight text-white uppercase leading-[1.08] break-words">
            THE PREMIUM <br />
            <span className="text-zinc-500 font-extralight italic">STREETWEAR</span> COLLECTION.
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 font-light leading-relaxed max-w-lg">
            Luxury atelier streetwear engineered with 480 GSM loopback cottons and sculptural footwear profiles. Operating across Pakistan in PKR.
          </p>

          <div className="pt-2">
            <button
              id="hero-explore-all"
              onClick={onScrollToCatalog}
              className="px-6 py-3 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs uppercase tracking-widest font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Explore Collection</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
