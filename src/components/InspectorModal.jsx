import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Check,
  Plus,
  ArrowLeft,
  ShoppingCart,
  SlidersHorizontal,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Sparkles,
  ShieldCheck,
  Zap,
  Cpu,
  Monitor,
  DollarSign,
  Box,
  ArrowUpDown,
} from 'lucide-react';
import {
  HARDWARE_CATEGORIES,
  HARDWARE_CATALOG,
  CURRENCIES,
  formatCurrency,
  validateBuildCompatibility,
  recommendOptimalBuild,
} from '../utils/textureGenerator';
import {
  resolveRealProductPhoto,
  REAL_PRODUCT_IMAGE_DICTIONARY,
} from '../utils/hardwareCatalogAdapter';

const PAGE_SIZE = 25;

const BUILD_OBJECTIVES = [
  {
    id: '1080p',
    label: 'Custo-Benefício 1080p',
    subtitle: 'Jogos competitivos em Full HD com alto FPS e ótimo custo',
    recommendedBudget: 1350,
    icon: Monitor,
  },
  {
    id: '1440p',
    label: 'Gamer 1440p Ultra',
    subtitle: 'Quad HD no Ultra com Ray Tracing e zero gargalo entre CPU e GPU',
    recommendedBudget: 2250,
    icon: Cpu,
  },
  {
    id: '4k',
    label: 'Estação 4K / High-End',
    subtitle: 'Desempenho extremo em 4K, renderização 3D e multitarefa pesada',
    recommendedBudget: 3400,
    icon: Sparkles,
  },
];

const FEATURED_MANUFACTURERS = [
  'ASUS',
  'Gigabyte',
  'MSI',
  'ASRock',
  'Corsair',
  'NZXT',
  'Lian Li',
  'HYTE',
];

const FORM_FACTORS = ['ATX', 'Micro-ATX', 'Mini-ITX'];

function BrandWordmark({ brand }) {
  const upper = String(brand || '').toUpperCase();
  if (upper === 'ASUS') {
    return (
      <span className="font-display font-black tracking-[0.18em] text-[#2884f6] text-xs italic">
        ASUS
      </span>
    );
  }
  if (upper === 'GIGABYTE') {
    return (
      <div className="flex flex-col items-center leading-none">
        <span className="font-display font-black text-[#1d9bf0] text-sm tracking-tight">
          G
        </span>
        <span className="font-display font-bold text-[#38bdf8] text-[9px] tracking-[0.14em] mt-0.5">
          GIGABYTE
        </span>
      </div>
    );
  }
  if (upper === 'MSI') {
    return (
      <div className="flex items-center gap-1">
        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#ef4444]" />
        <span className="font-display font-black tracking-wider text-white text-xs italic">
          msi
        </span>
      </div>
    );
  }
  if (upper === 'ASROCK') {
    return (
      <span className="font-display font-black tracking-wider text-[#84cc16] text-xs">
        ASRock
      </span>
    );
  }
  if (upper === 'HYTE') {
    return (
      <span className="font-display font-black tracking-[0.22em] text-[#facc15] text-xs">
        HYTE
      </span>
    );
  }
  if (upper === 'NZXT') {
    return (
      <span className="font-display font-black tracking-[0.2em] text-[#a855f7] text-xs">
        NZXT
      </span>
    );
  }
  if (upper === 'CORSAIR') {
    return (
      <span className="font-display font-bold tracking-[0.14em] text-[#facc15] text-[11px]">
        CORSAIR
      </span>
    );
  }
  if (upper === 'LIAN LI') {
    return (
      <span className="font-display font-bold tracking-[0.14em] text-[#60a5fa] text-[11px]">
        LIAN LI
      </span>
    );
  }
  return (
    <span className="font-display font-bold text-slate-200 text-[11px] truncate px-1">
      {brand}
    </span>
  );
}

