import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  Cpu,
  HardDrive,
  Fan,
  Zap,
  Box,
  CircuitBoard,
  MemoryStick,
  MonitorPlay,
  CheckCircle2,
  AlertTriangle,
  Camera,
  RotateCw,
  RotateCcw,
  Maximize2,
  Upload,
  Trash2,
  ChevronDown,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Sparkles,
  Palette,
  Power,
  Copy,
  Check,
  TrendingDown,
  ListFilter,
  LineChart,
  Plus,
} from 'lucide-react';
import {
  HARDWARE_CATEGORIES,
  RGB_PRESETS,
  CURRENCIES,
  formatCurrency,
  validateBuildCompatibility,
  generateBuildPriceHistory,
} from '../utils/textureGenerator';
import {
  resolveRealProductPhoto,
  REAL_PRODUCT_IMAGE_DICTIONARY,
} from '../utils/hardwareCatalogAdapter';

const CATEGORY_ICONS = {
  case: Box,
  motherboard: CircuitBoard,
  cpu: Cpu,
  cooler: Fan,
  gpu: MonitorPlay,
  ram: MemoryStick,
  storage: HardDrive,
  psu: Zap,
};

const BUILDCORES_SLOT_ORDER = [
  { id: 'case', label: 'Case', ptLabel: 'Gabinete' },
  { id: 'cpu', label: 'CPU', ptLabel: 'Processador' },
  { id: 'motherboard', label: 'Motherboard', ptLabel: 'Placa-Mãe' },
  { id: 'gpu', label: 'GPU', ptLabel: 'Placa de Vídeo' },
  { id: 'ram', label: 'RAM', ptLabel: 'Memória RAM' },
  { id: 'cooler', label: 'Cooler', ptLabel: 'Cooler de CPU' },
  { id: 'storage', label: 'Storage', ptLabel: 'Armazenamento SSD' },
  { id: 'psu', label: 'Power Supply', ptLabel: 'Fonte de Alimentação' },
];

function ProductThumbnail({ part, onClick }) {
  const primaryUrl = resolveRealProductPhoto(part);
  const categoryBackupUrl =
    REAL_PRODUCT_IMAGE_DICTIONARY.byCategory[part?.category] ||
    REAL_PRODUCT_IMAGE_DICTIONARY.byCategory.cpu;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ width: '56px', height: '56px', backgroundColor: '#ffffff' }}
      className="relative shrink-0 rounded-xl overflow-hidden border border-white/15 flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 transition-transform"
      title={`Ver detalhes de ${part?.name || ''}`}
    >
      <img
        src={primaryUrl}
        onError={(e) => {
          if (e.currentTarget.src !== categoryBackupUrl) {
            e.currentTarget.src = categoryBackupUrl;
          }
        }}
        alt={part?.name || 'Produto'}
        style={{
          backgroundColor: '#ffffff',
          objectFit: 'contain',
          objectPosition: 'center',
          padding: '4px',
        }}
        className="w-full h-full"
      />
    </button>
  );
}

