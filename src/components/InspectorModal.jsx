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
} from 'lucide-react';
import {
  HARDWARE_CATEGORIES,
  HARDWARE_CATALOG,
  validateBuildCompatibility,
  recommendOptimalBuild,
} from '../utils/textureGenerator';
import {
  resolveRealProductPhoto,
  REAL_PRODUCT_IMAGE_DICTIONARY,
} from '../utils/hardwareCatalogAdapter';

const PAGE_SIZE = 24;

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
        padding: '8px',
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
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [compatFilter, setCompatFilter] = useState(false);
  const [maxPriceFilter, setMaxPriceFilter] = useState(3000);
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

  const availableBrands = useMemo(() => {
    const counts = new Map();
    allCategoryParts.forEach((p) => {
      if (p.brand) counts.set(p.brand, (counts.get(p.brand) || 0) + 1);
    });
    const top = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 14)
      .map(([brand]) => brand);
    return ['ALL', ...top];
  }, [allCategoryParts]);

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
    return allCategoryParts.filter((part) => {
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
  }, [
    allCategoryParts,
    searchQuery,
    selectedBrand,
    maxPriceFilter,
    compatFilter,
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
        <div className="relative w-full max-w-6xl h-[90vh] rounded-2xl bg-[#111318] border border-white/[0.1] shadow-[0_24px_90px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-slate-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#14171d]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-400/30 text-sky-300">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-white">
                  Assistente de Compatibilidade e Recomendação
                </h2>
                <p className="text-xs text-slate-400">
                  Verificação física e elétrica em tempo real + Montador inteligente sem gargalos
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-white/[0.05] hover:bg-white/[0.12] p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="rounded-2xl bg-[#151821] border border-white/[0.08] p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck
                    className={`h-5 w-5 ${
                      compatibility.compatible ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  />
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
                  <div className="rounded-xl bg-[#101218] border border-white/[0.07] px-3 py-1.5 text-xs">
                    <span className="text-slate-400 mr-1.5">Consumo Total:</span>
                    <span className="font-bold text-amber-300">
                      {compatibility.totalTdp}W
                    </span>
                  </div>
                  <div className="rounded-xl bg-[#101218] border border-white/[0.07] px-3 py-1.5 text-xs">
                    <span className="text-slate-400 mr-1.5">Fonte Recomendada (+30%):</span>
                    <span className="font-bold text-sky-300">
                      {compatibility.recommendedPsuWatts}W
                    </span>
                  </div>
                  <div className="rounded-xl bg-[#101218] border border-white/[0.07] px-3 py-1.5 text-xs">
                    <span className="text-slate-400 mr-1.5">Fonte Atual:</span>
                    <span className="font-bold text-emerald-400">
                      {compatibility.psuWatts}W
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {(compatibility.checks || []).map((chk) => (
                  <div
                    key={chk.id}
                    className={`rounded-xl p-3.5 border ${
                      chk.ok
                        ? 'bg-emerald-500/[0.06] border-emerald-500/25'
                        : 'bg-rose-500/[0.1] border-rose-500/35'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">
                        {chk.label}
                      </span>
                      {chk.ok ? (
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                          OK
                        </span>
                      ) : (
                        <span className="rounded bg-rose-500/25 px-1.5 py-0.5 text-[10px] font-bold text-rose-300">
                          CONFLITO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300">{chk.detail}</p>
                  </div>
                ))}
              </div>

              {(compatibility.issues.length > 0 ||
                compatibility.warnings.length > 0) && (
                <div className="space-y-2 pt-2 border-t border-white/[0.07]">
                  {compatibility.issues.map((issue, idx) => (
                    <div
                      key={`issue-${idx}`}
                      className="flex items-center justify-between gap-3 rounded-xl bg-rose-500/15 border border-rose-500/30 px-4 py-2.5 text-xs text-rose-200"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                        <span>{issue}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onBackToPicker('motherboard')}
                        className="rounded-lg bg-rose-500 hover:bg-rose-400 px-3 py-1 text-[11px] font-bold text-white transition cursor-pointer shrink-0"
                      >
                        Corrigir Peça
                      </button>
                    </div>
                  ))}
                  {compatibility.warnings.map((warn, idx) => (
                    <div
                      key={`warn-${idx}`}
                      className="flex items-center justify-between gap-3 rounded-xl bg-amber-500/15 border border-amber-500/30 px-4 py-2.5 text-xs text-amber-200"
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-amber-400 shrink-0" />
                        <span>{warn}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onBackToPicker('psu')}
                        className="rounded-lg bg-amber-500 hover:bg-amber-400 px-3 py-1 text-[11px] font-bold text-slate-950 transition cursor-pointer shrink-0"
                      >
                        Trocar Fonte
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-[#151821] border border-white/[0.08] p-5 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-500/15 border border-sky-400/30 px-2.5 py-0.5 text-[11px] font-bold text-sky-300 mb-1.5">
                    <Sparkles className="h-3 w-3" />
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
                  className="flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 px-5 py-3 text-xs font-bold text-slate-950 shadow-[0_0_25px_rgba(14,165,233,0.35)] transition cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>
                    Aplicar Build no PC 3D (${recommendation.totalPrice.toFixed(2)})
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
                          ? 'bg-sky-500/15 border-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.15)]'
                          : 'bg-[#101218] border-white/[0.08] hover:border-white/[0.2]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${
                            active
                              ? 'bg-sky-500 text-slate-950'
                              : 'bg-white/[0.06] text-slate-300'
                          }`}
                        >
                          <IconComp className="h-4 w-4" />
                        </span>
                        <span className="text-xs font-bold text-emerald-400">
                          Alvo ~${obj.recommendedBudget}
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

              <div className="rounded-xl bg-[#101218] border border-white/[0.08] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                      Orçamento Máximo Desejado
                    </span>
                    <span className="text-sm font-bold text-emerald-400">
                      ${assistantBudget}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="900"
                    max="4200"
                    step="50"
                    value={assistantBudget}
                    onChange={(e) => setAssistantBudget(Number(e.target.value))}
                    className="w-full accent-sky-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>$900 (Entrada)</span>
                    <span>$2200 (1440p Ultra)</span>
                    <span>$4200 (4K Entusiasta)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 border-t sm:border-t-0 sm:border-l border-white/[0.08] pt-3 sm:pt-0 sm:pl-4">
                  <div>
                    <span className="block text-[10px] text-slate-400">
                      Total da Recomendação
                    </span>
                    <span className="text-lg font-bold text-emerald-400">
                      ${recommendation.totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400">
                      Status de Gargalo
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-xs font-bold text-emerald-300">
                      <Check className="h-3 w-3" />
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
                      className="flex items-center gap-3 rounded-xl bg-[#101218] border border-white/[0.08] p-3"
                    >
                      <div
                        style={{ backgroundColor: '#ffffff' }}
                        className="h-14 w-14 shrink-0 rounded-lg overflow-hidden flex items-center justify-center"
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
                        <span className="text-xs font-bold text-emerald-400">
                          ${recPart.price.toFixed(2)}
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
        <div className="relative w-full max-w-6xl h-[90vh] rounded-2xl bg-[#111318] border border-white/[0.1] shadow-[0_24px_90px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-slate-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#14171d]">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-base font-bold text-white">
                Escolher {categoryMeta.label}
              </h2>
              <span className="rounded-md bg-white/[0.06] px-2.5 py-0.5 text-xs text-slate-300">
                {filteredParts.length} opções disponíveis
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-1">
              {HARDWARE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedBrand('ALL');
                    setPage(1);
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
              type="button"
              onClick={onClose}
              className="rounded-lg bg-white/[0.05] hover:bg-white/[0.12] p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="hidden md:flex w-64 shrink-0 border-r border-white/[0.08] bg-[#0e1015] p-4 flex-col gap-5 overflow-y-auto">
              <div className="rounded-xl bg-[#161920] border border-white/[0.08] p-3.5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
                  <span>Filtro Inteligente</span>
                </div>

                <label className="flex items-center gap-2 rounded-lg bg-[#111318] border border-white/[0.07] px-2.5 py-2 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={compatFilter}
                    onChange={(e) => {
                      setCompatFilter(e.target.checked);
                      setPage(1);
                    }}
                    className="accent-emerald-500"
                  />
                  <span>Mostrar apenas peças compatíveis</span>
                </label>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.07] text-center">
                  <div>
                    <span className="block text-[10px] text-slate-400">
                      Total Atual
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      ${Math.round(totalPrice)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400">
                      Consumo
                    </span>
                    <span className="text-xs font-bold text-amber-400">
                      {compatibility.totalTdp}W
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filtros
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBrand('ALL');
                    setMaxPriceFilter(3000);
                    setCompatFilter(false);
                    setSearchQuery('');
                    setPage(1);
                  }}
                  className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
                >
                  Limpar
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Preço Máximo</span>
                  <span className="text-slate-200 font-semibold">
                    ${maxPriceFilter}
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="3000"
                  step="50"
                  value={maxPriceFilter}
                  onChange={(e) => {
                    setMaxPriceFilter(Number(e.target.value));
                    setPage(1);
                  }}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <span className="block text-xs font-medium text-slate-300">
                  Marca
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {availableBrands.map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => {
                        setSelectedBrand(brand);
                        setPage(1);
                      }}
                      className={`rounded-lg py-2 px-2 text-xs font-semibold border transition truncate cursor-pointer ${
                        selectedBrand === brand
                          ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                          : 'bg-[#161920] border-white/[0.07] text-slate-300 hover:bg-[#1c2029]'
                      }`}
                      title={brand}
                    >
                      {brand === 'ALL' ? 'Todas' : brand}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden bg-[#111318]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3.5 border-b border-white/[0.07]">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1);
                      }}
                      placeholder={`Buscar em ${categoryMeta.label}...`}
                      className="w-full rounded-lg bg-[#181b22] border border-white/[0.1] pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <label className="flex items-center gap-2 rounded-lg bg-[#181b22] border border-white/[0.1] px-3 py-2 text-xs font-medium text-slate-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={compatFilter}
                      onChange={(e) => {
                        setCompatFilter(e.target.checked);
                        setPage(1);
                      }}
                      className="accent-emerald-500"
                    />
                    <span>Mostrar apenas peças compatíveis</span>
                  </label>
                </div>

                {currentlyEquipped && onRemovePartFromBuild && (
                  <button
                    type="button"
                    onClick={() => {
                      onRemovePartFromBuild(activeCategory);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-600 border border-rose-500/30 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-white transition cursor-pointer shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Deixar Slot Vazio</span>
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
                {paginatedParts.map((part) => {
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
                      <button
                        type="button"
                        onClick={() => onOpenPartDetails(activeCategory, part)}
                        style={{ backgroundColor: '#ffffff' }}
                        className="relative h-44 w-full flex items-center justify-center cursor-pointer group overflow-hidden"
                      >
                        <CleanModalImage
                          part={part}
                          className="h-full w-full group-hover:scale-105 transition-transform duration-300"
                        />
                        {isEquipped && (
                          <span className="absolute top-2 right-2 rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                            EQUIPADO
                          </span>
                        )}
                        {!compat && (
                          <span className="absolute top-2 left-2 rounded bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white shadow flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Incompatível
                          </span>
                        )}
                      </button>

                      <div className="flex-1 p-4 flex flex-col">
                        <button
                          type="button"
                          onClick={() => onOpenPartDetails(activeCategory, part)}
                          className="text-left text-sm font-bold text-white hover:text-sky-400 line-clamp-2 cursor-pointer"
                        >
                          {part.name}
                        </button>

                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-sm font-bold text-emerald-400">
                            ${part.price.toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-400 truncate max-w-[140px]">
                            {part.brand}
                          </span>
                        </div>

                        <div className="mt-2.5 space-y-1 border-t border-white/[0.07] pt-2 text-[11px]">
                          {specEntries.map(([k, v]) => (
                            <div key={k} className="flex justify-between gap-2">
                              <span className="text-slate-400 capitalize">{k}:</span>
                              <span className="text-slate-200 font-medium truncate">
                                {Array.isArray(v) ? v.join(', ') : String(v)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-auto pt-3">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectPartForBuild(activeCategory, part);
                              onClose();
                            }}
                            className={`w-full flex items-center justify-center gap-1.5 rounded-lg py-2 px-3 text-xs font-semibold transition cursor-pointer ${
                              isEquipped
                                ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300'
                                : 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold'
                            }`}
                          >
                            {isEquipped ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                <span>Peça Selecionada</span>
                              </>
                            ) : (
                              <>
                                <Plus className="h-3.5 w-3.5" />
                                <span>Equipar no PC</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="px-6 py-3 border-t border-white/[0.08] bg-[#14171d] flex items-center justify-between text-xs">
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
        <div className="relative w-full max-w-3xl max-h-[90vh] rounded-2xl bg-[#111318] border border-white/[0.12] shadow-[0_24px_90px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-slate-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#14171d]">
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

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-white/[0.05] hover:bg-white/[0.12] p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5 space-y-4">
              <div
                style={{ backgroundColor: '#ffffff' }}
                className="rounded-xl overflow-hidden border border-white/10 h-60 flex items-center justify-center"
              >
                <CleanModalImage part={part} />
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

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#161920] border border-white/[0.08] p-4">
                <div>
                  <span className="block text-xs text-slate-400">
                    Preço Estimado
                  </span>
                  <span className="text-2xl font-bold text-emerald-400">
                    ${part.price.toFixed(2)}
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
                      className="flex items-center gap-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-600 border border-rose-500/30 px-3.5 py-2.5 text-xs font-bold text-rose-300 hover:text-white transition cursor-pointer"
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
                    className="flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition cursor-pointer"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    <span>
                      {isEquipped ? 'Já Equipado' : 'Equipar no PC'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-[#161920] border border-white/[0.08] p-4 space-y-3">
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
