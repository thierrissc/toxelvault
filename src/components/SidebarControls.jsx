import React, { useRef, useState } from 'react';
import {
  Cpu,
  HardDrive,
  Fan,
  Zap,
  Box,
  CircuitBoard,
  MemoryStick,
  MonitorPlay,
  Wind,
  CheckCircle2,
  Camera,
  Code2,
  RotateCw,
  RotateCcw,
  Maximize2,
  DoorOpen,
  Upload,
  Grid,
  Sliders,
  Plus,
  Info,
  Share2,
  TrendingUp,
} from 'lucide-react';
import {
  HARDWARE_CATEGORIES,
  RGB_PRESETS,
  getHardwareProductPhoto,
} from '../utils/textureGenerator';

const CATEGORY_ICONS = {
  case: Box,
  cpu: Cpu,
  motherboard: CircuitBoard,
  gpu: MonitorPlay,
  ram: MemoryStick,
  cooler: Fan,
  storage: HardDrive,
  psu: Zap,
  fans: Wind,
};

export default function SidebarControls({
  build,
  onOpenPartPicker,
  onOpenPartDetails,
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
  children, // The 3D Canvas viewport passed into the center area
}) {
  const fileInputRef = useRef(null);
  const [rightTab, setRightTab] = useState('parts'); // 'parts' | 'settings'
  const [mobileDrawer, setMobileDrawer] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onUploadCustomTexture(file);
    e.target.value = '';
  };

  // Compatibility check between CPU socket & Motherboard socket
  const isSocketCompatible =
    build.motherboard.socket.includes(build.cpu.socket) ||
    build.cpu.socket.includes(build.motherboard.socket);

  // 3DMark Time Spy Estimated Score
  const timeSpyScore = Math.round(
    build.gpu.perfScore * 245 + build.cpu.perfScore * 88
  );

  return (
    <div className="flex flex-col w-screen h-screen bg-[#0b0c10] text-slate-100 overflow-hidden select-none">
      {/* =====================================================================
          TOP HEADER BAR (BuildCores Studio Style)
         ===================================================================== */}
      <header className="h-14 shrink-0 flex items-center justify-between px-4 lg:px-6 bg-[#111318] border-b border-white/[0.08] z-20">
        {/* Left: Brand & Build Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600/20 border border-rose-500/40 text-rose-400">
              <Box className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-bold tracking-wide text-white">
                  VOXELCORES
                </span>
                <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono-tech text-[10px] text-slate-400">
                  3D STUDIO v2.4
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-white/[0.08] text-xs text-slate-400">
            <span className="text-white font-medium">Custom 3D Setup</span>
            <span>•</span>
            <span className="font-mono-tech text-[11px] text-slate-500">
              {build.case.name.split(' ').slice(0, 2).join(' ')}
            </span>
          </div>
        </div>

        {/* Center Status Pills (Price, Compatibility, Wattage, 3DMark Score) */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {/* Total Price Pill */}
          <div className="flex items-center gap-1.5 rounded-lg bg-[#181b22] border border-white/[0.08] px-3 py-1.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="font-mono-tech font-bold text-emerald-400">
              ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Compatibility Pill */}
          <div
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs ${
              isSocketCompatible
                ? 'bg-[#181b22] border-white/[0.08] text-sky-400'
                : 'bg-amber-500/10 border-amber-500/40 text-amber-300'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="font-medium">
              {isSocketCompatible ? 'Compatible' : 'Check Socket'}
            </span>
          </div>

          {/* Wattage Pill */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-[#181b22] border border-white/[0.08] px-3 py-1.5 text-xs">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-mono-tech font-semibold text-amber-300">
              {totalWattage}W
            </span>
            <span className="text-slate-500 text-[11px]">
              / {build.psu.capacityW}W
            </span>
          </div>

          {/* 3DMark Time Spy Pill */}
          <div className="hidden xl:flex items-center gap-1.5 rounded-lg bg-[#181b22] border border-white/[0.08] px-3 py-1.5 text-xs">
            <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-400">3DMARK</span>
            <span className="font-mono-tech font-semibold text-white">
              {timeSpyScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onCaptureScreenshot}
            className="hidden sm:flex items-center gap-1.5 rounded-lg bg-[#181b22] hover:bg-[#222630] border border-white/[0.1] px-3 py-1.5 text-xs font-medium text-slate-200 transition cursor-pointer"
            title="Exportar Screenshot PNG Transparente HD"
          >
            <Camera className="h-3.5 w-3.5 text-sky-400" />
            <span>Screenshot HD</span>
          </button>

          <button
            onClick={onOpenInspector}
            className="flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 px-3 py-1.5 text-xs font-semibold text-slate-950 transition cursor-pointer"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export Build</span>
          </button>

          <button
            onClick={() => setMobileDrawer(!mobileDrawer)}
            className="lg:hidden rounded-lg bg-[#181b22] border border-white/[0.1] px-2.5 py-1.5 text-xs font-medium text-white"
          >
            {mobileDrawer ? 'Ver 3D' : 'Peças'}
          </button>
        </div>
      </header>

      {/* =====================================================================
          MAIN WORKSPACE (Center 3D Viewport + Right BuildCores Part List)
         ===================================================================== */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* CENTER 3D VIEWPORT */}
        <div className="relative flex-1 h-full flex flex-col bg-[#101216] overflow-hidden">
          {/* Top-Left / Top-Right Viewport Overlay Toolbar */}
          <div className="pointer-events-none absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2">
            {/* Camera View Presets */}
            <div className="pointer-events-auto flex items-center gap-1 rounded-lg bg-[#14171f]/90 backdrop-blur-md border border-white/[0.08] p-1 shadow-lg">
              {[
                { id: 'iso', label: '3/4 View' },
                { id: 'side', label: 'Side Interior' },
                { id: 'gpu', label: 'GPU Slot' },
                { id: 'cpu', label: 'CPU & RAM' },
                { id: 'front', label: 'Front Panel' },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => onSnapCamera(v.id)}
                  className="rounded-md px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-white/[0.08] hover:text-white transition cursor-pointer"
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* Interactive 3D Hardware Toggles (Exploded View, Open Glass, Spin, Wireframe) */}
            <div className="pointer-events-auto flex items-center gap-1.5 rounded-lg bg-[#14171f]/90 backdrop-blur-md border border-white/[0.08] p-1 shadow-lg">
              <button
                onClick={() => setExplodedView(!explodedView)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                  explodedView
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
                    : 'text-slate-300 hover:bg-white/[0.08]'
                }`}
              >
                <Maximize2 className="h-3 w-3" />
                <span>Exploded View</span>
              </button>

              <button
                onClick={() => setGlassOpen(!glassOpen)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                  glassOpen
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
                    : 'text-slate-300 hover:bg-white/[0.08]'
                }`}
              >
                <DoorOpen className="h-3 w-3" />
                <span>Side Glass</span>
              </button>

              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                  autoRotate
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                    : 'text-slate-300 hover:bg-white/[0.08]'
                }`}
              >
                <RotateCw className={`h-3 w-3 ${autoRotate ? 'animate-spin' : ''}`} />
                <span>360°</span>
              </button>

              <button
                onClick={() => setWireframe(!wireframe)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                  wireframe
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                    : 'text-slate-300 hover:bg-white/[0.08]'
                }`}
              >
                <Grid className="h-3 w-3" />
                <span>Wireframe</span>
              </button>
            </div>
          </div>

          {/* 3D Canvas Viewport */}
          <div className="flex-1 w-full h-full">{children}</div>

          {/* Bottom-Left Subtle Telemetry Watermark (like BuildCores) */}
          <div className="pointer-events-none absolute bottom-3 left-4 z-10 flex items-center gap-4 text-[11px] font-mono-tech text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {stats.fps} FPS • {stats.triangles.toLocaleString()} TRIS
            </span>
            <span>CPU {cpuTemp}°C</span>
            <span>GPU {gpuTemp}°C</span>
          </div>

          {/* Screenshot Toast */}
          {screenshotToast && (
            <div className="pointer-events-auto absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-lg bg-emerald-500/20 border border-emerald-400/40 px-3.5 py-2 text-xs font-medium text-emerald-200 shadow-lg">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>PNG Transparente HD exportado com sucesso!</span>
            </div>
          )}
        </div>

        {/* =================================================================
            RIGHT SIDEBAR: BUILDCORES PART LIST & 3D STUDIO SETTINGS
           ================================================================= */}
        <aside
          className={`fixed lg:static top-14 bottom-0 right-0 z-30 w-full sm:w-[410px] lg:w-[420px] shrink-0 bg-[#111318] border-l border-white/[0.08] flex flex-col transition-transform duration-300 ${
            mobileDrawer
              ? 'translate-x-0'
              : 'translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Sidebar Top Tabs (Parts vs 3D & RGB Settings) */}
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 pt-2.5">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setRightTab('parts')}
                className={`flex items-center gap-2 pb-2.5 text-xs font-semibold border-b-2 transition cursor-pointer ${
                  rightTab === 'parts'
                    ? 'border-white text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Box className="h-3.5 w-3.5" />
                <span>Parts (PC Build)</span>
              </button>

              <button
                onClick={() => setRightTab('settings')}
                className={`flex items-center gap-2 pb-2.5 text-xs font-semibold border-b-2 transition cursor-pointer ${
                  rightTab === 'settings'
                    ? 'border-white text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>3D Lighting &amp; Tuning</span>
              </button>
            </div>

            <button
              onClick={onResetBuild}
              className="pb-2 text-[11px] font-mono-tech text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              title="Restaurar build padrão"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          {rightTab === 'parts' ? (
            /* PART LIST SLOTS (BuildCores Style) */
            <div className="flex-1 overflow-y-auto p-3.5 space-y-2">
              <div className="flex items-center justify-between px-1 pb-1">
                <span className="text-[10px] font-mono-tech uppercase tracking-wider text-slate-400">
                  PC BUILD COMPONENTS (CLICK TO SWAP OR INSPECT)
                </span>
                <span className="text-[10px] font-mono-tech text-emerald-400">
                  9 / 9 Selected
                </span>
              </div>

              {HARDWARE_CATEGORIES.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.id] || Cpu;
                const selectedPart = build[cat.id];
                const photoUrl = getHardwareProductPhoto(cat.id, selectedPart);

                return (
                  <div
                    key={cat.id}
                    className="group rounded-xl bg-[#161920] hover:bg-[#1c2029] border border-white/[0.07] hover:border-white/[0.15] p-2.5 transition"
                  >
                    <div className="flex items-center gap-3">
                      {/* White-Box Studio Product Photo Thumbnail */}
                      <button
                        onClick={() => onOpenPartDetails(cat.id, selectedPart)}
                        className="relative h-14 w-16 shrink-0 rounded-lg overflow-hidden bg-white border border-white/10 p-0.5 cursor-pointer group/img"
                        title="Ver especificações detalhadas, lojas e histórico de preço"
                      >
                        <img
                          src={photoUrl}
                          alt={selectedPart.name}
                          className="h-full w-full object-contain group-hover/img:scale-105 transition-transform"
                        />
                      </button>

                      {/* Component Category & Real Model Name */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="flex items-center gap-1.5 text-[10px] font-mono-tech uppercase tracking-wider text-slate-400">
                            <Icon className="h-3 w-3 text-slate-400" />
                            {cat.label}
                          </span>
                          <span className="font-mono-tech text-xs font-bold text-emerald-400">
                            ${selectedPart.price.toFixed(2)}
                          </span>
                        </div>

                        <button
                          onClick={() => onOpenPartDetails(cat.id, selectedPart)}
                          className="block text-left text-xs font-semibold text-white hover:text-sky-400 truncate w-full mt-0.5 cursor-pointer"
                        >
                          {selectedPart.name}
                        </button>

                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[11px] text-slate-400 truncate">
                            {selectedPart.brand} •{' '}
                            {selectedPart.socket ||
                              selectedPart.vram ||
                              selectedPart.capacity ||
                              selectedPart.formFactor ||
                              selectedPart.radiatorSize ||
                              selectedPart.efficiency ||
                              selectedPart.airflowCfm}
                          </span>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => onOpenPartDetails(cat.id, selectedPart)}
                              className="rounded-md bg-white/[0.05] hover:bg-white/[0.12] p-1 text-slate-300 hover:text-white transition cursor-pointer"
                              title="Detalhes da peça"
                            >
                              <Info className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => onOpenPartPicker(cat.id)}
                              className="flex items-center gap-1 rounded-md bg-rose-600/90 hover:bg-rose-500 px-2.5 py-1 text-[11px] font-semibold text-white transition cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Change</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* 3D STUDIO LIGHTING, ARGB & MATERIAL TUNING TAB */
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Subtle ARGB Preset Picker (Including Stealth Off) */}
              <div className="space-y-2">
                <label className="block font-mono-tech text-[10px] uppercase tracking-wider text-slate-400">
                  Internal Case Lighting (Subtle / Stealth)
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {RGB_PRESETS.map((preset) => {
                    const active = rgbPreset.id === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => setRgbPreset(preset)}
                        className={`flex items-center justify-between rounded-xl px-3 py-2.5 border text-xs font-medium transition cursor-pointer ${
                          active
                            ? 'bg-white/[0.08] border-white/40 text-white'
                            : 'bg-[#161920] border-white/[0.07] text-slate-300 hover:bg-[#1c2029]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-4 w-4 rounded-full border border-white/30"
                            style={{
                              background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})`,
                            }}
                          />
                          <span>{preset.name}</span>
                        </div>
                        {active && (
                          <span className="text-[10px] font-mono-tech text-emerald-400">
                            ACTIVE
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fan Speed & Material Sliders */}
              <div className="space-y-4 rounded-xl bg-[#161920] border border-white/[0.07] p-3.5">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Fan Speed (RPM)</span>
                    <span className="font-mono-tech text-slate-200">
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

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Chassis Metalness</span>
                    <span className="font-mono-tech text-slate-200">
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

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Surface Roughness</span>
                    <span className="font-mono-tech text-slate-200">
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

              {/* Studio Lighting Mode */}
              <div className="space-y-2">
                <label className="block font-mono-tech text-[10px] uppercase tracking-wider text-slate-400">
                  Studio Environment Lighting
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'studio', label: 'Clean Studio' },
                    { id: 'darkroom', label: 'Contrast Dark' },
                    { id: 'warm', label: 'Warm Daylight' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setLightingMode(m.id)}
                      className={`rounded-xl py-2 px-2 text-xs font-medium border transition cursor-pointer ${
                        lightingMode === m.id
                          ? 'bg-white/[0.1] border-white/40 text-white'
                          : 'bg-[#161920] border-white/[0.07] text-slate-400 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Image Upload for AIO LCD Screen & GPU Backplate */}
              <div className="pt-2 border-t border-white/[0.08]">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#181b22] hover:bg-[#222630] border border-white/[0.12] py-2.5 px-3 text-xs font-semibold text-white transition cursor-pointer"
                >
                  <Upload className="h-4 w-4 text-sky-400" />
                  <span>Upload Custom AIO LCD / GPU Backplate</span>
                </button>
                {customLogoName && (
                  <p className="mt-1.5 text-center font-mono-tech text-[10px] text-emerald-400 truncate">
                    ✓ Active: {customLogoName}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Sidebar Footer Summary */}
          <div className="border-t border-white/[0.08] bg-[#0e1015] p-3.5 flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-mono-tech text-slate-400">
                ESTIMATED BUILD TOTAL
              </span>
              <span className="font-display text-base font-bold text-emerald-400">
                ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <button
              onClick={onOpenInspector}
              className="flex items-center gap-1.5 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.1] px-3 py-2 text-xs font-medium text-white transition cursor-pointer"
            >
              <Code2 className="h-3.5 w-3.5 text-sky-400" />
              <span>Full Specs Sheet</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
