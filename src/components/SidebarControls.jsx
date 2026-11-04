import React, { useRef, useState, useEffect } from 'react';
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
} from 'lucide-react';
import {
  HARDWARE_CATEGORIES,
  validateBuildCompatibility,
  getFallbackProductPhotoDataUri,
  cleanProductImage,
} from '../utils/textureGenerator';

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

function ProductThumbnail({ part, onClick }) {
  const rawUrl = part?.imageUrl || part?.realPhotoUrl || '';
  const fallbackUri = getFallbackProductPhotoDataUri(part);
  const [resolvedSrc, setResolvedSrc] = useState(() => fallbackUri);

  useEffect(() => {
    let active = true;
    cleanProductImage(rawUrl, part).then((uri) => {
      if (active && uri) {
        setResolvedSrc(uri);
      }
    });
    return () => {
      active = false;
    };
  }, [rawUrl, part]);

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ width: '56px', height: '56px', backgroundColor: '#ffffff' }}
      className="relative shrink-0 rounded-xl overflow-hidden border border-white/15 flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 transition-transform"
      title={`Ver detalhes de ${part?.name || ''}`}
    >
      <img
        src={resolvedSrc || fallbackUri}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = fallbackUri;
        }}
        alt={part?.name || 'Produto'}
        style={{
          objectFit: 'contain',
          objectPosition: 'center',
          padding: '4px',
        }}
        className="w-full h-full"
      />
    </button>
  );
}

