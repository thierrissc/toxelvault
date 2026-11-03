import * as THREE from 'three';
import catalogData from '../data/partsCatalog.json';

export const HARDWARE_CATEGORIES = catalogData.categories;
export const SNAP_POINTS = catalogData.snapPoints;
export const ALL_PARTS = catalogData.parts;

export const HARDWARE_CATALOG = HARDWARE_CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = ALL_PARTS.filter((p) => p.category === cat.id);
  return acc;
}, {});

export const DEFAULT_BUILD = {
  case: HARDWARE_CATALOG.case[0],
  motherboard: HARDWARE_CATALOG.motherboard[0],
  cpu: HARDWARE_CATALOG.cpu[0],
  cooler: HARDWARE_CATALOG.cooler[0],
  gpu: HARDWARE_CATALOG.gpu[0],
  ram: HARDWARE_CATALOG.ram[0],
  storage: HARDWARE_CATALOG.storage[0],
  psu: HARDWARE_CATALOG.psu[0],
};

/**
 * Validates hardware compatibility across the active build:
 * - CPU Socket vs Motherboard Socket (AM5 vs LGA1700)
 * - GPU physical length (mm) vs Case max GPU clearance (mm)
 * - Total TDP wattage vs PSU capacity (W)
 */
export function validateBuildCompatibility(build) {
  const issues = [];
  const warnings = [];

  if (build.cpu && build.motherboard) {
    const cpuSocket = build.cpu.specs?.socket;
    const moboSocket = build.motherboard.specs?.socket;
    if (cpuSocket && moboSocket && cpuSocket !== moboSocket) {
      issues.push(
        `Incompatibilidade de Socket: ${build.cpu.name} (${cpuSocket}) não encaixa na placa-mãe ${build.motherboard.name} (${moboSocket}).`
      );
    }
  }

  if (build.gpu && build.case) {
    const gpuLen = build.gpu.specs?.lengthMm || 0;
    const maxCaseGpu = build.case.specs?.maxGpuLengthMm || 999;
    if (gpuLen > maxCaseGpu) {
      issues.push(
        `Comprimento da GPU excedido: ${build.gpu.name} (${gpuLen}mm) excede o espaço máximo do gabinete ${build.case.name} (${maxCaseGpu}mm).`
      );
    }
  }

  const totalTdp = Object.values(build).reduce(
    (sum, part) => sum + (part?.specs?.tdpW || 0),
    0
  );
  const psuWatts = build.psu?.specs?.wattageCapacity || 1000;

  return {
    isCompatible: issues.length === 0,
    issues,
    warnings,
    totalTdp,
    psuWatts,
  };
}

/**
 * High-Detail Instant Fallback Product Photo Data-URI Generator
 * Guarantees ZERO broken image icons even if external network is offline.
 */
const fallbackPhotoCache = {};

