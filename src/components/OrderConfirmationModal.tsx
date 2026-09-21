import React from 'react';
import { CheckCircle2, Truck, ArrowRight, ShieldCheck, Mail, ShoppingBag } from 'lucide-react';
import { Order } from '../types';
import { formatPKR } from '../utils/currency';

interface OrderConfirmationModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onTrackCustomerOrder: (orderId: string) => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  isOpen,
  onClose,
  onTrackCustomerOrder,
}) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div
        id="order-confirmation-dialog"
        className="relative w-full max-w-2xl bg-[#0e0e12] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden z-10 my-auto p-6 sm:p-8"
      >
        {/* Success Icon & Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-semibold">
              Order Confirmed & Logged
            </span>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight uppercase">
              Thank You, {order.customerName.split(' ')[0]}
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              Your order has been registered in the KHOJJ Atelier. Dispatch notification 
              sent to <strong className="text-zinc-200 font-mono">{order.adminEmailRecipient}</strong>.
            </p>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="mt-6 p-4 rounded-xl bg-[#141418] border border-[#27272a] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800 text-xs font-mono">
            <div>
              <span className="text-zinc-500">Order Reference:</span>{' '}
              <strong className="text-white font-bold">{order.id}</strong>
            </div>
            <div>
              <span className="text-zinc-500">Payment:</span>{' '}
              <span className="text-zinc-300">{order.paymentMethod}</span>
            </div>
          </div>

          {/* Purchased Items list */}
          <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-11 bg-black rounded border border-zinc-800 p-0.5 shrink-0 flex items-center justify-center">
                    <img
                      src={item.image}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="truncate">
                    <p className="text-zinc-200 font-semibold truncate">{item.title}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      Size: {item.size} • {item.color} (x{item.quantity})
                    </p>
                  </div>
                </div>
                <span className="font-mono font-bold text-white shrink-0 ml-2">
                  {formatPKR(item.pricePKR * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Delivery destination summary */}
          <div className="pt-3 border-t border-zinc-800 text-xs text-zinc-400 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Truck className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-semibold">Courier Destination:</span>
            </div>
            <p className="text-[11px] text-zinc-300 pl-5 leading-relaxed">
              {order.address}, {order.city}, {order.province} • Contact: {order.phone}
            </p>
          </div>

          {/* Total */}
          <div className="pt-3 border-t border-zinc-800 flex justify-between items-center text-xs">
            <span className="text-zinc-400 uppercase font-semibold">Total Paid / Payable</span>
            <span className="font-mono text-base font-bold text-white">{formatPKR(order.totalPKR)}</span>
          </div>
        </div>

        {/* 4-Step Pipeline Preview */}
        <div className="mt-6 p-3.5 rounded-xl bg-[#121216] border border-[#27272a]">
          <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-2">
            Live Atelier Fulfillment Pipeline
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
            <div className="p-1.5 rounded bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold">
              1. Placed ✅
            </div>
            <div className="p-1.5 rounded bg-zinc-800/60 border border-zinc-700 text-zinc-400">
              2. Packing
            </div>
            <div className="p-1.5 rounded bg-zinc-800/60 border border-zinc-700 text-zinc-400">
              3. Dispatch
            </div>
            <div className="p-1.5 rounded bg-zinc-800/60 border border-zinc-700 text-zinc-400">
              4. Delivered
            </div>
          </div>
        </div>

        {/* Modal Buttons: Customer-friendly CTAs */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            id="track-customer-order-btn"
            onClick={() => {
              onClose();
              onTrackCustomerOrder(order.id);
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-white/10"
          >
            <Truck className="w-4 h-4" />
            <span>Track Order Status</span>
          </button>

          <button
            id="continue-shopping-btn"
            onClick={onClose}
            className="px-5 py-3 rounded-xl bg-[#18181b] hover:bg-zinc-800 border border-[#27272a] text-zinc-300 hover:text-white font-semibold uppercase tracking-wider text-xs transition-colors cursor-pointer"
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};