export default function SidebarControls({
  build,
  onRemovePart,
  onUploadCustomGlb,
  onOpenPartPicker,
  onOpenPartDetails,
  envPreset,
  setEnvPreset,
  autoRotate,
  setAutoRotate,
  explodedView,
  setExplodedView,
  showGlass = true,
  setShowGlass,
  onSnapCamera,
  onCaptureScreenshot,
  screenshotToast,
  onResetBuild,
  totalPrice,
  children,
}) {
  const glbInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [uploadTargetCategory, setUploadTargetCategory] = useState('gpu');
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState(false);

  const compatibility = validateBuildCompatibility(build);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setViewMenuOpen(false);
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

  const equippedCount = HARDWARE_CATEGORIES.filter((c) => Boolean(build[c.id])).length;

  return (
    <div className="flex flex-col w-screen h-screen bg-[#0b0c10] text-slate-100 overflow-hidden select-none">
      <header className="h-14 shrink-0 flex items-center justify-between px-4 lg:px-6 bg-[#111318] border-b border-white/[0.08] z-20">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600/20 border border-rose-500/40 text-rose-400">
            <Box className="h-4 w-4" />
          </div>
          <span className="font-display text-sm font-bold tracking-wide text-white">
            VOXELVAULT
          </span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto py-1">
          <div
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs ${
              compatibility.isCompatible
                ? 'bg-[#181b22] border-white/[0.08] text-emerald-400'
                : 'bg-rose-500/15 border-rose-500/50 text-rose-300'
            }`}
          >
            {compatibility.isCompatible ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-medium">
                  Peças Compatíveis
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                <span className="font-semibold">
                  Incompatibilidade Detectada
                </span>
              </>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-[#181b22] border border-white/[0.08] px-3 py-1.5 text-xs">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-semibold text-amber-300">
              {compatibility.totalTdp}W
            </span>
            <span className="text-slate-400 text-[11px]">
              / {compatibility.psuWatts}W
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCaptureScreenshot}
            className="hidden sm:flex items-center gap-1.5 rounded-lg bg-[#181b22] hover:bg-[#222630] border border-white/[0.1] px-3 py-1.5 text-xs font-medium text-slate-200 transition cursor-pointer"
          >
            <Camera className="h-3.5 w-3.5 text-sky-400" />
            <span>Capturar Foto</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileDrawer(!mobileDrawer)}
            className="lg:hidden rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white cursor-pointer"
          >
            {mobileDrawer ? 'Ver 3D' : `Peças (${equippedCount}/8)`}
          </button>
        </div>
      </header>

      {!compatibility.isCompatible && (
        <div className="bg-rose-950/90 border-b border-rose-500/40 px-6 py-2 flex items-center justify-between text-xs text-rose-200 z-20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{compatibility.issues[0]}</span>
          </div>
          <button
            type="button"
            onClick={() => onOpenPartPicker('motherboard')}
            className="rounded bg-rose-500/30 hover:bg-rose-500/50 border border-rose-400/40 px-2.5 py-0.5 text-[11px] font-semibold text-white cursor-pointer shrink-0"
          >
            Trocar Placa-Mãe
          </button>
        </div>
      )}

      <div className="relative flex-1 flex overflow-hidden">
        <div className="relative flex-1 h-full flex flex-col bg-[#0c0e13] overflow-hidden">
          <div className="pointer-events-none absolute top-3.5 left-4 right-4 z-20 flex items-center justify-between gap-2">
            <div className="pointer-events-auto flex items-center gap-2" ref={dropdownRef}>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setViewMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-xl bg-[#14171f]/95 hover:bg-[#1c202b] backdrop-blur-md border border-white/[0.1] px-3.5 py-2 text-xs font-semibold text-white shadow-lg transition cursor-pointer"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-sky-400" />
                  <span>Visualização 3D</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                      viewMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {viewMenuOpen && (
                  <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-[#14171f]/98 backdrop-blur-xl border border-white/[0.12] p-3.5 shadow-2xl space-y-4 z-30">
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
                            className="rounded-lg bg-[#1c202b] hover:bg-sky-500/20 border border-white/[0.07] hover:border-sky-400/40 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white text-left transition cursor-pointer"
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
                              ? 'bg-sky-500/20 border-sky-400/40 text-sky-300'
                              : 'bg-[#1c202b] border-white/[0.07] text-slate-200 hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {showGlass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            <span>{showGlass ? 'Remover Vidro do Gabinete' : 'Colocar Vidro do Gabinete'}</span>
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setExplodedView(!explodedView)}
                          className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium border transition cursor-pointer ${
                            explodedView
                              ? 'bg-sky-500/20 border-sky-400/40 text-sky-300'
                              : 'bg-[#1c202b] border-white/[0.07] text-slate-200 hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Maximize2 className="h-3.5 w-3.5" />
                            <span>Explodir Peças</span>
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
                              ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                              : 'bg-[#1c202b] border-white/[0.07] text-slate-200 hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <RotateCw className={`h-3.5 w-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
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
                        Iluminação do Estúdio
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'studio', label: 'Estúdio' },
                          { id: 'city', label: 'Neutra' },
                          { id: 'warehouse', label: 'Contraste' },
                        ].map((env) => (
                          <button
                            key={env.id}
                            type="button"
                            onClick={() => setEnvPreset(env.id)}
                            className={`rounded-lg py-1.5 px-2 text-xs font-medium border transition cursor-pointer ${
                              envPreset === env.id
                                ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                                : 'bg-[#1c202b] border-white/[0.07] text-slate-300 hover:text-white'
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
                        className="w-full rounded-lg bg-[#0e1015] border border-white/15 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400"
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
                        className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 py-2 px-3 text-xs font-bold text-slate-950 transition cursor-pointer"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>Carregar Arquivo .GLB</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowGlass(!showGlass)}
                className={`flex items-center gap-1.5 rounded-xl backdrop-blur-md border px-3.5 py-2 text-xs font-semibold shadow-lg transition cursor-pointer ${
                  !showGlass
                    ? 'bg-sky-500/20 border-sky-400/50 text-sky-300'
                    : 'bg-[#14171f]/95 hover:bg-[#1c202b] border-white/[0.1] text-slate-200 hover:text-white'
                }`}
              >
                {showGlass ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5 text-sky-400" />
                    <span>Remover Vidro</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5 text-sky-400" />
                    <span>Colocar Vidro</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 w-full h-full">{children}</div>

          {screenshotToast && (
            <div className="pointer-events-auto absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-lg bg-emerald-500/20 border border-emerald-400/40 px-3.5 py-2 text-xs font-medium text-emerald-200 shadow-lg">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Imagem capturada com sucesso!</span>
            </div>
          )}
        </div>

        <aside
          className={`fixed lg:static top-14 bottom-0 right-0 z-30 w-full sm:w-[420px] lg:w-[440px] shrink-0 bg-[#111318] border-l border-white/[0.08] flex flex-col transition-transform duration-300 ${
            mobileDrawer ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3.5 shrink-0">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-rose-500" />
                <span>Montador de PC</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {equippedCount} de 8 componentes selecionados
              </p>
            </div>

            <button
              type="button"
              onClick={onResetBuild}
              className="flex items-center gap-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition cursor-pointer"
              title="Restaurar configuração padrão"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restaurar</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {HARDWARE_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id] || Cpu;
              const selectedPart = build[cat.id];

              if (!selectedPart) {
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onOpenPartPicker(cat.id)}
                    className="w-full rounded-xl border border-dashed border-white/20 hover:border-sky-400/60 bg-[#151821]/60 hover:bg-[#191d28] p-3.5 flex items-center justify-between text-left transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-white/[0.04] group-hover:bg-sky-500/15 border border-white/[0.08] flex items-center justify-center text-slate-400 group-hover:text-sky-400 transition">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="block text-xs text-slate-400">
                          {cat.label}
                        </span>
                        <span className="block text-[15px] font-semibold text-sky-400 group-hover:text-sky-300 mt-0.5">
                          + Escolher {cat.label}
                        </span>
                      </div>
                    </div>

                    <span className="rounded-lg bg-sky-500/15 border border-sky-400/30 px-3 py-1.5 text-xs font-semibold text-sky-300 group-hover:bg-sky-500 group-hover:text-slate-950 transition">
                      Adicionar
                    </span>
                  </button>
                );
              }

              return (
                <div
                  key={cat.id}
                  className="rounded-xl bg-[#161922] hover:bg-[#1b1f2a] border border-white/[0.08] p-3 transition"
                >
                  <div className="flex items-center gap-3.5">
                    <ProductThumbnail
                      part={selectedPart}
                      onClick={() => onOpenPartDetails(cat.id, selectedPart)}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-400 font-medium">
                          {cat.label}
                        </span>
                        <span className="text-sm font-bold text-emerald-400 shrink-0">
                          ${selectedPart.price.toFixed(2)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenPartDetails(cat.id, selectedPart)}
                        style={{ fontSize: '15px' }}
                        className="block text-left font-semibold text-white hover:text-sky-400 truncate w-full mt-0.5 cursor-pointer leading-snug"
                        title={selectedPart.name}
                      >
                        {selectedPart.name}
                      </button>

                      <div className="flex items-center justify-end gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => onOpenPartPicker(cat.id)}
                          className="rounded-lg bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.1] px-3 py-1 text-xs font-semibold text-white transition cursor-pointer"
                        >
                          Trocar
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemovePart(cat.id)}
                          className="flex items-center gap-1 rounded-lg bg-rose-500/15 hover:bg-rose-600 border border-rose-500/30 hover:border-rose-500 px-2.5 py-1 text-xs font-semibold text-rose-400 hover:text-white transition cursor-pointer"
                          title={`Remover ${cat.label} do PC 3D`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Remover</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-white/[0.08] bg-[#14171f] flex items-center justify-between shrink-0">
            <div>
              <span className="block text-xs text-slate-400">
                Valor Total do Setup
              </span>
              <span className="text-xl font-bold text-emerald-400">
                ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <button
              type="button"
              onClick={onCaptureScreenshot}
              className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg transition cursor-pointer"
            >
              <Camera className="h-4 w-4" />
              <span>Salvar Imagem</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
