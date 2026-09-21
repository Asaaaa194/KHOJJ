import React, { useState } from 'react';
import { X, ShieldCheck, Truck, CreditCard, Banknote, Building2, Check, Copy } from 'lucide-react';
import { CartItem, Order, OrderItem } from '../types';
import {
  formatPKR,
  calculateDeliveryFee,
  generateOrderId,
} from '../utils/currency';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderPlaced: (order: Order) => void;
}

const PAKISTAN_PROVINCES = [
  'Punjab',
  'Sindh',
  'Islamabad Capital Territory',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Gilgit-Baltistan',
  'Azad Jammu & Kashmir',
];

const POPULAR_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Peshawar',
  'Multan',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Abbottabad',
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onOrderPlaced,
}) => {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.pricePKR * item.quantity, 0);
  const shippingFee = calculateDeliveryFee(subtotal);
  const total = subtotal + shippingFee;

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Lahore');
  const [customCity, setCustomCity] = useState('');
  const [province, setProvince] = useState('Punjab');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('Cash on Delivery (COD)');
  const [raastCopied, setRaastCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick auto-format phone: 03XX-XXXXXXX
  const handlePhoneChange = (val: string) => {
    // Keep numbers and dashes
    const cleaned = val.replace(/[^0-9]/g, '');
    if (cleaned.length <= 11) {
      if (cleaned.length > 4) {
        setPhone(`${cleaned.slice(0, 4)}-${cleaned.slice(4)}`);
      } else {
        setPhone(cleaned);
      }
    }
  };

  const handleCopyRaast = () => {
    navigator.clipboard?.writeText('03008429182');
    setRaastCopied(true);
    setTimeout(() => setRaastCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please provide a valid Pakistani contact / WhatsApp number (e.g. 0300-1234567).');
      return;
    }

    if (!address.trim()) {
      setErrorMsg('Please provide your complete delivery street address.');
      return;
    }

    const finalCity = city === 'Other' ? customCity.trim() : city;
    if (!finalCity) {
      setErrorMsg('Please specify your city.');
      return;
    }

    setIsSubmitting(true);

    const orderItems: OrderItem[] = cartItems.map((item) => ({
      productId: item.productId,
      title: item.product.title,
      image: item.product.images[0],
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      pricePKR: item.product.pricePKR,
      category: item.product.category,
    }));

    const newOrder: Order = {
      id: generateOrderId(),
      createdAt: new Date().toISOString(),
      customerName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: finalCity,
      province,
      deliveryNotes: deliveryNotes.trim() || undefined,
      paymentMethod,
      items: orderItems,
      subtotalPKR: subtotal,
      shippingFeePKR: shippingFee,
      totalPKR: total,
      status: 'Pending',
      statusHistory: [
        {
          status: 'Pending',
          timestamp: new Date().toISOString(),
          note: `Order placed via Atelier Storefront. Payment: ${paymentMethod}`,
        },
      ],
      adminEmailRecipient: localStorage.getItem('khojj_owner_email') || 'musemusical61@gmail.com',
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onOrderPlaced(newOrder);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div
        id="checkout-modal-container"
        className="relative w-full max-w-4xl bg-[#0e0e12] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden z-10 my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#27272a] bg-[#121215] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-xl text-white uppercase tracking-wider">
                Atelier Express Checkout
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                PAKISTAN DISPATCH
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Strictly operating in Pakistani Rupee (PKR). Dispatched via TCS / Leopards Courier.
            </p>
          </div>

          <button
            id="close-checkout-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-500 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close checkout"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <span className="font-bold">•</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Shipping & Pakistani Details Form */}
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-zinc-400" />
                  <span>1. Delivery Destination (Pakistan)</span>
                </h4>

                {/* Customer Full Name */}
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
                    Customer Full Name *
                  </label>
                  <input
                    id="checkout-fullname-input"
                    type="text"
                    required
                    placeholder="e.g. Hamza Tariq / Ayesha Malik"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#141418] border border-zinc-800 focus:border-zinc-400 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none"
                  />
                </div>

                {/* Mobile / WhatsApp Number */}
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
                    Mobile / WhatsApp Number (Pakistan) *
                  </label>
                  <input
                    id="checkout-phone-input"
                    type="tel"
                    required
                    placeholder="03XX-XXXXXXX"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="w-full bg-[#141418] border border-zinc-800 focus:border-zinc-400 rounded-lg px-3.5 py-2.5 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Courier rider will call / WhatsApp for gate access & parcel handover.
                  </span>
                </div>

                {/* Full Delivery Address */}
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
                    Full Delivery Street Address *
                  </label>
                  <textarea
                    id="checkout-address-input"
                    required
                    rows={2}
                    placeholder="House/Plot number, Street/Sector, Phase, Block, Landmark..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#141418] border border-zinc-800 focus:border-zinc-400 rounded-lg px-3.5 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none resize-none"
                  />
                </div>

                {/* City & Province */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
                      City *
                    </label>
                    <select
                      id="checkout-city-select"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-[#141418] border border-zinc-800 focus:border-zinc-400 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none cursor-pointer"
                    >
                      {POPULAR_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="Other">Other City...</option>
                    </select>

                    {city === 'Other' && (
                      <input
                        type="text"
                        placeholder="Type city name..."
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        className="mt-2 w-full bg-[#141418] border border-zinc-800 focus:border-zinc-400 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
                      Province / Region *
                    </label>
                    <select
                      id="checkout-province-select"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full bg-[#141418] border border-zinc-800 focus:border-zinc-400 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none cursor-pointer"
                    >
                      {PAKISTAN_PROVINCES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Courier Notes */}
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
                    Courier Delivery Notes (Optional)
                  </label>
                  <input
                    id="checkout-notes-input"
                    type="text"
                    placeholder="e.g. Ring bell twice, deliver after 2pm, leave with security"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    className="w-full bg-[#141418] border border-zinc-800 focus:border-zinc-400 rounded-lg px-3.5 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="pt-4 border-t border-[#27272a] space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <Banknote className="w-3.5 h-3.5 text-zinc-400" />
                  <span>2. Payment Method</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* COD */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cash on Delivery (COD)')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      paymentMethod === 'Cash on Delivery (COD)'
                        ? 'border-white bg-zinc-800/90 text-white'
                        : 'border-zinc-800 bg-[#141418] text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <Banknote className="w-4 h-4" />
                      {paymentMethod === 'Cash on Delivery (COD)' && (
                        <Check className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                    <span className="text-xs font-bold font-display">Cash on Delivery</span>
                    <span className="text-[10px] text-zinc-400 font-mono mt-0.5">Pay rider in PKR</span>
                  </button>

                  {/* Raast / Bank */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Online Bank Transfer / Raast')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      paymentMethod === 'Online Bank Transfer / Raast'
                        ? 'border-white bg-zinc-800/90 text-white'
                        : 'border-zinc-800 bg-[#141418] text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <Building2 className="w-4 h-4" />
                      {paymentMethod === 'Online Bank Transfer / Raast' && (
                        <Check className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                    <span className="text-xs font-bold font-display">Raast / Bank</span>
                    <span className="text-[10px] text-zinc-400 font-mono mt-0.5">Instant Transfer</span>
                  </button>

                  {/* Card */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Debit / Credit Card')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      paymentMethod === 'Debit / Credit Card'
                        ? 'border-white bg-zinc-800/90 text-white'
                        : 'border-zinc-800 bg-[#141418] text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <CreditCard className="w-4 h-4" />
                      {paymentMethod === 'Debit / Credit Card' && (
                        <Check className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                    <span className="text-xs font-bold font-display">Debit / Card</span>
                    <span className="text-[10px] text-zinc-400 font-mono mt-0.5">Visa / Mastercard</span>
                  </button>
                </div>

                {/* Raast Details Box */}
                {paymentMethod === 'Online Bank Transfer / Raast' && (
                  <div className="p-3.5 rounded-xl bg-[#18181f] border border-zinc-700 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300 font-semibold font-mono">
                        RAAST ID / PHONE: 0300-8429182
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyRaast}
                        className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                      >
                        {raastCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{raastCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Bank: Meezan Bank Ltd • Title: <strong>KHOJJ (The Premium Closet)</strong> • Account: 0102-0104829102
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Order Summary & Item Review */}
            <div className="lg:col-span-5 bg-[#121216] border border-[#27272a] rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-3">
                  Atelier Bag Summary ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                </h4>

                {/* Items preview list */}
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="flex items-center gap-3 p-2 rounded-lg bg-[#0e0e11] border border-zinc-800/80"
                    >
                      {/* uncropped thumbnail */}
                      <div className="w-12 h-14 bg-[#141418] rounded border border-zinc-800 p-0.5 shrink-0 flex items-center justify-center">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-zinc-200 truncate">{item.product.title}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">
                          Size: {item.size} • {item.color} • Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-white shrink-0">
                        {formatPKR(item.product.pricePKR * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Cost Breakdown */}
                <div className="pt-4 border-t border-zinc-800 space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span className="font-mono text-zinc-200">{formatPKR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Domestic Shipping</span>
                    <span className="font-mono text-zinc-200">
                      {shippingFee === 0 ? (
                        <span className="text-emerald-400 uppercase font-semibold text-[11px]">
                          Free (Order &gt; PKR 15,000)
                        </span>
                      ) : (
                        formatPKR(shippingFee)
                      )}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-zinc-800 flex justify-between text-sm font-bold text-white">
                    <span className="uppercase font-display">Total Payable</span>
                    <span className="font-mono text-base">{formatPKR(total)}</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 space-y-2">
                <button
                  id="submit-order-button"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/10 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Registering Order with Atelier...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Confirm Order • {formatPKR(total)}</span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-zinc-500 text-center font-mono">
                  Order will immediately notify Atelier dispatch headquarters.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
