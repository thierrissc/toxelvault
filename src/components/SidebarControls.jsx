import React, { useRef } from 'react';
import {
  Cpu,
  HardDrive,
  Fan,
  Zap,
  Box,
  CircuitBoard,
  MemoryStick,
  MonitorPlay,
  Sliders,
  Sun,
  Moon,
  Aperture,
  Grid,
  Upload,
  Camera,
  Code2,
  RotateCw,
  RotateCcw,
  CheckCircle2,
  Maximize2,
  DoorOpen,
  Sparkles,
  Eye,
  Flame,
} from 'lucide-react';
import {
  HARDWARE_CATEGORIES,
  HARDWARE_CATALOG,
  RGB_PRESETS,
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

export default function SidebarControls({
  build,
  activeCategory,
  setActiveCategory,
  onSelectPart,
  rgbPreset,
  setRgbPreset,
  fanRpmFactor,
  setFanRpmFactor,
  metalness,
  setMetalness,
  roughness,
  setRoughness,
  lightingMode,
  setLightingMode,
  wireframe,
  setWireframe,
  autoRotate,
  setAutoRotate,
  explodedView,
  setExplodedView,
  glassOpen,
  setGlassOpen,
  customLogoName,
  onUploadCustomTexture,
  onSnapCamera,
  onCaptureScreenshot,
  screenshotToast,
  onOpenInspector,
  onResetBuild,
  stats,
  totalPrice,
  totalWattage,
  cpuTemp,
  gpuTemp,
  mobileTab,
  setMobileTab,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onUploadCustomTexture(file);
    e.target.value = '';
  };

  const partsForCategory = HARDWARE_CATALOG[activeCategory] || [];
  const selectedPartInCat = build[activeCategory];

  // PSU Load percentage
  const psuCapacity = build.psu.capacityW || 1000;
  const psuLoadPercent = Math.min(98, Math.round((totalWattage / psuCapacity) * 100));

  // Estimated 4K Ultra Gaming FPS based on CPU + GPU scores
  const estGamingFps = Math.round(
    (build.gpu.perfScore * 1.45 + build.cpu.perfScore * 0.65) * 0.95
  );

  return (
    <>
      {/* =====================================================================
          TOP HEADER BAR (VoxelVault 3D PC Builder Studio & Camera Angles)
         ===================================================================== */}
      <header className="pointer-events-none fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
        {/* Brand Identity */}
        <div className="pointer-events-auto flex items-center gap-3 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/30 to-fuchsia-500/30 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.35)]">
            <Cpu className="h-5 w-5 text-cyan-300" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-sm md:text-base font-bold tracking-wider text-white uppercase">
                VoxelVault <span className="text-cyan-400">PC Builder 3D</span>
              </h1>
              <span className="hidden sm:inline-flex items-center rounded-md bg-cyan-500/15 px-1.5 py-0.5 text-[10px] font-mono-tech font-medium text-cyan-300 border border-cyan-400/30">
                RIG STUDIO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Montador Interativo 3D de Hardware, Fluxo de Ar &amp; Estética ARGB
            </p>
          </div>
        </div>

        {/* Camera Quick Angles & Live Telemetry Pill */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 p-1">
            <button
              onClick={() => onSnapCamera('iso')}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              3/4 Gabinete
            </button>
            <button
              onClick={() => onSnapCamera('side')}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-500/15 border border-cyan-400/30 hover:bg-cyan-500/25 transition cursor-pointer"
            >
              Interior Lateral
            </button>
            <button
              onClick={() => onSnapCamera('gpu')}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              Zoom GPU
            </button>
            <button
              onClick={() => onSnapCamera('cpu')}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              Zoom CPU/RAM
            </button>
          </div>

          {/* Real-Time FPS & Thermal Badge */}
          <button
            onClick={onOpenInspector}
            className="flex items-center gap-2 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 px-3 py-2 text-xs font-mono-tech text-slate-200 hover:border-cyan-400/40 transition cursor-pointer"
            title="Clique para abrir especificações completas do PC"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span>{stats.fps} FPS</span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-cyan-300">
              {cpuTemp}°C CPU • {gpuTemp}°C GPU
            </span>
          </button>
        </div>
      </header>

      {/* =====================================================================
          MOBILE PANEL SWITCHER TABS
         ===================================================================== */}
      <div className="pointer-events-auto fixed top-16 left-4 right-4 z-20 flex md:hidden gap-1.5 rounded-xl backdrop-blur-md bg-black/50 border border-white/10 p-1">
        <button
          onClick={() => setMobileTab(mobileTab === 'catalog' ? 'none' : 'catalog')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
            mobileTab === 'catalog'
              ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40'
              : 'text-slate-300'
          }`}
        >
          Peças &amp; Hardware
        </button>
        <button
          onClick={() => setMobileTab(mobileTab === 'customizer' ? 'none' : 'customizer')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
            mobileTab === 'customizer'
              ? 'bg-fuchsia-500/25 text-fuchsia-200 border border-fuchsia-400/40'
              : 'text-slate-300'
          }`}
        >
          Estética &amp; Gabinete
        </button>
        {mobileTab !== 'none' && (
          <button
            onClick={() => setMobileTab('none')}
            className="px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
          >
            Ver 3D
          </button>
        )}
      </div>

      {/* =====================================================================
          LEFT PANEL: SELETOR DE PEÇAS DE HARDWARE & COMPATIBILIDADE
         ===================================================================== */}
      <aside
        className={`fixed left-4 md:left-6 top-28 md:top-20 bottom-24 z-20 w-[calc(100vw-2rem)] sm:w-88 flex flex-col gap-3 transition-all duration-300 ${
          mobileTab === 'catalog'
            ? 'translate-x-0 opacity-100 pointer-events-auto'
            : '-translate-x-[120%] opacity-0 pointer-events-none md:translate-x-0 md:opacity-100 md:pointer-events-auto'
        }`}
      >
        <div className="flex-1 overflow-y-auto rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.5)] flex flex-col gap-3.5">
          {/* Category Tabs Grid (8 Hardware Categories) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-display text-xs font-bold uppercase tracking-wider text-slate-200">
                1. Escolha o Componente
              </span>
              <span className="font-mono-tech text-[10px] text-emerald-400 flex items-center gap-1">
                ✓ 100% Compatível
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {HARDWARE_CATEGORIES.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.id] || Cpu;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 px-1 text-[10px] font-mono-tech font-medium border transition cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                        : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.08] hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{cat.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Available Models for Active Category */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>
                Opções de{' '}
                <strong className="text-white">
                  {HARDWARE_CATEGORIES.find((c) => c.id === activeCategory)?.label}
                </strong>
              </span>
              <span className="font-mono-tech">{partsForCategory.length} modelos</span>
            </div>

            <div className="space-y-2">
              {partsForCategory.map((part) => {
                const isChosen = selectedPartInCat?.id === part.id;
                return (
                  <button
                    key={part.id}
                    onClick={() => onSelectPart(activeCategory, part)}
                    className={`w-full text-left rounded-xl p-3 transition-all border cursor-pointer ${
                      isChosen
                        ? 'bg-gradient-to-r from-cyan-500/20 via-white/10 to-transparent border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono-tech text-[10px] uppercase tracking-wider text-cyan-400">
                        {part.brand}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full bg-gradient-to-r px-2 py-0.5 text-[9px] font-medium border ${part.tierColor}`}
                      >
                        {part.tier}
                      </span>
                    </div>

                    <p className="font-display text-xs font-semibold text-white mt-0.5">
                      {part.name}
                    </p>

                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {part.description}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/10 font-mono-tech text-[11px]">
                      <span className="text-emerald-400 font-semibold">
                        R$ {part.price.toLocaleString('pt-BR')}
                      </span>
                      <span className="text-slate-400">
                        {part.capacityW
                          ? `${part.capacityW}W Output`
                          : `${part.wattage || 15}W TDP`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Build Summary Telemetry: Power Supply Load Bar & Total Price */}
          <div className="mt-auto rounded-xl bg-black/40 border border-white/10 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                Consumo Estimado vs Fonte
              </span>
              <span className="font-mono-tech text-xs font-bold text-white">
                {totalWattage}W / {psuCapacity}W ({psuLoadPercent}%)
              </span>
            </div>

            {/* Animated Wattage Load Bar */}
            <div className="relative h-2 w-full rounded-full overflow-hidden bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400 transition-all duration-500"
                style={{ width: `${psuLoadPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/10">
              <div>
                <span className="block text-[10px] font-mono-tech text-slate-400">
                  PERF. 4K ULTRA EST.
                </span>
                <span className="font-mono-tech text-xs font-bold text-cyan-300">
                  ~{estGamingFps} FPS Médio
                </span>
              </div>
              <div className="text-right">
                <span className="block text-[10px] font-mono-tech text-slate-400">
                  ORÇAMENTO TOTAL DA BUILD
                </span>
                <span className="font-display text-sm font-bold text-emerald-400">
                  R$ {totalPrice.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* =====================================================================
          RIGHT PANEL: CONTROLES DO GABINETE 3D, VISTA EXPLODIDA & ARGB
         ===================================================================== */}
      <aside
        className={`fixed right-4 md:right-6 top-28 md:top-20 bottom-24 z-20 w-[calc(100vw-2rem)] sm:w-84 flex flex-col gap-3 transition-all duration-300 ${
          mobileTab === 'customizer'
            ? 'translate-x-0 opacity-100 pointer-events-auto'
            : 'translate-x-[120%] opacity-0 pointer-events-none md:translate-x-0 md:opacity-100 md:pointer-events-auto'
        }`}
      >
        <div className="flex-1 overflow-y-auto rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.5)] flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-fuchsia-400" />
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-slate-200">
                Inspeção Física &amp; ARGB
              </h2>
            </div>
            <button
              onClick={onResetBuild}
              className="flex items-center gap-1 text-[11px] font-mono-tech text-slate-400 hover:text-cyan-300 transition cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>

          {/* Interactive Case Mechanics: Exploded View & Open Glass Door */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setExplodedView(!explodedView)}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-xl p-3 text-xs font-semibold border transition cursor-pointer ${
                explodedView
                  ? 'bg-gradient-to-br from-cyan-500/30 to-fuchsia-500/30 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                  : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.09]'
              }`}
            >
              <Maximize2 className="h-4 w-4 text-cyan-300" />
              <span>Vista Explodida</span>
              <span className="text-[10px] font-mono-tech text-slate-400">
                {explodedView ? 'ATIVADA' : 'Separar Peças'}
              </span>
            </button>

            <button
              onClick={() => setGlassOpen(!glassOpen)}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-xl p-3 text-xs font-semibold border transition cursor-pointer ${
                glassOpen
                  ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                  : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.09]'
              }`}
            >
              <DoorOpen className="h-4 w-4 text-fuchsia-300" />
              <span>Vidro Lateral</span>
              <span className="text-[10px] font-mono-tech text-slate-400">
                {glassOpen ? 'ABERTO' : 'FECHADO'}
              </span>
            </button>
          </div>

          {/* Synchronized ARGB Lighting Theme Selector */}
          <div className="space-y-2">
            <label className="block font-mono-tech text-[10px] uppercase tracking-wider text-slate-400">
              Sincronização ARGB (Aura / Mystic Light)
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {RGB_PRESETS.map((preset) => {
                const active = rgbPreset.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setRgbPreset(preset)}
                    title={preset.name}
                    className={`group flex flex-col items-center gap-1 rounded-xl p-2 border transition cursor-pointer ${
                      active
                        ? 'bg-white/15 border-white shadow-[0_0_12px_rgba(255,255,255,0.25)]'
                        : 'bg-black/30 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <span
                      className="h-5 w-5 rounded-full border border-white/40"
                      style={{
                        background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})`,
                      }}
                    />
                    <span className="text-[9px] font-mono-tech text-slate-300 truncate w-full text-center">
                      {preset.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sliders: Fan RPM, Metalness, Roughness */}
          <div className="space-y-3.5 rounded-xl bg-black/35 border border-white/10 p-3.5">
            {/* Fan RPM Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-200 font-medium">
                  <Fan className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
                  Rotação das Fans (RPM)
                </span>
                <span className="font-mono-tech text-cyan-300">
                  {Math.round(600 + fanRpmFactor * 350)} RPM
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={fanRpmFactor}
                onChange={(e) => setFanRpmFactor(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Metalness Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-200 font-medium">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  Acabamento Metálico (PBR)
                </span>
                <span className="font-mono-tech text-amber-300">
                  {Math.round(metalness * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={metalness}
                onChange={(e) => setMetalness(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Roughness Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-200 font-medium">
                  <Flame className="h-3.5 w-3.5 text-fuchsia-400" />
                  Rugosidade Anodizada
                </span>
                <span className="font-mono-tech text-fuchsia-300">
                  {Math.round(roughness * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={roughness}
                onChange={(e) => setRoughness(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Studio Environment Lighting Mode */}
          <div className="space-y-1.5">
            <label className="block font-mono-tech text-[10px] uppercase tracking-wider text-slate-400">
              Ambiente de Iluminação
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'studio', label: 'Estúdio', icon: Aperture },
                { id: 'neon', label: 'Noite Neon', icon: Moon },
                { id: 'solar', label: 'Luz Solar', icon: Sun },
              ].map((mode) => {
                const Icon = mode.icon;
                const active = lightingMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setLightingMode(mode.id)}
                    className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 px-2 text-xs font-medium border transition cursor-pointer ${
                      active
                        ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200'
                        : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.08] hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wireframe & Auto-Rotate Toggles */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setWireframe(!wireframe)}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-medium border transition cursor-pointer ${
                wireframe
                  ? 'bg-fuchsia-500/25 border-fuchsia-400/60 text-fuchsia-200'
                  : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.08]'
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Wireframe {wireframe ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-medium border transition cursor-pointer ${
                autoRotate
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                  : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.08]'
              }`}
            >
              <RotateCw className={`h-3.5 w-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
              <span>Girar PC 360°</span>
            </button>
          </div>

          {/* Custom Wallpaper / GPU Backplate & AIO LCD Upload */}
          <div className="mt-auto pt-2 border-t border-white/10">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500/20 via-fuchsia-500/20 to-cyan-500/20 hover:from-cyan-500/30 hover:to-fuchsia-500/30 border border-cyan-400/40 py-2.5 px-3 text-xs font-semibold text-white transition cursor-pointer"
            >
              <Upload className="h-4 w-4 text-cyan-300" />
              <span>Customizar Tela LCD / Backplate GPU</span>
            </button>
            {customLogoName && (
              <p className="mt-1 text-center font-mono-tech text-[10px] text-emerald-300 truncate">
                ✓ Imagem aplicada: {customLogoName}
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* =====================================================================
          BOTTOM BAR: SCREENSHOT HD TRANSPARENTE & ESPECIFICAÇÕES DA BUILD
         ===================================================================== */}
      <footer className="pointer-events-none fixed bottom-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-center justify-center gap-3">
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 sm:gap-3 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 px-4 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.65)]">
          <div className="hidden xl:flex items-center gap-2 pr-3 border-r border-white/10 text-xs text-slate-300">
            <Eye className="h-3.5 w-3.5 text-cyan-400" />
            <span>Arraste para girar o PC 3D • Scroll para dar zoom nas peças</span>
          </div>

          <button
            onClick={onCaptureScreenshot}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.45)] transition cursor-pointer"
          >
            <Camera className="h-4 w-4" />
            <span>Capturar Screenshot HD</span>
          </button>

          <button
            onClick={onOpenInspector}
            className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 px-4 py-2 text-xs font-medium text-white transition cursor-pointer"
          >
            <Code2 className="h-4 w-4 text-fuchsia-400" />
            <span>Ficha Técnica Completa / Exportar Build</span>
          </button>
        </div>

        {screenshotToast && (
          <div className="pointer-events-auto flex items-center gap-2 rounded-xl backdrop-blur-md bg-emerald-500/20 border border-emerald-400/50 px-3.5 py-2 text-xs font-medium text-emerald-200 shadow-lg">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>PNG Transparente HD do seu PC exportado!</span>
          </div>
        )}
      </footer>
    </>
  );
}