function getTwoCardSpecs(part, category) {
  const s = part?.specs || {};
  if (category === 'motherboard') {
    return [
      { label: 'Socket', value: s.socket || 'AM5' },
      { label: 'Form Factor', value: s.formFactor || 'ATX' },
    ];
  }
  if (category === 'cpu') {
    return [
      { label: 'Socket', value: s.socket || 'AM5' },
      { label: 'Cores / Boost', value: `${s.cores || 8}C • ${s.boostClock || '5.0 GHz'}` },
    ];
  }
  if (category === 'gpu') {
    return [
      { label: 'VRAM', value: s.vram || '16GB GDDR6X' },
      { label: 'Length', value: `${s.lengthMm || 310}mm` },
    ];
  }
  if (category === 'ram') {
    return [
      { label: 'Capacity', value: `${s.capacityGb || 32}GB (${s.modules || '2x16GB'})` },
      { label: 'Speed', value: `${s.type || 'DDR5'} ${s.speedMhz || 6000}MHz` },
    ];
  }
  if (category === 'cooler') {
    return [
      { label: 'Radiator / Type', value: s.radiator || s.type || '360mm AIO' },
      { label: 'TDP Rating', value: `${s.tdpRating || 280}W` },
    ];
  }
  if (category === 'storage') {
    return [
      { label: 'Capacity', value: s.capacity || '2TB' },
      { label: 'Interface', value: s.interface || 'PCIe 4.0 x4' },
    ];
  }
  if (category === 'psu') {
    return [
      { label: 'Wattage', value: `${s.wattage || 850}W` },
      { label: 'Rating', value: s.efficiency || '80+ Gold' },
    ];
  }
  if (category === 'case') {
    return [
      { label: 'Form Factor', value: s.formFactor || 'ATX Dual-Chamber' },
      { label: 'Max GPU Length', value: `${s.maxGpuLengthMm || 400}mm` },
    ];
  }
  const entries = Object.entries(s).slice(0, 2);
  return [
    { label: entries[0]?.[0] || 'Spec', value: String(entries[0]?.[1] || 'Padrão') },
    { label: entries[1]?.[0] || 'Type', value: String(entries[1]?.[1] || '3D Ready') },
  ];
}

function CleanModalImage({ part, className = 'h-full w-full' }) {
  const src = resolveRealProductPhoto(part);
  const categoryFallback =
    REAL_PRODUCT_IMAGE_DICTIONARY.byCategory[part?.category] ||
    REAL_PRODUCT_IMAGE_DICTIONARY.byCategory.gpu;

  return (
    <img
      src={src}
      onError={(e) => {
        if (e.currentTarget.src !== categoryFallback) {
          e.currentTarget.src = categoryFallback;
        }
      }}
      alt={part?.name || 'Produto'}
      loading="lazy"
      style={{
        objectFit: 'contain',
        objectPosition: 'center',
        backgroundColor: '#ffffff',
      }}
      className={className}
    />
  );
}

