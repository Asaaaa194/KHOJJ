import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Printer,
  ChevronRight,
  Filter,
  ExternalLink,
  ShieldCheck,
  Search,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Box,
  Coins,
  MessageCircle,
  Download,
  Upload,
  HardDrive,
  Check,
} from 'lucide-react';
import { Order, OrderStatus, Product } from '../../types';
import { formatPKR, generateTrackingNumber } from '../../utils/currency';
import { ProductFormModal } from './ProductFormModal';
import { EmailPreviewModal } from './EmailPreviewModal';
import { PackingSlipModal } from './PackingSlipModal';
import { InAppDeleteModal } from '../InAppDeleteModal';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateStock: (productId: string, delta: number) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus, courier?: string, trackingNum?: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onCloseAdmin: () => void;
  onInspectTracking?: (orderId: string) => void;
  availableCategories?: string[];
  onAddNewCategory?: (cat: string) => void;
  onDeleteCategory?: (cat: string) => void;
  onRestoreProducts?: (products: Product[]) => void;
  ownerEmail?: string;
  onUpdateOwnerEmail?: (newEmail: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  onSaveProduct,
  onDeleteProduct,
  onUpdateStock,
  onUpdateOrderStatus,
  onDeleteOrder,
  onCloseAdmin,
  onInspectTracking,
  availableCategories = ['Hoodies', 'Shoes', 'Shirts', 'T-Shirts'],
  onAddNewCategory,
  onDeleteCategory,
  onRestoreProducts,
  ownerEmail = 'musemusical61@gmail.com',
  onUpdateOwnerEmail,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'All' | OrderStatus>('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [backupToast, setBackupToast] = useState<string | null>(null);

  // Store Owner Notification Email State
  const [editingOwnerEmail, setEditingOwnerEmail] = useState(ownerEmail);
  const [emailSaveToast, setEmailSaveToast] = useState<string | null>(null);

  useEffect(() => {
    if (ownerEmail) {
      setEditingOwnerEmail(ownerEmail);
    }
  }, [ownerEmail]);

  const handleSaveOwnerEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = editingOwnerEmail.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setEmailSaveToast('Please enter a valid email address.');
      setTimeout(() => setEmailSaveToast(null), 3000);
      return;
    }
    if (onUpdateOwnerEmail) {
      onUpdateOwnerEmail(trimmed);
    } else {
      localStorage.setItem('khojj_owner_email', trimmed);
    }
    setEmailSaveToast(`Owner notification email updated to: ${trimmed}`);
    setTimeout(() => setEmailSaveToast(null), 4000);
  };

  const handleExportCatalog = () => {
    const dataStr = JSON.stringify(products, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `khojj-catalog-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setBackupToast('Catalog backup downloaded successfully!');
    setTimeout(() => setBackupToast(null), 3500);
  };

  const handleImportCatalog = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id && parsed[0].title) {
          if (onRestoreProducts) {
            onRestoreProducts(parsed);
          } else {
            localStorage.setItem('khojj_products_v1', JSON.stringify(parsed));
          }
          setBackupToast(`Restored ${parsed.length} pieces from backup!`);
          setTimeout(() => setBackupToast(null), 3500);
        } else {
          setBackupToast('Invalid catalog backup file.');
          setTimeout(() => setBackupToast(null), 3500);
        }
      } catch (err) {
        console.error('Failed to parse catalog JSON:', err);
        setBackupToast('Failed to read file. Please ensure it is valid JSON.');
        setTimeout(() => setBackupToast(null), 3500);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Modals state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);

  const [inspectingEmailOrder, setInspectingEmailOrder] = useState<Order | null>(null);
  const [packingSlipOrder, setPackingSlipOrder] = useState<Order | null>(null);

  // In-app delete modal state
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'Product' | 'Order' | 'Section';
    id: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
  } | null>(null);

  // Filtered orders
  const filteredOrders = orders.filter((ord) => {
    const matchesStatus = orderStatusFilter === 'All' || ord.status === orderStatusFilter;
    const matchesQuery =
      !orderSearch ||
      ord.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.city.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.phone.includes(orderSearch);
    return matchesStatus && matchesQuery;
  });

  // Filtered products
  const filteredProducts = products.filter((p) => {
    return (
      !productSearch ||
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
    );
  });

  // Calculate Live Metric Tiles
  const totalOrdersCount = orders.length;
  const totalRevenuePKR = orders.reduce((acc, curr) => acc + curr.totalPKR, 0);
  const uniqueCustomersCount = new Set(orders.map((o) => o.phone.trim() || o.customerName.trim())).size;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;
  const deliveredPercentage =
    totalOrdersCount > 0 ? Math.round((deliveredCount / totalOrdersCount) * 100) : 0;
  const inTransitCount = orders.filter((o) => o.status === 'Shipped').length;
  const pendingCount = orders.filter(
    (o) => o.status === 'Pending' || o.status === 'Processing'
  ).length;

  // Pipeline step order
  const PIPELINE_STEPS: { status: OrderStatus; label: string; num: number }[] = [
    { status: 'Pending', label: '1. Placed', num: 1 },
    { status: 'Processing', label: '2. Packed', num: 2 },
    { status: 'Shipped', label: '3. Dispatched', num: 3 },
    { status: 'Delivered', label: '4. Delivered', num: 4 },
  ];

  const getStepIndex = (status: OrderStatus) => {
    return PIPELINE_STEPS.findIndex((s) => s.status === status);
  };

  const handleAdvanceOrder = (order: Order) => {
    const currentIndex = getStepIndex(order.status);
    if (currentIndex < PIPELINE_STEPS.length - 1) {
      const nextStep = PIPELINE_STEPS[currentIndex + 1].status;
      if (nextStep === 'Shipped') {
        const courier = order.courier || 'TCS Express';
        const tracking = order.trackingNumber || generateTrackingNumber(courier);
        onUpdateOrderStatus(order.id, 'Shipped', courier, tracking);
      } else {
        onUpdateOrderStatus(order.id, nextStep);
      }
    }
  };

  const handleDispatchAndShip = (order: Order) => {
    const courier = order.courier || 'TCS Express';
    const tracking = order.trackingNumber || generateTrackingNumber(courier);
    onUpdateOrderStatus(order.id, 'Shipped', courier, tracking);
  };

  const handleMarkDelivered = (order: Order) => {
    onUpdateOrderStatus(order.id, 'Delivered');
  };

  const confirmPermanentDeletion = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'Product') {
      onDeleteProduct(itemToDelete.id);
    } else if (itemToDelete.type === 'Order') {
      onDeleteOrder(itemToDelete.id);
    } else if (itemToDelete.type === 'Section' && onDeleteCategory) {
      onDeleteCategory(itemToDelete.id);
    }
    setItemToDelete(null);
  };

  return (
    <div id="admin-atelier-dashboard" className="min-h-screen bg-[#09090b] text-[#f4f4f5] pb-16">
      {/* Top Admin Sub-Header */}
      <div className="bg-[#121215] border-b border-[#27272a] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                LIVE
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-bold">
                Atelier Operations Suite
              </span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight uppercase">
              KHOJJ ATELIER ADMIN
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              The Premium Closet — Live domestic order tracking, 4-step fulfillment pipeline, and zero-code inventory control.
            </p>
          </div>

          {/* Header Action Controls: Quick Add Product & Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="admin-header-add-product-btn"
              onClick={() => {
                setEditingProduct(null);
                setIsProductFormOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/10 cursor-pointer shrink-0"
              title="Add & Publish a New Product to Storefront"
            >
              <Plus className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
              <span>+ List New Product</span>
            </button>

            {/* Navigation Tabs (Orders vs Inventory) */}
            <div className="flex items-center gap-2 bg-[#09090b] p-1.5 rounded-xl border border-[#27272a]">
              <button
                id="admin-tab-orders"
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Live Delivery & Orders</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-zinc-800 text-zinc-200">
                  {orders.length}
                </span>
              </button>

              <button
                id="admin-tab-inventory"
                onClick={() => setActiveTab('inventory')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'inventory'
                    ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>Atelier Inventory</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-zinc-800 text-zinc-200">
                  {products.length}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* ======================= TAB 1: ORDERS & LIVE DELIVERY TRACKER ======================= */}
        {activeTab === 'orders' && (
          <div className="space-y-8">
            {/* 5 LIVE METRIC TILES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Metric 1: Total Orders */}
              <div
                id="metric-total-orders"
                className="p-5 rounded-2xl bg-[#0e0e12] border border-[#27272a] space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[11px] font-mono uppercase tracking-wider">
                    Total Orders
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-300">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="font-display font-extrabold text-2xl lg:text-3xl text-white">
                    {totalOrdersCount} Orders
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 font-mono">
                    <strong className="text-white">{uniqueCustomersCount}</strong> Unique Customers
                  </p>
                </div>
              </div>

              {/* Metric 2: Total Revenue */}
              <div
                id="metric-total-revenue"
                className="p-5 rounded-2xl bg-[#0e0e12] border border-amber-900/40 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between text-amber-400">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-semibold">
                    Total Revenue
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-800 text-amber-300 flex items-center justify-center">
                    <Coins className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="font-display font-extrabold text-2xl lg:text-3xl text-amber-300">
                    {formatPKR(totalRevenuePKR)}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 font-mono">
                    Gross sales value booked
                  </p>
                </div>
              </div>

              {/* Metric 3: Action Needed / Pending count */}
              <div
                id="metric-pending-action"
                className="p-5 rounded-2xl bg-[#0e0e12] border border-[#27272a] space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[11px] font-mono uppercase tracking-wider">
                    Pending Action
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-800 text-amber-400 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="font-display font-extrabold text-2xl lg:text-3xl text-amber-400">
                    {pendingCount} Pending
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1 font-mono">
                    Awaiting packaging & dispatch
                  </p>
                </div>
              </div>

              {/* Metric 4: In Transit / Dispatched count */}
              <div
                id="metric-in-transit"
                className="p-5 rounded-2xl bg-[#0e0e12] border border-[#27272a] space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[11px] font-mono uppercase tracking-wider">
                    In Courier
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-800 text-blue-400 flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="font-display font-extrabold text-2xl lg:text-3xl text-blue-400">
                    {inTransitCount} In Courier
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1 font-mono">
                    TCS / Leopards tracking live
                  </p>
                </div>
              </div>

              {/* Metric 5: Delivered count & completion percentage */}
              <div
                id="metric-delivered-completion"
                className="p-5 rounded-2xl bg-[#0e0e12] border border-[#27272a] space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[11px] font-mono uppercase tracking-wider">
                    Delivered
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="font-display font-extrabold text-2xl lg:text-3xl text-emerald-400">
                    {deliveredCount} Delivered
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 font-mono">
                    <strong className="text-white">{deliveredPercentage}% Fulfilled</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Owner Order Notification Email Routing Settings Bar */}
            <div className="p-4 rounded-2xl bg-[#0e0e12] border border-[#27272a] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-400 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">Owner Order Notification Email</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-900/60 border border-emerald-700 text-emerald-300 font-bold uppercase">Active</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    All new customer orders send automated dispatch alerts and manifests to this address.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveOwnerEmail} className="flex items-center gap-2 shrink-0">
                <input
                  id="owner-email-input"
                  type="email"
                  value={editingOwnerEmail}
                  onChange={(e) => setEditingOwnerEmail(e.target.value)}
                  placeholder="e.g. yourname@gmail.com"
                  className="bg-[#141418] border border-zinc-800 focus:border-zinc-500 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none w-56 sm:w-64 font-mono"
                />
                <button
                  id="save-owner-email-btn"
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shrink-0 shadow-sm"
                >
                  Save Email
                </button>
              </form>
            </div>

            {/* Email Save Toast */}
            {emailSaveToast && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{emailSaveToast}</span>
              </div>
            )}

            {/* STATUS FILTER BAR & SEARCH */}
            <div className="p-4 rounded-2xl bg-[#0e0e12] border border-[#27272a] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* 1-click filter buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {(['All', 'Pending', 'Processing', 'Shipped', 'Delivered'] as const).map(
                  (st) => {
                    const isActive = orderStatusFilter === st;
                    const count =
                      st === 'All'
                        ? orders.length
                        : orders.filter((o) => o.status === st).length;
                    return (
                      <button
                        key={st}
                        id={`filter-order-status-${st.toLowerCase()}`}
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                          isActive
                            ? 'bg-zinc-100 text-zinc-950 font-bold'
                            : 'bg-[#141418] border border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {st} ({count})
                      </button>
                    );
                  }
                )}
              </div>

              {/* Order Search */}
              <div className="relative sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search by ID, name, phone, city..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full bg-[#141418] border border-zinc-800 focus:border-zinc-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none"
                />
              </div>
            </div>

            {/* ORDERS LIST WITH 4-STEP FULFILLMENT PIPELINE */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[#0e0e12] border border-[#27272a] text-zinc-500 space-y-3">
                  <Package className="w-10 h-10 mx-auto text-zinc-600" />
                  <p className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
                    No Orders Match the Selected Filter
                  </p>
                  <p className="text-xs text-zinc-500">
                    Orders placed on the storefront will appear here immediately.
                  </p>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const currentStepIdx = getStepIndex(order.status);

                  return (
                    <div
                      key={order.id}
                      id={`admin-order-card-${order.id}`}
                      className="p-5 sm:p-6 rounded-2xl bg-[#0e0e12] border border-[#27272a] hover:border-zinc-700 transition-all space-y-5"
                    >
                      {/* Order Header */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-base text-white">
                              {order.id}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                order.status === 'Delivered'
                                  ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-800'
                                  : order.status === 'Shipped'
                                  ? 'bg-blue-950/90 text-blue-300 border border-blue-800'
                                  : 'bg-amber-950/90 text-amber-300 border border-amber-800'
                              }`}
                            >
                              {order.status}
                            </span>
                            <span className="text-[11px] font-mono text-zinc-500">
                              {new Date(order.createdAt).toLocaleString('en-PK')}
                            </span>
                          </div>
                          <div className="text-xs text-zinc-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span>Customer: <strong className="text-white">{order.customerName}</strong></span>
                            <span>•</span>
                            <span>Phone: <span className="font-mono text-zinc-200">{order.phone}</span></span>
                            {/* WhatsApp link for quick order verification */}
                            <a
                              id={`whatsapp-customer-${order.id}`}
                              href={`https://wa.me/${order.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `Assalam o Alaikum ${order.customerName}, this is KHOJJ (The Premium Closet) regarding your order #${order.id} (Total: ${formatPKR(order.totalPKR)}).`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/60 transition-colors"
                              title="Message Customer on WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                            <span>•</span>
                            <span>City: <span className="text-zinc-200 font-medium">{order.city}, {order.province}</span></span>
                            <span>•</span>
                            <span>Address: <span className="text-zinc-300">{order.address}</span></span>
                          </div>
                        </div>

                        {/* Top action links */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Direct Email to Owner button */}
                          <a
                            id={`email-owner-btn-${order.id}`}
                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                              order.adminEmailRecipient || ownerEmail || 'musemusical61@gmail.com'
                            )}&su=${encodeURIComponent(
                              `[KHOJJ ORDER #${order.id}] ${order.customerName} - PKR ${order.totalPKR.toLocaleString()}`
                            )}&body=${encodeURIComponent(
                              `KHOJJ ATELIER ORDER NOTIFICATION\n------------------------------------\nOrder Reference: ${order.id}\nCustomer: ${order.customerName}\nPhone: ${order.phone}\nDelivery Address: ${order.address}, ${order.city}, ${order.province}\nPayment Method: ${order.paymentMethod}\nTotal Due: PKR ${order.totalPKR.toLocaleString()}\n\nPURCHASED PIECES:\n${order.items
                                .map(
                                  (i) =>
                                    `- ${i.title} (${i.size}, ${i.color}) x${i.quantity} = PKR ${(
                                      i.pricePKR * i.quantity
                                    ).toLocaleString()}`
                                )
                                .join('\n')}\n\nDelivery Instructions: ${
                                order.deliveryNotes || 'None'
                              }\nOrder Time: ${new Date(order.createdAt).toLocaleString()}\n------------------------------------\nOwner Inbox: ${
                                order.adminEmailRecipient || ownerEmail || 'musemusical61@gmail.com'
                              }`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-700/80 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            title={`Open direct Gmail notification to store owner (${order.adminEmailRecipient || ownerEmail || 'musemusical61@gmail.com'})`}
                          >
                            <Mail className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Email Owner ({order.adminEmailRecipient || ownerEmail || 'musemusical61@gmail.com'})</span>
                          </a>

                          {/* Inspect Sent Email button */}
                          <button
                            id={`inspect-email-${order.id}`}
                            onClick={() => setInspectingEmailOrder(order)}
                            className="px-3 py-1.5 rounded-lg bg-[#18181b] hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Inspect Sent Email</span>
                          </button>

                          {/* Owner-Only Track Parcel button */}
                          {onInspectTracking && (
                            <button
                              id={`admin-track-parcel-${order.id}`}
                              onClick={() => onInspectTracking(order.id)}
                              className="px-3 py-1.5 rounded-lg bg-[#18181b] hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Inspect visual parcel journey (Owner View)"
                            >
                              <Truck className="w-3.5 h-3.5 text-blue-400" />
                              <span>Track Parcel</span>
                            </button>
                          )}

                          {/* Print Packing Slip button */}
                          <button
                            id={`print-slip-${order.id}`}
                            onClick={() => setPackingSlipOrder(order)}
                            className="px-3 py-1.5 rounded-lg bg-[#18181b] hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Packing Slip</span>
                          </button>

                          {/* Delete / Archive button with in-app confirmation */}
                          <button
                            id={`delete-order-${order.id}`}
                            onClick={() =>
                              setItemToDelete({
                                type: 'Order',
                                id: order.id,
                                title: `Order ${order.id} (${order.customerName})`,
                                description: `Value: ${formatPKR(order.totalPKR)} • Status: ${order.status}`,
                              })
                            }
                            className="p-1.5 rounded-lg bg-[#18181b] hover:bg-rose-950/60 border border-zinc-700 hover:border-rose-800 text-zinc-400 hover:text-rose-300 transition-colors cursor-pointer"
                            title="Delete / Archive Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* 4-STEP FULFILLMENT PIPELINE VISUAL TIMELINE */}
                      <div className="p-4 rounded-xl bg-[#141418] border border-zinc-800/80 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                            Fulfillment Pipeline Tracker:
                          </span>
                          {order.courier && order.trackingNumber && (
                            <span className="text-[11px] font-mono text-zinc-300">
                              Courier: <strong className="text-white">{order.courier}</strong> • Tracking:{' '}
                              <strong className="text-emerald-400">{order.trackingNumber}</strong>
                            </span>
                          )}
                        </div>

                        {/* Pipeline stages */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                          {PIPELINE_STEPS.map((step, idx) => {
                            const isPast = idx < currentStepIdx;
                            const isCurrent = idx === currentStepIdx;

                            return (
                              <div
                                key={step.status}
                                className={`p-2.5 rounded-lg border text-center transition-all ${
                                  isPast
                                    ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
                                    : isCurrent
                                    ? 'bg-zinc-800 border-white text-white shadow-sm ring-1 ring-white/20'
                                    : 'bg-[#0e0e11] border-zinc-800 text-zinc-500'
                                }`}
                              >
                                <div className="text-[11px] font-mono font-bold flex items-center justify-center gap-1.5">
                                  {isPast ? (
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  ) : isCurrent ? (
                                    <Clock className="w-3 h-3 text-emerald-400" />
                                  ) : null}
                                  <span>{step.label}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Items & Quick Pipeline Actions Row */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Ordered Items Preview */}
                        <div className="flex flex-wrap items-center gap-3">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 p-1.5 pr-3 rounded-lg bg-[#141418] border border-zinc-800 text-xs"
                            >
                              <div className="w-10 h-12 bg-black rounded p-0.5 border border-zinc-700 flex items-center justify-center shrink-0">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div className="text-[11px]">
                                <p className="font-semibold text-zinc-200 truncate max-w-[160px]">
                                  {item.title}
                                </p>
                                <p className="font-mono text-zinc-400 text-[10px]">
                                  Size {item.size} • {item.color} (x{item.quantity})
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Financial summary & Action Buttons */}
                        <div className="flex flex-wrap items-center justify-end gap-3 shrink-0">
                          <div className="text-right mr-2">
                            <span className="text-[10px] text-zinc-500 uppercase font-mono block">
                              Total Due ({order.paymentMethod.split(' ')[0]})
                            </span>
                            <span className="font-mono font-extrabold text-base text-white">
                              {formatPKR(order.totalPKR)}
                            </span>
                          </div>

                          {/* Quick Action: Advance Step */}
                          {order.status !== 'Delivered' && (
                            <button
                              id={`advance-order-${order.id}`}
                              onClick={() => handleAdvanceOrder(order)}
                              className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <span>Advance Step</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Quick Action: Dispatch & Ship */}
                          {order.status !== 'Shipped' && order.status !== 'Delivered' && (
                            <button
                              id={`dispatch-order-${order.id}`}
                              onClick={() => handleDispatchAndShip(order)}
                              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Dispatch & Ship</span>
                            </button>
                          )}

                          {/* Quick Action: Mark Delivered */}
                          {order.status !== 'Delivered' && (
                            <button
                              id={`deliver-order-${order.id}`}
                              onClick={() => handleMarkDelivered(order)}
                              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark Delivered</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ======================= TAB 2: ATELIER INVENTORY & PRODUCTS ======================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Storefront Collections / Category Sections Manager */}
            <div className="p-4 rounded-2xl bg-[#0e0e12] border border-[#27272a] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <span>Product Collections &amp; Sections</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                      {availableCategories.length} Sections
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Manage store catalog sections (e.g., Hoodies, Shoes, Shirts, T-Shirts) or add new product lines.
                  </p>
                </div>

                {/* Quick Add Custom Category */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="New section (e.g. T-Shirts)..."
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = newCategoryInput.trim();
                        if (val && onAddNewCategory) {
                          onAddNewCategory(val);
                          setNewCategoryInput('');
                        }
                      }
                    }}
                    className="bg-[#141418] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 w-full sm:w-48"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = newCategoryInput.trim();
                      if (val && onAddNewCategory) {
                        onAddNewCategory(val);
                        setNewCategoryInput('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white text-zinc-950 font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors cursor-pointer shrink-0"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Badges list with delete section control */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {availableCategories.map((cat) => (
                  <span
                    key={cat}
                    className="px-2.5 py-1 rounded-lg bg-[#141418] border border-zinc-800 hover:border-zinc-600 text-xs font-mono text-zinc-300 flex items-center gap-2 transition-all group"
                  >
                    <span className="font-semibold">{cat}</span>
                    <span className="text-[10px] text-zinc-500">
                      ({products.filter((p) => p.category === cat).length})
                    </span>
                    {onDeleteCategory && (
                      <button
                        type="button"
                        id={`delete-section-btn-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={() => {
                          const count = products.filter((p) => p.category === cat).length;
                          setItemToDelete({
                            type: 'Section',
                            id: cat,
                            title: `Catalog Section: ${cat}`,
                            description: count > 0 
                              ? `Are you sure you want to delete the "${cat}" section? The ${count} piece(s) currently in this section will be safely reassigned to the primary catalog section so no products are lost.`
                              : `Are you sure you want to delete the "${cat}" section from your store catalog?`,
                          });
                        }}
                        className="text-zinc-500 hover:text-rose-400 p-0.5 rounded transition-colors cursor-pointer"
                        title={`Delete section "${cat}"`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Catalog Persistence & Backup Suite */}
            <div className="p-4 rounded-2xl bg-[#0e0e12] border border-[#27272a] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <div>
                  <span className="font-semibold text-white">Permanent Product Persistence: Active</span>
                  <p className="text-[11px] text-zinc-400">
                    All {products.length} products stay saved in your browser storage automatically until you delete them.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <button
                  id="admin-export-catalog-btn"
                  type="button"
                  onClick={handleExportCatalog}
                  className="px-3 py-1.5 rounded-lg bg-[#141418] hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Download complete catalog JSON backup file to your computer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download Backup (.JSON)</span>
                </button>

                <label
                  id="admin-import-catalog-label"
                  className="px-3 py-1.5 rounded-lg bg-[#141418] hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Restore or import product catalog from a JSON backup file"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-400" />
                  <span>Restore Backup</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportCatalog}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Backup / Restore Toast */}
            {backupToast && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{backupToast}</span>
              </div>
            )}

            {/* Toolbar: Add New Product & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0e0e12] border border-[#27272a]">
              <div className="relative flex-1 sm:w-80">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search pieces by title, SKU, or category..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-[#141418] border border-zinc-800 focus:border-zinc-500 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none"
                />
              </div>

              <button
                id="admin-add-product-btn"
                onClick={() => {
                  setEditingProduct(null);
                  setIsProductFormOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/10 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Piece</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="rounded-2xl bg-[#0e0e12] border border-[#27272a] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#27272a] bg-[#141418] text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                      <th className="py-3 px-4">Piece / Silhouette</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">SKU Code</th>
                      <th className="py-3 px-4">Price (PKR)</th>
                      <th className="py-3 px-4">Inventory Stock</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-zinc-900/30 transition-colors">
                        {/* Title & Photo */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-14 bg-black rounded-lg border border-zinc-800 p-0.5 shrink-0 flex items-center justify-center">
                              <img
                                src={p.images[0]}
                                alt={p.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-bold text-white text-xs">{p.title}</p>
                              <p className="text-[10px] text-zinc-500 font-mono">
                                {p.sizes.join(', ')}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category & Coming Soon */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-semibold bg-zinc-800 border border-zinc-700 text-zinc-300">
                              {p.category}
                            </span>
                            {p.isComingSoon && (
                              <span className="px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold bg-amber-950/90 border border-amber-600/70 text-amber-300 flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                                <span>Coming Soon</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="py-3 px-4 font-mono text-zinc-400">{p.sku}</td>

                        {/* Price PKR */}
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-white">
                            {formatPKR(p.pricePKR)}
                          </div>
                          {p.compareAtPricePKR && (
                            <div className="font-mono text-[10px] text-zinc-500 line-through">
                              {formatPKR(p.compareAtPricePKR)}
                            </div>
                          )}
                        </td>

                        {/* Stock with quick modifier */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center bg-[#141418] border border-zinc-800 rounded-md">
                              <button
                                onClick={() => onUpdateStock(p.id, -1)}
                                className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white"
                              >
                                -
                              </button>
                              <span
                                className={`w-8 text-center font-mono font-bold text-xs ${
                                  p.stock <= 3 ? 'text-amber-400' : 'text-white'
                                }`}
                              >
                                {p.stock}
                              </span>
                              <button
                                onClick={() => onUpdateStock(p.id, 1)}
                                className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white"
                              >
                                +
                              </button>
                            </div>
                            {p.stock <= 0 && (
                              <span className="text-[10px] font-mono text-rose-400 font-semibold">
                                Sold Out
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Quick Coming Soon Toggle */}
                            <button
                              type="button"
                              onClick={() =>
                                onSaveProduct({
                                  ...p,
                                  isComingSoon: !p.isComingSoon,
                                })
                              }
                              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                                p.isComingSoon
                                  ? 'bg-amber-950/90 border-amber-600 text-amber-300 hover:bg-amber-900'
                                  : 'bg-[#141418] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                              }`}
                              title={
                                p.isComingSoon
                                  ? 'Active as Coming Soon teaser. Click to make available.'
                                  : 'Click to mark as Coming Soon drop'
                              }
                            >
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              <span className="hidden xl:inline">
                                {p.isComingSoon ? 'Coming Soon: ON' : 'Coming Soon'}
                              </span>
                              <span className="xl:hidden">
                                {p.isComingSoon ? 'Soon' : '+Soon'}
                              </span>
                            </button>

                            {/* Edit Piece */}
                            <button
                              id={`admin-edit-product-${p.id}`}
                              onClick={() => {
                                setEditingProduct(p);
                                setIsProductFormOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-[#141418] hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                              title="Edit Piece"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* In-App Delete Confirmation */}
                            <button
                              id={`admin-delete-product-${p.id}`}
                              onClick={() =>
                                setItemToDelete({
                                  type: 'Product',
                                  id: p.id,
                                  title: p.title,
                                  description: `SKU: ${p.sku} • Category: ${p.category} • Price: ${formatPKR(
                                    p.pricePKR
                                  )}`,
                                  thumbnailUrl: p.images[0],
                                })
                              }
                              className="p-1.5 rounded-lg bg-[#141418] hover:bg-rose-950/60 border border-zinc-700 hover:border-rose-800 text-zinc-400 hover:text-rose-300 transition-colors cursor-pointer"
                              title="Delete Piece"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isProductFormOpen}
        onClose={() => {
          setIsProductFormOpen(false);
          setEditingProduct(null);
        }}
        onSaveProduct={onSaveProduct}
        initialProduct={editingProduct}
        availableCategories={availableCategories}
        onAddNewCategory={onAddNewCategory}
      />

      {/* Email Inspector Modal */}
      <EmailPreviewModal
        order={inspectingEmailOrder}
        isOpen={!!inspectingEmailOrder}
        onClose={() => setInspectingEmailOrder(null)}
        onOpenPackingSlip={(order) => {
          setInspectingEmailOrder(null);
          setPackingSlipOrder(order);
        }}
      />

      {/* Packing Slip Modal */}
      <PackingSlipModal
        order={packingSlipOrder}
        isOpen={!!packingSlipOrder}
        onClose={() => setPackingSlipOrder(null)}
      />

      {/* IN-APP DELETE MODAL (NEVER window.confirm()) */}
      <InAppDeleteModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirmDelete={confirmPermanentDeletion}
        title={itemToDelete?.title || ''}
        itemDescription={itemToDelete?.description}
        thumbnailUrl={itemToDelete?.thumbnailUrl}
        itemType={itemToDelete?.type || 'Product'}
      />
    </div>
  );
};
