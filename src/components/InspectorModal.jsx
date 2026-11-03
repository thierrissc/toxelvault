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
  AlertTriangle,
  ExternalLink,
  FolderOpen,
} from 'lucide-react';
import {
  HARDWARE_CATEGORIES,
  HARDWARE_CATALOG,
  validateBuildCompatibility,
} from '../utils/textureGenerator';

export default function InspectorModal({
  modalState, // { mode: 'closed' | 'picker' | 'details' | 'manifest', category: 'cpu', item: null }
  onClose,
  onSelectPartForBuild,
  onOpenPartDetails,
  onBackToPicker,
  build,
  totalPrice,
  stats,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [compatFilter, setCompatFilter] = useState(false);
  const [maxPriceFilter, setMaxPriceFilter] = useState(2500);
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

  const availableBrands = useMemo(() => {
    const set = new Set(allCategoryParts.map((p) => p.brand));
    return ['ALL', ...Array.from(set)];
  }, [allCategoryParts]);

  // Check if a candidate part is socket-compatible with the current build
  const isPartCompatibleWithBuild = (part) => {
    if (part.category === 'cpu' && build.motherboard?.specs?.socket) {
      return part.specs?.socket === build.motherboard.specs.socket;
    }
    if (part.category === 'motherboard' && build.cpu?.specs?.socket) {
      return part.specs?.socket === build.cpu.specs.socket;
    }
    if (part.category === 'gpu' && build.case?.specs?.maxGpuLengthMm) {
      return (part.specs?.lengthMm || 0) <= build.case.specs.maxGpuLengthMm;
    }
    return true;
  };

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
      if (compatFilter && !isPartCompatibleWithBuild(part)) {
        return false;
      }
      return true;
    });
  }, [allCategoryParts, searchQuery, selectedBrand, maxPriceFilter, compatFilter, build]);

  if (!isOpen) return null;

  const compatibility = validateBuildCompatibility(build);

  // =========================================================================
  // MODE 1: PART PICKER MODAL (Reads realPhotoUrl, model3dPath & specs from partsCatalog.json)
  // =========================================================================
  if (modalState.mode === 'picker') {
    const currentlyEquipped = build[activeCategory];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
        <div className="relative w-full max-w-6xl h-[88vh] rounded-2xl bg-[#111318] border border-white/[0.1] shadow-[0_24px_90px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-slate-100">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#14171d]">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-base font-bold text-white">
                {categoryMeta.label}
              </h2>
              <span className="rounded-md bg-white/[0.06] px-2 py-0.5 font-mono-tech text-xs text-sky-400">
                Socket: {categoryMeta.socketTarget}
              </span>
            </div>

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
                  {cat.id.toUpperCase()}
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

          <div className="flex-1 flex overflow-hidden">
            {/* LEFT FILTER SIDEBAR */}
            <div className="hidden md:flex w-64 shrink-0 border-r border-white/[0.08] bg-[#0e1015] p-4 flex-col gap-5 overflow-y-auto">
              <div className="rounded-xl bg-[#161920] border border-white/[0.08] p-3.5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
                  <span>COMPATIBILITY FILTER</span>
                </div>

                <label className="flex items-center gap-2 rounded-lg bg-[#111318] border border-white/[0.07] px-2.5 py-2 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={compatFilter}
                    onChange={(e) => setCompatFilter(e.target.checked)}
                    className="accent-rose-500"
                  />
                  <span>Only Compatible Sockets</span>
                </label>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.07] text-center">
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
                      TOTAL TDP
                    </span>
                    <span className="font-mono-tech text-xs font-bold text-amber-400">
                      {compatibility.totalTdp}W
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters
                </span>
                <button
                  onClick={() => {
                    setSelectedBrand('ALL');
                    setMaxPriceFilter(2500);
                    setCompatFilter(false);
                    setSearchQuery('');
                  }}
                  className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
                >
                  Reset
                </button>
              </div>

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
              </div>

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

            {/* RIGHT PRODUCT CARDS GRID */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#111318]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3.5 border-b border-white/[0.07]">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Showing {filteredParts.length} real hardware models from partsCatalog.json
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Selecting a part loads its <code className="text-amber-300">model3dPath</code> into socket <code className="text-sky-300">{categoryMeta.socketTarget}</code>
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search model or brand..."
                    className="w-full rounded-lg bg-[#181b22] border border-white/[0.1] pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
                {filteredParts.map((part) => {
                  const isEquipped = currentlyEquipped?.id === part.id;
                  const compat = isPartCompatibleWithBuild(part);
                  const specEntries = Object.entries(part.specs || {}).slice(0, 4);

                  return (
                    <div
                      key={part.id}
                      className={`flex flex-col rounded-xl bg-[#161920] border transition overflow-hidden ${
                        isEquipped
                          ? 'border-emerald-400/70 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                          : 'border-white/[0.08] hover:border-white/[0.2]'
                      }`}
                    >
                      {/* Real Product Photo (realPhotoUrl) */}
                      <button
                        onClick={() => onOpenPartDetails(activeCategory, part)}
                        className="relative h-44 w-full bg-white flex items-center justify-center cursor-pointer group overflow-hidden"
                      >
                        <img
                          src={part.realPhotoUrl}
                          alt={part.name}
                          loading="lazy"
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {isEquipped && (
                          <span className="absolute top-2 right-2 rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                            MOUNTED
                          </span>
                        )}
                        {!compat && (
                          <span className="absolute top-2 left-2 rounded bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white shadow flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Socket Mismatch
                          </span>
                        )}
                      </button>

                      {/* Card Body */}
                      <div className="flex-1 p-4 flex flex-col">
                        <button
                          onClick={() => onOpenPartDetails(activeCategory, part)}
                          className="text-left font-display text-xs font-bold text-white hover:text-sky-400 line-clamp-2 cursor-pointer"
                        >
                          {part.name}
                        </button>

                        <div className="flex items-center justify-between mt-1">
                          <span className="font-mono-tech text-xs font-bold text-emerald-400">
                            ${part.price.toFixed(2)}
                          </span>
                          <span className="font-mono-tech text-[10px] text-amber-300 truncate max-w-[160px]">
                            {part.model3dPath}
                          </span>
                        </div>

                        <div className="mt-2.5 space-y-1 border-t border-white/[0.07] pt-2 text-[11px]">
                          {specEntries.map(([k, v]) => (
                            <div key={k} className="flex justify-between gap-2">
                              <span className="text-slate-400 capitalize">{k}:</span>
                              <span className="font-mono-tech text-slate-200 truncate">
                                {Array.isArray(v) ? v.join(', ') : String(v)}
                              </span>
                            </div>
                          ))}
                        </div>

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
                                <span>Installed in Socket</span>
                              </>
                            ) : (
                              <>
                                <Plus className="h-3.5 w-3.5" />
                                <span>Load .GLB into Socket</span>
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
  // MODE 2: PART DETAILS MODAL (Real Photo, Specs, Model3dPath & MountOffset)
  // =========================================================================
  if (modalState.mode === 'details' && modalState.item) {
    const part = modalState.item;
    const isEquipped = build[activeCategory]?.id === part.id;
    const specEntries = Object.entries(part.specs || {});

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
        <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl bg-[#111318] border border-white/[0.12] shadow-[0_24px_90px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-slate-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#14171d]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onBackToPicker(activeCategory)}
                className="flex items-center gap-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] px-2.5 py-1 text-xs text-slate-300 hover:text-white transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Catalog</span>
              </button>
              <span className="font-display text-sm font-bold text-white">
                Hardware Technical Sheet
              </span>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg bg-white/[0.05] hover:bg-white/[0.12] p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5 space-y-4">
              <div className="rounded-xl bg-white overflow-hidden border border-white/10 h-60 flex items-center justify-center">
                <img
                  src={part.realPhotoUrl}
                  alt={part.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* 3D Asset & Socket Path Box */}
              <div className="rounded-xl bg-[#161920] border border-amber-500/30 p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-300 font-mono-tech font-bold">
                  <FolderOpen className="h-4 w-4" />
                  <span>3D GLTF / GLB ASSET CONFIG</span>
                </div>
                <div className="font-mono-tech text-[11px] space-y-1 text-slate-300">
                  <p>
                    <span className="text-slate-500">model3dPath:</span>{' '}
                    <span className="text-amber-300">/public{part.model3dPath}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">mountOffset.position:</span>{' '}
                    [{part.mountOffset.position.join(', ')}]
                  </p>
                  <p>
                    <span className="text-slate-500">mountOffset.scale:</span> [
                    {part.mountOffset.scale.join(', ')}]
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 space-y-5">
              <div>
                <span className="inline-block rounded bg-white/[0.08] px-2 py-0.5 font-mono-tech text-[10px] uppercase text-slate-300">
                  {part.category.toUpperCase()} • {part.brand} • ID: {part.id}
                </span>
                <h3 className="font-display text-xl font-bold text-white mt-1.5">
                  {part.name}
                </h3>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#161920] border border-white/[0.08] p-4">
                <div>
                  <span className="block text-[10px] text-slate-400">
                    Market Price
                  </span>
                  <span className="font-mono-tech text-2xl font-bold text-emerald-400">
                    ${part.price.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => {
                    onSelectPartForBuild(activeCategory, part);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition cursor-pointer"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span>
                    {isEquipped ? 'Mounted in 3D Socket' : 'Mount in 3D Socket'}
                  </span>
                </button>
              </div>

              {/* True Specifications Grid */}
              <div className="rounded-xl bg-[#161920] border border-white/[0.08] p-4 space-y-3">
                <h4 className="font-mono-tech text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/[0.08] pb-2">
                  TRUE TECHNICAL SPECIFICATIONS (partsCatalog.json)
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {specEntries.map(([label, val]) => (
                    <div key={label} className="border-b border-white/[0.05] pb-2">
                      <span className="block text-[10px] text-slate-400 uppercase font-mono-tech">
                        {label}
                      </span>
                      <span className="font-semibold text-white mt-0.5 block">
                        {Array.isArray(val) ? val.join(', ') : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Merchants Table */}
              <div className="rounded-xl bg-[#161920] border border-white/[0.08] overflow-hidden">
                <div className="grid grid-cols-12 px-4 py-2 bg-[#0e1015] border-b border-white/[0.07] text-[10px] font-mono-tech uppercase text-slate-400">
                  <span className="col-span-5">MERCHANT</span>
                  <span className="col-span-3">SHIPPING</span>
                  <span className="col-span-4 text-right">PRICE</span>
                </div>
                <div className="divide-y divide-white/[0.06] text-xs">
                  {(part.merchants || []).map((m, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 items-center px-4 py-2.5"
                    >
                      <span className="col-span-5 font-bold text-white">
                        {m.name}
                      </span>
                      <span className="col-span-3 text-slate-400 text-[11px]">
                        {m.shipping}
                      </span>
                      <span className="col-span-4 text-right font-mono-tech font-bold text-emerald-400">
                        ${m.price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MODE 3: FULL BUILD JSON & MISSING .GLB PATHS MANIFEST
  // =========================================================================
  const buildManifestJson = JSON.stringify(
    Object.fromEntries(
      HARDWARE_CATEGORIES.map((c) => [
        c.id,
        {
          id: build[c.id].id,
          name: build[c.id].name,
          socketTarget: c.socketTarget,
          model3dPath: `/public${build[c.id].model3dPath}`,
          specs: build[c.id].specs,
        },
      ])
    ),
    null,
    2
  );

  const handleCopy = () => {
    navigator.clipboard?.writeText(buildManifestJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[88vh] rounded-2xl bg-[#111318] border border-white/[0.12] p-6 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div>
            <h3 className="font-display text-base font-bold text-white">
              Active 3D Socket Build &amp; Required .GLB Paths
            </h3>
            <p className="text-xs text-slate-400">
              Place your real <code className="text-amber-300">.glb</code> files in the paths listed below or upload them via the right sidebar
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
                  className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-2.5 gap-1"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-28 shrink-0 font-mono-tech text-[10px] uppercase text-sky-400">
                      [{cat.socketTarget}]
                    </span>
                    <button
                      onClick={() => onOpenPartDetails(cat.id, item)}
                      className="font-semibold text-white hover:text-sky-400 truncate flex items-center gap-1 cursor-pointer"
                    >
                      <span>{item.name}</span>
                      <ExternalLink className="h-3 w-3 text-slate-500" />
                    </button>
                  </div>
                  <span className="font-mono-tech text-[11px] text-amber-300 shrink-0">
                    /public{item.model3dPath}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl bg-[#0e1015] border border-white/[0.08] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-[#161920] border-b border-white/[0.07]">
              <span className="font-mono-tech text-[11px] text-slate-300">
                Active Socket &amp; GLTF Configuration JSON
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 px-3 py-1 text-xs font-bold text-slate-950 transition cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="p-4 text-[11px] font-mono-tech text-slate-300 overflow-x-auto">
              <code>{buildManifestJson}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
