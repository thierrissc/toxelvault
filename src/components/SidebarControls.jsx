import React, { useRef } from 'react';
import {
  Wind,
  Sparkles,
  Sun,
  Moon,
  Aperture,
  Grid,
  Upload,
  Camera,
  Code2,
  RotateCw,
  TrendingUp,
  ShieldCheck,
  Sliders,
  Layers,
  Eye,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { SKIN_THEMES } from '../utils/textureGenerator';

/**
 * SVG Price History Chart for the selected skin
 */
function PriceSparkline({ data, accentHex }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(1, max - min);
  const width = 240;
  const height = 54;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 14) - 7;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div className="relative pt-1">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-14 overflow-visible"
      >
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accentHex || '#22d3ee'} stopOpacity="0.38" />
            <stop offset="100%" stopColor={accentHex || '#22d3ee'} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#sparkGrad)" />
        <polyline
          fill="none"
          stroke={accentHex || '#22d3ee'}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {data.map((val, idx) => {
          const x = (idx / (data.length - 1)) * width;
          const y = height - ((val - min) / range) * (height - 14) - 7;
          return (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r={idx === data.length - 1 ? 3.5 : 2}
              fill={idx === data.length - 1 ? '#ffffff' : accentHex || '#22d3ee'}
              stroke={accentHex || '#22d3ee'}
              strokeWidth="1.5"
            />
          );
        })}
      </svg>
      <div className="flex justify-between text-[10px] font-mono-tech text-slate-400 mt-1">
        <span>7D AGO</span>
        <span>5D</span>
        <span>3D</span>
        <span>ONTEM</span>
        <span className="text-cyan-300 font-semibold">AGORA</span>
      </div>
    </div>
  );
}

