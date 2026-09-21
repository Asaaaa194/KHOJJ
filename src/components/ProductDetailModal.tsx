import React, { useState } from 'react';
import { X, ShoppingBag, Check, ShieldCheck, Truck, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { formatPKR } from '../utils/currency';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, color: string, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  if (!isOpen || !product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const images = product.images.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=85'
  ];

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleAdd = () => {
    if (product.stock <= 0) return;
    onAddToCart(product, selectedSize, selectedColor, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 900);
  };

  const discount = product.compareAtPricePKR
    ? Math.round(((product.compareAtPricePKR - product.pricePKR) / product.compareAtPricePKR) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Window */}
      <div
        id="product-details-modal"
        className="relative w-full max-w-5xl bg-[#0e0e12] border border-[#27272a] rounded-2xl shadow-2xl overflow-y-auto md:overflow-hidden z-10 my-auto flex flex-col md:flex-row max-h-[92vh]"
      >
        {/* Close Button */}
        <button
          id="close-product-modal"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-zinc-900/80 border border-zinc-700 hover:border-zinc-400 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Side: Uncropped Multi-Photo Gallery with Thumbnails & Image Counter */}
        <div className="w-full md:w-1/2 bg-[#141418] p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#27272a]">
          {/* Main Stage: Strict object-contain so NO piece is ever cropped */}
          <div className="relative w-full aspect-[4/5] bg-[#0c0c0e] rounded-xl border border-[#27272a]/50 p-4 sm:p-6 flex items-center justify-center overflow-hidden">
            <img
              src={images[activeImageIndex]}
              alt={`${product.title} perspective ${activeImageIndex + 1}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain transition-all duration-300"
            />

            {/* Coming Soon Stage Badge */}
            {product.isComingSoon && (
              <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-950 font-mono text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 shadow-xl shadow-black/80">
                <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
                <span>Atelier Drop • Coming Soon</span>
              </div>
            )}

            {/* Image Counter Badge */}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-sm border border-zinc-700/60 text-[11px] font-mono text-zinc-300 font-medium">
              {activeImageIndex + 1} / {images.length}
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 hover:bg-black border border-zinc-700 text-zinc-200 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Previous image"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 hover:bg-black border border-zinc-700 text-zinc-200 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Next image"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-16 h-18 rounded-lg overflow-hidden border p-1 bg-[#0c0c0e] transition-all shrink-0 cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-white ring-2 ring-white/20'
                      : 'border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-600'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details & Purchase Form */}
        <div className="w-full md:w-1/2 p-5 sm:p-8 flex flex-col justify-between md:overflow-y-auto md:max-h-[90vh]">
          <div className="space-y-6">
            {/* Header / Badges */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {product.category}
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  SKU: {product.sku}
                </span>
              </div>

              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                {product.title}
              </h2>

              {/* Pricing in PKR */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="font-mono font-extrabold text-2xl text-white">
                  {formatPKR(product.pricePKR)}
                </span>
                {product.compareAtPricePKR && (
                  <span className="font-mono text-sm text-zinc-500 line-through">
                    {formatPKR(product.compareAtPricePKR)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-950/80 border border-rose-800 text-rose-300">
                    SAVE {discount}%
                  </span>
                )}
              </div>
            </div>

            {/* Color Swatches */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-zinc-400 uppercase tracking-wider text-[11px]">
                  Color Shade: <strong className="text-white ml-1">{selectedColor}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColor(c.name)}
                    className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                      selectedColor === c.name
                        ? 'border-white bg-zinc-800/80 text-white'
                        : 'border-zinc-800 bg-[#121214] text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/30"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-zinc-400 uppercase tracking-wider text-[11px]">
                  Select {product.category === 'Shoes' ? 'Footwear Size' : 'Garment Size'}:
                </span>
                <span className="text-[11px] font-mono text-zinc-500">Standard Atelier Sizing</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`min-w-[44px] h-10 px-3 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center justify-center cursor-pointer ${
                      selectedSize === s
                        ? 'bg-white text-zinc-950 border-white shadow-md'
                        : 'bg-[#141418] border border-zinc-800 text-zinc-300 hover:border-zinc-500 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector & Stock Indicator */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-wider text-zinc-400 font-medium text-[11px]">
                  Qty:
                </span>
                <div className="flex items-center bg-[#141418] border border-zinc-800 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-mono font-bold text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Stock status */}
              <div>
                {product.stock <= 0 ? (
                  <span className="text-xs font-mono text-red-400 font-semibold">Out of Stock</span>
                ) : product.stock <= 5 ? (
                  <span className="text-xs font-mono text-amber-400 font-semibold flex items-center gap-1.5">
                    Only {product.stock} pieces remaining
                  </span>
                ) : (
                  <span className="text-xs font-mono text-emerald-400">
                    In Stock ({product.stock} available)
                  </span>
                )}
              </div>
            </div>

            {/* Description & Fabric Specs */}
            <div className="pt-4 border-t border-[#27272a] space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Atelier Narrative
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                {product.description}
              </p>

              {product.fabricSpecs.length > 0 && (
                <div className="pt-2">
                  <h5 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Material & Construction Specs
                  </h5>
                  <ul className="space-y-1">
                    {product.fabricSpecs.map((spec, i) => (
                      <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                        <span className="text-zinc-600 font-mono">—</span>
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Courier & Guarantee info */}
            <div className="p-3.5 rounded-xl bg-[#121216] border border-[#27272a] space-y-2 text-[11px] text-zinc-400">
              <div className="flex items-center gap-2 text-zinc-300">
                <Truck className="w-3.5 h-3.5 text-zinc-400" />
                <span>Express Dispatch across Pakistan (TCS / Leopards 24-48 hrs)</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                <span>Authentic Atelier Guarantee & 7-Day Size Exchange</span>
              </div>
            </div>

            {/* Coming Soon Notice Banner */}
            {product.isComingSoon && (
              <div className="p-4 rounded-xl bg-[#1e1710] border border-amber-600/60 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-amber-300 font-mono uppercase tracking-wider">
                    Coming Soon • Pre-Release Atelier Piece
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    This piece is currently scheduled for our upcoming drop in Pakistan. Pre-launch preview only.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Add to Bag CTA Button / Coming Soon CTA */}
          <div className="pt-6 border-t border-[#27272a] mt-6">
            {product.isComingSoon ? (
              <button
                id="modal-add-to-bag-button"
                type="button"
                disabled
                className="w-full py-4 px-6 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 bg-[#1c160f] border border-amber-600/70 text-amber-300 cursor-not-allowed shadow-xl"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Coming Soon — Drop Imminent</span>
              </button>
            ) : (
              <button
                id="modal-add-to-bag-button"
                type="button"
                disabled={product.stock <= 0}
                onClick={handleAdd}
                className={`w-full py-3.5 px-6 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer ${
                  product.stock <= 0
                    ? 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                    : isAdded
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                    : 'bg-white hover:bg-zinc-200 text-zinc-950 shadow-white/10 hover:shadow-white/20'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Atelier Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag • {formatPKR(product.pricePKR * quantity)}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
