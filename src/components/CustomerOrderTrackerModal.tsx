import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { formatPKR } from '../utils/currency';

interface CustomerOrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  initialOrderId?: string;
}

export const CustomerOrderTrackerModal: React.FC<CustomerOrderTrackerModalProps> = ({
  isOpen,
  onClose,
  orders,
  initialOrderId,
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState(initialOrderId || '');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);

  // Initialize with initialOrderId if present
  useEffect(() => {
    if (initialOrderId) {
      setSearchQuery(initialOrderId);
      const match = orders.find(
        (o) => o.id.toLowerCase() === initialOrderId.toLowerCase()
      );
      if (match) {
        setSelectedOrder(match);
      }
    } else if (orders.length > 0 && !selectedOrder) {
      // Default to most recent order if available
      setSelectedOrder(orders[0]);
      setSearchQuery(orders[0].id);
    }
  }, [initialOrderId, orders]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchAttempted(true);

    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setSelectedOrder(null);
      return;
    }

    const match = orders.find(
      (o) =>
        o.id.toLowerCase().includes(query) ||
        o.phone.replace(/[^0-9]/g, '').includes(query.replace(/[^0-9]/g, ''))
    );

    setSelectedOrder(match || null);
  };

  const handleCopyTracking = (num: string) => {
    navigator.clipboard?.writeText(num);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const PIPELINE_STAGES: { status: OrderStatus; label: string; desc: string }[] = [
    {
      status: 'Pending',
      label: 'Order Placed',
      desc: 'Order verified and recorded at Atelier hub',
    },
    {
      status: 'Processing',
      label: 'Quality Check & Packing',
      desc: 'Garment steamed, inspected, and sealed in dust bag',
    },
    {
      status: 'Shipped',
      label: 'Handed to Courier',
      desc: 'In transit via TCS / Leopards domestic express',
    },
    {
      status: 'Delivered',
      label: 'Delivered',
      desc: 'Package delivered & signed by recipient',
    },
  ];

  const getStageIndex = (status: OrderStatus) => {
    return PIPELINE_STAGES.findIndex((s) => s.status === status);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div
        id="customer-tracking-modal"
        className="relative w-full max-w-2xl bg-[#0e0e12] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden z-10 my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#27272a] bg-[#121215] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-white" />
              <h3 className="font-display font-bold text-lg sm:text-xl text-white uppercase tracking-wider">
                Track Your Atelier Parcel
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Live status tracking for domestic TCS and Leopards shipments across Pakistan.
            </p>
          </div>

          <button
            id="close-tracking-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-500 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close tracking"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 sm:p-5 bg-[#141418] border-b border-[#27272a]">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                id="tracking-search-input"
                type="text"
                placeholder="Enter Order Reference (e.g. KHJ-8921) or mobile number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0a0a0d] border border-zinc-800 focus:border-zinc-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none"
              />
            </div>
            <button
              id="submit-tracking-search"
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold uppercase tracking-wider text-xs transition-colors shrink-0 cursor-pointer"
            >
              Track
            </button>
          </form>

          {/* Quick Select Recent Orders if any */}
          {orders.length > 0 && (
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 text-[11px] font-mono">
              <span className="text-zinc-500 shrink-0">Recent:</span>
              {orders.slice(0, 3).map((ord) => (
                <button
                  key={ord.id}
                  type="button"
                  onClick={() => {
                    setSearchQuery(ord.id);
                    setSelectedOrder(ord);
                  }}
                  className={`px-2.5 py-1 rounded-lg border transition-all shrink-0 cursor-pointer ${
                    selectedOrder?.id === ord.id
                      ? 'bg-zinc-800 border-white text-white font-bold'
                      : 'bg-[#0a0a0d] border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {ord.id} ({ord.customerName.split(' ')[0]})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Body: Active Order Tracker */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {!selectedOrder ? (
            <div className="py-12 text-center text-zinc-500 space-y-3">
              <Package className="w-10 h-10 mx-auto text-zinc-600" />
              <p className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
                {searchAttempted
                  ? 'No Order Found Matching That Reference'
                  : 'Enter Your Order Reference to View Tracking'}
              </p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Check the Order ID in your order confirmation, or enter the Pakistani mobile number used during checkout.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Order Reference Top Banner */}
              <div className="p-4 rounded-xl bg-[#141418] border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-400">Order ID:</span>
                    <strong className="text-base font-mono text-white">{selectedOrder.id}</strong>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        selectedOrder.status === 'Delivered'
                          ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-800'
                          : selectedOrder.status === 'Shipped'
                          ? 'bg-blue-950/90 text-blue-300 border border-blue-800'
                          : 'bg-amber-950/90 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {selectedOrder.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Booked on {new Date(selectedOrder.createdAt).toLocaleDateString('en-PK', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}{' '}
                    • {selectedOrder.paymentMethod}
                  </p>
                </div>

                {/* Courier / Tracking Number Pill */}
                {selectedOrder.courier && selectedOrder.trackingNumber && (
                  <div className="p-2.5 rounded-lg bg-[#0a0a0d] border border-zinc-700/80 text-right">
                    <div className="text-[10px] uppercase font-mono text-zinc-400">
                      Courier: <strong className="text-zinc-200">{selectedOrder.courier}</strong>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        {selectedOrder.trackingNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyTracking(selectedOrder.trackingNumber || '')}
                        className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        title="Copy Tracking Number"
                      >
                        {copiedTracking ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 4-Step Graphical Visual Timeline */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#121216] border border-[#27272a] space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Fulfillment Journey
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
                  {PIPELINE_STAGES.map((stage, idx) => {
                    const currentIdx = getStageIndex(selectedOrder.status);
                    const isDone = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={stage.status} className="relative group">
                        {/* Dot indicator */}
                        <div
                          className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                            isCurrent
                              ? 'bg-white text-zinc-950 ring-4 ring-white/20'
                              : isDone
                              ? 'bg-emerald-500 text-white'
                              : 'bg-zinc-900 border border-zinc-700 text-zinc-600'
                          }`}
                        >
                          {isDone ? (
                            <Check className="w-3 h-3 stroke-[3]" />
                          ) : (
                            <span className="text-[9px] font-mono">{idx + 1}</span>
                          )}
                        </div>

                        {/* Text */}
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-bold font-display uppercase tracking-wider ${
                                isCurrent
                                  ? 'text-white'
                                  : isDone
                                  ? 'text-zinc-200'
                                  : 'text-zinc-500'
                              }`}
                            >
                              {stage.label}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 animate-pulse">
                                CURRENT STATUS
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 font-light">
                            {stage.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Destination Address & Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Delivery Address */}
                <div className="p-4 rounded-xl bg-[#141418] border border-zinc-800/80 space-y-2">
                  <div className="flex items-center gap-2 text-zinc-300 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Delivery Address</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 font-light leading-relaxed">
                    {selectedOrder.customerName}
                    <br />
                    {selectedOrder.address}
                    <br />
                    {selectedOrder.city}, {selectedOrder.province}
                    <br />
                    <span className="font-mono text-zinc-400">Phone: {selectedOrder.phone}</span>
                  </p>
                </div>

                {/* Total & Packaging */}
                <div className="p-4 rounded-xl bg-[#141418] border border-zinc-800/80 space-y-2">
                  <div className="flex items-center gap-2 text-zinc-300 font-semibold">
                    <Package className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Parcel Value</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-zinc-400 text-[11px]">
                      <span>Items Total:</span>
                      <span className="font-mono text-zinc-200">{formatPKR(selectedOrder.subtotalPKR)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400 text-[11px]">
                      <span>Shipping Fee:</span>
                      <span className="font-mono text-zinc-200">
                        {selectedOrder.shippingFeePKR === 0 ? 'Free' : formatPKR(selectedOrder.shippingFeePKR)}
                      </span>
                    </div>
                    <div className="pt-1 border-t border-zinc-800 flex justify-between font-bold text-white text-xs">
                      <span>Total Payable:</span>
                      <span className="font-mono">{formatPKR(selectedOrder.totalPKR)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items in this shipment */}
              <div className="space-y-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Silhouettes in this Shipment ({selectedOrder.items.length})
                </span>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-[#141418] border border-zinc-800/80 text-xs"
                    >
                      <div className="w-12 h-14 bg-black rounded-lg border border-zinc-700 p-0.5 shrink-0 flex items-center justify-center">
                        <img
                          src={item.image}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-zinc-200 truncate">{item.title}</h5>
                        <p className="text-[10px] text-zinc-400 font-mono">
                          Size: {item.size} • Shade: {item.color} • Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-white shrink-0">
                        {formatPKR(item.pricePKR * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Need help concierge banner */}
              <div className="p-3.5 rounded-xl bg-[#18181f] border border-zinc-800 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <p className="font-semibold text-zinc-200">Need immediate dispatch assistance?</p>
                  <p className="text-[11px] text-zinc-400">Our concierge is available on WhatsApp daily (10am–10pm PKT).</p>
                </div>
                <a
                  href={`https://wa.me/923008429182?text=Hello%20KHOJJ%20The%20Premium%20Closet,%20inquiring%20about%20Order%20${selectedOrder.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
