import React from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import { CategoryType } from '../types';

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

interface CategoryBarProps {
  activeCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
  categories?: string[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalPieces: number;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  activeCategory,
  onSelectCategory,
  categories = ['All Pieces', 'Hoodies', 'Shoes', 'Shirts', 'T-Shirts'],
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
}) => {
  return (
    <div id="catalog-controls" className="py-3 sm:py-4 border-b border-[#27272a] bg-[#09090b]/90 backdrop-blur-md sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Tabs: Smooth touch scroll for phone and tablet */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none touch-pan-x -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  id={`filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => onSelectCategory(cat)}
                  className={`min-h-[38px] px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
                      : 'bg-[#121214] text-zinc-400 hover:text-white border border-[#27272a]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search and Sort controls */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                id="search-products-input"
                type="text"
                placeholder="Search pieces..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-[#121215] border border-[#27272a] focus:border-zinc-400 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex items-center shrink-0">
              <ArrowUpDown className="w-3 h-3 absolute left-2.5 pointer-events-none text-zinc-400" />
              <select
                id="sort-products-select"
                value={sortOption}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                aria-label="Sort products"
                className="bg-[#121215] border border-[#27272a] text-zinc-300 rounded-lg pl-7 pr-6 py-1.5 text-xs font-medium focus:outline-none focus:border-zinc-400 appearance-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low</option>
                <option value="price-desc">Price: High</option>
              </select>
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-zinc-500">
                ▼
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
