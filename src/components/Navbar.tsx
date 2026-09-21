import React, { useState } from 'react';
import { ShoppingBag, ArrowLeft, Menu, X, LogOut, Truck } from 'lucide-react';
import { CategoryType } from '../types';
import { KhojjLogo } from './KhojjLogo';

interface NavbarProps {
  activeCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
  categories?: string[];
  cartCount: number;
  onOpenCart: () => void;
  isAdminOpen: boolean;
  onExitAdmin: () => void;
  onOpenCustomerTracker?: () => void;
  onOpenStaffLogin: () => void;
  isStaffAuthenticated: boolean;
  onLogoutStaff: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCategory,
  onSelectCategory,
  categories = ['All Pieces', 'Hoodies', 'Shoes', 'Shirts', 'T-Shirts'],
  cartCount,
  onOpenCart,
  isAdminOpen,
  onExitAdmin,
  onOpenCustomerTracker,
  onOpenStaffLogin,
  isStaffAuthenticated,
  onLogoutStaff,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCategoryClick = (cat: CategoryType) => {
    onSelectCategory(cat);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#09090b]/90 backdrop-blur-md border-b border-[#27272a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Brand Logo & Desktop Navigation */}
          <div className="flex items-center gap-8">
            {/* Mobile menu toggle (visible on mobile/tablet) */}
            {!isAdminOpen && (
              <button
                id="mobile-menu-toggle"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="md:hidden p-2 rounded-lg bg-[#121214] border border-[#27272a] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            <button
              id="brand-logo-button"
              onClick={() => {
                if (isAdminOpen) onExitAdmin();
                onSelectCategory('All Pieces');
              }}
              className="text-left group flex items-center focus:outline-none cursor-pointer py-1"
            >
              <KhojjLogo className="h-8 sm:h-9 w-auto" />
            </button>

            {/* Desktop Category Navigation */}
            {!isAdminOpen && (
              <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-[#27272a]">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    id={`nav-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => onSelectCategory(cat)}
                    className={`px-3 py-1.5 text-xs tracking-wider uppercase transition-all rounded-lg cursor-pointer ${
                      activeCategory === cat
                        ? 'text-white bg-zinc-800 font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </nav>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {isAdminOpen ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800 text-[10px] font-mono text-emerald-300 font-bold uppercase">
                  Staff Mode
                </span>

                <button
                  id="nav-exit-admin-btn"
                  onClick={onExitAdmin}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase bg-white hover:bg-zinc-200 text-zinc-950 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Storefront</span>
                </button>

                <button
                  id="nav-logout-staff-btn"
                  onClick={onLogoutStaff}
                  title="Lock & Logout Staff"
                  className="p-2 rounded-lg bg-[#141418] hover:bg-rose-950/60 border border-zinc-700 text-zinc-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Sleek Customer Header: Bag button */
              <button
                id="nav-cart-trigger"
                onClick={onOpenCart}
                className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-[#121215] border border-[#27272a] hover:border-zinc-500 text-zinc-200 hover:text-white transition-all cursor-pointer group"
                aria-label="View shopping bag"
              >
                <ShoppingBag className="w-4 h-4 text-zinc-300 group-hover:text-white transition-colors" />
                <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline">
                  Bag
                </span>
                {cartCount > 0 && (
                  <span
                    id="cart-badge-count"
                    className="px-1.5 py-0.2 min-w-[20px] h-5 rounded-full text-[11px] font-bold flex items-center justify-center font-mono bg-white text-zinc-950 shadow-sm"
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation (Slide-over for Phones & Tablets) */}
      {isMobileMenuOpen && !isAdminOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex flex-col bg-black/95 backdrop-blur-lg animate-fadeIn pt-16">
          <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between overflow-y-auto space-y-6">
            <div className="space-y-4">
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 pb-2 border-b border-zinc-800">
                Product Collections
              </div>
              <div className="space-y-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={`w-full min-h-[44px] p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-zinc-800 border-white text-white font-bold'
                        : 'bg-[#121215] border-zinc-800/80 text-zinc-300 active:bg-zinc-800'
                    }`}
                  >
                    <span className="text-sm uppercase tracking-wider font-display font-semibold">
                      {cat}
                    </span>
                    {activeCategory === cat && (
                      <span className="text-[11px] font-mono text-emerald-400">Viewing</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Quick Customer & Management Tools for Mobile */}
              <div className="pt-4 border-t border-zinc-800 space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 pb-1">
                  Quick Access
                </div>
                {onOpenCustomerTracker && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenCustomerTracker();
                    }}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#141418] border border-zinc-800 hover:border-zinc-600 text-zinc-200 text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 cursor-pointer"
                  >
                    <Truck className="w-4 h-4 text-emerald-400" />
                    <span>Track TCS / Leopards Order</span>
                  </button>
                )}

                {isStaffAuthenticated && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenStaffLogin();
                    }}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#121215] border border-emerald-900/50 hover:border-emerald-600 text-emerald-300 text-xs font-mono tracking-wider flex items-center justify-between cursor-pointer"
                  >
                    <span className="text-[11px] uppercase">
                      Open Owner Portal
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono border border-emerald-800">
                      Logged In
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div className="text-[11px] text-zinc-500 font-mono text-center">
              KHOJJ • THE PREMIUM CLOSET • PKR ATELIER
            </div>
          </div>
        </div>
      )}
    </>
  );
};
