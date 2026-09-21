import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, ShieldCheck } from 'lucide-react';
import { CartItem } from '../types';
import {
  formatPKR,
  calculateDeliveryFee,
  getRemainingForFreeDelivery,
  FREE_DELIVERY_THRESHOLD,
} from '../utils/currency';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.pricePKR * item.quantity, 0);
  const deliveryFee = calculateDeliveryFee(subtotal);
  const remainingForFree = getRemainingForFreeDelivery(subtotal);
  const total = subtotal + deliveryFee;
  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Slide-out Drawer Panel */}
      <div
        id="cart-drawer-panel"
        className="relative w-full max-w-md bg-[#0e0e12] border-l border-[#27272a] h-full flex flex-col justify-between z-10 shadow-2xl overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#27272a] flex items-center justify-between bg-[#121215]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-zinc-300" />
            <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">
              Shopping Bag
            </h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-zinc-800 text-zinc-300">
              {items.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          </div>

          <button
            id="close-cart-drawer"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-500 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free Delivery Threshold Progress Bar */}
        <div className="px-5 py-3.5 bg-[#141418] border-b border-[#27272a]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Truck className="w-3.5 h-3.5 text-zinc-400" />
              {remainingForFree === 0 ? (
                <span className="text-emerald-400 font-semibold text-[11px]">
                  Complimentary Nationwide Shipping Unlocked!
                </span>
              ) : (
                <span className="text-[11px] text-zinc-300">
                  Add <strong className="text-white font-mono">{formatPKR(remainingForFree)}</strong> for Free Delivery
                </span>
              )}
            </div>
            <span className="text-[10px] font-mono text-zinc-500">{freeDeliveryProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                remainingForFree === 0 ? 'bg-emerald-500' : 'bg-gradient-to-r from-zinc-400 to-white'
              }`}
              style={{ width: `${freeDeliveryProgress}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-zinc-500">
              <div className="w-16 h-16 rounded-2xl bg-[#141418] border border-zinc-800 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-zinc-600" />
              </div>
              <div>
                <p className="text-sm text-zinc-300 font-medium uppercase tracking-wider">
                  Your Atelier Bag is Empty
                </p>
                <p className="text-xs text-zinc-500 mt-1 max-w-[240px]">
                  Explore our heavy loopback hoodies, raw overshirts, and sculptural shoes.
                </p>
              </div>
              <button
                id="cart-empty-explore-btn"
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold uppercase tracking-wider text-white transition-colors cursor-pointer"
              >
                Browse Collection
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.cartItemId}
                className="flex gap-3.5 p-3 rounded-xl bg-[#121216] border border-[#27272a] relative group"
              >
                {/* Product thumbnail: object-contain with aspect-[4/5] so piece is uncropped */}
                <div className="w-20 h-24 bg-[#0a0a0d] rounded-lg border border-zinc-800 p-1 flex items-center justify-center shrink-0">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-zinc-100 truncate font-display">
                        {item.product.title}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.cartItemId)}
                        className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Size and Color badges */}
                    <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-zinc-400">
                      <span className="px-1.5 py-0.2 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">
                        Size: {item.size}
                      </span>
                      <span className="text-zinc-500">•</span>
                      <span className="truncate">{item.color}</span>
                    </div>
                  </div>

                  {/* Quantity and Price */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center bg-[#0a0a0d] border border-zinc-800 rounded-md">
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-mono font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-30"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-mono text-xs font-bold text-white">
                      {formatPKR(item.product.pricePKR * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer & Checkout CTA */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[#27272a] bg-[#121215] space-y-3">
            {/* Cost Breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Items Subtotal</span>
                <span className="font-mono text-zinc-200">{formatPKR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Domestic Delivery (Pakistan)</span>
                <span className="font-mono text-zinc-200">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-400 uppercase font-semibold text-[11px]">
                      Complimentary
                    </span>
                  ) : (
                    formatPKR(deliveryFee)
                  )}
                </span>
              </div>
              <div className="pt-2 border-t border-zinc-800 flex justify-between text-sm font-bold text-white">
                <span className="uppercase tracking-wider font-display">Total Amount</span>
                <span className="font-mono text-base">{formatPKR(total)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              id="drawer-checkout-button"
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3.5 px-5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/10 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 text-center font-mono">
              <ShieldCheck className="w-3 h-3 text-zinc-400" />
              <span>CASH ON DELIVERY (COD) & RAAST INSTANT VERIFIED</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
