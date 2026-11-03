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
  CheckCircle2,
  AlertTriangle,
  Camera,
  Code2,
  RotateCw,
  RotateCcw,
  Maximize2,
  Upload,
  Grid,
  Sliders,
  Plus,
  Info,
  Share2,
  Tag,
} from 'lucide-react';
import {
  HARDWARE_CATEGORIES,
  SNAP_POINTS,
  validateBuildCompatibility,
  getFallbackProductPhotoDataUri,
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
  customGlbOverrides,
  onUploadCustomGlb,
  onOpenPartPicker,
  onOpenPartDetails,
  envPreset,
  setEnvPreset,
  showBoundingLabels,
  setShowBoundingLabels,
  wireframe,
  setWireframe,
  autoRotate,
  setAutoRotate,
  explodedView,
  setExplodedView,
  onSnapCamera,
  onCaptureScreenshot,
  screenshotToast,
  onOpenInspector,
  onResetBuild,
  stats,
  totalPrice,
  children,
}) {
  const glbInputRef = useRef(null);
  const [uploadTargetCategory, setUploadTargetCategory] = useState('gpu');
  const [rightTab, setRightTab] = useState('parts'); // 'parts' | 'sockets'
  const [mobileDrawer, setMobileDrawer] = useState(false);

  const compatibility = validateBuildCompatibility(build);

  const handleGlbFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onUploadCustomGlb(uploadTargetCategory, file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-[#0b0c10] text-slate-100 overflow-hidden select-none">
      {/* =====================================================================
          TOP HEADER BAR (BuildCores Studio + Real Compatibility Check)
         ===================================================================== */}
      <header className="h-14 shrink-0 flex items-center justify-between px-4 lg:px-6 bg-[#111318] border-b border-white/[0.08] z-20">
        {/* Left: Brand */}
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
                  GLTF / DRACO ENGINE
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-white/[0.08] text-xs text-slate-400">
            <span className="text-white font-medium">Socket Snap Architecture</span>
            <span>•</span>
            <span className="font-mono-tech text-[11px] text-slate-400">
              partsCatalog.json
            </span>
          </div>
        </div>

        {/* Center Status Pills (Price, Real Socket Compatibility, TDP Wattage) */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {/* Total Price Pill */}
          <div className="flex items-center gap-1.5 rounded-lg bg-[#181b22] border border-white/[0.08] px-3 py-1.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="font-mono-tech font-bold text-emerald-400">
              ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Compatibility Validation Pill */}
          <div
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs ${
              compatibility.isCompatible
                ? 'bg-[#181b22] border-white/[0.08] text-sky-400'
                : 'bg-rose-500/15 border-rose-500/50 text-rose-300'
            }`}
            title={
              compatibility.issues.length > 0
                ? compatibility.issues.join(' | ')
                : 'CPU Socket, RAM DDR5 & GPU Length 100% Compatíveis'
            }
          >
            {compatibility.isCompatible ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-medium">
                  Compatible ({build.cpu.specs.socket})
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                <span className="font-semibold">
                  Socket Mismatch ({build.cpu.specs.socket} ≠ {build.motherboard.specs.socket})
                </span>
              </>
            )}
          </div>

          {/* Wattage Pill */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-[#181b22] border border-white/[0.08] px-3 py-1.5 text-xs">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-mono-tech font-semibold text-amber-300">
              {compatibility.totalTdp}W
            </span>
            <span className="text-slate-500 text-[11px]">
              / {compatibility.psuWatts}W PSU
            </span>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onCaptureScreenshot}
            className="hidden sm:flex items-center gap-1.5 rounded-lg bg-[#181b22] hover:bg-[#222630] border border-white/[0.1] px-3 py-1.5 text-xs font-medium text-slate-200 transition cursor-pointer"
          >
            <Camera className="h-3.5 w-3.5 text-sky-400" />
            <span>Screenshot HD</span>
          </button>

          <button
            onClick={onOpenInspector}
            className="flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 px-3 py-1.5 text-xs font-semibold text-slate-950 transition cursor-pointer"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Specs &amp; JSON</span>
          </button>

          <button
            onClick={() => setMobileDrawer(!mobileDrawer)}
            className="lg:hidden rounded-lg bg-[#181b22] border border-white/[0.1] px-2.5 py-1.5 text-xs font-medium text-white"
          >
            {mobileDrawer ? '3D' : 'Parts'}
          </button>
        </div>
      </header>

      {/* Compatibility Alert Banner if Socket or Clearance fails */}
      {!compatibility.isCompatible && (
        <div className="bg-rose-950/90 border-b border-rose-500/40 px-6 py-2 flex items-center justify-between text-xs text-rose-200 z-20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{compatibility.issues[0]}</span>
          </div>
          <button
            onClick={() => onOpenPartPicker('motherboard')}
            className="rounded bg-rose-500/30 hover:bg-rose-500/50 border border-rose-400/40 px-2.5 py-0.5 text-[11px] font-semibold text-white cursor-pointer shrink-0"
          >
            Trocar Placa-Mãe
          </button>
        </div>
      )}

      {/* =====================================================================
          MAIN WORKSPACE (Center 3D GLTF Viewport + Right Catalog Sidebar)
         ===================================================================== */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* CENTER 3D VIEWPORT */}
        <div className="relative flex-1 h-full flex flex-col bg-[#101216] overflow-hidden">
          {/* Viewport Overlay Toolbar */}
          <div className="pointer-events-none absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2">
            {/* Camera View Presets */}
            <div className="pointer-events-auto flex items-center gap-1 rounded-lg bg-[#14171f]/90 backdrop-blur-md border border-white/[0.08] p-1 shadow-lg">
              {[
                { id: 'iso', label: '3/4 Rig View' },
                { id: 'side', label: 'Motherboard Sockets' },
                { id: 'gpu', label: 'slot_pcie_x16' },
                { id: 'cpu', label: 'socket_cpu & RAM' },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => onSnapCamera(v.id)}
                  className="rounded-md px-2.5 py-1 text-[11px] font-mono-tech text-slate-300 hover:bg-white/[0.08] hover:text-white transition cursor-pointer"
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* 3D GLTF & Socket Inspection Toggles */}
            <div className="pointer-events-auto flex items-center gap-1.5 rounded-lg bg-[#14171f]/90 backdrop-blur-md border border-white/[0.08] p-1 shadow-lg">
              <button
                onClick={() => setShowBoundingLabels(!showBoundingLabels)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                  showBoundingLabels
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                    : 'text-slate-300 hover:bg-white/[0.08]'
                }`}
                title="Exibir/Ocultar etiquetas de caminho .glb nos BoundingBoxes"
              >
                <Tag className="h-3 w-3" />
                <span>GLB Path Labels</span>
              </button>

              <button
                onClick={() => setExplodedView(!explodedView)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                  explodedView
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
                    : 'text-slate-300 hover:bg-white/[0.08]'
                }`}
              >
                <Maximize2 className="h-3 w-3" />
                <span>Explode Sockets</span>
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
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
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

          {/* Bottom-Left Status Info */}
          <div className="pointer-events-none absolute bottom-3 left-4 z-10 flex flex-wrap items-center gap-4 text-[11px] font-mono-tech text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {stats.fps} FPS • GLTFLoader + DRACOLoader Ready
            </span>
            <span>HDRI: {envPreset.toUpperCase()}</span>
          </div>

          {screenshotToast && (
            <div className="pointer-events-auto absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-lg bg-emerald-500/20 border border-emerald-400/40 px-3.5 py-2 text-xs font-medium text-emerald-200 shadow-lg">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>PNG Transparente HD exportado com sucesso!</span>
            </div>
          )}
        </div>

        {/* =================================================================
            RIGHT SIDEBAR: PARTS CATALOG (Real Photos + Socket Inspector)
           ================================================================= */}
        <aside
          className={`fixed lg:static top-14 bottom-0 right-0 z-30 w-full sm:w-[420px] lg:w-[440px] shrink-0 bg-[#111318] border-l border-white/[0.08] flex flex-col transition-transform duration-300 ${
            mobileDrawer ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Sidebar Tabs */}
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
                <span>Parts Catalog (JSON)</span>
              </button>

              <button
                onClick={() => setRightTab('sockets')}
                className={`flex items-center gap-2 pb-2.5 text-xs font-semibold border-b-2 transition cursor-pointer ${
                  rightTab === 'sockets'
                    ? 'border-white text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Sockets &amp; Upload .GLB</span>
              </button>
            </div>

            <button
              onClick={onResetBuild}
              className="pb-2 text-[11px] font-mono-tech text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          {rightTab === 'parts' ? (
            /* PART LIST SLOTS READING DIRECTLY FROM partsCatalog.json */
            <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-mono-tech uppercase tracking-wider text-slate-400">
                  ACTIVE HARDWARE SLOTS (REAL PHOTOS &amp; GLB PATHS)
                </span>
                <span className="text-[10px] font-mono-tech text-sky-400">
                  8 Snap Points
                </span>
              </div>

              {HARDWARE_CATEGORIES.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.id] || Cpu;
                const selectedPart = build[cat.id];
                const hasCustomGlb = Boolean(customGlbOverrides[cat.id]);

                return (
                  <div
                    key={cat.id}
                    className="group rounded-xl bg-[#161920] hover:bg-[#1c2029] border border-white/[0.07] hover:border-white/[0.15] p-2.5 transition"
                  >
                    <div className="flex items-center gap-3">
                      {/* Real Product Photo from partsCatalog.json (realPhotoUrl) */}
                      <button
                        onClick={() => onOpenPartDetails(cat.id, selectedPart)}
                        className="relative h-16 w-20 shrink-0 rounded-lg overflow-hidden bg-white border border-white/10 cursor-pointer group/img flex items-center justify-center"
                        title="Inspecionar ficha técnica real e caminho .GLB"
                      >
                        <img
                          src={selectedPart.realPhotoUrl}
                          alt={selectedPart.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getFallbackProductPhotoDataUri(selectedPart);
                          }}
                          className="h-full w-full object-cover group-hover/img:scale-105 transition-transform"
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[8px] font-mono-tech text-center text-amber-300 py-0.5 truncate px-1">
                          {cat.socketTarget}
                        </span>
                      </button>

                      {/* Component Info */}
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

                        {/* Real Technical Specs Preview */}
                        <p className="text-[10px] font-mono-tech text-slate-400 truncate mt-0.5">
                          {selectedPart.specs.socket ||
                            selectedPart.specs.vram ||
                            selectedPart.specs.capacity ||
                            selectedPart.specs.formFactor ||
                            selectedPart.specs.coolerType ||
                            `${selectedPart.specs.wattageCapacity}W`}{' '}
                          •{' '}
                          <span className="text-amber-300/90">
                            {hasCustomGlb ? 'Custom .GLB Loaded' : selectedPart.model3dPath}
                          </span>
                        </p>

                        <div className="flex items-center justify-end gap-1.5 mt-1.5">
                          <button
                            onClick={() => onOpenPartDetails(cat.id, selectedPart)}
                            className="rounded-md bg-white/[0.05] hover:bg-white/[0.12] p-1 text-slate-300 hover:text-white transition cursor-pointer"
                            title="Especificações técnicas e coordenadas do Socket"
                          >
                            <Info className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenPartPicker(cat.id)}
                            className="flex items-center gap-1 rounded-md bg-rose-600/90 hover:bg-rose-500 px-2.5 py-1 text-[11px] font-semibold text-white transition cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Swap Part</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* SOCKET SNAP COORDINATES & LOCAL .GLB UPLOADER TAB */
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Upload Local .GLB File to Test Any Socket Immediately */}
              <div className="rounded-xl bg-[#161920] border border-sky-500/30 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs font-bold text-white">
                    Carregar Arquivo .GLB / .GLTF Local
                  </span>
                  <span className="font-mono-tech text-[10px] text-sky-400">
                    GLTFLoader + Draco
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Enquanto você não move os arquivos definitivos para{' '}
                  <code className="text-amber-300">/public/models/</code>, você também pode selecionar um arquivo <code className="text-white">.glb</code> do seu computador para encaixar instantaneamente no socket escolhido:
                </p>

                <div className="space-y-2">
                  <label className="block text-[10px] font-mono-tech uppercase text-slate-400">
                    Slot / Categoria Alvo:
                  </label>
                  <select
                    value={uploadTargetCategory}
                    onChange={(e) => setUploadTargetCategory(e.target.value)}
                    className="w-full rounded-lg bg-[#0e1015] border border-white/15 px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
                  >
                    {HARDWARE_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label} → [{c.socketTarget}] ({build[c.id].model3dPath})
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  ref={glbInputRef}
                  type="file"
                  accept=".glb,.gltf"
                  onChange={handleGlbFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => glbInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 py-2.5 px-3 text-xs font-bold text-slate-950 transition cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>Selecionar Arquivo .GLB para este Socket</span>
                </button>
              </div>

              {/* HDRI Environment Map Selector */}
              <div className="rounded-xl bg-[#161920] border border-white/[0.07] p-3.5 space-y-2.5">
                <label className="block font-mono-tech text-[10px] uppercase tracking-wider text-slate-400">
                  HDRI Environment Map (Reflexos PBR nos .GLB)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'city', label: 'City HDRI' },
                    { id: 'studio', label: 'Studio Soft' },
                    { id: 'warehouse', label: 'Warehouse' },
                  ].map((env) => (
                    <button
                      key={env.id}
                      onClick={() => setEnvPreset(env.id)}
                      className={`rounded-lg py-2 px-2 text-xs font-medium border transition cursor-pointer ${
                        envPreset === env.id
                          ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                          : 'bg-[#111318] border-white/[0.07] text-slate-400 hover:text-white'
                      }`}
                    >
                      {env.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Socket Snap Coordinates Reference Table */}
              <div className="rounded-xl bg-[#161920] border border-white/[0.07] p-3.5 space-y-2.5">
                <span className="block font-mono-tech text-[10px] uppercase tracking-wider text-slate-400">
                  Coordenadas de Encaixe (Vector3 Snap Points)
                </span>
                <div className="space-y-1.5 text-[11px] font-mono-tech">
                  {Object.entries({
                    ...SNAP_POINTS.case,
                    ...SNAP_POINTS.motherboard,
                  }).map(([socketKey, cfg]) => (
                    <div
                      key={socketKey}
                      className="flex items-center justify-between rounded bg-[#0e1015] px-2.5 py-1.5 border border-white/[0.05]"
                    >
                      <span className="text-sky-400">{socketKey}</span>
                      <span className="text-slate-300">
                        [{cfg.position.join(', ')}]
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sidebar Footer */}
          <div className="border-t border-white/[0.08] bg-[#0e1015] p-3.5 flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-mono-tech text-slate-400">
                TOTAL BUILD PRICE
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
              <span>Inspect JSON &amp; Paths</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
