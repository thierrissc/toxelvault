import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Check,
  Plus,
  ArrowLeft,
  ShoppingCart,
  SlidersHorizontal,
  Copy,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import {
  HARDWARE_CATEGORIES,
  HARDWARE_CATALOG,
  getHardwareProductPhoto,
} from '../utils/textureGenerator';

/**
 * Price History Line Chart (30d / 60d / 90d / Max) matching BuildCores Part Details
 */
function PriceHistoryChart({ history = [450, 440, 430, 420, 420, 415, 410] }) {
  const width = 560;
  const height = 140;
  const min = Math.min(...history) * 0.92;
  const max = Math.max(...history) * 1.05;
  const range = Math.max(1, max - min);

  const points = history
    .map((val, idx) => {
      const x = (idx / (history.length - 1)) * (width - 60) + 45;
      const y = height - 24 - ((val - min) / range) * (height - 48);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="rounded-xl bg-[#0e1015] border border-white/[0.07] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-white">Price History (USD)</span>
        <div className="flex items-center gap-1 rounded-lg bg-[#161920] p-0.5 text-[10px] font-mono-tech">
          <span className="px-2 py-0.5 text-slate-400">30d</span>
          <span className="px-2 py-0.5 rounded bg-white/10 text-white font-semibold">
            60d
          </span>
          <span className="px-2 py-0.5 text-slate-400">90d</span>
          <span className="px-2 py-0.5 text-slate-400">Max</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32 overflow-visible">
        {/* Horizontal dashed grid lines */}
        {[0.2, 0.5, 0.8].map((ratio, idx) => {
          const y = height * ratio;
          const labelVal = Math.round(max - ratio * range);
          return (
            <g key={idx}>
              <line
                x1="45"
                y1={y}
                x2={width - 10}
                y2={y}
                stroke="rgba(255,255,255,0.07)"
                strokeDasharray="3 3"
              />
              <text
                x="4"
                y={y + 3}
                fill="#64748b"
                fontSize="10"
                fontFamily="monospace"
              >
                ${labelVal}
              </text>
            </g>
          );
        })}

        {/* Amazon Price Line (Emerald) */}
        <polyline
          fill="none"
          stroke="#34d399"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />

        {/* Baseline Comparison Line (Sky Blue) */}
        <line
          x1="45"
          y1={height - 28}
          x2={width - 15}
          y2={height - 28}
          stroke="#38bdf8"
          strokeWidth="1.5"
          strokeOpacity="0.65"
        />
      </svg>
    </div>
  );
}

export default function InspectorModal({
  modalState, // { mode: 'closed' | 'picker' | 'details' | 'manifest', category: 'cpu', item: null }
  onClose,
  onSelectPartForBuild,
  onOpenPartDetails,
  onBackToPicker,
  build,
  totalPrice,
  totalWattage,
  stats,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [compatFilter, setCompatFilter] = useState(true);
  const [maxPriceFilter, setMaxPriceFilter] = useState(3000);
  const [copied, setCopied] = useState(false);

  const isOpen = modalState?.mode && modalState.mode !== 'closed';
  const activeCategory = modalState?.category || 'cpu';
  const categoryMeta =
    HARDWARE_CATEGORIES.find((c) => c.id === activeCategory) ||
    HARDWARE_CATEGORIES[0];

  const allCategoryParts = useMemo(
    () => HARDWARE_CATALOG[activeCategory] || [],
    [activeCategory]
  );

  // Unique brands for left filter sidebar
  const availableBrands = useMemo(() => {
    const set = new Set(allCategoryParts.map((p) => p.brand));
    return ['ALL', ...Array.from(set)];
  }, [allCategoryParts]);

  // Filtered products
  const filteredParts = useMemo(() => {
    return allCategoryParts.filter((part) => {
      if (
        searchQuery &&
        !part.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !part.brand.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (selectedBrand !== 'ALL' && part.brand !== selectedBrand) {
        return false;
      }
      if (part.price > maxPriceFilter) {
        return false;
      }
      return true;
    });
  }, [allCategoryParts, searchQuery, selectedBrand, maxPriceFilter]);

  if (!isOpen) return null;

  // =========================================================================
  // MODE 1: BUILDCORES PART PICKER CATALOG MODAL (Screenshot 1)
  // =========================================================================
  if (modalState.mode === 'picker') {
    const currentlyEquipped = build[activeCategory];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
        <div className="relative w-full max-w-6xl h-[88vh] rounded-2xl bg-[#111318] border border-white/[0.1] shadow-[0_24px_90px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-slate-100">
          {/* Modal Top Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#14171d]">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-base font-bold text-white">
                {categoryMeta.label} Select
              </h2>
              <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-xs text-slate-400">
                {categoryMeta.ptLabel}
              </span>
            </div>

            {/* Category Quick Switcher Pills inside Modal */}
            <div className="hidden lg:flex items-center gap-1">
              {HARDWARE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedBrand('ALL');
                    onBackToPicker(cat.id);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                    cat.id === activeCategory
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="rounded-lg bg-white/[0.05] hover:bg-white/[0.12] p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Modal Body: Left Filter Column + Right Product Card Grid */}
          <div className="flex-1 flex overflow-hidden">
            {/* LEFT FILTER SIDEBAR (BuildCores Style) */}
            <div className="hidden md:flex w-64 shrink-0 border-r border-white/[0.08] bg-[#0e1015] p-4 flex-col gap-5 overflow-y-auto">
              {/* Part List Mini Summary Box */}
              <div className="rounded-xl bg-[#161920] border border-white/[0.08] p-3.5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
                  <span>PART LIST SUMMARY</span>
                </div>

                <label className="flex items-center gap-2 rounded-lg bg-[#111318] border border-white/[0.07] px-2.5 py-1.5 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={compatFilter}
                    onChange={(e) => setCompatFilter(e.target.checked)}
                    className="accent-rose-500"
                  />
                  <span>Compatibility Filter</span>
                </label>

                <div className="grid grid-cols-3 gap-1 pt-1 border-t border-white/[0.07] text-center">
                  <div>
                    <span className="block text-[9px] font-mono-tech text-slate-400">
                      PARTS
                    </span>
                    <span className="font-mono-tech text-xs font-bold text-white">
                      9
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-mono-tech text-slate-400">
                      SETUP PRICE
                    </span>
                    <span className="font-mono-tech text-xs font-bold text-emerald-400">
                      ${Math.round(totalPrice)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-mono-tech text-slate-400">
                      WATTAGE
                    </span>
                    <span className="font-mono-tech text-xs font-bold text-amber-400">
                      {totalWattage}W
                    </span>
                  </div>
                </div>
              </div>

              {/* Filters Header */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters
                </span>
                <button
                  onClick={() => {
                    setSelectedBrand('ALL');
                    setMaxPriceFilter(3000);
                    setSearchQuery('');
                  }}
                  className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
                >
                  Reset All
                </button>
              </div>

              {/* In Stock Pill */}
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  In Stock Only
                </span>
              </div>

              {/* Max Price Range Filter */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Max Price</span>
                  <span className="font-mono-tech text-slate-200">
                    ${maxPriceFilter}
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2500"
                  step="50"
                  value={maxPriceFilter}
                  onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] font-mono-tech text-slate-500">
                  <span>$50.00</span>
                  <span>$2,500.00</span>
                </div>
              </div>

              {/* Manufacturer Filter */}
              <div className="space-y-2">
                <span className="block text-xs font-medium text-slate-300">
                  Manufacturer
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {availableBrands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => setSelectedBrand(brand)}
                      className={`rounded-lg py-2 px-2 text-xs font-semibold border transition cursor-pointer ${
                        selectedBrand === brand
                          ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                          : 'bg-[#161920] border-white/[0.07] text-slate-300 hover:bg-[#1c2029]'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT PRODUCT GRID AREA */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#111318]">
              {/* Top Bar: Showing count + Search Input */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3.5 border-b border-white/[0.07]">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Showing {filteredParts.length} compatible products
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Click any product photo to inspect full specs &amp; price history, or click &ldquo;+ Add to build&rdquo; to install in 3D
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className=" absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${categoryMeta.label}...`}
                    className="w-full rounded-lg bg-[#181b22] border border-white/[0.1] pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              {/* Product Cards Grid (BuildCores White-Box Studio Photos) */}
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start">
                {filteredParts.map((part) => {
                  const isEquipped = currentlyEquipped?.id === part.id;
                  const photoUrl = getHardwareProductPhoto(activeCategory, part);
                  const specEntries = Object.entries(part.specs || {}).slice(0, 2);

                  return (
                    <div
                      key={part.id}
                      className={`flex flex-col rounded-xl bg-[#161920] border transition overflow-hidden ${
                        isEquipped
                          ? 'border-emerald-400/70 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                          : 'border-white/[0.08] hover:border-white/[0.2]'
                      }`}
                    >
                      {/* White Studio Photo Box */}
                      <button
                        onClick={() => onOpenPartDetails(activeCategory, part)}
                        className="relative h-40 w-full bg-white p-3 flex items-center justify-center cursor-pointer group overflow-hidden"
                      >
                        <img
                          src={photoUrl}
                          alt={part.name}
                          className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                        {isEquipped && (
                          <span className="absolute top-2 right-2 rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                            INSTALLED IN 3D
                          </span>
                        )}
                      </button>

                      {/* Card Body */}
                      <div className="flex-1 p-3.5 flex flex-col">
                        <button
                          onClick={() => onOpenPartDetails(activeCategory, part)}
                          className="text-left font-display text-xs font-bold text-white hover:text-sky-400 line-clamp-2 cursor-pointer"
                        >
                          {part.name}
                        </button>

                        <span className="mt-1 font-mono-tech text-xs font-bold text-emerald-400">
                          ${part.price.toFixed(2)}
                        </span>

                        {/* Key Technical Specs */}
                        <div className="mt-2.5 space-y-1.5 border-t border-white/[0.07] pt-2 text-[11px]">
                          {specEntries.map(([k, v]) => (
                            <div key={k}>
                              <span className="block text-[10px] text-slate-400">
                                {k}
                              </span>
                              <span className="font-medium text-slate-200 truncate block">
                                {v}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Action Button (+ Add to build) */}
                        <div className="mt-auto pt-3">
                          <button
                            onClick={() => {
                              onSelectPartForBuild(activeCategory, part);
                              onClose();
                            }}
                            className={`w-full flex items-center justify-center gap-1.5 rounded-lg py-2 px-3 text-xs font-semibold transition cursor-pointer ${
                              isEquipped
                                ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300'
                                : 'bg-[#222631] hover:bg-sky-500 hover:text-slate-950 text-slate-200 border border-white/[0.08]'
                            }`}
                          >
                            {isEquipped ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                <span>Installed in Rig</span>
                              </>
                            ) : (
                              <>
                                <Plus className="h-3.5 w-3.5" />
                                <span>Add to build</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MODE 2: BUILDCORES PART DETAILS MODAL (Screenshot 2)
  // =========================================================================
  if (modalState.mode === 'details' && modalState.item) {
    const part = modalState.item;
    const photoUrl = getHardwareProductPhoto(activeCategory, part);
    const isEquipped = build[activeCategory]?.id === part.id;
    const specEntries = Object.entries(part.specs || {});

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
        <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl bg-[#111318] border border-white/[0.12] shadow-[0_24px_90px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-slate-100">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#14171d]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onBackToPicker(activeCategory)}
                className="flex items-center gap-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] px-2.5 py-1 text-xs text-slate-300 hover:text-white transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to {categoryMeta.label} List</span>
              </button>
              <span className="font-display text-sm font-bold text-white">
                Part Details
              </span>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg bg-white/[0.05] hover:bg-white/[0.12] p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable Details Body */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Studio Photo + General Specifications Grid */}
            <div className="md:col-span-5 space-y-5">
              <div className="rounded-xl bg-white p-5 flex items-center justify-center border border-white/10 h-60">
                <img
                  src={photoUrl}
                  alt={part.name}
                  className="h-full w-full object-contain"
                />
              </div>

              {/* General Specifications Table */}
              <div className="rounded-xl bg-[#161920] border border-white/[0.08] p-4 space-y-3">
                <h4 className="font-mono-tech text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/[0.08] pb-2">
                  GENERAL SPECIFICATIONS
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {specEntries.map(([label, val]) => (
                    <div key={label} className="border-b border-white/[0.05] pb-2">
                      <span className="block text-[10px] text-slate-400 underline decoration-dotted">
                        {label}
                      </span>
                      <span className="font-semibold text-white mt-0.5 block">
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Title, Highlights, Merchants Table & Price History */}
            <div className="md:col-span-7 space-y-5">
              <div>
                <span className="inline-block rounded bg-white/[0.08] px-2 py-0.5 font-mono-tech text-[10px] uppercase text-slate-300">
                  {categoryMeta.label} • {part.brand}
                </span>
                <h3 className="font-display text-xl font-bold text-white mt-1.5">
                  {part.name}
                </h3>
              </div>

              {/* Highlight Boxes */}
              <div className="grid grid-cols-3 gap-2.5">
                {specEntries.slice(0, 3).map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-xl bg-[#161920] border border-white/[0.08] p-3 text-center"
                  >
                    <span className="block text-[10px] text-slate-400">{k}</span>
                    <span className="font-display text-xs font-bold text-white mt-0.5 block truncate">
                      {v}
                    </span>
                  </div>
                ))}
              </div>

              {/* Best Price & Add to Build CTA */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#161920] border border-white/[0.08] p-4">
                <div>
                  <span className="block text-[10px] text-slate-400">
                    Best Price
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono-tech text-2xl font-bold text-emerald-400">
                      ${part.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400">via Amazon</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectPartForBuild(activeCategory, part);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-[#222631] hover:bg-white/15 border border-white/15 px-3.5 py-2 text-xs font-semibold text-white transition cursor-pointer"
                  >
                    {isEquipped ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-400" />
                        <span>Installed in 3D</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Add to Build</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onSelectPartForBuild(activeCategory, part);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 px-4 py-2 text-xs font-bold text-slate-950 transition cursor-pointer"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    <span>Install &amp; View 3D</span>
                  </button>
                </div>
              </div>

              {/* Merchants Comparison Table */}
              <div className="rounded-xl bg-[#161920] border border-white/[0.08] overflow-hidden">
                <div className="grid grid-cols-12 px-4 py-2 bg-[#0e1015] border-b border-white/[0.07] text-[10px] font-mono-tech uppercase text-slate-400">
                  <span className="col-span-4">MERCHANT</span>
                  <span className="col-span-3">SHIPPING</span>
                  <span className="col-span-2">AVAILABILITY</span>
                  <span className="col-span-3 text-right">TOTAL</span>
                </div>

                <div className="divide-y divide-white/[0.06] text-xs">
                  {(part.merchants || []).map((m, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 items-center px-4 py-2.5"
                    >
                      <span className="col-span-4 font-bold text-white">
                        {m.name}
                      </span>
                      <span className="col-span-3 text-slate-400 text-[11px]">
                        {m.shipping}
                      </span>
                      <span className="col-span-2">
                        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] text-emerald-300">
                          {m.stock}
                        </span>
                      </span>
                      <div className="col-span-3 flex items-center justify-end gap-2">
                        <span className="font-mono-tech font-bold text-emerald-400">
                          ${m.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => {
                            onSelectPartForBuild(activeCategory, part);
                            onClose();
                          }}
                          className="rounded bg-sky-500 hover:bg-sky-400 px-2.5 py-1 text-[10px] font-bold text-slate-950 cursor-pointer"
                        >
                          Use
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price History Chart */}
              <PriceHistoryChart history={part.priceHistory} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MODE 3: FULL BUILD EXPORT & SPECS SHEET MODAL
  // =========================================================================
  const buildManifestText = `=== VOXELCORES 3D — COMPLETE PC BUILD SPECIFICATION ===
${HARDWARE_CATEGORIES.map((c) => `• ${c.label}: ${build[c.id].name} ($${build[c.id].price.toFixed(2)})`).join('\n')}
-------------------------------------------------------
• Estimated Wattage: ${totalWattage}W / ${build.psu.capacityW}W PSU
• Total Build Price: $${totalPrice.toFixed(2)}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(buildManifestText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[88vh] rounded-2xl bg-[#111318] border border-white/[0.12] p-6 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div>
            <h3 className="font-display text-base font-bold text-white">
              Complete 3D PC Build Specification &amp; Export
            </h3>
            <p className="text-xs text-slate-400">
              All 9 selected hardware components • {stats.fps} FPS WebGL Engine ({stats.triangles.toLocaleString()} Triangles)
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-white/[0.06] hover:bg-white/[0.12] p-1.5 text-slate-300 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto my-4 space-y-4">
          <div className="rounded-xl bg-[#161920] border border-white/[0.08] divide-y divide-white/[0.06] text-xs">
            {HARDWARE_CATEGORIES.map((cat) => {
              const item = build[cat.id];
              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between px-4 py-2.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-24 shrink-0 font-mono-tech text-[10px] uppercase text-slate-400">
                      {cat.label}
                    </span>
                    <button
                      onClick={() => onOpenPartDetails(cat.id, item)}
                      className="font-semibold text-white hover:text-sky-400 truncate flex items-center gap-1 cursor-pointer"
                    >
                      <span>{item.name}</span>
                      <ExternalLink className="h-3 w-3 text-slate-500" />
                    </button>
                  </div>
                  <span className="font-mono-tech font-bold text-emerald-400 shrink-0 ml-2">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl bg-[#0e1015] border border-white/[0.08] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-[#161920] border-b border-white/[0.07]">
              <span className="font-mono-tech text-[11px] text-slate-300">
                Markdown / Reddit / Part List Export
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 px-3 py-1 text-xs font-bold text-slate-950 transition cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Build List'}</span>
              </button>
            </div>
            <pre className="p-4 text-[11px] font-mono-tech text-slate-300 overflow-x-auto">
              <code>{buildManifestText}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