export default function InspectorModal({
  modalState,
  catalogByCategory = HARDWARE_CATALOG,
  onClose,
  onSelectPartForBuild,
  onRemovePartFromBuild,
  onApplyRecommendedBuild,
  onOpenPartDetails,
  onBackToPicker,
  build,
  totalPrice,
  currency = 'BRL',
  setCurrency,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [selectedFormFactor, setSelectedFormFactor] = useState('ALL');
  const [compatFilter, setCompatFilter] = useState(true);
  const [only3DFilter, setOnly3DFilter] = useState(true);
  const [inStockFilter, setInStockFilter] = useState(true);
  const [minPriceFilter, setMinPriceFilter] = useState(0);
  const [maxPriceFilter, setMaxPriceFilter] = useState(3000);
  const [sortBy, setSortBy] = useState('featured');
  const [page, setPage] = useState(1);

  const [assistantObjective, setAssistantObjective] = useState('1440p');
  const [assistantBudget, setAssistantBudget] = useState(2350);

  const isOpen = modalState?.mode && modalState.mode !== 'closed';
  const activeCategory = modalState?.category || 'cpu';
  const categoryMeta =
    HARDWARE_CATEGORIES.find((c) => c.id === activeCategory) ||
    HARDWARE_CATEGORIES[0];

  const allCategoryParts = useMemo(
    () => catalogByCategory[activeCategory] || HARDWARE_CATALOG[activeCategory] || [],
    [catalogByCategory, activeCategory]
  );

  const equippedPartsCount = useMemo(
    () => Object.values(build || {}).filter(Boolean).length,
    [build]
  );

  const availableBrands = useMemo(() => {
    const counts = new Map();
    allCategoryParts.forEach((p) => {
      if (p.brand) counts.set(p.brand, (counts.get(p.brand) || 0) + 1);
    });
    const ordered = [];
    FEATURED_MANUFACTURERS.forEach((b) => {
      const match = Array.from(counts.keys()).find(
        (k) => k.toLowerCase() === b.toLowerCase()
      );
      if (match) ordered.push(match);
    });
    Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([brand]) => {
        if (!ordered.includes(brand)) ordered.push(brand);
      });
    return ordered.length > 0 ? ordered : FEATURED_MANUFACTURERS;
  }, [allCategoryParts]);

  const displayedBrands = useMemo(
    () => (showAllBrands ? availableBrands.slice(0, 14) : availableBrands.slice(0, 4)),
    [availableBrands, showAllBrands]
  );

  const compatibility = useMemo(() => validateBuildCompatibility(build), [build]);

  const isPartCompatibleWithBuild = React.useCallback(
    (part) => {
      if (!part) return true;

      if (part.category === 'cpu' && build.motherboard?.specs?.socket) {
        return part.specs?.socket === build.motherboard.specs.socket;
      }
      if (part.category === 'motherboard' && build.cpu?.specs?.socket) {
        return part.specs?.socket === build.cpu.specs.socket;
      }
      if (part.category === 'ram' && build.motherboard) {
        const moboRam = String(
          build.motherboard.specs?.memoryType ||
            (build.motherboard.specs?.socket === 'AM5' ? 'DDR5' : 'DDR5')
        ).toUpperCase();
        const ramType = String(part.specs?.type || part.name || '').toUpperCase();
        if (moboRam.includes('DDR5') && ramType.includes('DDR4')) return false;
        if (moboRam.includes('DDR4') && ramType.includes('DDR5')) return false;
      }
      if (part.category === 'gpu' && build.case?.specs?.maxGpuLengthMm) {
        return (part.specs?.lengthMm || 0) <= build.case.specs.maxGpuLengthMm;
      }
      if (part.category === 'case' && build.gpu?.specs?.lengthMm) {
        return (part.specs?.maxGpuLengthMm || 400) >= build.gpu.specs.lengthMm;
      }
      if (part.category === 'psu') {
        const psuW =
          Number(part.specs?.wattage) ||
          parseInt(String(part.specs?.wattage || '750').replace(/\D/g, ''), 10) ||
          750;
        return psuW >= compatibility.recommendedPsuWatts;
      }
      return true;
    },
    [build, compatibility.recommendedPsuWatts]
  );

  const filteredParts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = allCategoryParts.filter((part) => {
      if (q) {
        const specText = Object.values(part.specs || {})
          .join(' ')
          .toLowerCase();
        if (
          !part.name.toLowerCase().includes(q) &&
          !part.brand.toLowerCase().includes(q) &&
          !specText.includes(q)
        ) {
          return false;
        }
      }
      if (
        selectedBrand !== 'ALL' &&
        part.brand?.toLowerCase() !== selectedBrand.toLowerCase()
      ) {
        return false;
      }
      if (selectedFormFactor !== 'ALL') {
        const ff = String(part.specs?.formFactor || part.name || '').toLowerCase();
        const target = selectedFormFactor.toLowerCase().replace('-', ' ');
        const targetHyphen = selectedFormFactor.toLowerCase();
        if (!ff.includes(target) && !ff.includes(targetHyphen)) {
          return false;
        }
      }
      if (part.price < minPriceFilter || part.price > maxPriceFilter) {
        return false;
      }
      if (compatFilter && !isPartCompatibleWithBuild(part)) {
        return false;
      }
      return true;
    });

    if (sortBy === 'price_asc') {
      return [...list].sort((a, b) => (a.price || 0) - (b.price || 0));
    }
    if (sortBy === 'price_desc') {
      return [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
    }
    if (sortBy === 'name_asc') {
      return [...list].sort((a, b) => String(a.name).localeCompare(String(b.name)));
    }
    return list;
  }, [
    allCategoryParts,
    searchQuery,
    selectedBrand,
    selectedFormFactor,
    minPriceFilter,
    maxPriceFilter,
    compatFilter,
    sortBy,
    isPartCompatibleWithBuild,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredParts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedParts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredParts.slice(start, start + PAGE_SIZE);
  }, [filteredParts, currentPage]);

  const recommendation = useMemo(
    () =>
      recommendOptimalBuild(
        catalogByCategory,
        assistantObjective,
        assistantBudget
      ),
    [catalogByCategory, assistantObjective, assistantBudget]
  );

  if (!isOpen) return null;

  if (modalState.mode === 'assistant') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
        <div className="relative w-full max-w-6xl h-[90vh] rounded-2xl bg-[#101217] border border-white/[0.1] shadow-[0_24px_90px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-slate-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#13161d]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.12] text-slate-200">
                <Sparkles className="h-4 w-4 text-slate-200" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-white">
                  Assistente de Compatibilidade e Recomendação
                </h2>
                <p className="text-xs text-slate-400">
                  Verificação física e elétrica em tempo real e recomendação de montagem sem gargalos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xl bg-[#161922] border border-white/[0.1] p-0.5">
                {Object.values(CURRENCIES).map((curr) => (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => setCurrency && setCurrency(curr.code)}
                    className={`rounded-lg px-2 py-1 text-xs font-semibold transition cursor-pointer ${
                      currency === curr.code
                        ? 'bg-white text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {curr.code}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-white/[0.05] hover:bg-white/[0.12] p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="rounded-2xl bg-[#14171f] border border-white/[0.08] p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-slate-200" />
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Diagnóstico da Build Atual em Tempo Real
                    </h3>
                    <p className="text-xs text-slate-400">
                      Validação automática de Socket, Memória RAM, Comprimento da GPU e Potência da Fonte (+30% de margem)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-[#0e1015] border border-white/[0.08] px-3 py-1.5 text-xs">
                    <span className="text-slate-400 mr-1.5">Consumo Total:</span>
                    <span className="font-bold text-white tabular-nums">
                      {compatibility.totalTdp}W
                    </span>
                  </div>
                  <div className="rounded-xl bg-[#0e1015] border border-white/[0.08] px-3 py-1.5 text-xs">
                    <span className="text-slate-400 mr-1.5">Fonte Recomendada (+30%):</span>
                    <span className="font-bold text-white tabular-nums">
                      {compatibility.recommendedPsuWatts}W
                    </span>
                  </div>
                  <div className="rounded-xl bg-[#0e1015] border border-white/[0.08] px-3 py-1.5 text-xs">
                    <span className="text-slate-400 mr-1.5">Fonte Atual:</span>
                    <span className="font-bold text-white tabular-nums">
                      {compatibility.psuWatts}W
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {(compatibility.checks || []).map((chk) => {
                  const isOk = chk.status === 'ok' || chk.ok;
                  return (
                    <div
                      key={chk.id}
                      className={`rounded-xl p-3.5 border ${
                        isOk
                          ? 'bg-[#0e1015] border-white/[0.08]'
                          : 'bg-white/[0.06] border-white/[0.25]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">
                          {chk.label}
                        </span>
                        {isOk ? (
                          <span className="rounded bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-bold text-slate-200">
                            OK
                          </span>
                        ) : (
                          <span className="rounded bg-white text-slate-950 px-1.5 py-0.5 text-[10px] font-bold">
                            CONFLITO
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{chk.detail}</p>
                    </div>
                  );
                })}
              </div>

              {(compatibility.issues.length > 0 ||
                compatibility.warnings.length > 0) && (
                <div className="space-y-2 pt-2 border-t border-white/[0.07]">
                  {compatibility.issues.map((issue, idx) => (
                    <div
                      key={`issue-${idx}`}
                      className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.06] border border-white/[0.16] px-4 py-2.5 text-xs text-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-slate-300 shrink-0" />
                        <span>{issue}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onBackToPicker('motherboard')}
                        className="rounded-lg bg-white hover:bg-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-950 transition cursor-pointer shrink-0"
                      >
                        Corrigir Peça
                      </button>
                    </div>
                  ))}
                  {compatibility.warnings.map((warn, idx) => (
                    <div
                      key={`warn-${idx}`}
                      className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.05] border border-white/[0.12] px-4 py-2.5 text-xs text-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-slate-300 shrink-0" />
                        <span>{warn}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onBackToPicker('psu')}
                        className="rounded-lg bg-white hover:bg-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-950 transition cursor-pointer shrink-0"
                      >
                        Trocar Fonte
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-[#14171f] border border-white/[0.08] p-5 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.07] border border-white/[0.12] px-2.5 py-0.5 text-[11px] font-semibold text-slate-200 mb-1.5">
                    <Sparkles className="h-3 w-3 text-slate-300" />
                    MONTAR PARA MIM
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Recomendação Automática de Build Ideal
                  </h3>
                  <p className="text-xs text-slate-400">
                    Escolha o objetivo de uso e seu orçamento máximo para preencher o PC 3D com a combinação mais equilibrada
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onApplyRecommendedBuild && recommendation?.build) {
                      onApplyRecommendedBuild(recommendation.build);
                      onClose();
                    }
                  }}
                  className="flex items-center gap-2 rounded-xl bg-white hover:bg-slate-200 px-5 py-3 text-xs font-semibold text-slate-950 shadow-sm transition cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-slate-950" />
                  <span>
                    Aplicar Build no PC 3D ({formatCurrency(recommendation.totalPrice, currency)})
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {BUILD_OBJECTIVES.map((obj) => {
                  const IconComp = obj.icon;
                  const active = assistantObjective === obj.id;
                  return (
                    <button
                      key={obj.id}
                      type="button"
                      onClick={() => {
                        setAssistantObjective(obj.id);
                        setAssistantBudget(obj.recommendedBudget);
                      }}
                      className={`text-left rounded-xl p-4 border transition cursor-pointer ${
                        active
                          ? 'bg-white/[0.1] border-white/[0.28]'
                          : 'bg-[#0e1015] border-white/[0.08] hover:border-white/[0.18]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${
                            active
                              ? 'bg-white text-slate-950'
                              : 'bg-white/[0.06] text-slate-300'
                          }`}
                        >
                          <IconComp className="h-4 w-4" />
                        </span>
                        <span className="text-xs font-semibold text-slate-300 tabular-nums">
                          Alvo ~{formatCurrency(obj.recommendedBudget, currency, { decimals: 0 })}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white">
                        {obj.label}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {obj.subtitle}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-xl bg-[#0e1015] border border-white/[0.08] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-slate-300" />
                      Orçamento Máximo Desejado
                    </span>
                    <span className="text-sm font-bold text-white tabular-nums">
                      {formatCurrency(assistantBudget, currency, { decimals: 0 })}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="900"
                    max="4200"
                    step="50"
                    value={assistantBudget}
                    onChange={(e) => setAssistantBudget(Number(e.target.value))}
                    className="w-full accent-white"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>{formatCurrency(900, currency, { decimals: 0 })} (Entrada)</span>
                    <span>{formatCurrency(2200, currency, { decimals: 0 })} (1440p Ultra)</span>
                    <span>{formatCurrency(4200, currency, { decimals: 0 })} (4K Entusiasta)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 border-t sm:border-t-0 sm:border-l border-white/[0.08] pt-3 sm:pt-0 sm:pl-4">
                  <div>
                    <span className="block text-[10px] text-slate-400">
                      Total da Recomendação
                    </span>
                    <span className="text-lg font-bold text-[#4ade80] tabular-nums">
                      {formatCurrency(recommendation.totalPrice, currency)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400">
                      Status de Gargalo
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-white/[0.08] border border-white/[0.15] px-2 py-0.5 text-xs font-semibold text-white">
                      <Check className="h-3 w-3 text-slate-200" />
                      100% Compatível
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {HARDWARE_CATEGORIES.map((cat) => {
                  const recPart = recommendation.build[cat.id];
                  if (!recPart) return null;
                  return (
                    <div
                      key={cat.id}
                      className="flex items-center gap-3 rounded-xl bg-[#0e1015] border border-white/[0.08] p-3"
                    >
                      <div
                        style={{ backgroundColor: '#ffffff' }}
                        className="h-14 w-14 shrink-0 rounded-lg p-1.5 overflow-hidden flex items-center justify-center"
                      >
                        <CleanModalImage part={recPart} className="h-full w-full" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          {cat.label}
                        </span>
                        <p className="text-xs font-bold text-white truncate" title={recPart.name}>
                          {recPart.name}
                        </p>
                        <span className="text-xs font-bold text-[#4ade80] tabular-nums">
                          {formatCurrency(recPart.price, currency)}
                        </span>
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

  if (modalState.mode === 'picker') {
    const currentlyEquipped = build[activeCategory];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/85 backdrop-blur-sm">
        <div className="relative w-full max-w-[1440px] h-[92vh] rounded-2xl bg-[#0b0d12] border border-white/[0.1] shadow-[0_28px_100px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-slate-100">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-[#101218]">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-base font-bold text-white">
                Escolher {categoryMeta.label}
              </h2>
            </div>

            <div className="hidden xl:flex items-center gap-1">
              {HARDWARE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedBrand('ALL');
                    setSelectedFormFactor('ALL');
                    setPage(1);
                    onBackToPicker(cat.id);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                    cat.id === activeCategory
                      ? 'bg-white text-slate-950 font-semibold'
                      : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xl bg-[#161922] border border-white/[0.1] p-0.5">
                {Object.values(CURRENCIES).map((curr) => (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => setCurrency && setCurrency(curr.code)}
                    className={`rounded-lg px-2 py-1 text-xs font-semibold transition cursor-pointer ${
                      currency === curr.code
                        ? 'bg-white text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {curr.code}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-white/[0.05] hover:bg-white/[0.12] p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="hidden md:flex w-[260px] shrink-0 border-r border-white/[0.08] bg-[#0e1016] p-4 flex-col gap-4 overflow-y-auto">
              <div className="rounded-xl bg-[#14161e] border border-white/[0.08] p-3.5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#d926a9] text-white">
                    <Box className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold tracking-wider uppercase text-white">
                    RESUMO DO SETUP
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCompatFilter((v) => !v);
                    setPage(1);
                  }}
                  className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold border transition cursor-pointer ${
                    compatFilter
                      ? 'bg-[#1c1f2b] border-[#d926a9]/60 text-white'
                      : 'bg-[#101218] border-white/[0.08] text-slate-400 hover:text-white'
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded ${
                      compatFilter
                        ? 'bg-[#d926a9] text-white'
                        : 'border border-white/25'
                    }`}
                  >
                    {compatFilter && <Check className="h-3 w-3" />}
                  </span>
                  <span>Filtro de Compatibilidade</span>
                </button>

                <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/[0.07]">
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      PEÇAS
                    </span>
                    <span className="text-sm font-bold text-white tabular-nums">
                      {equippedPartsCount}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      PREÇO ATUAL
                    </span>
                    <span className="text-sm font-bold text-[#4ade80] tabular-nums">
                      {formatCurrency(totalPrice, currency, { decimals: 0 })}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      CONSUMO
                    </span>
                    <span className="text-sm font-bold text-[#f59e0b] tabular-nums">
                      {compatibility.totalTdp}W
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-white pt-1">
                <span className="flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-slate-300" />
                  Filtros
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBrand('ALL');
                    setSelectedFormFactor('ALL');
                    setMinPriceFilter(0);
                    setMaxPriceFilter(3000);
                    setCompatFilter(false);
                    setSearchQuery('');
                    setPage(1);
                  }}
                  className="text-[11px] font-medium text-slate-400 hover:text-white cursor-pointer"
                >
                  Limpar Tudo
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOnly3DFilter((v) => !v)}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] font-semibold border transition cursor-pointer ${
                    only3DFilter
                      ? 'bg-[#1a1d27] border-[#d926a9]/60 text-white'
                      : 'bg-[#13151d] border-white/[0.07] text-slate-400'
                  }`}
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#d926a9] text-white shrink-0">
                    <Box className="h-2.5 w-2.5" />
                  </span>
                  <span className="truncate">3D Only</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInStockFilter((v) => !v)}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] font-semibold border transition cursor-pointer ${
                    inStockFilter
                      ? 'bg-[#1a1d27] border-[#4ade80]/50 text-white'
                      : 'bg-[#13151d] border-white/[0.07] text-slate-400'
                  }`}
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#22c55e] text-slate-950 shrink-0">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                  <span className="truncate">Em Estoque</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCompatFilter((v) => !v);
                    setPage(1);
                  }}
                  className={`col-span-2 flex items-center justify-center gap-2 rounded-lg px-2.5 py-2 text-[11px] font-semibold border transition cursor-pointer ${
                    compatFilter
                      ? 'bg-[#1a1d27] border-[#38bdf8]/50 text-white'
                      : 'bg-[#13151d] border-white/[0.07] text-slate-400'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-[#38bdf8]" />
                  <span>Compatíveis com o Setup</span>
                </button>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-white/[0.07]">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>Preço</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMinPriceFilter(0);
                      setMaxPriceFilter(3000);
                      setPage(1);
                    }}
                    className="text-[10px] text-slate-400 hover:text-white cursor-pointer"
                  >
                    Resetar
                  </button>
                </div>

                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="1500"
                    step="25"
                    value={minPriceFilter}
                    onChange={(e) => {
                      const val = Math.min(Number(e.target.value), maxPriceFilter - 25);
                      setMinPriceFilter(Math.max(0, val));
                      setPage(1);
                    }}
                    className="w-full accent-[#3b82f6] h-1.5 cursor-pointer"
                  />
                  <input
                    type="range"
                    min="50"
                    max="3000"
                    step="50"
                    value={maxPriceFilter}
                    onChange={(e) => {
                      const val = Math.max(Number(e.target.value), minPriceFilter + 25);
                      setMaxPriceFilter(val);
                      setPage(1);
                    }}
                    className="w-full accent-[#3b82f6] h-1.5 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-medium text-slate-300 tabular-nums">
                  <span>{formatCurrency(minPriceFilter, currency, { decimals: 0 })}</span>
                  <span>{formatCurrency(maxPriceFilter, currency, { decimals: 0 })}</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-white/[0.07]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    Manufacturer
                  </span>
                  {selectedBrand !== 'ALL' && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBrand('ALL');
                        setPage(1);
                      }}
                      className="text-[10px] text-slate-400 hover:text-white cursor-pointer"
                    >
                      Todas
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {displayedBrands.map((brand) => {
                    const isSelected =
                      selectedBrand.toLowerCase() === brand.toLowerCase();
                    return (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => {
                          setSelectedBrand(isSelected ? 'ALL' : brand);
                          setPage(1);
                        }}
                        className={`h-14 rounded-xl flex items-center justify-center border transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#1e2230] border-white/45 shadow-[0_0_15px_rgba(255,255,255,0.08)]'
                            : 'bg-[#14161e] border-white/[0.07] hover:bg-[#191c26] hover:border-white/[0.16]'
                        }`}
                        title={brand}
                      >
                        <BrandWordmark brand={brand} />
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setShowAllBrands((v) => !v)}
                  className="w-full rounded-lg bg-[#14161e] hover:bg-[#1a1d28] border border-white/[0.07] py-1.5 text-[11px] font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                >
                  {showAllBrands ? 'Mostrar Menos' : 'Show All'}
                </button>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-white/[0.07]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    Form Factor
                  </span>
                  {selectedFormFactor !== 'ALL' && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFormFactor('ALL');
                        setPage(1);
                      }}
                      className="text-[10px] text-slate-400 hover:text-white cursor-pointer"
                    >
                      Todos
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {FORM_FACTORS.map((ff) => {
                    const active = selectedFormFactor === ff;
                    return (
                      <button
                        key={ff}
                        type="button"
                        onClick={() => {
                          setSelectedFormFactor(active ? 'ALL' : ff);
                          setPage(1);
                        }}
                        className={`h-11 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          active
                            ? 'bg-[#1e2230] border-white/45 text-white'
                            : 'bg-[#14161e] border-white/[0.07] text-slate-300 hover:bg-[#191c26] hover:text-white'
                        }`}
                      >
                        {ff}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden bg-[#0b0d12]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-white/[0.07] bg-[#0e1016]">
                <div>
                  <div className="text-sm font-bold text-white">
                    Mostrando {filteredParts.length} produtos compatíveis
                  </div>
                  <div className="text-[11px] text-slate-400">
                    de {allCategoryParts.length} produtos no catálogo de {categoryMeta.label}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {currentlyEquipped && onRemovePartFromBuild && (
                    <button
                      type="button"
                      onClick={() => {
                        onRemovePartFromBuild(activeCategory);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-[#161922] hover:bg-white/[0.1] border border-white/[0.1] px-3 py-2 text-xs font-medium text-slate-300 hover:text-white transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remover Atual</span>
                    </button>
                  )}

                  <div className="relative flex items-center">
                    <ArrowUpDown className="absolute left-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setPage(1);
                      }}
                      className="rounded-lg bg-[#14161e] border border-white/[0.12] pl-8 pr-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-white/30 cursor-pointer"
                    >
                      <option value="featured">Ordenar: Destaques 3D</option>
                      <option value="price_asc">Preço: Menor para Maior</option>
                      <option value="price_desc">Preço: Maior para Menor</option>
                      <option value="name_asc">Nome: A a Z</option>
                    </select>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Buscar peça..."
                      className="w-full rounded-lg bg-[#14161e] border border-white/[0.12] pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/35"
                    />
                  </div>
                </div>
              </div>

              <div
                className="flex-1 overflow-y-auto p-5 content-start"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                  gap: '14px',
                }}
              >
                {paginatedParts.map((part) => {
                  const isEquipped = currentlyEquipped?.id === part.id;
                  const compat = isPartCompatibleWithBuild(part);
                  const twoSpecs = getTwoCardSpecs(part, activeCategory);

                  return (
                    <div
                      key={part.id}
                      style={{ backgroundColor: '#14161d', borderRadius: '8px' }}
                      className={`flex flex-col border transition overflow-hidden ${
                        isEquipped
                          ? 'border-[#4ade80]/70 shadow-[0_0_20px_rgba(74,222,128,0.12)]'
                          : 'border-white/[0.08] hover:border-white/[0.22]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => onOpenPartDetails(activeCategory, part)}
                        style={{
                          backgroundColor: '#ffffff',
                          height: '160px',
                          padding: '12px',
                          borderRadius: '8px 8px 0 0',
                        }}
                        className="relative w-full flex items-center justify-center cursor-pointer group overflow-hidden shrink-0"
                      >
                        <CleanModalImage
                          part={part}
                          className="h-full w-full group-hover:scale-105 transition-transform duration-300"
                        />

                        <span
                          style={{ backgroundColor: '#d926a9' }}
                          className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-bold text-white shadow-sm"
                        >
                          <Box className="h-3 w-3 text-white" />
                          <span>3D</span>
                        </span>

                        {isEquipped && (
                          <span className="absolute top-2 right-2 rounded bg-slate-950/90 px-2 py-0.5 text-[10px] font-bold text-[#4ade80] shadow">
                            EQUIPADO
                          </span>
                        )}

                        {!compat && (
                          <span className="absolute top-2 left-2 rounded bg-slate-950/90 px-2 py-0.5 text-[10px] font-bold text-amber-400 shadow flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Incompatível
                          </span>
                        )}
                      </button>

                      <div
                        style={{ backgroundColor: '#14161d' }}
                        className="flex-1 p-3.5 flex flex-col justify-between"
                      >
                        <div>
                          <button
                            type="button"
                            onClick={() => onOpenPartDetails(activeCategory, part)}
                            style={{ fontSize: '13px' }}
                            className="text-left font-bold text-white hover:text-slate-200 line-clamp-2 min-h-[36px] leading-snug cursor-pointer"
                            title={part.name}
                          >
                            {part.name}
                          </button>

                          <div
                            style={{ color: '#4ade80', fontSize: '15px' }}
                            className="font-bold tabular-nums mt-1.5"
                          >
                            {formatCurrency(part.price, currency)}
                          </div>

                          <div className="mt-2.5 space-y-1.5">
                            {twoSpecs.map((spec) => (
                              <div key={spec.label} className="leading-tight">
                                <span
                                  style={{ color: '#6b7280' }}
                                  className="block text-[10px] font-medium"
                                >
                                  {spec.label}
                                </span>
                                <span className="block text-[11px] font-semibold text-white truncate">
                                  {spec.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            onSelectPartForBuild(activeCategory, part);
                            onClose();
                          }}
                          style={{
                            backgroundColor: isEquipped ? '#26332d' : '#1f2430',
                          }}
                          className="mt-3.5 w-full flex items-center justify-center gap-1.5 rounded-md py-2 px-3 text-xs font-semibold text-white hover:brightness-125 border border-white/[0.07] hover:border-white/[0.2] transition cursor-pointer"
                        >
                          {isEquipped ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-[#4ade80]" />
                              <span>Equipado no PC</span>
                            </>
                          ) : (
                            <>
                              <Plus className="h-3.5 w-3.5 text-slate-200" />
                              <span>Adicionar ao PC</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="px-6 py-3 border-t border-white/[0.08] bg-[#101218] flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Página {currentPage} de {totalPages} ({filteredParts.length} peças)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="flex items-center gap-1 rounded-lg bg-[#181b22] disabled:opacity-40 hover:bg-white/[0.08] border border-white/[0.1] px-3 py-1.5 text-slate-200 cursor-pointer"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      <span>Anterior</span>
                    </button>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="flex items-center gap-1 rounded-lg bg-[#181b22] disabled:opacity-40 hover:bg-white/[0.08] border border-white/[0.1] px-3 py-1.5 text-slate-200 cursor-pointer"
                    >
                      <span>Próxima</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (modalState.mode === 'details' && modalState.item) {
    const part = modalState.item;
    const isEquipped = build[activeCategory]?.id === part.id;
    const specEntries = Object.entries(part.specs || {});

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
        <div className="relative w-full max-w-3xl max-h-[90vh] rounded-2xl bg-[#101217] border border-white/[0.12] shadow-[0_24px_90px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-slate-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#13161d]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onBackToPicker(activeCategory)}
                className="flex items-center gap-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] px-2.5 py-1 text-xs text-slate-300 hover:text-white transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Voltar para a Lista</span>
              </button>
              <span className="font-display text-sm font-bold text-white">
                Detalhes do Produto
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xl bg-[#161922] border border-white/[0.1] p-0.5">
                {Object.values(CURRENCIES).map((curr) => (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => setCurrency && setCurrency(curr.code)}
                    className={`rounded-lg px-2 py-1 text-xs font-semibold transition cursor-pointer ${
                      currency === curr.code
                        ? 'bg-white text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {curr.code}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-white/[0.05] hover:bg-white/[0.12] p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5 space-y-4">
              <div
                style={{ backgroundColor: '#ffffff' }}
                className="relative rounded-xl overflow-hidden border border-white/10 h-60 p-4 flex items-center justify-center"
              >
                <CleanModalImage part={part} />
                <span
                  style={{ backgroundColor: '#d926a9' }}
                  className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-bold text-white shadow-sm"
                >
                  <Box className="h-3.5 w-3.5 text-white" />
                  <span>3D</span>
                </span>
              </div>
            </div>

            <div className="md:col-span-7 space-y-5">
              <div>
                <span className="inline-block rounded bg-white/[0.08] px-2.5 py-0.5 text-xs text-slate-300">
                  {part.brand}
                </span>
                <h3 className="font-display text-xl font-bold text-white mt-1.5">
                  {part.name}
                </h3>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#151821] border border-white/[0.08] p-4">
                <div>
                  <span className="block text-xs text-slate-400">
                    Preço Estimado
                  </span>
                  <span className="text-2xl font-bold text-[#4ade80] tabular-nums">
                    {formatCurrency(part.price, currency)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isEquipped && onRemovePartFromBuild && (
                    <button
                      type="button"
                      onClick={() => {
                        onRemovePartFromBuild(activeCategory);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] px-3.5 py-2.5 text-xs font-medium text-slate-300 hover:text-white transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remover</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      onSelectPartForBuild(activeCategory, part);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-white hover:bg-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-950 transition cursor-pointer"
                  >
                    <ShoppingCart className="h-3.5 w-3.5 text-slate-950" />
                    <span>
                      {isEquipped ? 'Já Equipado' : 'Adicionar ao PC'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-[#151821] border border-white/[0.08] p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-white/[0.08] pb-2">
                  Especificações Técnicas
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {specEntries.map(([label, val]) => (
                    <div key={label} className="border-b border-white/[0.05] pb-2">
                      <span className="block text-[11px] text-slate-400 capitalize">
                        {label}
                      </span>
                      <span className="font-semibold text-white mt-0.5 block">
                        {Array.isArray(val) ? val.join(', ') : String(val)}
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

  return null;
}
