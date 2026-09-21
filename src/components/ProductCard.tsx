import React, { useState } from 'react';
import { ShoppingBag, Eye, Check, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { formatPKR } from '../utils/currency';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onQuickAdd: (product: Product, size: string, color: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onQuickAdd,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || 'Standard');
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Use secondary image on hover if available
  const displayImage =
    isHovered && product.images.length > 1 ? product.images[1] : product.images[0];

  const defaultSize = product.sizes[0] || (product.category === 'Shoes' ? 'US 9' : 'M');

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    onQuickAdd(product, defaultSize, selectedColor);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1400);
  };

  const discountPercent = product.compareAtPricePKR
    ? Math.round(((product.compareAtPricePKR - product.pricePKR) / product.compareAtPricePKR) * 100)
    : 0;

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onViewDetails(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer ${
        product.isComingSoon
          ? 'bg-[#0e0d0a] border-2 border-amber-500/50 hover:border-amber-400 shadow-xl shadow-amber-950/30'
          : 'bg-[#0e0e11] border border-[#27272a] hover:border-zinc-500 shadow-md hover:shadow-xl hover:shadow-black/50'
      }`}
    >
      {/* Product Image Frame: MUST BE object-contain with aspect-[4/5] so shoes, hoodies, shirts are NEVER cut off or cropped */}
      <div className="relative w-full aspect-[4/5] bg-[#141418] flex items-center justify-center p-4 sm:p-6 overflow-hidden border-b border-[#27272a]/60">
        <img
          src={displayImage}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Full-Cover Luxury "Coming Soon" Overlay across the entire item image */}
        {product.isComingSoon ? (
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/95 via-black/70 to-black/60 backdrop-blur-[2px] flex flex-col items-center justify-between p-5 text-center transition-all duration-300 group-hover:bg-black/60 group-hover:backdrop-blur-none">
            {/* Top Atelier Badge */}
            <div className="w-full flex items-center justify-between">
              <span className="px-3 py-1 rounded-md text-[10px] uppercase font-mono tracking-widest font-bold bg-amber-400 text-zinc-950 shadow-md">
                COMING SOON
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider font-semibold bg-black/80 text-amber-300 border border-amber-600/40">
                {product.category}
              </span>
            </div>

            {/* Central Atelier Drop Plaque */}
            <div className="w-full max-w-[260px] p-5 rounded-2xl bg-[#0e0d0b]/95 border border-amber-500/60 shadow-2xl shadow-black flex flex-col items-center gap-2 transform group-hover:scale-105 transition-transform duration-300">
              <div className="text-[10px] font-mono tracking-[0.25em] text-amber-400 uppercase font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Atelier Pre-Release</span>
              </div>
              <h4 className="font-display font-black text-lg sm:text-xl tracking-wider text-white uppercase leading-tight">
                Coming Soon
              </h4>
              <p className="text-xs text-zinc-300 font-light leading-relaxed">
                Exclusive atelier cut currently in pre-launch preview.
              </p>
              <div className="mt-2 w-full pt-2.5 border-t border-amber-500/30 flex items-center justify-center gap-2 text-xs font-mono text-amber-300 font-semibold tracking-wider">
                <Eye className="w-3.5 h-3.5" />
                <span>Click to Inspect Piece</span>
              </div>
            </div>

            {/* Bottom Note */}
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
              Official Drop Imminent
            </div>
          </div>
        ) : (
          <>
            {/* Standard Top Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider font-semibold bg-black/80 backdrop-blur-md text-zinc-300 border border-zinc-700/60">
                {product.category}
              </span>
              {product.isNewArrival && (
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider font-semibold bg-white text-zinc-950 shadow-sm">
                  NEW RELEASE
                </span>
              )}
            </div>

            {/* Discount Badge */}
            {discountPercent > 0 && (
              <div className="absolute top-3 right-3 z-10">
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold tracking-wider bg-rose-950/80 border border-rose-800/80 text-rose-300">
                  -{discountPercent}%
                </span>
              </div>
            )}

            {/* Stock Status Indicator without round pulse dot */}
            <div className="absolute bottom-3 left-3 z-10">
              {product.stock <= 0 ? (
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-semibold bg-red-950/90 border border-red-800 text-red-300">
                  Sold Out
                </span>
              ) : product.stock <= 5 ? (
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-semibold bg-amber-950/90 border border-amber-800 text-amber-300 flex items-center gap-1.5">
                  Only {product.stock} Left
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-medium bg-black/70 border border-zinc-800 text-zinc-400">
                  In Stock ({product.stock})
                </span>
              )}
            </div>

            {/* Quick View Overlay Button on hover */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
              <div className="px-4 py-2 rounded-lg bg-black/80 backdrop-blur-md border border-zinc-700 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect Piece</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        {/* Colors and SKU */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {product.colors.map((c) => (
              <button
                key={c.name}
                type="button"
                title={c.name}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedColor(c.name);
                }}
                className={`w-4 h-2.5 rounded-sm border transition-all ${
                  selectedColor === c.name
                    ? 'border-white ring-1 ring-white/60 scale-105 shadow-sm'
                    : 'border-zinc-700 hover:border-zinc-400'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
            <span className="text-[10px] text-zinc-500 font-mono ml-1 truncate max-w-[100px]">
              {selectedColor}
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">{product.sku}</span>
        </div>

        {/* Title */}
        <div>
          <h3 className="font-display font-bold text-sm sm:text-base text-zinc-100 group-hover:text-white transition-colors line-clamp-1">
            {product.title}
          </h3>
          <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1 font-light">
            {product.fabricSpecs[0] || product.description}
          </p>
        </div>

        {/* Price Row & Quick Actions */}
        <div className="pt-2 border-t border-[#27272a]/60 flex items-center justify-between gap-2 mt-auto">
          {product.isComingSoon ? (
            <>
              <div>
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
                  Expected Launch
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono font-bold text-sm sm:text-base text-white">
                    {formatPKR(product.pricePKR)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                id={`quick-add-${product.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(product);
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-zinc-950 shadow-md shadow-amber-950/40 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 font-mono"
                title="Preview Piece (Coming Soon)"
              >
                <Eye className="w-3.5 h-3.5 text-zinc-950" />
                <span>Preview Piece</span>
              </button>
            </>
          ) : (
            <>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono font-bold text-sm sm:text-base text-white">
                    {formatPKR(product.pricePKR)}
                  </span>
                  {product.compareAtPricePKR && (
                    <span className="font-mono text-xs text-zinc-500 line-through">
                      {formatPKR(product.compareAtPricePKR)}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  Size: {defaultSize}
                </div>
              </div>

              <button
                type="button"
                id={`quick-add-${product.id}`}
                disabled={product.stock <= 0}
                onClick={handleQuickAddClick}
                className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  product.stock <= 0
                    ? 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                    : addedAnimation
                    ? 'bg-emerald-500 text-white border border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-[#18181b] hover:bg-white text-zinc-200 hover:text-zinc-950 border border-[#27272a] hover:border-white shadow-sm'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