function PriceHistoryPanel({ build, currency }) {
  const [rangeDays, setRangeDays] = useState(30);
  const history = useMemo(
    () => generateBuildPriceHistory(build, rangeDays),
    [build, rangeDays]
  );

  const svgWidth = 360;
  const svgHeight = 148;
  const padX = 10;
  const padY = 14;

  const { pathD, areaD, coords } = useMemo(() => {
    const pts = history.points;
    if (!pts.length) return { pathD: '', areaD: '', coords: [] };
    const minP = history.lowest * 0.985;
    const maxP = history.highest * 1.015;
    const span = Math.max(1, maxP - minP);

    const mapped = pts.map((pt, idx) => {
      const x =
        padX +
        (idx / Math.max(1, pts.length - 1)) * (svgWidth - padX * 2);
      const y =
        svgHeight -
        padY -
        ((pt.price - minP) / span) * (svgHeight - padY * 2);
      return { x, y, ...pt };
    });

    const line = mapped
      .map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
      .join(' ');
    const area = `${line} L${mapped[mapped.length - 1].x.toFixed(1)},${svgHeight} L${mapped[0].x.toFixed(1)},${svgHeight} Z`;

    return { pathD: line, areaD: area, coords: mapped };
  }, [history]);

  const equippedParts = BUILDCORES_SLOT_ORDER.map((slot) => ({
    slot,
    part: build[slot.id],
  })).filter((entry) => Boolean(entry.part));

  return (
    <div className="p-4 space-y-4">
      <div className="rounded-xl bg-[#14171f] border border-white/[0.08] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="block text-[11px] font-medium text-slate-400">
              Total Price Trend
            </span>
            <span className="text-lg font-bold text-white tabular-nums">
              {formatCurrency(history.current, currency)}
            </span>
          </div>

          <div className="flex items-center rounded-lg bg-[#0d0f14] border border-white/[0.08] p-0.5">
            {[30, 90].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setRangeDays(d)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                  rangeDays === d
                    ? 'bg-white text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {d}D
              </button>
            ))}
          </div>
        </div>

        <div className="relative rounded-lg bg-[#0d0f14] border border-white/[0.06] p-2 overflow-hidden">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-36 overflow-visible"
          >
            <defs>
              <linearGradient id="priceAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {areaD && <path d={areaD} fill="url(#priceAreaGrad)" />}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#f8fafc"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {coords.length > 0 && (
              <circle
                cx={coords[coords.length - 1].x}
                cy={coords[coords.length - 1].y}
                r="3.5"
                fill="#ffffff"
              />
            )}
          </svg>

          <div className="flex justify-between text-[10px] text-slate-500 px-1 pt-1">
            <span>{history.points[0]?.dateLabel}</span>
            <span>{history.points[Math.floor(history.points.length / 2)]?.dateLabel}</span>
            <span>Hoje ({history.points[history.points.length - 1]?.dateLabel})</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="rounded-lg bg-[#0d0f14] border border-white/[0.06] p-2.5">
            <span className="block text-[10px] text-slate-400">Menor ({rangeDays}d)</span>
            <span className="text-xs font-bold text-white tabular-nums mt-0.5 block">
              {formatCurrency(history.lowest, currency)}
            </span>
          </div>
          <div className="rounded-lg bg-[#0d0f14] border border-white/[0.06] p-2.5">
            <span className="block text-[10px] text-slate-400">Média ({rangeDays}d)</span>
            <span className="text-xs font-bold text-slate-200 tabular-nums mt-0.5 block">
              {formatCurrency(history.average, currency)}
            </span>
          </div>
          <div className="rounded-lg bg-[#0d0f14] border border-white/[0.06] p-2.5">
            <span className="block text-[10px] text-slate-400">Maior ({rangeDays}d)</span>
            <span className="text-xs font-bold text-slate-300 tabular-nums mt-0.5 block">
              {formatCurrency(history.highest, currency)}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-[#14171f] border border-white/[0.08] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <TrendingDown className="h-3.5 w-3.5 text-slate-300" />
            <span>Distribuição de Custo por Peça</span>
          </span>
          <span className="text-[11px] text-slate-400">
            {equippedParts.length} itens
          </span>
        </div>

        <div className="space-y-2.5">
          {equippedParts.map(({ slot, part }) => {
            const pct =
              history.current > 0
                ? Math.round((part.price / history.current) * 100)
                : 0;
            return (
              <div key={slot.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 truncate max-w-[210px]">
                    {slot.label}: <strong className="text-white">{part.name}</strong>
                  </span>
                  <span className="text-white font-semibold tabular-nums shrink-0">
                    {formatCurrency(part.price, currency)} ({pct}%)
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#0d0f14] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-slate-200"
                    style={{ width: `${Math.max(4, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function SidebarControls({
  build,
  onRemovePart,
  onUploadCustomGlb,
  onOpenPartPicker,
  onOpenPartDetails,
  onOpenAssistant,
  envPreset,
  setEnvPreset,
  autoRotate,
  setAutoRotate,
  explodedView,
  setExplodedView,
  showGlass = true,
  setShowGlass,
  isPcOn = true,
  setIsPcOn,
  rgbConfig,
  setRgbConfig,
  onSnapCamera,
  onCaptureScreenshot,
  screenshotToast,
  onResetBuild,
  totalPrice,
  currency = 'BRL',
  setCurrency,
  children,
}) {
  const glbInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const rgbMenuRef = useRef(null);

  const [uploadTargetCategory, setUploadTargetCategory] = useState('gpu');
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [rgbMenuOpen, setRgbMenuOpen] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState(false);

  const [sidebarTab, setSidebarTab] = useState('parts');
  const [hide3D, setHide3D] = useState(false);
  const [buildName, setBuildName] = useState('ToxelVault Custom Build');
  const [clonedToast, setClonedToast] = useState(false);

  const compatibility = validateBuildCompatibility(build);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setViewMenuOpen(false);
      }
      if (rgbMenuRef.current && !rgbMenuRef.current.contains(e.target)) {
        setRgbMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGlbFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onUploadCustomGlb(uploadTargetCategory, file);
    e.target.value = '';
    setViewMenuOpen(false);
  };

  const handleGlobalColorChange = (hex) => {
    setRgbConfig((prev) => ({
      ...prev,
      mode: prev.mode === 'off' ? 'static' : prev.mode,
      globalColor: hex,
      groups: prev.syncAll
        ? { fans: hex, ram: hex, gpu: hex, cooler: hex }
        : prev.groups,
    }));
  };

  const handleGroupColorChange = (groupKey, hex) => {
    setRgbConfig((prev) => ({
      ...prev,
      syncAll: false,
      mode: prev.mode === 'off' ? 'static' : prev.mode,
      groups: {
        ...prev.groups,
        [groupKey]: hex,
      },
    }));
  };

  const handleCloneBuild = () => {
    const summaryLines = [
      `${buildName} (${formatCurrency(totalPrice, currency)})`,
      ...BUILDCORES_SLOT_ORDER.map((slot) => {
        const p = build[slot.id];
        return `${slot.label}: ${p ? `${p.name} (${formatCurrency(p.price, currency)})` : 'Empty'}`;
      }),
    ];
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(summaryLines.join('\n')).catch(() => {});
    }
    setBuildName((prev) => (prev.endsWith(' (Copy)') ? prev : `${prev} (Copy)`));
    setClonedToast(true);
    setTimeout(() => setClonedToast(false), 2600);
  };

  const equippedCount = HARDWARE_CATEGORIES.filter((c) => Boolean(build[c.id])).length;

  return (
    <div className="flex flex-col w-screen h-screen bg-[#090b0f] text-slate-100 overflow-hidden select-none">
      <header className="h-14 shrink-0 flex items-center justify-between gap-3 px-4 lg:px-6 bg-[#101217] border-b border-white/[0.08] z-30">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/logo.png"
            alt="ToxelVault Logo"
            className="w-9 h-9 rounded-lg object-contain shrink-0"
          />
          <span className="font-display text-sm font-bold tracking-wide text-white shrink-0">
            ToxelVault
          </span>

          <div className="hidden md:flex items-center pl-3 border-l border-white/[0.08]">
            <input
              type="text"
              value={buildName}
              onChange={(e) => setBuildName(e.target.value)}
              aria-label="Nome da Build"
              className="w-44 lg:w-52 rounded-lg bg-[#161920] hover:bg-[#1b1f28] focus:bg-[#1b1f28] border border-white/[0.08] focus:border-white/[0.24] px-2.5 py-1 text-xs font-semibold text-slate-100 focus:outline-none transition truncate"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-[#161920] border border-white/[0.09] px-3 py-1.5 text-xs">
            <span className="text-slate-400">Total:</span>
            <span className="font-bold text-white tabular-nums">
              {formatCurrency(totalPrice, currency)}
            </span>
          </div>

          <div className="flex items-center rounded-xl bg-[#161920] border border-white/[0.1] p-0.5">
            {Object.values(CURRENCIES).map((curr) => (
              <button
                key={curr.code}
                type="button"
                onClick={() => setCurrency && setCurrency(curr.code)}
                className={`rounded-lg px-2 py-1 text-xs font-semibold transition cursor-pointer ${
                  currency === curr.code
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`Moeda: ${curr.code} (${curr.symbol})`}
              >
                {curr.code}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onOpenAssistant}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
              compatibility.isCompatible && compatibility.warnings.length === 0
                ? 'bg-[#161920] hover:bg-[#1e222b] border-white/[0.1] text-slate-200'
                : 'bg-white/[0.1] border-white/[0.25] text-white'
            }`}
            title="Status de Compatibilidade e Consumo Estimado"
          >
            {compatibility.isCompatible ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-slate-300" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 text-slate-200" />
            )}
            <span className="hidden xl:inline">
              {compatibility.isCompatible ? 'Compatible' : 'Incompatible'}
            </span>
            <span className="text-slate-400 hidden xl:inline">•</span>
            <span className="font-semibold text-white tabular-nums">
              {compatibility.totalTdp}W
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsPcOn(!isPcOn)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              isPcOn
                ? 'bg-white/[0.1] border-white/[0.22] text-white'
                : 'bg-[#161920] border-white/[0.08] text-slate-400 hover:text-slate-200'
            }`}
            title="Ligar ou Desligar o PC 3D"
          >
            <Power className="h-3.5 w-3.5 text-current" />
            <span className="hidden md:inline">PC {isPcOn ? 'Ligado' : 'Desligado'}</span>
          </button>

          <div className="relative" ref={rgbMenuRef}>
            <button
              type="button"
              onClick={() => setRgbMenuOpen((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-xl bg-[#161920] hover:bg-[#1e222b] border border-white/[0.1] px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white transition cursor-pointer"
              title="Controlador RGB / ARGB"
            >
              <Palette className="h-3.5 w-3.5 text-slate-300" />
              <span className="hidden 2xl:inline">RGB</span>
              <span
                className="h-2.5 w-2.5 rounded-full border border-white/40"
                style={{
                  background:
                    rgbConfig?.mode === 'rainbow'
                      ? 'linear-gradient(135deg, #00f2fe, #a855f7, #ef4444)'
                      : rgbConfig?.globalColor || '#00f2fe',
                }}
              />
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {rgbMenuOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 rounded-2xl bg-[#13161d]/98 backdrop-blur-xl border border-white/[0.12] p-4 shadow-2xl space-y-4 z-50">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Palette className="h-4 w-4 text-slate-300" />
                    Controlador RGB / ARGB
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {isPcOn ? 'Ativo' : 'PC Desligado'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="block text-[11px] font-semibold text-slate-400">
                    Modo de Iluminação
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'static', label: 'Estático' },
                      { id: 'breathing', label: 'Respiração' },
                      { id: 'rainbow', label: 'Arco-Íris' },
                      { id: 'off', label: 'Desligado' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() =>
                          setRgbConfig((prev) => ({ ...prev, mode: m.id }))
                        }
                        className={`rounded-lg py-1.5 px-2.5 text-xs font-medium border transition cursor-pointer ${
                          rgbConfig?.mode === m.id
                            ? 'bg-white/[0.12] border-white/[0.28] text-white'
                            : 'bg-[#191d26] border-white/[0.07] text-slate-400 hover:text-white'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400">
                      Cor Global &amp; Presets
                    </span>
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(rgbConfig?.syncAll)}
                        onChange={(e) =>
                          setRgbConfig((prev) => ({
                            ...prev,
                            syncAll: e.target.checked,
                          }))
                        }
                        className="accent-slate-200"
                      />
                      <span>Sincronizar Tudo</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={rgbConfig?.globalColor || '#00f2fe'}
                      onChange={(e) => handleGlobalColorChange(e.target.value)}
                      className="h-8 w-10 rounded cursor-pointer bg-transparent border border-white/20"
                    />
                    <div className="flex flex-wrap gap-1.5 flex-1">
                      {RGB_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleGlobalColorChange(preset.color)}
                          className="flex items-center gap-1.5 rounded-lg bg-[#191d26] hover:bg-white/[0.1] border border-white/[0.08] px-2 py-1 text-[11px] text-slate-200 transition cursor-pointer"
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: preset.color }}
                          />
                          <span>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                  <span className="block text-[11px] font-semibold text-slate-400">
                    Cor Individual por Grupo
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'fans', label: 'Ventoinhas (Fans)' },
                      { key: 'ram', label: 'Memória RAM' },
                      { key: 'gpu', label: 'Placa de Vídeo' },
                      { key: 'cooler', label: 'Water Cooler' },
                    ].map((grp) => (
                      <label
                        key={grp.key}
                        className="flex items-center justify-between rounded-lg bg-[#191d26] border border-white/[0.07] px-2.5 py-1.5 text-xs text-slate-200 cursor-pointer"
                      >
                        <span className="truncate pr-1">{grp.label}</span>
                        <input
                          type="color"
                          value={
                            rgbConfig?.syncAll
                              ? rgbConfig?.globalColor || '#00f2fe'
                              : rgbConfig?.groups?.[grp.key] || '#00f2fe'
                          }
                          onChange={(e) =>
                            handleGroupColorChange(grp.key, e.target.value)
                          }
                          className="h-5 w-6 rounded cursor-pointer bg-transparent border-0 shrink-0"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setHide3D((prev) => !prev)}
            className={`hidden lg:flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
              hide3D
                ? 'bg-white text-slate-950 border-white font-semibold'
                : 'bg-[#161920] hover:bg-[#1e222b] border-white/[0.1] text-slate-200 hover:text-white'
            }`}
            title={hide3D ? 'Mostrar Visualização 3D' : 'Ocultar Visualização 3D'}
          >
            {hide3D ? (
              <Eye className="h-3.5 w-3.5 text-current" />
            ) : (
              <EyeOff className="h-3.5 w-3.5 text-slate-300" />
            )}
            <span>{hide3D ? 'Show 3D' : 'Hide 3D'}</span>
          </button>

          <button
            type="button"
            onClick={handleCloneBuild}
            className="hidden sm:flex items-center gap-1.5 rounded-xl bg-[#161920] hover:bg-[#1e222b] border border-white/[0.1] px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white transition cursor-pointer"
            title="Clonar e copiar lista da build"
          >
            {clonedToast ? (
              <Check className="h-3.5 w-3.5 text-white" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-slate-300" />
            )}
            <span>{clonedToast ? 'Cloned' : 'Clone'}</span>
          </button>

          <button
            type="button"
            onClick={onCaptureScreenshot}
            className="hidden sm:flex items-center gap-1.5 rounded-xl bg-[#161920] hover:bg-[#1e222b] border border-white/[0.1] px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white transition cursor-pointer"
            title="Capturar Screenshot em Alta Definição"
          >
            <Camera className="h-3.5 w-3.5 text-slate-300" />
            <span>Screenshot</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileDrawer(!mobileDrawer)}
            className="lg:hidden rounded-xl bg-white text-slate-950 px-3 py-1.5 text-xs font-semibold cursor-pointer"
          >
            {mobileDrawer ? 'Ver 3D' : `Parts (${equippedCount}/8)`}
          </button>
        </div>
      </header>

      {(!compatibility.isCompatible || compatibility.warnings.length > 0) && (
        <div className="bg-[#161922] border-b border-white/[0.1] px-6 py-2 flex items-center justify-between text-xs text-slate-200 z-20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-slate-300 shrink-0" />
            <span>{compatibility.issues[0] || compatibility.warnings[0]}</span>
          </div>
          <button
            type="button"
            onClick={onOpenAssistant}
            className="rounded-lg bg-white/[0.1] hover:bg-white/[0.16] border border-white/[0.15] px-2.5 py-1 text-[11px] font-semibold text-white cursor-pointer shrink-0"
          >
            Resolver no Assistente
          </button>
        </div>
      )}

      <div className="relative flex-1 flex overflow-hidden">
        {!hide3D && (
          <div className="relative flex-1 h-full flex flex-col bg-[#090b0f] overflow-hidden">
            <div className="pointer-events-none absolute top-3.5 left-4 right-4 z-20 flex items-center justify-between gap-2">
              <div className="pointer-events-auto flex items-center gap-2" ref={dropdownRef}>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setViewMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 rounded-xl bg-[#13161d]/95 hover:bg-[#1b1f29] backdrop-blur-md border border-white/[0.1] px-3.5 py-2 text-xs font-medium text-slate-200 hover:text-white shadow-lg transition cursor-pointer"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5 text-slate-300" />
                    <span>Visualização 3D</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                        viewMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {viewMenuOpen && (
                    <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-[#13161d]/98 backdrop-blur-xl border border-white/[0.12] p-3.5 shadow-2xl space-y-4 z-30">
                      <div className="space-y-1.5">
                        <span className="block text-[11px] font-semibold text-slate-400">
                          Ângulos de Câmera
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { id: 'iso', label: 'Visão Geral' },
                            { id: 'side', label: 'Interior' },
                            { id: 'gpu', label: 'Placa de Vídeo' },
                            { id: 'cpu', label: 'Processador' },
                          ].map((cam) => (
                            <button
                              key={cam.id}
                              type="button"
                              onClick={() => {
                                onSnapCamera(cam.id);
                                setViewMenuOpen(false);
                              }}
                              className="rounded-lg bg-[#191d26] hover:bg-white/[0.1] border border-white/[0.07] hover:border-white/[0.18] px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white text-left transition cursor-pointer"
                            >
                              {cam.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-white/[0.08]">
                        <span className="block text-[11px] font-semibold text-slate-400">
                          Opções da Cena
                        </span>
                        <div className="space-y-1.5">
                          <button
                            type="button"
                            onClick={() => setShowGlass(!showGlass)}
                            className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium border transition cursor-pointer ${
                              !showGlass
                                ? 'bg-white/[0.12] border-white/[0.25] text-white'
                                : 'bg-[#191d26] border-white/[0.07] text-slate-300 hover:text-white'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {showGlass ? (
                                <EyeOff className="h-3.5 w-3.5 text-slate-300" />
                              ) : (
                                <Eye className="h-3.5 w-3.5 text-slate-300" />
                              )}
                              <span>
                                {showGlass
                                  ? 'Remover Vidro Temperado'
                                  : 'Colocar Vidro Temperado'}
                              </span>
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setExplodedView(!explodedView)}
                            className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium border transition cursor-pointer ${
                              explodedView
                                ? 'bg-white/[0.12] border-white/[0.25] text-white'
                                : 'bg-[#191d26] border-white/[0.07] text-slate-300 hover:text-white'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <Maximize2 className="h-3.5 w-3.5 text-slate-300" />
                              <span>Explodir Sockets</span>
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {explodedView ? 'Ativo' : 'Desativado'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setAutoRotate(!autoRotate)}
                            className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium border transition cursor-pointer ${
                              autoRotate
                                ? 'bg-white/[0.12] border-white/[0.25] text-white'
                                : 'bg-[#191d26] border-white/[0.07] text-slate-300 hover:text-white'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <RotateCw
                                className={`h-3.5 w-3.5 text-slate-300 ${
                                  autoRotate ? 'animate-spin' : ''
                                }`}
                              />
                              <span>Girar 360°</span>
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {autoRotate ? 'Ativo' : 'Desativado'}
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-white/[0.08]">
                        <span className="block text-[11px] font-semibold text-slate-400">
                          Ambiente HDRI de Estúdio
                        </span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { id: 'studio', label: 'Estúdio' },
                            { id: 'city', label: 'Neutro' },
                            { id: 'warehouse', label: 'Contraste' },
                          ].map((env) => (
                            <button
                              key={env.id}
                              type="button"
                              onClick={() => setEnvPreset(env.id)}
                              className={`rounded-lg py-1.5 px-2 text-xs font-medium border transition cursor-pointer ${
                                envPreset === env.id
                                  ? 'bg-white/[0.14] border-white/[0.28] text-white'
                                  : 'bg-[#191d26] border-white/[0.07] text-slate-400 hover:text-white'
                              }`}
                            >
                              {env.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                        <span className="block text-[11px] font-semibold text-slate-400">
                          Importar Modelo 3D (.GLB)
                        </span>
                        <select
                          value={uploadTargetCategory}
                          onChange={(e) => setUploadTargetCategory(e.target.value)}
                          className="w-full rounded-lg bg-[#0d0f14] border border-white/15 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white/40"
                        >
                          {HARDWARE_CATEGORIES.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                        <input
                          ref={glbInputRef}
                          type="file"
                          accept=".glb,.gltf"
                          onChange={handleGlbFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => glbInputRef.current?.click()}
                          className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-white hover:bg-slate-200 py-2 px-3 text-xs font-semibold text-slate-950 transition cursor-pointer"
                        >
                          <Upload className="h-3.5 w-3.5 text-slate-950" />
                          <span>Carregar Arquivo .GLB</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowGlass(!showGlass)}
                  className={`flex items-center gap-1.5 rounded-xl backdrop-blur-md border px-3.5 py-2 text-xs font-medium shadow-lg transition cursor-pointer ${
                    !showGlass
                      ? 'bg-white/[0.14] border-white/[0.28] text-white'
                      : 'bg-[#13161d]/95 hover:bg-[#1b1f29] border-white/[0.1] text-slate-200 hover:text-white'
                  }`}
                >
                  {showGlass ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5 text-slate-300" />
                      <span>Remover Vidro</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5 text-slate-300" />
                      <span>Colocar Vidro</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 w-full h-full">{children}</div>

            {screenshotToast && (
              <div className="pointer-events-auto absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-xl bg-[#161922] border border-white/[0.15] px-3.5 py-2 text-xs font-medium text-white shadow-lg">
                <CheckCircle2 className="h-4 w-4 text-slate-300" />
                <span>Screenshot capturado com sucesso</span>
              </div>
            )}
          </div>
        )}

        <aside
          className={`fixed lg:static top-14 bottom-0 right-0 z-30 ${
            hide3D
              ? 'w-full max-w-5xl mx-auto border-x border-white/[0.08]'
              : 'w-full sm:w-[420px] lg:w-[450px] border-l border-white/[0.08]'
          } shrink-0 bg-[#101217] flex flex-col transition-transform duration-300 ${
            mobileDrawer ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3 shrink-0 gap-2">
            <div className="flex items-center rounded-xl bg-[#161920] border border-white/[0.08] p-1">
              <button
                type="button"
                onClick={() => setSidebarTab('parts')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  sidebarTab === 'parts'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ListFilter className="h-3.5 w-3.5" />
                <span>Parts ({equippedCount}/8)</span>
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab('history')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  sidebarTab === 'history'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LineChart className="h-3.5 w-3.5" />
                <span>Price History</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenAssistant}
                className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-sm transition cursor-pointer"
                title="Abrir Assistente de Compatibilidade e Recomendação"
              >
                <Sparkles className="h-3.5 w-3.5 text-slate-950" />
                <span>Assistente</span>
              </button>
              <button
                type="button"
                onClick={onResetBuild}
                className="flex items-center justify-center rounded-xl bg-[#161920] hover:bg-[#1e222b] border border-white/[0.1] p-2 text-slate-300 hover:text-white transition cursor-pointer"
                title="Restaurar configuração padrão"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {sidebarTab === 'history' ? (
            <div className="flex-1 overflow-y-auto">
              <PriceHistoryPanel build={build} currency={currency} />
            </div>
          ) : (
            <div
              className={`flex-1 overflow-y-auto p-4 ${
                hide3D
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-3 content-start'
                  : 'space-y-2.5'
              }`}
            >
              {BUILDCORES_SLOT_ORDER.map((slot) => {
                const Icon = CATEGORY_ICONS[slot.id] || Cpu;
                const selectedPart = build[slot.id];

                if (!selectedPart) {
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => onOpenPartPicker(slot.id)}
                      className="w-full rounded-xl border border-dashed border-white/[0.15] hover:border-white/[0.3] bg-[#14171f]/60 hover:bg-[#181c26] p-3.5 flex items-center justify-between text-left transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-white/[0.04] group-hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-slate-400 group-hover:text-white transition">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="block text-xs text-slate-400">
                            {slot.label} ({slot.ptLabel})
                          </span>
                          <span className="block text-sm font-semibold text-slate-200 group-hover:text-white mt-0.5">
                            + Add {slot.label}
                          </span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 rounded-lg bg-white/[0.07] border border-white/[0.12] px-3 py-1.5 text-xs font-semibold text-slate-200 group-hover:bg-white group-hover:text-slate-950 transition">
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add {slot.label}</span>
                      </span>
                    </button>
                  );
                }

                return (
                  <div
                    key={slot.id}
                    className="rounded-xl bg-[#151820] hover:bg-[#191d27] border border-white/[0.07] hover:border-white/[0.14] p-3 transition"
                  >
                    <div className="flex items-center gap-3.5">
                      <ProductThumbnail
                        part={selectedPart}
                        onClick={() => onOpenPartDetails(slot.id, selectedPart)}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-slate-400 font-medium">
                            {slot.label} • {slot.ptLabel}
                          </span>
                          <span className="text-sm font-semibold text-slate-100 tabular-nums shrink-0">
                            {formatCurrency(selectedPart.price, currency)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onOpenPartDetails(slot.id, selectedPart)}
                          style={{ fontSize: '15px' }}
                          className="block text-left font-semibold text-white hover:text-slate-300 truncate w-full mt-0.5 cursor-pointer leading-snug"
                          title={selectedPart.name}
                        >
                          {selectedPart.name}
                        </button>

                        <div className="flex items-center justify-end gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => onOpenPartPicker(slot.id)}
                            className="rounded-lg bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.1] px-3 py-1 text-xs font-medium text-slate-100 hover:text-white transition cursor-pointer"
                          >
                            Trocar
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemovePart(slot.id)}
                            className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.09] border border-white/[0.07] hover:border-white/[0.16] px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-200 transition cursor-pointer"
                            title={`Remover ${slot.label}`}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-current" />
                            <span>Remover</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="p-4 border-t border-white/[0.08] bg-[#13161d] flex items-center justify-between shrink-0">
            <div>
              <span className="block text-xs text-slate-400">
                Valor Total do Setup
              </span>
              <span className="text-xl font-bold text-white tabular-nums">
                {formatCurrency(totalPrice, currency)}
              </span>
            </div>

            <button
              type="button"
              onClick={onCaptureScreenshot}
              className="flex items-center gap-2 rounded-xl bg-white hover:bg-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-sm transition cursor-pointer"
            >
              <Camera className="h-4 w-4 text-slate-950" />
              <span>Salvar Imagem</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