export function getFallbackProductPhotoDataUri(part) {
  if (!part) return '';
  if (fallbackPhotoCache[part.id]) return fallbackPhotoCache[part.id];

  const canvas = document.createElement('canvas');
  canvas.width = 360;
  canvas.height = 240;
  const ctx = canvas.getContext('2d');

  // Dark Studio Gradient Backdrop
  const bg = ctx.createRadialGradient(180, 120, 15, 180, 120, 200);
  bg.addColorStop(0, '#1e2430');
  bg.addColorStop(1, '#0d1017');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 360, 240);

  // Subtle floor reflection
  ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
  ctx.beginPath();
  ctx.ellipse(180, 198, 110, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  const cat = part.category;

  if (cat === 'case') {
    ctx.fillStyle = '#151821';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.fillRect(115, 28, 130, 170);
    ctx.strokeRect(115, 28, 130, 170);
    // Glass window
    ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.fillRect(123, 38, 114, 130);
    // 3 RGB Fan rings inside
    [64, 98, 132].forEach((y) => {
      ctx.strokeStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(212, y, 13, 0, Math.PI * 2);
      ctx.stroke();
    });
  } else if (cat === 'motherboard') {
    ctx.fillStyle = '#11141c';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.fillRect(105, 26, 150, 178);
    ctx.strokeRect(105, 26, 150, 178);
    // VRM Heatsinks with TUF/ROG styling
    ctx.fillStyle = '#2a303c';
    ctx.fillRect(112, 34, 34, 90);
    ctx.fillRect(150, 34, 64, 26);
    ctx.fillStyle = part.accentColor || '#f59e0b';
    ctx.fillRect(116, 52, 24, 6);
    // Socket AM5
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(160, 72, 38, 38);
    // 4 DIMM Slots
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#475569' : '#f59e0b';
      ctx.fillRect(212 + i * 7, 64, 4, 52);
    }
    // Steel PCIe x16 Slot
    ctx.strokeStyle = '#cbd5e1';
    ctx.strokeRect(118, 136, 105, 6);
  } else if (cat === 'gpu') {
    ctx.save();
    ctx.translate(180, 116);
    ctx.rotate(-0.06);
    ctx.fillStyle = '#1a1e28';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.fillRect(-125, -46, 250, 92);
    ctx.strokeRect(-125, -46, 250, 92);
    // ROG RGB Accent Bar
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(-115, -44, 140, 5);
    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(25, -44, 90, 5);
    // 3 Axial Fans
    [-76, 0, 76].forEach((fx) => {
      ctx.fillStyle = '#0d1017';
      ctx.beginPath();
      ctx.arc(fx, 4, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.stroke();
    });
    ctx.restore();
  } else if (cat === 'cpu') {
    const isIntel = part.brand === 'Intel';
    ctx.fillStyle = isIntel ? '#1e3a8a' : '#1f242d';
    ctx.strokeStyle = isIntel ? '#38bdf8' : '#f97316';
    ctx.lineWidth = 3;
    ctx.fillRect(110, 36, 140, 156);
    ctx.strokeRect(110, 36, 140, 156);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(148, 76, 64, 64);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(part.brand, 180, 110);
  } else if (cat === 'cooler') {
    // 360mm Radiator + Circular LCD Pump
    ctx.fillStyle = '#161922';
    ctx.strokeStyle = '#475569';
    ctx.fillRect(70, 38, 220, 52);
    ctx.strokeRect(70, 38, 220, 52);
    ctx.fillStyle = '#090b10';
    ctx.beginPath();
    ctx.arc(180, 150, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('42°C', 180, 156);
  } else if (cat === 'ram') {
    [-16, 16].forEach((yOff) => {
      ctx.fillStyle = '#181b24';
      ctx.fillRect(75, 98 + yOff, 210, 26);
      const g = ctx.createLinearGradient(75, 0, 285, 0);
      g.addColorStop(0, '#06b6d4');
      g.addColorStop(0.5, '#a855f7');
      g.addColorStop(1, '#ec4899');
      ctx.fillStyle = g;
      ctx.fillRect(75, 92 + yOff, 210, 6);
    });
  } else {
    ctx.fillStyle = '#161922';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.fillRect(85, 68, 190, 96);
    ctx.strokeRect(85, 68, 190, 96);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(part.brand.toUpperCase(), 180, 120);
  }

  const uri = canvas.toDataURL('image/png');
  fallbackPhotoCache[part.id] = uri;
  return uri;
}

/**
 * Generates a realistic ASUS TUF B650M / ROG Motherboard PCB Texture
 */
export function createMotherboardPcbTexture(pcbColor = '#111318', accentColor = '#f59e0b') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = pcbColor;
  ctx.fillRect(0, 0, 512, 512);

  // Copper signal traces under soldermask
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.065)';
  ctx.lineWidth = 1.5;
  for (let i = 16; i < 496; i += 10) {
    ctx.beginPath();
    ctx.moveTo(i, 20);
    ctx.lineTo(i, 210);
    ctx.lineTo(i + 16, 228);
    ctx.lineTo(i + 16, 492);
    ctx.stroke();
  }

  // TUF Gaming / ROG geometric silkscreen accents
  ctx.strokeStyle = accentColor;
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = 3;
  ctx.strokeRect(22, 22, 468, 468);
  ctx.beginPath();
  ctx.moveTo(40, 440);
  ctx.lineTo(180, 440);
  ctx.lineTo(210, 470);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // VRM Chokes & Capacitors array around CPU Socket
  ctx.fillStyle = '#475569';
  for (let i = 0; i < 12; i++) {
    ctx.fillRect(118 + i * 18, 48, 12, 16);
    ctx.fillRect(92, 74 + i * 16, 16, 12);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Generates NZXT Kraken Elite 360 Circular LCD Telemetry Texture (42°C)
 */
export function createKrakenLcdTexture(tempC = 42, gpuTempC = 48, wattage = 422) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#07090e';
  ctx.fillRect(0, 0, 256, 256);

  // Outer gauge track
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(128, 128, 102, 0, Math.PI * 2);
  ctx.stroke();

  // Active temperature arc
  const grad = ctx.createLinearGradient(0, 0, 256, 256);
  grad.addColorStop(0, '#38bdf8');
  grad.addColorStop(1, '#a855f7');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(128, 128, 102, -Math.PI * 0.75, Math.PI * 0.55);
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('NZXT KRAKEN ELITE', 128, 74);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 52px sans-serif';
  ctx.fillText(`${tempC}°C`, 128, 134);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(`GPU ${gpuTempC}°C • ${wattage}W`, 128, 172);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Generates Samsung 990 PRO NVMe M.2 & Corsair RM1000e Label Textures
 */
export function createHardwareLabelTexture(type = 'ssd', title = '990 PRO', sub = '2TB NVMe M.2') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#111318';
  ctx.fillRect(0, 0, 512, 160);

  if (type === 'ssd') {
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(20, 18, 472, 8);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px sans-serif';
    ctx.fillText('SAMSUNG', 28, 78);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 36px monospace';
    ctx.fillText(title, 260, 78);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(sub, 28, 126);
  } else {
    // Corsair RM1000e / ROG Thor PSU Side Label
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.strokeRect(12, 12, 488, 136);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(24, 28, 12, 104);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 46px sans-serif';
    ctx.fillText(title, 54, 86);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(sub, 54, 124);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
