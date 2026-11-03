import React from 'react';
import { X, Cpu, Layers, Activity, Terminal, Sparkles, Check } from 'lucide-react';

export default function InspectorModal({
  isOpen,
  onClose,
  activeTheme,
  customTextureName,
  stats,
  windSpeed,
  metalness,
  roughness,
  lightingMode,
  wireframe,
  previewUrl,
}) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const shaderSnippet = `// VoxelVault 3D — Procedural PBR & Sinusoidal Cape Shader Config
const material = new THREE.MeshStandardMaterial({
  name: "${customTextureName || activeTheme.name}",
  map: proceduralCanvasTexture, // 512x512 NearestFilter (SRGB)
  emissiveMap: proceduralEmissiveTexture,
  emissiveIntensity: ${activeTheme.defaultEmissiveIntensity},
  metalness: ${metalness.toFixed(2)},
  roughness: ${roughness.toFixed(2)},
  wireframe: ${wireframe},
});

// Articulated 14-Segment Cape Wave (useFrame @ ${stats.fps} FPS)
useFrame(({ clock }) => {
  const t = clock.getElapsedTime();
  segments.forEach((seg, i) => {
    const phase = t * (1.8 + ${windSpeed.toFixed(1)} * 1.15) - i * 0.42;
    seg.rotation.x = Math.sin(phase) * (0.025 + (i / 14) * 0.055);
  });
});`;

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(shaderSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl backdrop-blur-xl bg-[#0d1018]/95 border border-white/15 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.85)] text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Top Modal Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-400/40">
              <Cpu className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-white">
                Inspetor Técnico WebGL &amp; Especificações do Ativo
              </h3>
              <p className="text-xs text-slate-400">
                Telemetria em tempo real da Engine Three.js + React Three Fiber
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 p-2 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Live Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
          <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-mono-tech text-slate-400">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              <span>TAXA DE QUADROS</span>
            </div>
            <p className="mt-1 font-mono-tech text-xl font-bold text-emerald-400">
              {stats.fps} <span className="text-xs font-normal text-slate-400">FPS</span>
            </p>
          </div>

          <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-mono-tech text-slate-400">
              <Layers className="h-3.5 w-3.5 text-cyan-400" />
              <span>CONTAGEM POLÍGONOS</span>
            </div>
            <p className="mt-1 font-mono-tech text-xl font-bold text-cyan-300">
              {stats.triangles}{' '}
              <span className="text-xs font-normal text-slate-400">Tris</span>
            </p>
          </div>

          <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-mono-tech text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-fuchsia-400" />
              <span>DRAW CALLS</span>
            </div>
            <p className="mt-1 font-mono-tech text-xl font-bold text-fuchsia-300">
              {stats.calls}{' '}
              <span className="text-xs font-normal text-slate-400">Calls</span>
            </p>
          </div>

          <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-mono-tech text-slate-400">
              <Terminal className="h-3.5 w-3.5 text-amber-400" />
              <span>SEGMENTOS CAPA</span>
            </div>
            <p className="mt-1 font-mono-tech text-xl font-bold text-amber-300">
              14 <span className="text-xs font-normal text-slate-400">Bones</span>
            </p>
          </div>
        </div>

        {/* Asset Technical Specifications + Live Procedural Canvas Texture Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {/* Live Texture Atlas Map */}
          <div className="rounded-xl bg-black/50 border border-white/10 p-3 flex flex-col items-center justify-center">
            <span className="text-[10px] font-mono-tech uppercase tracking-wider text-slate-400 mb-2">
              CanvasTexture Atlas (2D → 3D)
            </span>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Procedural Texture Atlas"
                className="h-28 w-28 rounded-lg border border-white/20 object-cover shadow-md"
                style={{ imageRendering: 'pixelated' }}
              />
            )}
            <span className="mt-2 font-mono-tech text-[10px] text-cyan-300">
              THREE.NearestFilter • SRGB
            </span>
          </div>

          {/* Specification Table */}
          <div className="md:col-span-2 rounded-xl bg-black/40 border border-white/10 p-4 space-y-2.5 text-xs">
            <div className="flex justify-between border-b border-white/10 pb-1.5">
              <span className="text-slate-400">Ativo Selecionado:</span>
              <span className="font-mono-tech font-semibold text-white">
                {customTextureName || activeTheme.name} ({activeTheme.rarity})
              </span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-1.5">
              <span className="text-slate-400">Pipeline de Material:</span>
              <span className="font-mono-tech text-cyan-300">
                {activeTheme.specs.shader}
              </span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-1.5">
              <span className="text-slate-400">Resolução Procedural:</span>
              <span className="font-mono-tech text-slate-200">
                {activeTheme.specs.resolution}
              </span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-1.5">
              <span className="text-slate-400">Mapeamento UV / Iluminação:</span>
              <span className="font-mono-tech text-slate-200">
                {activeTheme.specs.uvMap} • Modo {lightingMode.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Número de Série / Float:</span>
              <span className="font-mono-tech text-emerald-400">
                {activeTheme.specs.serial} ({activeTheme.floatValue.toFixed(4)})
              </span>
            </div>
          </div>
        </div>

        {/* Live Shader & Physics Code Inspector */}
        <div className="rounded-xl bg-black/70 border border-white/15 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-white/[0.04] border-b border-white/10">
            <span className="font-mono-tech text-[11px] text-slate-300">
              src/components/CapeModel.jsx — Live Runtime Parameters
            </span>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 px-2.5 py-1 text-[11px] font-mono-tech text-cyan-300 transition cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : null}
              <span>{copied ? 'Copiado!' : 'Copiar Snippet'}</span>
            </button>
          </div>
          <pre className="p-4 text-[11px] font-mono-tech leading-relaxed text-cyan-200/90 overflow-x-auto">
            <code>{shaderSnippet}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