export default function SidebarControls({
  selectedThemeId,
  onSelectTheme,
  activeTheme,
  thumbnails,
  customTextureName,
  onUploadCustomTexture,
  windSpeed,
  setWindSpeed,
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
  onSnapCamera,
  onCaptureScreenshot,
  screenshotToast,
  onOpenInspector,
  onResetMaterial,
  stats,
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

  // Float marker percentage (0.00 to 0.15 scale for visual clarity)
  const floatPercent = Math.min(96, Math.max(4, (activeTheme.floatValue / 0.08) * 100));

  return (
    <>
      {/* =====================================================================
          TOP HEADER BAR (Cyberpunk Glassmorphism Brand & Live Telemetry)
         ===================================================================== */}
      <header className="pointer-events-none fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
        {/* Brand Identity */}
        <div className="pointer-events-auto flex items-center gap-3 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/30 to-fuchsia-500/30 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.35)]">
            <Layers className="h-5 w-5 text-cyan-300" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-sm md:text-base font-bold tracking-wider text-white uppercase">
                VoxelVault <span className="text-cyan-400">3D</span>
              </h1>
              <span className="hidden sm:inline-flex items-center rounded-md bg-cyan-500/15 px-1.5 py-0.5 text-[10px] font-mono-tech font-medium text-cyan-300 border border-cyan-400/30">
                WEBGL 2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Vitrine Interativa de Ativos Digitais &amp; Skins Procedurais
            </p>
          </div>
        </div>

        {/* Camera Quick Angles & Live FPS Pill */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 p-1">
            <button
              onClick={() => onSnapCamera('iso')}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
              title="Ângulo 3/4 Isométrico"
            >
              3/4 Orbit
            </button>
            <button
              onClick={() => onSnapCamera('cape')}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-500/15 border border-cyan-400/30 hover:bg-cyan-500/25 transition cursor-pointer"
              title="Focar na Capa Traseira"
            >
              Focar Capa
            </button>
            <button
              onClick={() => onSnapCamera('front')}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
              title="Visão Frontal da Armadura"
            >
              Armadura
            </button>
          </div>

          {/* Real-Time FPS Badge */}
          <button
            onClick={onOpenInspector}
            className="flex items-center gap-2 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 px-3 py-2 text-xs font-mono-tech text-slate-200 hover:border-cyan-400/40 transition cursor-pointer"
            title="Clique para abrir especificações técnicas"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span>{stats.fps} FPS</span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-cyan-300">{stats.triangles} TRIS</span>
          </button>
        </div>
      </header>

      {/* =====================================================================
          MOBILE PANEL SWITCHER TABS (Visible only on small screens)
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
          Catálogo &amp; Raridade
        </button>
        <button
          onClick={() => setMobileTab(mobileTab === 'customizer' ? 'none' : 'customizer')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
            mobileTab === 'customizer'
              ? 'bg-fuchsia-500/25 text-fuchsia-200 border border-fuchsia-400/40'
              : 'text-slate-300'
          }`}
        >
          Customizador 3D
        </button>
        {mobileTab !== 'none' && (
          <button
            onClick={() => setMobileTab('none')}
            className="px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
          >
            3D
          </button>
        )}
      </div>

      {/* =====================================================================
          LEFT PANEL: CATÁLOGO, RARIDADE, FLOAT & VALORIZAÇÃO
         ===================================================================== */}
      <aside
        className={`fixed left-4 md:left-6 top-28 md:top-20 bottom-24 z-20 w-[calc(100vw-2rem)] sm:w-80 flex flex-col gap-3 transition-all duration-300 ${
          mobileTab === 'catalog'
            ? 'translate-x-0 opacity-100 pointer-events-auto'
            : '-translate-x-[120%] opacity-0 pointer-events-none md:translate-x-0 md:opacity-100 md:pointer-events-auto'
        }`}
      >
        <div className="flex-1 overflow-y-auto rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.5)] flex flex-col gap-4">
          {/* Section Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-slate-200">
                Catálogo de Ativos
              </h2>
            </div>
            <span className="font-mono-tech text-[11px] text-slate-400">
              {SKIN_THEMES.length} SKINS PROCEDURAIS
            </span>
          </div>

          {/* Skin Selector Cards with Procedural Thumbnails */}
          <div className="grid grid-cols-1 gap-2">
            {SKIN_THEMES.map((theme) => {
              const isSelected = selectedThemeId === theme.id && !customTextureName;
              return (
                <button
                  key={theme.id}
                  onClick={() => onSelectTheme(theme.id)}
                  className={`group relative flex items-center gap-3 rounded-xl p-2.5 text-left transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500/20 via-white/10 to-transparent border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:border-white/20'
                  }`}
                >
                  {/* Pixelated Canvas Thumbnail */}
                  <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-black/40">
                    {thumbnails[theme.id] && (
                      <img
                        src={thumbnails[theme.id]}
                        alt={theme.name}
                        className="h-full w-full object-cover"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-display text-xs font-semibold text-white truncate">
                        {theme.name}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r px-2 py-0.5 text-[10px] font-medium border ${theme.rarityColor}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${theme.badgeDot}`} />
                        {theme.rarity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {theme.subtitle}
                    </p>
                    <div className="flex items-center justify-between mt-1 text-[10px] font-mono-tech">
                      <span className="text-slate-300">{theme.priceCurrent}</span>
                      <span className="text-emerald-400">{theme.priceChange}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Item Details & Animated Float/Wear Bar */}
          <div className="rounded-xl bg-black/35 border border-white/10 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono-tech uppercase tracking-wider text-slate-400">
                  INSPEÇÃO DE DESGASTE (FLOAT)
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-mono-tech text-sm font-bold text-white">
                    {activeTheme.floatValue.toFixed(4)}
                  </span>
                  <span className="text-xs font-medium text-cyan-300">
                    — {customTextureName ? 'Custom Mint' : activeTheme.wearLabel}
                  </span>
                </div>
              </div>
              <span className="rounded-md bg-white/5 border border-white/10 px-2 py-1 font-mono-tech text-[10px] text-slate-300">
                {activeTheme.specs.serial}
              </span>
            </div>

            {/* Animated Float Spectrum Bar */}
            <div className="space-y-1.5">
              <div className="relative h-2.5 w-full rounded-full overflow-hidden bg-slate-800 p-[1px]">
                <div className="h-full w-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 via-amber-400 to-rose-500 opacity-85" />
                {/* Animated Indicator Pin */}
                <div
                  className="absolute top-0 bottom-0 w-1.5 -ml-0.5 rounded-full bg-white shadow-[0_0_10px_#ffffff] transition-all duration-700 ease-out"
                  style={{ left: `${floatPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono-tech text-slate-400">
                <span>0.00 FN</span>
                <span>0.07 MW</span>
                <span>0.15 FT</span>
                <span>0.45 BS</span>
              </div>
            </div>

            <p className="text-[11px] leading-relaxed text-slate-300/90">
              {customTextureName
                ? `Textura customizada "${customTextureName}" carregada diretamente na malha UV da capa e armadura.`
                : activeTheme.description}
            </p>
          </div>

          {/* Simulated Market Valuation History */}
          <div className="rounded-xl bg-black/35 border border-white/10 p-3.5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[10px] font-mono-tech uppercase tracking-wider text-slate-300">
                  Histórico de Valorização
                </span>
              </div>
              <span className="font-mono-tech text-xs font-semibold text-emerald-400">
                {activeTheme.priceChange}
              </span>
            </div>
            <PriceSparkline
              data={activeTheme.priceHistory}
              accentHex={activeTheme.accentHex}
            />
          </div>
        </div>
      </aside>

      {/* =====================================================================
          RIGHT PANEL: CUSTOMIZADOR & INSPETOR TÉCNICO EM TEMPO REAL
         ===================================================================== */}
      <aside
        className={`fixed right-4 md:right-6 top-28 md:top-20 bottom-24 z-20 w-[calc(100vw-2rem)] sm:w-80 flex flex-col gap-3 transition-all duration-300 ${
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
                Customizador &amp; Shader PBR
              </h2>
            </div>
            <button
              onClick={onResetMaterial}
              className="flex items-center gap-1 text-[11px] font-mono-tech text-slate-400 hover:text-cyan-300 transition cursor-pointer"
              title="Restaurar parâmetros originais do tema"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>

          {/* Real-Time Sliders: Wind Speed, Metalness, Roughness */}
          <div className="space-y-4 rounded-xl bg-black/35 border border-white/10 p-3.5">
            {/* Wind Speed Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-200 font-medium">
                  <Wind className="h-3.5 w-3.5 text-cyan-400" />
                  Velocidade do Vento (Capa)
                </span>
                <span className="font-mono-tech text-cyan-300">
                  {windSpeed.toFixed(1)} m/s
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                step="0.1"
                value={windSpeed}
                onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Metalness Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-200 font-medium">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  Brilho Metálico (Metalness)
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
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-200 font-medium">
                  <Aperture className="h-3.5 w-3.5 text-fuchsia-400" />
                  Rugosidade (Roughness)
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

          {/* Lighting Environment Selector (Estúdio, Noite Neon, Luz Solar) */}
          <div className="space-y-2">
            <label className="block font-mono-tech text-[10px] uppercase tracking-wider text-slate-400">
              Modo de Iluminação 3-Point
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
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-xl py-2.5 px-2 text-xs font-medium border transition cursor-pointer ${
                      active
                        ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                        : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.08] hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Technical Toggles: Wireframe & Auto-Rotate */}
          <div className="space-y-2">
            <label className="block font-mono-tech text-[10px] uppercase tracking-wider text-slate-400">
              Inspeção de Malha &amp; Câmera
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setWireframe(!wireframe)}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-medium border transition cursor-pointer ${
                  wireframe
                    ? 'bg-fuchsia-500/25 border-fuchsia-400/60 text-fuchsia-200 shadow-[0_0_15px_rgba(217,70,239,0.3)]'
                    : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.08]'
                }`}
              >
                <Grid className="h-4 w-4" />
                <span>Wireframe {wireframe ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-medium border transition cursor-pointer ${
                  autoRotate
                    ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                    : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.08]'
                }`}
              >
                <RotateCw className={`h-4 w-4 ${autoRotate ? 'animate-spin' : ''}`} />
                <span>Auto-Giro</span>
              </button>
            </div>
          </div>

          {/* Custom Texture Upload (.png / .jpg) */}
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
              className="w-full group relative flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 via-fuchsia-500/20 to-cyan-500/20 hover:from-cyan-500/30 hover:to-fuchsia-500/30 border border-cyan-400/40 py-3 px-4 text-xs font-semibold text-white shadow-[0_0_20px_rgba(6,182,212,0.2)] transition cursor-pointer"
            >
              <Upload className="h-4 w-4 text-cyan-300 group-hover:scale-110 transition-transform" />
              <span>Upload de Textura (.PNG / .JPG)</span>
            </button>
            {customTextureName && (
              <p className="mt-1.5 text-center font-mono-tech text-[10px] text-emerald-300 truncate">
                ✓ Ativo: {customTextureName}
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* =====================================================================
          BOTTOM BAR: CONVERSÃO, SCREENSHOT HD TRANSPARENTE & ESPECIFICAÇÕES
         ===================================================================== */}
      <footer className="pointer-events-none fixed bottom-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-center justify-center gap-3">
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 sm:gap-3 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 px-4 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.65)]">
          {/* Interactive Hint */}
          <div className="hidden xl:flex items-center gap-2 pr-3 border-r border-white/10 text-xs text-slate-300">
            <Eye className="h-3.5 w-3.5 text-cyan-400" />
            <span>Arraste para orbitar • Scroll para zoom</span>
          </div>

          {/* Capture Transparent HD Screenshot Button */}
          <button
            onClick={onCaptureScreenshot}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.45)] transition cursor-pointer"
          >
            <Camera className="h-4 w-4" />
            <span>Capturar Screenshot HD</span>
          </button>

          {/* Open Technical Specs / Code Modal */}
          <button
            onClick={onOpenInspector}
            className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 px-4 py-2 text-xs font-medium text-white transition cursor-pointer"
          >
            <Code2 className="h-4 w-4 text-fuchsia-400" />
            <span>Inspecionar Código / Especificações</span>
          </button>
        </div>

        {/* Toast notification when HD screenshot is exported */}
        {screenshotToast && (
          <div className="pointer-events-auto flex items-center gap-2 rounded-xl backdrop-blur-md bg-emerald-500/20 border border-emerald-400/50 px-3.5 py-2 text-xs font-medium text-emerald-200 shadow-lg">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>PNG Transparente HD exportado com sucesso!</span>
          </div>
        )}
      </footer>
    </>
  );
}
