import React from 'react';
import { X, Printer, CheckSquare, Truck } from 'lucide-react';
import { Order } from '../../types';
import { formatPKR } from '../../utils/currency';

interface PackingSlipModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PackingSlipModal: React.FC<PackingSlipModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="fixed inset-0 no-print" onClick={onClose} />

      <div
        id="packing-slip-modal"
        className="relative w-full max-w-3xl bg-white text-zinc-950 rounded-2xl shadow-2xl overflow-hidden z-10 my-auto flex flex-col max-h-[95vh]"
      >
        {/* Modal Toolbar (hidden in actual printout) */}
        <div className="p-4 bg-zinc-900 text-white flex items-center justify-between border-b border-zinc-800 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
              Atelier Packing Slip Manifest
            </span>
            <span className="text-xs font-mono text-zinc-500">[{order.id}]</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Slip Paper */}
        <div className="p-8 sm:p-10 overflow-y-auto font-sans text-xs leading-relaxed space-y-6">
          {/* Header Row */}
          <div className="flex justify-between items-start border-b-2 border-black pb-6">
            <div>
              <h2 className="font-display font-black text-2xl uppercase tracking-wider">
                KHOJJ
              </h2>
              <p className="text-[11px] uppercase tracking-widest text-zinc-600 font-mono font-semibold">
                The Premium Closet • Atelier Dispatch
              </p>
              <p className="text-[10px] text-zinc-500 mt-1">
                Atelier Fulfillment Hub • Lahore / Karachi / Islamabad
              </p>
            </div>

            <div className="text-right">
              <div className="text-lg font-mono font-bold tracking-wider">{order.id}</div>
              <div className="text-[10px] font-mono text-zinc-500">
                DATE: {new Date(order.createdAt).toLocaleDateString('en-PK')}
              </div>
              <div className="inline-block mt-1 px-2 py-0.5 border border-black font-mono font-bold uppercase text-[10px]">
                COURIER: {order.courier || 'TCS Express'}
              </div>
            </div>
          </div>

          {/* Recipient & Shipping Grid */}
          <div className="grid grid-cols-2 gap-6 p-4 border border-zinc-200 bg-zinc-50/50 rounded-lg">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                Ship To Recipient:
              </h4>
              <p className="font-bold text-sm">{order.customerName}</p>
              <p className="text-xs text-zinc-700 mt-0.5">{order.address}</p>
              <p className="text-xs font-semibold text-zinc-900">{order.city}, {order.province}</p>
              <p className="text-xs font-mono mt-1">TEL: {order.phone}</p>
            </div>

            <div className="space-y-2 border-l border-zinc-200 pl-6">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Payment Protocol:
                </h4>
                <p className="font-bold">{order.paymentMethod}</p>
                {order.paymentMethod.includes('COD') ? (
                  <p className="font-mono text-red-600 font-bold text-xs">
                    COLLECT CASH ON DELIVERY: {formatPKR(order.totalPKR)}
                  </p>
                ) : (
                  <p className="font-mono text-emerald-700 font-bold text-xs">
                    PREPAID (DO NOT COLLECT CASH)
                  </p>
                )}
              </div>

              {order.deliveryNotes && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Courier Dispatch Instructions:
                  </h4>
                  <p className="italic text-zinc-700 text-[11px]">{order.deliveryNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Packing Manifest Checklist */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-2 mb-3">
              Fulfillment Verification Checklist
            </h4>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-300 text-[10px] uppercase font-mono text-zinc-600">
                  <th className="py-2 w-10 text-center">Pack</th>
                  <th className="py-2">Item Title / Silhouette</th>
                  <th className="py-2 text-center">Size</th>
                  <th className="py-2 text-center">Color Shade</th>
                  <th className="py-2 text-center">Quantity</th>
                  <th className="py-2 text-right">PKR Price</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-zinc-200">
                    <td className="py-3 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-zinc-400 cursor-pointer"
                        defaultChecked={order.status === 'Delivered' || order.status === 'Shipped'}
                      />
                    </td>
                    <td className="py-3 font-semibold">{item.title}</td>
                    <td className="py-3 text-center font-mono">{item.size}</td>
                    <td className="py-3 text-center text-zinc-600">{item.color}</td>
                    <td className="py-3 text-center font-bold">{item.quantity}</td>
                    <td className="py-3 text-right font-mono font-semibold">
                      {formatPKR(item.pricePKR * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end border-t border-black pt-3">
            <div className="w-64 space-y-1 text-right">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal:</span>
                <span className="font-mono">{formatPKR(order.subtotalPKR)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Shipping:</span>
                <span className="font-mono">
                  {order.shippingFeePKR === 0 ? 'Complimentary' : formatPKR(order.shippingFeePKR)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-zinc-300 pt-1">
                <span>Total Amount:</span>
                <span className="font-mono">{formatPKR(order.totalPKR)}</span>
              </div>
            </div>
          </div>

          {/* Signatures & Quality seal */}
          <div className="pt-8 border-t border-zinc-300 grid grid-cols-2 gap-8 text-[11px] text-zinc-600">
            <div>
              <div className="border-b border-zinc-400 pb-8 mb-1"></div>
              <p className="font-mono uppercase text-[10px]">Atelier Quality Inspector Signature</p>
            </div>
            <div>
              <div className="border-b border-zinc-400 pb-8 mb-1"></div>
              <p className="font-mono uppercase text-[10px]">Courier Handover Officer / Timestamp</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
