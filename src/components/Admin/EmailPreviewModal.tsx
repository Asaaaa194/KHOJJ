import React, { useState } from 'react';
import { X, Mail, Copy, Check, Printer, ExternalLink, ShieldCheck } from 'lucide-react';
import { Order } from '../../types';
import { formatPKR } from '../../utils/currency';

interface EmailPreviewModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenPackingSlip: (order: Order) => void;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  order,
  isOpen,
  onClose,
  onOpenPackingSlip,
}) => {
  if (!isOpen || !order) return null;

  const [copied, setCopied] = useState(false);

  // Generate plain HTML string of the email
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Order Dispatch Alert - ${order.id}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; color: #18181b; padding: 24px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="background: #09090b; padding: 24px; color: #ffffff;">
      <h1 style="margin: 0; font-size: 20px; letter-spacing: 0.1em; text-transform: uppercase;">KHOJJ — THE PREMIUM CLOSET</h1>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #a1a1aa;">Atelier Order Dispatch Alert • Recipient: ${order.adminEmailRecipient}</p>
    </div>
    <div style="padding: 24px;">
      <div style="margin-bottom: 20px; padding: 12px 16px; background: #fafafa; border-radius: 8px; border-left: 4px solid #09090b;">
        <p style="margin: 0; font-size: 14px; font-weight: bold;">Order Reference: ${order.id}</p>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #71717a;">Placed: ${new Date(order.createdAt).toLocaleString('en-PK')} • Status: ${order.status}</p>
      </div>

      <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e4e4e7; padding-bottom: 8px; margin-top: 24px;">Customer & Delivery Details</h3>
      <table style="width: 100%; font-size: 13px; line-height: 1.6; margin-bottom: 20px;">
        <tr><td style="width: 140px; color: #71717a;">Full Name:</td><td><strong>${order.customerName}</strong></td></tr>
        <tr><td style="color: #71717a;">Mobile / WhatsApp:</td><td><strong>${order.phone}</strong></td></tr>
        <tr><td style="color: #71717a;">Address:</td><td>${order.address}</td></tr>
        <tr><td style="color: #71717a;">City / Province:</td><td>${order.city}, ${order.province}</td></tr>
        <tr><td style="color: #71717a;">Courier Notes:</td><td>${order.deliveryNotes || 'None specified'}</td></tr>
        <tr><td style="color: #71717a;">Payment Method:</td><td><strong>${order.paymentMethod}</strong></td></tr>
      </table>

      <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e4e4e7; padding-bottom: 8px; margin-top: 24px;">Itemized Atelier Manifest</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
        <thead>
          <tr style="border-bottom: 1px solid #e4e4e7; text-align: left; color: #71717a; font-size: 11px; text-transform: uppercase;">
            <th style="padding: 8px 0;">Item Description</th>
            <th style="padding: 8px; text-align: center;">Size</th>
            <th style="padding: 8px; text-align: center;">Color</th>
            <th style="padding: 8px; text-align: center;">Qty</th>
            <th style="padding: 8px 0; text-align: right;">Amount (PKR)</th>
          </tr>
        </thead>
        <tbody>
          ${order.items
            .map(
              (i) => `
            <tr style="border-bottom: 1px solid #f4f4f5;">
              <td style="padding: 10px 0;"><strong>${i.title}</strong></td>
              <td style="padding: 10px; text-align: center;">${i.size}</td>
              <td style="padding: 10px; text-align: center;">${i.color}</td>
              <td style="padding: 10px; text-align: center;">${i.quantity}</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold;">${formatPKR(i.pricePKR * i.quantity)}</td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>

      <div style="border-top: 2px solid #18181b; padding-top: 12px; margin-top: 12px;">
        <table style="width: 100%; font-size: 13px;">
          <tr><td style="color: #71717a;">Items Subtotal:</td><td style="text-align: right;">${formatPKR(order.subtotalPKR)}</td></tr>
          <tr><td style="color: #71717a;">Shipping Fee:</td><td style="text-align: right;">${order.shippingFeePKR === 0 ? 'Complimentary' : formatPKR(order.shippingFeePKR)}</td></tr>
          <tr style="font-size: 16px; font-weight: bold;"><td style="padding-top: 8px;">Total Due:</td><td style="text-align: right; padding-top: 8px;">${formatPKR(order.totalPKR)}</td></tr>
        </table>
      </div>
    </div>
    <div style="background: #fafafa; padding: 16px 24px; border-top: 1px solid #e4e4e7; font-size: 11px; color: #a1a1aa; text-align: center;">
      KHOJJ • The Premium Closet Automated Notification • Dispatched to ${order.adminEmailRecipient}
    </div>
  </div>
</body>
</html>
  `.trim();

  const handleCopy = () => {
    navigator.clipboard?.writeText(emailHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div
        id="email-inspect-modal"
        className="relative w-full max-w-3xl bg-[#0e0e12] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden z-10 my-auto flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#27272a] bg-[#121215] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm sm:text-base text-white uppercase tracking-wider">
                Sent Email Dispatch Inspector
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                Recipient: <span className="text-emerald-400 font-semibold">{order.adminEmailRecipient}</span> • Order {order.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPackingSlip(order)}
              className="px-3 py-1.5 rounded-lg bg-[#18181b] hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Packing Slip</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied HTML' : 'Copy HTML'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Email Rendered Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-950/50">
          <div className="max-w-2xl mx-auto bg-white text-zinc-900 rounded-xl shadow-lg overflow-hidden border border-zinc-200">
            {/* Email Top bar */}
            <div className="bg-[#09090b] p-5 text-white flex items-center justify-between">
              <div>
                <h4 className="font-display font-extrabold text-lg uppercase tracking-wider">
                  KHOJJ — THE PREMIUM CLOSET
                </h4>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Order Dispatch Alert • Dispatched to {order.adminEmailRecipient}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-zinc-800 border border-zinc-700 text-xs font-mono font-bold text-white">
                {order.id}
              </span>
            </div>

            {/* Email Content Body */}
            <div className="p-6 space-y-5 text-xs text-zinc-800">
              <div className="p-3 bg-zinc-50 border-l-4 border-zinc-900 rounded">
                <div className="font-bold text-sm text-zinc-900">
                  New Order Received from {order.customerName}
                </div>
                <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                  Placed on {new Date(order.createdAt).toLocaleString('en-PK')} • Payment via {order.paymentMethod}
                </div>
              </div>

              {/* Delivery info */}
              <div>
                <h5 className="font-bold uppercase tracking-wider text-[11px] text-zinc-500 border-b pb-1 mb-2">
                  Delivery Destination & Courier Instructions
                </h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-zinc-500">Contact / WhatsApp:</span>
                    <p className="font-semibold">{order.phone}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Location:</span>
                    <p className="font-semibold">{order.city}, {order.province}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-zinc-500">Address:</span>
                    <p className="font-medium text-zinc-900">{order.address}</p>
                  </div>
                  {order.deliveryNotes && (
                    <div className="col-span-2">
                      <span className="text-zinc-500">Courier Note:</span>
                      <p className="italic text-zinc-700">{order.deliveryNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h5 className="font-bold uppercase tracking-wider text-[11px] text-zinc-500 border-b pb-1 mb-2">
                  Itemized Manifest
                </h5>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b text-zinc-500 text-[10px] uppercase font-mono">
                      <th className="py-1">Item</th>
                      <th className="py-1 text-center">Size</th>
                      <th className="py-1 text-center">Color</th>
                      <th className="py-1 text-center">Qty</th>
                      <th className="py-1 text-right">PKR Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, i) => (
                      <tr key={i} className="border-b border-zinc-100">
                        <td className="py-2 font-medium">{item.title}</td>
                        <td className="py-2 text-center font-mono">{item.size}</td>
                        <td className="py-2 text-center text-zinc-600">{item.color}</td>
                        <td className="py-2 text-center font-bold">{item.quantity}</td>
                        <td className="py-2 text-right font-mono font-bold">
                          {formatPKR(item.pricePKR * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial breakdown */}
              <div className="pt-2 space-y-1 text-xs border-t">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatPKR(order.subtotalPKR)}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Delivery Fee</span>
                  <span className="font-mono">
                    {order.shippingFeePKR === 0 ? 'Complimentary' : formatPKR(order.shippingFeePKR)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-zinc-950 pt-1 border-t">
                  <span>Total Order Amount</span>
                  <span className="font-mono">{formatPKR(order.totalPKR)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-zinc-100 p-3 text-center text-[10px] text-zinc-500 font-mono">
              KHOJJ ATELIER • DISPATCH SYSTEM PROOF
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
