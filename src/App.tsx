import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryBar, SortOption } from './components/CategoryBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { CustomerOrderTrackerModal } from './components/CustomerOrderTrackerModal';
import { StaffAuthModal } from './components/StaffAuthModal';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { KhojjLogo } from './components/KhojjLogo';
import { CartItem, CategoryType, Order, OrderStatus, Product } from './types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from './data/initialData';
import { Lock } from 'lucide-react';

const STORAGE_KEYS = {
  PRODUCTS: 'khojj_products_v1',
  ORDERS: 'khojj_orders_v1',
  CART: 'khojj_cart_v1',
  STAFF_AUTH: 'khojj_staff_authenticated',
  OWNER_EMAIL: 'khojj_owner_email',
};

export default function App() {
  // Store Owner Email configuration
  const [ownerEmail, setOwnerEmail] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.OWNER_EMAIL) || 'musemusical61@gmail.com';
    } catch {
      return 'musemusical61@gmail.com';
    }
  });

  const handleUpdateOwnerEmail = (newEmail: string) => {
    const trimmed = newEmail.trim();
    if (!trimmed) return;
    setOwnerEmail(trimmed);
    try {
      localStorage.setItem(STORAGE_KEYS.OWNER_EMAIL, trimmed);
    } catch (e) {
      console.error('Failed to save owner email:', e);
    }
  };
  // Load products from localStorage or pre-seed
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved products:', e);
    }
    return INITIAL_PRODUCTS;
  });

  // Load orders from localStorage or pre-seed
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved orders:', e);
    }
    return INITIAL_ORDERS;
  });

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved cart:', e);
    }
    return [];
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cartItems));
  }, [cartItems]);

  // Staff Authentication & Admin State
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEYS.STAFF_AUTH) === 'true';
    } catch {
      return false;
    }
  });

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isStaffAuthModalOpen, setIsStaffAuthModalOpen] = useState(false);

  // Discreet Store Owner Portal Trigger:
  // Hidden from customers on the public storefront.
  // Accessible to store owner via:
  // 1. URL hash: #owner or #admin or ?admin=true
  // 2. Keyboard shortcut: Alt+A, Alt+O, or Ctrl+Shift+A
  // 3. Discrete click on footer copyright
  useEffect(() => {
    const handleCheckSecretAccess = () => {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (
        hash.includes('owner') ||
        hash.includes('admin') ||
        hash.includes('portal') ||
        search.includes('owner') ||
        search.includes('admin')
      ) {
        if (isStaffAuthenticated) {
          setIsAdminOpen(true);
        } else {
          setIsStaffAuthModalOpen(true);
        }
      }
    };

    handleCheckSecretAccess();
    window.addEventListener('hashchange', handleCheckSecretAccess);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.altKey && (e.key === 'a' || e.key === 'A' || e.key === 'o' || e.key === 'O')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A'))
      ) {
        e.preventDefault();
        if (isStaffAuthenticated) {
          setIsAdminOpen(true);
        } else {
          setIsStaffAuthModalOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', handleCheckSecretAccess);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isStaffAuthenticated]);

  // Dynamic Categories & Sections (Hoodies, Shoes, Shirts, T-Shirts, etc.)
  // Catalog Sections managed by store owner/admin
  const [activeCatalogSections, setActiveCatalogSections] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('khojj_catalog_sections_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved sections:', e);
    }
    return ['Hoodies', 'Shoes', 'Shirts', 'T-Shirts'];
  });

  const handleAddNewCategory = (newCat: string) => {
    const trimmed = newCat.trim();
    if (!trimmed) return;
    setActiveCatalogSections((prev) => {
      if (prev.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return prev;
      const updated = [...prev, trimmed];
      try {
        localStorage.setItem('khojj_catalog_sections_v3', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save category:', e);
      }
      return updated;
    });
  };

  const handleDeleteCategory = (catToDelete: string) => {
    if (activeCatalogSections.length <= 1) return; // Keep at least one section
    const updated = activeCatalogSections.filter((c) => c !== catToDelete);
    setActiveCatalogSections(updated);
    try {
      localStorage.setItem('khojj_catalog_sections_v3', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save updated categories:', e);
    }

    // Safely reassign any products in that deleted section to the primary available section
    const fallbackCategory = updated[0];
    setProducts((prev) => {
      const updatedProducts = prev.map((p) =>
        p.category === catToDelete ? { ...p, category: fallbackCategory } : p
      );
      try {
        localStorage.setItem('khojj_products_inventory_v2', JSON.stringify(updatedProducts));
      } catch (e) {
        console.error('Failed to update products after section deletion:', e);
      }
      return updatedProducts;
    });

    if (activeCategory === catToDelete) {
      setActiveCategory('All Pieces');
    }
  };

  const availableCategories = activeCatalogSections;

  const allDisplayCategories = useMemo(() => {
    return ['All Pieces', ...availableCategories];
  }, [availableCategories]);

  // Customer UI States
  const [activeCategory, setActiveCategory] = useState<CategoryType>('All Pieces');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('featured');

  // Customer Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isCustomerTrackerOpen, setIsCustomerTrackerOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | undefined>(undefined);
  const [newOrderAlert, setNewOrderAlert] = useState<{
    orderId: string;
    customerName: string;
    totalPKR: number;
  } | null>(null);

  // Keyboard shortcut for staff access (Ctrl + Shift + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (isStaffAuthenticated) {
          setIsAdminOpen((prev) => !prev);
        } else {
          setIsStaffAuthModalOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStaffAuthenticated]);

  // Cart operations
  const handleAddToCart = (product: Product, size: string, color: string, quantity: number = 1) => {
    setCartItems((prev) => {
      const cartItemId = `${product.id}-${size}-${color}`;
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { cartItemId, productId: product.id, product, size, color, quantity }];
    });
  };

  const handleUpdateCartQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  // Order Placement
  const handleOrderPlaced = (newOrder: Order) => {
    const orderWithCurrentOwner = {
      ...newOrder,
      adminEmailRecipient: ownerEmail,
    };

    setProducts((prev) =>
      prev.map((prod) => {
        const matchingItems = orderWithCurrentOwner.items.filter((item) => item.productId === prod.id);
        if (matchingItems.length > 0) {
          const totalOrdered = matchingItems.reduce((acc, curr) => acc + curr.quantity, 0);
          return {
            ...prod,
            stock: Math.max(0, prod.stock - totalOrdered),
          };
        }
        return prod;
      })
    );

    setOrders((prev) => [orderWithCurrentOwner, ...prev]);
    setCartItems([]);
    setIsCheckoutModalOpen(false);
    setConfirmedOrder(orderWithCurrentOwner);
    setIsConfirmationModalOpen(true);
    setNewOrderAlert({
      orderId: orderWithCurrentOwner.id,
      customerName: orderWithCurrentOwner.customerName,
      totalPKR: orderWithCurrentOwner.totalPKR,
    });
  };

  // Staff Authentication Handlers
  const handleAuthenticateSuccess = () => {
    setIsStaffAuthenticated(true);
    try {
      sessionStorage.setItem(STORAGE_KEYS.STAFF_AUTH, 'true');
    } catch (e) {
      console.error('Session storage error:', e);
    }
    setIsAdminOpen(true);
  };

  const handleLogoutStaff = () => {
    setIsStaffAuthenticated(false);
    try {
      sessionStorage.removeItem(STORAGE_KEYS.STAFF_AUTH);
    } catch (e) {
      console.error('Session storage error:', e);
    }
    setIsAdminOpen(false);
  };

  // Admin Actions
  const handleSaveProduct = (product: Product) => {
    setProducts((prev) => {
      const index = prev.findIndex((p) => p.id === product.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = product;
        return updated;
      }
      return [product, ...prev];
    });
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleUpdateStock = (productId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, stock: Math.max(0, p.stock + delta) } : p
      )
    );
  };

  const handleUpdateOrderStatus = (
    orderId: string,
    newStatus: OrderStatus,
    courier?: string,
    trackingNum?: string
  ) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const logNote =
            newStatus === 'Shipped'
              ? `Dispatched via ${courier || ord.courier || 'TCS Express'} (Tracking: ${
                  trackingNum || ord.trackingNumber || 'Pending'
                })`
              : newStatus === 'Delivered'
              ? 'Handover completed and verified by recipient'
              : `Order status changed to ${newStatus}`;

          return {
            ...ord,
            status: newStatus,
            courier: courier || ord.courier,
            trackingNumber: trackingNum || ord.trackingNumber,
            statusHistory: [
              ...ord.statusHistory,
              {
                status: newStatus,
                timestamp: new Date().toISOString(),
                note: logNote,
              },
            ],
          };
        }
        return ord;
      })
    );
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  // Filter & Sort Products for Storefront
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      activeCategory === 'All Pieces' || p.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === 'price-asc') return a.pricePKR - b.pricePKR;
    if (sortOption === 'price-desc') return b.pricePKR - a.pricePKR;
    if (sortOption === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return 0;
  });

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog-controls');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col font-sans selection:bg-zinc-800 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          scrollToCatalog();
        }}
        categories={allDisplayCategories}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartDrawerOpen(true)}
        isAdminOpen={isAdminOpen}
        onExitAdmin={() => setIsAdminOpen(false)}
        onOpenCustomerTracker={() => {
          setTrackingOrderId(undefined);
          setIsCustomerTrackerOpen(true);
        }}
        onOpenStaffLogin={() => {
          if (isStaffAuthenticated) {
            setIsAdminOpen(true);
          } else {
            setIsStaffAuthModalOpen(true);
          }
        }}
        isStaffAuthenticated={isStaffAuthenticated}
        onLogoutStaff={handleLogoutStaff}
      />

      {/* Main View Router: Admin vs Storefront */}
      {isAdminOpen ? (
        <AdminDashboard
          products={products}
          orders={orders}
          onSaveProduct={handleSaveProduct}
          onDeleteProduct={handleDeleteProduct}
          onUpdateStock={handleUpdateStock}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onDeleteOrder={handleDeleteOrder}
          onCloseAdmin={() => setIsAdminOpen(false)}
          onInspectTracking={(orderId) => {
            setTrackingOrderId(orderId);
            setIsCustomerTrackerOpen(true);
          }}
          availableCategories={availableCategories}
          onAddNewCategory={handleAddNewCategory}
          onDeleteCategory={handleDeleteCategory}
          onRestoreProducts={(restored) => setProducts(restored)}
          ownerEmail={ownerEmail}
          onUpdateOwnerEmail={handleUpdateOwnerEmail}
        />
      ) : (
        <main className="flex-1">
          {/* Clean Editorial Hero Banner */}
          <HeroBanner onScrollToCatalog={scrollToCatalog} />

          {/* Clean Category & Search Bar */}
          <CategoryBar
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            categories={allDisplayCategories}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortOption={sortOption}
            onSortChange={setSortOption}
            totalPieces={sortedProducts.length}
          />

          {/* Clean Product Grid */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            {sortedProducts.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-[#0e0e12] border border-[#27272a] space-y-3">
                <p className="font-display text-sm text-zinc-300 uppercase tracking-wider">
                  No pieces found
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('All Pieces');
                  }}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-xs uppercase tracking-wider text-white"
                >
                  Reset
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={(p) => {
                      setSelectedProduct(p);
                      setIsDetailModalOpen(true);
                    }}
                    onQuickAdd={(p, size, color) => {
                      handleAddToCart(p, size, color, 1);
                      setIsCartDrawerOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {/* Clean Minimalist Luxury Footer */}
      <footer className="border-t border-[#27272a] bg-[#070709] py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-3">
            <KhojjLogo className="h-7 w-auto" />
            <span className="text-zinc-600 hidden sm:inline">/</span>
            <span className="font-mono text-[11px] text-zinc-400 hidden sm:inline">PKR Atelier Pakistan</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[11px]">
            {/* Owner Portal Shortcut: Strictly visible only when Store Owner is already logged in */}
            {isStaffAuthenticated && (
              <div className="flex items-center gap-3">
                <button
                  id="footer-staff-portal-trigger"
                  onClick={() => setIsAdminOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-950/40 border border-emerald-800 hover:border-emerald-600 text-emerald-300 hover:text-white transition-all cursor-pointer font-medium font-mono text-[11px]"
                  title="Store Owner: View All Orders & Customers"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Owner Operations</span>
                  {orders.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-900 border border-emerald-700 text-emerald-200 font-bold">
                      {orders.length}
                    </span>
                  )}
                </button>
                <button
                  id="footer-logout-btn"
                  onClick={handleLogoutStaff}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors font-mono text-[10px] cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}

            {/* Copyright with discreet click access for owner (also accessible via Alt+A or #owner) */}
            <span
              onClick={() => {
                if (isStaffAuthenticated) {
                  setIsAdminOpen(true);
                } else {
                  setIsStaffAuthModalOpen(true);
                }
              }}
              className="cursor-default select-none text-zinc-500 hover:text-zinc-400 transition-colors"
              title="KHOJJ Atelier Pakistan"
            >
              © {new Date().getFullYear()} KHOJJ — The Premium Closet
            </span>
          </div>
        </div>
      </footer>

      {/* Real-time New Order Popup Notification: strictly for authenticated store owner */}
      {newOrderAlert && isStaffAuthenticated && (
        <div
          id="new-order-owner-alert"
          className="fixed bottom-6 right-6 z-50 bg-[#121215] border border-emerald-500/80 p-4 rounded-xl shadow-2xl shadow-emerald-950/50 max-w-sm space-y-2.5 backdrop-blur-md"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-mono uppercase">
              <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-zinc-950 text-[10px] font-bold">NEW</span>
              New Order Received!
            </span>
            <button
              onClick={() => setNewOrderAlert(null)}
              className="text-zinc-500 hover:text-white text-xs cursor-pointer p-1"
              aria-label="Dismiss alert"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            <strong className="text-white">{newOrderAlert.customerName}</strong> just placed order{' '}
            <span className="font-mono text-emerald-300">#{newOrderAlert.orderId}</span> for{' '}
            <strong className="text-white">PKR {newOrderAlert.totalPKR.toLocaleString()}</strong>.
          </p>
          <button
            onClick={() => {
              setNewOrderAlert(null);
              setIsAdminOpen(true);
            }}
            className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
          >
            <span>Open Owner Portal</span>
            <span>→</span>
          </button>
        </div>
      )}

      {/* Product Details Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedProduct(null);
        }}
        onAddToCart={(p, size, color, qty) => {
          handleAddToCart(p, size, color, qty);
          setIsCartDrawerOpen(true);
        }}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => setIsCheckoutModalOpen(true)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cartItems={cartItems}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        order={confirmedOrder}
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onTrackCustomerOrder={(orderId) => {
          setIsConfirmationModalOpen(false);
          setTrackingOrderId(orderId);
          setIsCustomerTrackerOpen(true);
        }}
      />

      {/* Dedicated Customer Order Tracker Modal */}
      <CustomerOrderTrackerModal
        isOpen={isCustomerTrackerOpen}
        onClose={() => {
          setIsCustomerTrackerOpen(false);
          setTrackingOrderId(undefined);
        }}
        orders={orders}
        initialOrderId={trackingOrderId}
      />

      {/* Staff Authentication Modal */}
      <StaffAuthModal
        isOpen={isStaffAuthModalOpen}
        onClose={() => setIsStaffAuthModalOpen(false)}
        onAuthenticateSuccess={handleAuthenticateSuccess}
      />
    </div>
  );
}
