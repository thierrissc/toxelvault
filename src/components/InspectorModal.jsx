import React, { useState } from 'react';
import {
  X,
  Cpu,
  Layers,
  Activity,
  Zap,
  Sparkles,
  Check,
  Copy,
  Thermometer,
} from 'lucide-react';
import { HARDWARE_CATEGORIES } from '../utils/textureGenerator';

export default function InspectorModal({
  isOpen,
  onClose,
  build,
  stats,
  totalPrice,
  totalWattage,
  cpuTemp,
  gpuTemp,
  rgbPreset,
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const buildManifestText = `=== VOXELVAULT 3D — CUSTOM PC BUILD MANIFEST ===
• Gabinete: ${build.case.name} (R$ ${build.case.price})
• Placa-Mãe: ${build.motherboard.name} (R$ ${build.motherboard.price})
• Processador: ${build.cpu.name} (R$ ${build.cpu.price})
• Resfriamento: ${build.cooler.name} (R$ ${build.cooler.price})
• Placa de Vídeo: ${build.gpu.name} (R$ ${build.gpu.price})
• Memória RAM: ${build.ram.name} (R$ ${build.ram.price})
• Armazenamento: ${build.storage.name} (R$ ${build.storage.price})
• Fonte (PSU): ${build.psu.name} (R$ ${build.psu.price})
------------------------------------------------
• Consumo Estimado: ${totalWattage}W / Fonte ${build.psu.capacityW}W
• Sincronização ARGB: ${rgbPreset?.name} (${rgbPreset?.primary})
• Orçamento Total: R$ ${totalPrice.toLocaleString('pt-BR')}`;

  const handleCopyManifest = () => {
    navigator.clipboard?.writeText(buildManifestText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-2xl backdrop-blur-xl bg-[#0d1018]/95 border border-white/15 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.85)] text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-400/40">
              <Cpu className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-white">
                Ficha Técnica Completa da Máquina &amp; Telemetria WebGL 3D
              </h3>
              <p className="text-xs text-slate-400">
                Resumo de peças, compatibilidade energética, temperaturas e engine Three.js
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

        {/* Live Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-mono-tech text-slate-400">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              <span>TAXA DE QUADROS 3D</span>
            </div>
            <p className="mt-1 font-mono-tech text-xl font-bold text-emerald-400">
              {stats.fps} <span className="text-xs font-normal text-slate-400">FPS</span>
            </p>
          </div>

          <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-mono-tech text-slate-400">
              <Layers className="h-3.5 w-3.5 text-cyan-400" />
              <span>MALHA 3D ATIVA</span>
            </div>
            <p className="mt-1 font-mono-tech text-xl font-bold text-cyan-300">
              {stats.triangles}{' '}
              <span className="text-xs font-normal text-slate-400">Tris</span>
            </p>
          </div>

          <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-mono-tech text-slate-400">
              <Thermometer className="h-3.5 w-3.5 text-amber-400" />
              <span>TEMP. CPU / GPU</span>
            </div>
            <p className="mt-1 font-mono-tech text-xl font-bold text-amber-300">
              {cpuTemp}°C <span className="text-xs font-normal text-slate-400">/ {gpuTemp}°C</span>
            </p>
          </div>

          <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-mono-tech text-slate-400">
              <Zap className="h-3.5 w-3.5 text-fuchsia-400" />
              <span>POTÊNCIA / FONTE</span>
            </div>
            <p className="mt-1 font-mono-tech text-xl font-bold text-fuchsia-300">
              {totalWattage}W{' '}
              <span className="text-xs font-normal text-slate-400">
                / {build.psu.capacityW}W
              </span>
            </p>
          </div>
        </div>

        {/* All 8 Selected Hardware Components Table */}
        <div className="rounded-xl bg-black/45 border border-white/10 overflow-hidden mb-4">
          <div className="px-4 py-2.5 bg-white/[0.04] border-b border-white/10 flex items-center justify-between">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-slate-200">
              Lista de Peças Selecionadas no Gabinete 3D
            </span>
            <span className="font-mono-tech text-xs font-bold text-emerald-400">
              Total: R$ {totalPrice.toLocaleString('pt-BR')}
            </span>
          </div>

          <div className="divide-y divide-white/10 text-xs">
            {HARDWARE_CATEGORIES.map((cat) => {
              const item = build[cat.id];
              return (
                <div
                  key={cat.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-2.5 gap-1 hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-20 shrink-0 font-mono-tech text-[10px] uppercase text-cyan-400">
                      {cat.label}
                    </span>
                    <span className="font-semibold text-white">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto font-mono-tech text-[11px]">
                    <span className="text-slate-400">{item.brand}</span>
                    <span className="text-emerald-400 font-semibold">
                      R$ {item.price.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Exportable Build Summary Snippet */}
        <div className="rounded-xl bg-black/70 border border-white/15 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-white/[0.04] border-b border-white/10">
            <span className="font-mono-tech text-[11px] text-slate-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              Manifesto de Configuração do PC
            </span>
            <button
              onClick={handleCopyManifest}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 px-3 py-1 text-[11px] font-mono-tech text-cyan-300 transition cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Build Copiada!' : 'Copiar Orçamento'}</span>
            </button>
          </div>
          <pre className="p-4 text-[11px] font-mono-tech leading-relaxed text-cyan-200/90 overflow-x-auto">
            <code>{buildManifestText}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
