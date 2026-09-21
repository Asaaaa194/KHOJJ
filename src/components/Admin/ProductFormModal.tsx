import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Eye, Sparkles, Check, Image as ImageIcon } from 'lucide-react';
import { Product, ProductColor } from '../../types';
import { formatPKR } from '../../utils/currency';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProduct: (product: Product) => void;
  initialProduct?: Product | null;
  availableCategories?: string[];
  onAddNewCategory?: (cat: string) => void;
}

const CLOTHING_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const SHOE_SIZES = ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12', 'US 13'];

const PRESET_COLORS: ProductColor[] = [
  { name: 'Onyx Black', hex: '#09090b' },
  { name: 'Mineral Charcoal', hex: '#27272a' },
  { name: 'Chalk White', hex: '#f4f4f5' },
  { name: 'Bone Ivory', hex: '#e4e4e7' },
  { name: 'Washed Olive', hex: '#2d3329' },
  { name: 'Chrome Silver', hex: '#a1a1aa' },
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSaveProduct,
  initialProduct,
  availableCategories = ['Hoodies', 'Shoes', 'Shirts', 'T-Shirts'],
  onAddNewCategory,
}) => {
  if (!isOpen) return null;

  const isEditing = !!initialProduct;

  const [title, setTitle] = useState(initialProduct?.title || '');
  const [category, setCategory] = useState<string>(
    initialProduct?.category || availableCategories[0] || 'Hoodies'
  );
  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [isComingSoon, setIsComingSoon] = useState<boolean>(
    initialProduct?.isComingSoon || false
  );
  const [sku, setSku] = useState(
    initialProduct?.sku || `KHJ-${Date.now().toString().slice(-4)}`
  );
  const [pricePKR, setPricePKR] = useState<number>(initialProduct?.pricePKR || 16500);
  const [compareAtPricePKR, setCompareAtPricePKR] = useState<number | undefined>(
    initialProduct?.compareAtPricePKR || 19500
  );
  const [stock, setStock] = useState<number>(initialProduct?.stock ?? 10);
  const [description, setDescription] = useState(
    initialProduct?.description ||
      'Engineered in heavy luxury cotton with architectural silhouette, dropped shoulder drape, and minimalist uncropped presence.'
  );
  const [fabricSpecsText, setFabricSpecsText] = useState(
    initialProduct?.fabricSpecs.join('\n') ||
      '480 GSM Heavy Loopback French Terry\nPre-shrunk architectural boxy cut\nDouble-stitched reinforced flatlock seams'
  );

  // Images state
  const [images, setImages] = useState<string[]>(
    initialProduct?.images || [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=85',
    ]
  );
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Colors state
  const [colors, setColors] = useState<ProductColor[]>(
    initialProduct?.colors || [
      { name: 'Onyx Black', hex: '#09090b' },
      { name: 'Mineral Charcoal', hex: '#27272a' },
    ]
  );
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#18181b');

  // Sizes state
  const [sizes, setSizes] = useState<string[]>(
    initialProduct?.sizes || (category === 'Shoes' ? ['US 8', 'US 9', 'US 10', 'US 11'] : ['S', 'M', 'L', 'XL'])
  );

  // When category switches and creating fresh product, suggest standard sizes
  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    if (!initialProduct) {
      if (newCat.toLowerCase().includes('shoe')) {
        setSizes(['US 8', 'US 9', 'US 10', 'US 11']);
      } else {
        setSizes(['S', 'M', 'L', 'XL']);
      }
    }
  };

  // Base64 File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setImages((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSize = (size: string) => {
    if (sizes.includes(size)) {
      if (sizes.length > 1) {
        setSizes((prev) => prev.filter((s) => s !== size));
      }
    } else {
      setSizes((prev) => [...prev, size]);
    }
  };

  const handleAddCustomColor = () => {
    if (!customColorName.trim()) return;
    setColors((prev) => [...prev, { name: customColorName.trim(), hex: customColorHex }]);
    setCustomColorName('');
  };

  const handleRemoveColor = (name: string) => {
    if (colors.length > 1) {
      setColors((prev) => prev.filter((c) => c.name !== name));
    }
  };

  // Quick 1-click sample templates to speed up listing
  const applyPresetTemplate = (type: 'hoodie' | 'shoe' | 'shirt') => {
    if (type === 'hoodie') {
      setTitle('Heavyweight Monolith Boxy Hoodie');
      setCategory('Hoodies');
      setSku(`KHJ-H${Math.floor(100 + Math.random() * 900)}`);
      setPricePKR(16500);
      setCompareAtPricePKR(19500);
      setStock(12);
      setDescription(
        '480 GSM ultra-heavy French terry architectural silhouette with drop shoulders, clean raw ribbed accents, and uncropped premium streetwear drape.'
      );
      setFabricSpecsText('480 GSM Heavy French Terry\nBoxy drop-shoulder cut\nPre-shrunk organic cotton\nReinforced flatlock stitching');
      setSizes(['S', 'M', 'L', 'XL']);
      setColors([
        { name: 'Onyx Black', hex: '#09090b' },
        { name: 'Mineral Charcoal', hex: '#27272a' },
      ]);
      setImages([
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=85',
      ]);
    } else if (type === 'shoe') {
      setTitle('Vanguard Monolith Leather Low Runners');
      setCategory('Shoes');
      setSku(`KHJ-S${Math.floor(100 + Math.random() * 900)}`);
      setPricePKR(34000);
      setCompareAtPricePKR(39000);
      setStock(8);
      setDescription(
        'Handcrafted in premium full-grain Italian leather with ergonomic sculpted EVA midsole, memory foam footbed, and architectural luxury tread.'
      );
      setFabricSpecsText('Full-Grain Italian Calfskin\nSculpted EVA Cushioning Midsole\nReinforced Rubber Outsole\nLuxury Silk Dust Bag Included');
      setSizes(['US 8', 'US 9', 'US 10', 'US 11']);
      setColors([
        { name: 'Chalk White', hex: '#f4f4f5' },
        { name: 'Onyx Black', hex: '#09090b' },
      ]);
      setImages([
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=85',
      ]);
    } else if (type === 'shirt') {
      setTitle('Architectural Acid-Wash Relaxed Tee');
      setCategory('Shirts');
      setSku(`KHJ-T${Math.floor(100 + Math.random() * 900)}`);
      setPricePKR(9500);
      setCompareAtPricePKR(11500);
      setStock(15);
      setDescription(
        'Heavyweight 280 GSM combed compact cotton with artisanal mineral acid wash, high-ribbed neckline, and loose streetwear silhouette.'
      );
      setFabricSpecsText('280 GSM Heavy Combed Cotton\nArtisanal Mineral Acid Wash\nHigh-density ribbed crew collar\nSingle-needle heritage stitching');
      setSizes(['S', 'M', 'L', 'XL']);
      setColors([
        { name: 'Mineral Charcoal', hex: '#27272a' },
        { name: 'Washed Olive', hex: '#2d3329' },
      ]);
      setImages([
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=85',
      ]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalProduct: Product = {
      id: initialProduct?.id || `prod-${Date.now()}`,
      title: title.trim(),
      category,
      sku: sku.trim(),
      pricePKR: Number(pricePKR) || 10000,
      compareAtPricePKR: compareAtPricePKR ? Number(compareAtPricePKR) : undefined,
      stock: Number(stock) || 0,
      images: images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=85'
      ],
      colors,
      sizes,
      description: description.trim(),
      fabricSpecs: fabricSpecsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      isFeatured: initialProduct?.isFeatured ?? true,
      isNewArrival: initialProduct?.isNewArrival ?? true,
      isComingSoon: Boolean(isComingSoon),
      createdAt: initialProduct?.createdAt || new Date().toISOString(),
    };

    onSaveProduct(finalProduct);
    onClose();
  };

  const previewImage = images[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=85';

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div
        id="product-form-modal"
        className="relative w-full max-w-5xl bg-[#0e0e12] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden z-10 my-auto flex flex-col max-h-[94vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#27272a] bg-[#121215] flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">
              {isEditing ? `Edit Atelier Piece: ${initialProduct?.title}` : 'Add New Atelier Piece'}
            </h3>
            <p className="text-xs text-zinc-400">
              Zero coding required. Changes persist permanently in Atelier state and localStorage.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Sample Template Buttons for Store Owner */}
        {!isEditing && (
          <div className="bg-[#141418] border-b border-[#27272a] px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-zinc-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-zinc-300">Quick Auto-Fill Sample (1-Click Test):</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => applyPresetTemplate('hoodie')}
                className="px-2.5 py-1 rounded-lg bg-[#1e1e24] hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs transition-colors cursor-pointer font-medium"
              >
                + Luxury Hoodie
              </button>
              <button
                type="button"
                onClick={() => applyPresetTemplate('shoe')}
                className="px-2.5 py-1 rounded-lg bg-[#1e1e24] hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs transition-colors cursor-pointer font-medium"
              >
                + Leather Runner
              </button>
              <button
                type="button"
                onClick={() => applyPresetTemplate('shirt')}
                className="px-2.5 py-1 rounded-lg bg-[#1e1e24] hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs transition-colors cursor-pointer font-medium"
              >
                + Acid-Wash Tee
              </button>
            </div>
          </div>
        )}

        {/* Body Form with Live Card Preview */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Fields Form */}
            <div className="lg:col-span-7 space-y-6">
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Piece Title (Product Name) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Heavyweight Monolith Boxy Hoodie"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#141418] border border-zinc-800 focus:border-zinc-400 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Category Section *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      if (e.target.value === '__add_new__') {
                        setIsCustomCategoryMode(true);
                      } else {
                        handleCategoryChange(e.target.value);
                      }
                    }}
                    className="w-full bg-[#141418] border border-zinc-800 focus:border-zinc-400 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    {!availableCategories.includes(category) && (
                      <option value={category}>{category}</option>
                    )}
                    <option value="__add_new__">+ Add New Section / Category...</option>
                  </select>

                  {isCustomCategoryMode && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <input
                        type="text"
                        autoFocus
                        placeholder="e.g. T-Shirts, Pants, Caps"
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        className="flex-1 bg-[#18181f] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = customCategoryInput.trim();
                          if (val) {
                            setCategory(val);
                            if (onAddNewCategory) onAddNewCategory(val);
                            setIsCustomCategoryMode(false);
                            setCustomCategoryInput('');
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-white text-zinc-950 font-bold text-[11px] uppercase cursor-pointer hover:bg-zinc-200"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCustomCategoryMode(false)}
                        className="px-2 py-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Coming Soon Teaser Option */}
              <div className="p-3 sm:p-4 rounded-xl bg-[#141418] border border-zinc-800 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Coming Soon (Pre-Release Piece)
                    </span>
                    {isComingSoon && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 border border-amber-600/70 text-amber-300 uppercase tracking-wider">
                        Active on Storefront
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    When enabled, this piece displays a luxury &quot;Coming Soon&quot; banner on the storefront and disables instant ordering until you are ready for launch.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isComingSoon}
                    onChange={(e) => setIsComingSoon(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {/* SKU, PKR Price, Compare At Price, Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-[#141418] border border-zinc-800 focus:border-zinc-400 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Price (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={pricePKR}
                    onChange={(e) => setPricePKR(Number(e.target.value))}
                    className="w-full bg-[#141418] border border-zinc-800 focus:border-zinc-400 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Original Price (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="Compare At"
                    value={compareAtPricePKR ?? ''}
                    onChange={(e) =>
                      setCompareAtPricePKR(e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="w-full bg-[#141418] border border-zinc-800 focus:border-zinc-400 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-[#141418] border border-zinc-800 focus:border-zinc-400 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Photo Upload: Base64 File Reader OR URL paste */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Product Photography ({images.length} photos)
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    All images rendered uncropped (object-contain)
                  </span>
                </div>

                {/* Upload from file OR Paste URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* File Upload Box */}
                  <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-zinc-700 hover:border-zinc-400 bg-[#141418] hover:bg-zinc-900 cursor-pointer transition-all">
                    <Upload className="w-5 h-5 text-zinc-400 mb-1" />
                    <span className="text-xs font-semibold text-zinc-200">
                      Upload from Device / Camera
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      Base64 instant photo reader
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* URL Paste Box */}
                  <div className="flex flex-col justify-between p-3 rounded-xl border border-zinc-800 bg-[#141418]">
                    <span className="text-xs font-semibold text-zinc-300 mb-1">
                      Or Paste Image Web URL
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="url"
                        placeholder="https://..."
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        className="flex-1 bg-[#09090b] border border-zinc-800 focus:border-zinc-400 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Thumbnail list with remove */}
                {images.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
                    {images.map((img, i) => (
                      <div
                        key={i}
                        className="relative w-16 h-20 rounded-lg bg-black border border-zinc-700 overflow-hidden p-1 shrink-0 group"
                      >
                        <img
                          src={img}
                          alt="Thumbnail"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="absolute inset-0 bg-red-950/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sizes checkboxes */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block">
                  Available Sizing:
                </label>
                <div className="flex flex-wrap gap-2">
                  {(category === 'Shoes' ? SHOE_SIZES : CLOTHING_SIZES).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleSize(sz)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                        sizes.includes(sz)
                          ? 'bg-white text-zinc-950 border-white'
                          : 'bg-[#141418] border border-zinc-800 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block">
                  Color Swatches:
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {colors.map((c) => (
                    <div
                      key={c.name}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141418] border border-zinc-800 text-xs text-zinc-200"
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/40"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(c.name)}
                        className="text-zinc-500 hover:text-rose-400 ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add color row */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Color Name (e.g. Acid Slate)"
                    value={customColorName}
                    onChange={(e) => setCustomColorName(e.target.value)}
                    className="flex-1 bg-[#141418] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none"
                  />
                  <input
                    type="color"
                    value={customColorHex}
                    onChange={(e) => setCustomColorHex(e.target.value)}
                    className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomColor}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white"
                  >
                    Add Color
                  </button>
                </div>
              </div>

              {/* Description & Fabric Specs */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Atelier Narrative & Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#141418] border border-zinc-800 focus:border-zinc-400 rounded-lg px-3.5 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Fabric & Construction Specs (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={fabricSpecsText}
                    onChange={(e) => setFabricSpecsText(e.target.value)}
                    className="w-full bg-[#141418] border border-zinc-800 focus:border-zinc-400 rounded-lg px-3.5 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Right: Real-Time Storefront Card Preview */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Real-Time Storefront Card Preview</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-500">Live Render</span>
              </div>

              {/* Exact Storefront Card Mirror with uncropped object-contain picture */}
              <div className="max-w-xs mx-auto bg-[#0e0e11] border border-zinc-700 rounded-xl overflow-hidden shadow-xl">
                <div className="relative w-full aspect-[4/5] bg-[#141418] p-4 flex items-center justify-center border-b border-[#27272a]/60">
                  <img
                    src={previewImage}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />

                  <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-semibold bg-black/80 text-zinc-300 border border-zinc-700">
                      {category}
                    </span>
                  </div>

                  {compareAtPricePKR && compareAtPricePKR > pricePKR && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-rose-950/80 border border-rose-800 text-rose-300">
                        -
                        {Math.round(
                          ((compareAtPricePKR - pricePKR) / compareAtPricePKR) * 100
                        )}
                        %
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 z-10">
                    {stock <= 0 ? (
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-semibold bg-red-950/90 text-red-300">
                        Sold Out
                      </span>
                    ) : stock <= 5 ? (
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-semibold bg-amber-950/90 text-amber-300">
                        Only {stock} Left
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-black/70 text-zinc-400">
                        In Stock ({stock})
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1">
                      {colors.slice(0, 3).map((c) => (
                        <span
                          key={c.name}
                          className="w-2.5 h-2.5 rounded-full border border-zinc-700"
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </div>
                    <span className="font-mono text-[10px] text-zinc-500">{sku}</span>
                  </div>

                  <h4 className="font-display font-bold text-sm text-white truncate">
                    {title || 'Untitled Atelier Piece'}
                  </h4>

                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono font-bold text-sm text-white">
                          {formatPKR(pricePKR)}
                        </span>
                        {compareAtPricePKR && (
                          <span className="font-mono text-xs text-zinc-500 line-through">
                            {formatPKR(compareAtPricePKR)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-white text-zinc-950 text-[10px] font-bold uppercase">
                      Add
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#121216] border border-[#27272a] text-[11px] text-zinc-400 space-y-1">
                <span className="font-bold text-zinc-300 uppercase tracking-wider text-[10px] block">
                  Studio Design Guarantee:
                </span>
                <p>
                  Images uploaded via file picker or URL are rendered uncropped with <code>object-contain</code> and 4:5 aspect ratio across phones, tablets, and desktops.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-[#27272a] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#18181b] hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              id="save-product-submit-button"
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-white/10 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Update Piece' : 'Publish to Storefront'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
