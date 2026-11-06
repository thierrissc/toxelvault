import * as THREE from 'three';
import catalogData from '../data/partsCatalog.json';
import modelManifest from '../../public/models/manifest.json';

export const HARDWARE_CATEGORIES = catalogData.categories;
export const SNAP_POINTS = catalogData.snapPoints;
export const ALL_PARTS = catalogData.parts;
export const MODEL_MANIFEST = modelManifest;

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

export function resolveGlbModelPath(part, customOverrideUrl = null) {
  if (customOverrideUrl) return customOverrideUrl;
  if (!part) return null;

  const catModels = MODEL_MANIFEST.models?.[part.category] || {};
  if (part.id && catModels[part.id]) {
    return catModels[part.id];
  }
  if (part.model3dPath && Object.values(catModels).includes(part.model3dPath)) {
    return part.model3dPath;
  }
  return catModels.default || part.model3dPath;
}

export const CURRENCIES = {
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    label: 'BRL',
    rate: 5.75,
    locale: 'pt-BR',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    label: 'USD',
    rate: 1.0,
    locale: 'en-US',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    label: 'EUR',
    rate: 0.92,
    locale: 'de-DE',
  },
};

export function formatCurrency(usdAmount, currencyCode = 'BRL', options = {}) {
  const cfg = CURRENCIES[currencyCode] || CURRENCIES.BRL;
  const converted = (Number(usdAmount) || 0) * cfg.rate;
  const decimals = options.decimals !== undefined ? options.decimals : 2;
  return new Intl.NumberFormat(cfg.locale, {
    style: 'currency',
    currency: cfg.code,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(converted);
}

export const RGB_PRESETS = [
  { id: 'cyan', label: 'Ciano', color: '#00f2fe' },
  { id: 'cyberpunk', label: 'Roxo', color: '#a855f7' },
  { id: 'rog', label: 'Vermelho', color: '#ef4444' },
  { id: 'ice', label: 'Branco Gelo', color: '#f8fafc' },
  { id: 'matrix', label: 'Verde', color: '#10b981' },
];

export const DEFAULT_RGB_CONFIG = {
  mode: 'static',
  syncAll: true,
  globalColor: '#00f2fe',
  groups: {
    fans: '#00f2fe',
    ram: '#a855f7',
    gpu: '#ef4444',
    cooler: '#00f2fe',
  },
};

export function validateBuildCompatibility(build) {
  const issues = [];
  const warnings = [];
  const checks = [];

  const cpuSocket = build.cpu?.specs?.socket;
  const moboSocket = build.motherboard?.specs?.socket;

  if (build.cpu && build.motherboard) {
    if (cpuSocket && moboSocket && cpuSocket !== moboSocket) {
      const msg = `Incompatibilidade de Socket: ${build.cpu.name} (${cpuSocket}) não encaixa na placa-mãe ${build.motherboard.name} (${moboSocket}).`;
      issues.push(msg);
      checks.push({
        id: 'socket',
        label: 'Socket CPU vs Placa-Mãe',
        status: 'error',
        ok: false,
        detail: `${cpuSocket} vs ${moboSocket}`,
      });
    } else {
      checks.push({
        id: 'socket',
        label: 'Socket CPU vs Placa-Mãe',
        status: 'ok',
        ok: true,
        detail: `${cpuSocket || 'AM5'} compatível`,
      });
    }
  } else {
    checks.push({
      id: 'socket',
      label: 'Socket CPU vs Placa-Mãe',
      status: 'pending',
      ok: true,
      detail: 'Aguardando seleção de CPU e Placa-Mãe',
    });
  }

  const ramType =
    build.ram?.specs?.memoryType ||
    (build.ram?.name?.includes('DDR4') ? 'DDR4' : 'DDR5');
  const moboRamType =
    build.motherboard?.specs?.memoryType ||
    (moboSocket === 'AM4' || moboSocket === 'LGA1200' ? 'DDR4' : 'DDR5');

  if (build.ram && build.motherboard) {
    if (ramType !== moboRamType) {
      const msg = `Incompatibilidade de Memória RAM: ${build.ram.name} (${ramType}) não é suportada pela placa-mãe ${build.motherboard.name} (${moboRamType}).`;
      issues.push(msg);
      checks.push({
        id: 'ram',
        label: 'Tipo de Memória RAM',
        status: 'error',
        ok: false,
        detail: `${ramType} vs Placa-Mãe ${moboRamType}`,
      });
    } else {
      checks.push({
        id: 'ram',
        label: 'Tipo de Memória RAM',
        status: 'ok',
        ok: true,
        detail: `Padrão ${ramType} compatível`,
      });
    }
  } else {
    checks.push({
      id: 'ram',
      label: 'Tipo de Memória RAM',
      status: 'pending',
      ok: true,
      detail: 'Aguardando Memória RAM e Placa-Mãe',
    });
  }

  if (build.gpu && build.case) {
    const gpuLen = build.gpu.specs?.lengthMm || 300;
    const maxCaseGpu = build.case.specs?.maxGpuLengthMm || 400;
    if (gpuLen > maxCaseGpu) {
      const msg = `Comprimento da GPU excedido: ${build.gpu.name} (${gpuLen}mm) excede o espaço interno do gabinete ${build.case.name} (máx ${maxCaseGpu}mm).`;
      issues.push(msg);
      checks.push({
        id: 'gpu_length',
        label: 'Espaço Físico da GPU',
        status: 'error',
        ok: false,
        detail: `${gpuLen}mm > máx ${maxCaseGpu}mm`,
      });
    } else {
      checks.push({
        id: 'gpu_length',
        label: 'Espaço Físico da GPU',
        status: 'ok',
        ok: true,
        detail: `${gpuLen}mm (suporta até ${maxCaseGpu}mm)`,
      });
    }
  } else {
    checks.push({
      id: 'gpu_length',
      label: 'Espaço Físico da GPU',
      status: 'pending',
      ok: true,
      detail: 'Aguardando Placa de Vídeo e Gabinete',
    });
  }

  const totalTdp = Object.values(build).reduce(
    (sum, part) => sum + (part?.specs?.tdpW || 0),
    0
  );
  const recommendedPsuWatts = Math.ceil((totalTdp * 1.3) / 50) * 50;
  const psuWatts = build.psu?.specs?.wattageCapacity || 0;

  if (build.psu) {
    if (psuWatts < totalTdp) {
      const msg = `Fonte Insuficiente: Consumo estimado de ${totalTdp}W supera a capacidade total da fonte ${build.psu.name} (${psuWatts}W).`;
      issues.push(msg);
      checks.push({
        id: 'psu_power',
        label: 'Potência da Fonte (+30% Margem)',
        status: 'error',
        ok: false,
        detail: `${psuWatts}W < ${totalTdp}W consumo`,
      });
    } else if (psuWatts < recommendedPsuWatts) {
      const msg = `Margem de Energia Baixa: Consumo de ${totalTdp}W recomenda fonte de ${recommendedPsuWatts}W (margem de 30%), mas a fonte atual tem ${psuWatts}W.`;
      warnings.push(msg);
      checks.push({
        id: 'psu_power',
        label: 'Potência da Fonte (+30% Margem)',
        status: 'warning',
        ok: false,
        detail: `${psuWatts}W (recomendado ${recommendedPsuWatts}W)`,
      });
    } else {
      checks.push({
        id: 'psu_power',
        label: 'Potência da Fonte (+30% Margem)',
        status: 'ok',
        ok: true,
        detail: `${psuWatts}W para ${totalTdp}W (rec. ${recommendedPsuWatts}W)`,
      });
    }
  } else {
    checks.push({
      id: 'psu_power',
      label: 'Potência da Fonte (+30% Margem)',
      status: 'pending',
      ok: true,
      detail: `Consumo atual ${totalTdp}W (rec. ${recommendedPsuWatts}W)`,
    });
  }

  return {
    isCompatible: issues.length === 0,
    compatible: issues.length === 0,
    issues,
    warnings,
    checks,
    totalTdp,
    recommendedPsuWatts,
    psuWatts,
  };
}

export function recommendOptimalBuild(
  catalogByCategory = HARDWARE_CATALOG,
  objective = '1440p',
  maxBudget = 2200
) {
  const budget = Math.max(850, Number(maxBudget) || 2200);

  const weights =
    objective === '1080p'
      ? {
        gpu: 0.34,
        cpu: 0.19,
        motherboard: 0.12,
        ram: 0.08,
        cooler: 0.07,
        storage: 0.07,
        psu: 0.06,
        case: 0.07,
      }
      : objective === '4k'
        ? {
          gpu: 0.44,
          cpu: 0.17,
          motherboard: 0.12,
          ram: 0.07,
          cooler: 0.06,
          storage: 0.05,
          psu: 0.05,
          case: 0.04,
        }
        : {
          gpu: 0.39,
          cpu: 0.18,
          motherboard: 0.11,
          ram: 0.07,
          cooler: 0.08,
          storage: 0.06,
          psu: 0.05,
          case: 0.06,
        };

  const pickClosestBelow = (list, targetPrice, predicate = () => true) => {
    const candidates = (list || []).filter(
      (item) => item && typeof item.price === 'number' && predicate(item)
    );
    if (candidates.length === 0) return (list || [])[0] || null;

    const within = candidates.filter((c) => c.price <= targetPrice * 1.12);
    const pool = within.length > 0 ? within : candidates;

    return pool.reduce((best, curr) => {
      const bestDiff = Math.abs(best.price - targetPrice);
      const currDiff = Math.abs(curr.price - targetPrice);
      return currDiff < bestDiff ? curr : best;
    }, pool[0]);
  };

  const selectedCpu =
    pickClosestBelow(
      catalogByCategory.cpu || HARDWARE_CATALOG.cpu,
      budget * weights.cpu,
      (c) => c.specs?.socket === 'AM5' || c.specs?.socket === 'LGA1700'
    ) || DEFAULT_BUILD.cpu;

  const targetSocket = selectedCpu?.specs?.socket || 'AM5';

  const selectedMobo =
    pickClosestBelow(
      catalogByCategory.motherboard || HARDWARE_CATALOG.motherboard,
      budget * weights.motherboard,
      (m) => m.specs?.socket === targetSocket
    ) || DEFAULT_BUILD.motherboard;

  const targetRamType =
    selectedMobo?.specs?.memoryType ||
    (targetSocket === 'AM4' || targetSocket === 'LGA1200' ? 'DDR4' : 'DDR5');

  const selectedCase =
    pickClosestBelow(
      catalogByCategory.case || HARDWARE_CATALOG.case,
      budget * weights.case
    ) || DEFAULT_BUILD.case;

  const maxGpuLen = selectedCase?.specs?.maxGpuLengthMm || 400;

  const selectedGpu =
    pickClosestBelow(
      catalogByCategory.gpu || HARDWARE_CATALOG.gpu,
      budget * weights.gpu,
      (g) => (g.specs?.lengthMm || 320) <= maxGpuLen
    ) || DEFAULT_BUILD.gpu;

  const selectedRam =
    pickClosestBelow(
      catalogByCategory.ram || HARDWARE_CATALOG.ram,
      budget * weights.ram,
      (r) =>
        (r.specs?.memoryType || 'DDR5') === targetRamType
    ) || DEFAULT_BUILD.ram;

  const selectedCooler =
    pickClosestBelow(
      catalogByCategory.cooler || HARDWARE_CATALOG.cooler,
      budget * weights.cooler
    ) || DEFAULT_BUILD.cooler;

  const selectedStorage =
    pickClosestBelow(
      catalogByCategory.storage || HARDWARE_CATALOG.storage,
      budget * weights.storage
    ) || DEFAULT_BUILD.storage;

  const partialTdp =
    (selectedCpu?.specs?.tdpW || 120) +
    (selectedMobo?.specs?.tdpW || 50) +
    (selectedGpu?.specs?.tdpW || 220) +
    (selectedRam?.specs?.tdpW || 12) +
    (selectedCooler?.specs?.tdpW || 20) +
    (selectedStorage?.specs?.tdpW || 8);

  const minRequiredWatts = Math.ceil((partialTdp * 1.3) / 50) * 50;

  const selectedPsu =
    pickClosestBelow(
      catalogByCategory.psu || HARDWARE_CATALOG.psu,
      budget * weights.psu,
      (p) => (p.specs?.wattageCapacity || 750) >= minRequiredWatts
    ) || DEFAULT_BUILD.psu;

  const recommendedBuild = {
    case: selectedCase,
    motherboard: selectedMobo,
    cpu: selectedCpu,
    cooler: selectedCooler,
    gpu: selectedGpu,
    ram: selectedRam,
    storage: selectedStorage,
    psu: selectedPsu,
  };

  const totalPrice = Object.values(recommendedBuild).reduce(
    (sum, item) => sum + (item?.price || 0),
    0
  );

  return {
    build: recommendedBuild,
    totalPrice,
    compatibility: validateBuildCompatibility(recommendedBuild),
  };
}

export function generateBuildPriceHistory(build, days = 30) {
  const currentTotal = Object.values(build).reduce(
    (acc, item) => acc + (item?.price || 0),
    0
  );
  const baseTotal = currentTotal > 0 ? currentTotal : 1950;
  const seed = Object.values(build)
    .filter(Boolean)
    .reduce((acc, p) => acc + p.name.length * 13, 17);

  const points = [];
  const now = new Date(2026, 10, 6);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const wave =
      Math.sin((i + seed) * 0.35) * 0.028 +
      Math.cos((i * 0.7 + seed) * 0.22) * 0.016 +
      (i / days) * 0.032;
    const price = i === 0 ? baseTotal : Number((baseTotal * (1 + wave)).toFixed(2));
    points.push({
      dateLabel: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
      price,
    });
  }

  const prices = points.map((p) => p.price);
  const lowest = Math.min(...prices);
  const highest = Math.max(...prices);
  const average = prices.reduce((a, b) => a + b, 0) / prices.length;

  return {
    points,
    current: baseTotal,
    lowest,
    highest,
    average,
  };
}

let cachedHerringboneAlpha = null;
export function createHerringboneVentAlphaTexture() {
  if (cachedHerringboneAlpha) return cachedHerringboneAlpha;
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1024, 1024);

  ctx.fillStyle = '#000000';
  const cols = 6;
  const rows = 28;
  const colW = 860 / cols;
  const rowH = 900 / rows;

  for (let c = 0; c < cols; c++) {
    const dir = c % 2 === 0 ? 1 : -1;
    for (let r = 0; r < rows; r++) {
      const cx = 82 + c * colW + colW * 0.5;
      const cy = 62 + r * rowH + rowH * 0.5;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(dir * 0.34);
      ctx.beginPath();
      ctx.roundRect(-colW * 0.37, -6.5, colW * 0.74, 13, 6);
      ctx.fill();
      ctx.restore();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  cachedHerringboneAlpha = tex;
  return tex;
}

let cachedHoneycombAlpha = null;
export function createHoneycombGrilleAlphaTexture() {
  if (cachedHoneycombAlpha) return cachedHoneycombAlpha;
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 512, 512);

  ctx.fillStyle = '#000000';
  const radius = 15;
  const dx = radius * 1.85;
  const dy = radius * 1.62;

  for (let row = 2; row < 28; row++) {
    for (let col = 2; col < 17; col++) {
      const x = col * dx + (row % 2 === 0 ? 0 : dx * 0.5);
      const y = row * dy;
      if (x > 38 && x < 474 && y > 38 && y < 474) {
        ctx.beginPath();
        for (let s = 0; s < 6; s++) {
          const ang = (s / 6) * Math.PI * 2;
          const px = x + Math.cos(ang) * (radius - 3);
          const py = y + Math.sin(ang) * (radius - 3);
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  cachedHoneycombAlpha = tex;
  return tex;
}

const moboSurfaceCache = new Map();
export function createMotherboardSurfaceTextures(part) {
  if (typeof document === 'undefined') return null;
  const upperName = String(part?.name || '').toUpperCase();
  const isStrixWhite =
    part?.themeVariant === 'strix_white' ||
    upperName.includes('X870-A') ||
    upperName.includes('B850-A') ||
    upperName.includes('B650-A') ||
    upperName.includes('WHITE') ||
    upperName.includes('SILVER') ||
    upperName.includes('ICE');
  const isTuf = upperName.includes('TUF');
  const cacheKey = isStrixWhite ? 'strix_white' : isTuf ? 'tuf_black' : 'rog_dark';

  if (moboSurfaceCache.has(cacheKey)) {
    return moboSurfaceCache.get(cacheKey);
  }

  const pcbCanvas = document.createElement('canvas');
  pcbCanvas.width = 1024;
  pcbCanvas.height = 1024;
  const pCtx = pcbCanvas.getContext('2d');
  pCtx.fillStyle = isStrixWhite ? '#161922' : '#0b0d12';
  pCtx.fillRect(0, 0, 1024, 1024);

  pCtx.strokeStyle = isStrixWhite ? 'rgba(203, 213, 225, 0.18)' : 'rgba(148, 163, 184, 0.12)';
  pCtx.lineWidth = 2;
  for (let i = 0; i < 48; i++) {
    const x = 80 + i * 18;
    pCtx.beginPath();
    pCtx.moveTo(x, 60);
    pCtx.lineTo(x, 460);
    pCtx.lineTo(x + 22, 510);
    pCtx.lineTo(x + 22, 960);
    pCtx.stroke();
  }

  for (const [mx, my] of [
    [42, 42],
    [982, 42],
    [42, 512],
    [982, 512],
    [42, 982],
    [982, 982],
  ]) {
    pCtx.fillStyle = '#94a3b8';
    pCtx.beginPath();
    pCtx.arc(mx, my, 16, 0, Math.PI * 2);
    pCtx.fill();
    pCtx.fillStyle = '#090b0f';
    pCtx.beginPath();
    pCtx.arc(mx, my, 7, 0, Math.PI * 2);
    pCtx.fill();
  }

  const vrmCanvas = document.createElement('canvas');
  vrmCanvas.width = 512;
  vrmCanvas.height = 1024;
  const vCtx = vrmCanvas.getContext('2d');

  const vrmEmissiveCanvas = document.createElement('canvas');
  vrmEmissiveCanvas.width = 512;
  vrmEmissiveCanvas.height = 1024;
  const veCtx = vrmEmissiveCanvas.getContext('2d');
  veCtx.fillStyle = '#000000';
  veCtx.fillRect(0, 0, 512, 1024);

  if (isStrixWhite) {
    const grad = vCtx.createLinearGradient(0, 0, 512, 1024);
    grad.addColorStop(0, '#f8fafc');
    grad.addColorStop(0.5, '#e2e8f0');
    grad.addColorStop(1, '#cbd5e1');
    vCtx.fillStyle = grad;
    vCtx.fillRect(0, 0, 512, 1024);

    vCtx.strokeStyle = 'rgba(100, 116, 139, 0.28)';
    vCtx.lineWidth = 4;
    for (let y = -200; y < 1200; y += 44) {
      vCtx.beginPath();
      vCtx.moveTo(0, y);
      vCtx.lineTo(512, y - 220);
      vCtx.stroke();
    }

    vCtx.save();
    vCtx.translate(260, 220);
    vCtx.rotate(-0.32);
    vCtx.fillStyle = '#64748b';
    vCtx.font = 'bold 46px Inter, sans-serif';
    vCtx.fillText('FOR THOSE', -140, 0);
    vCtx.font = 'bold 34px Inter, sans-serif';
    vCtx.fillText('WHO DARE', -120, 44);
    vCtx.restore();

    const drawRogEye = (ctx, fillStyle) => {
      ctx.save();
      ctx.translate(220, 520);
      ctx.fillStyle = fillStyle;
      ctx.beginPath();
      ctx.moveTo(-145, 25);
      ctx.lineTo(-35, -75);
      ctx.lineTo(135, -20);
      ctx.lineTo(45, 45);
      ctx.lineTo(-40, 10);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-85, 65);
      ctx.lineTo(15, 25);
      ctx.lineTo(125, 65);
      ctx.lineTo(20, 95);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    drawRogEye(vCtx, '#facc15');
    drawRogEye(veCtx, '#fbbf24');

    vCtx.save();
    vCtx.translate(250, 820);
    vCtx.rotate(-0.32);
    vCtx.fillStyle = '#64748b';
    vCtx.font = 'bold 52px Inter, sans-serif';
    vCtx.fillText('DARE', -95, 0);
    vCtx.restore();
  } else if (isTuf) {
    vCtx.fillStyle = '#1c2029';
    vCtx.fillRect(0, 0, 512, 1024);
    vCtx.fillStyle = '#f59e0b';
    vCtx.fillRect(36, 140, 16, 740);
    vCtx.save();
    vCtx.translate(260, 520);
    vCtx.rotate(-Math.PI / 2);
    vCtx.fillStyle = '#94a3b8';
    vCtx.font = 'bold 68px Inter, sans-serif';
    vCtx.fillText('TUF GAMING', -220, 20);
    vCtx.restore();
  } else {
    vCtx.fillStyle = '#161a23';
    vCtx.fillRect(0, 0, 512, 1024);
    const drawDarkEye = (ctx, fill) => {
      ctx.save();
      ctx.translate(230, 500);
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(-135, 20);
      ctx.lineTo(-30, -70);
      ctx.lineTo(130, -15);
      ctx.lineTo(40, 40);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
    drawDarkEye(vCtx, '#38bdf8');
    drawDarkEye(veCtx, '#38bdf8');
  }

  const m2Canvas = document.createElement('canvas');
  m2Canvas.width = 1024;
  m2Canvas.height = 512;
  const mCtx = m2Canvas.getContext('2d');

  if (isStrixWhite) {
    const mGrad = mCtx.createLinearGradient(0, 0, 1024, 512);
    mGrad.addColorStop(0, '#f1f5f9');
    mGrad.addColorStop(0.55, '#cbd5e1');
    mGrad.addColorStop(1, '#94a3b8');
    mCtx.fillStyle = mGrad;
    mCtx.fillRect(0, 0, 1024, 512);

    mCtx.strokeStyle = 'rgba(71, 85, 105, 0.35)';
    mCtx.lineWidth = 5;
    for (let x = -200; x < 1200; x += 64) {
      mCtx.beginPath();
      mCtx.moveTo(x, 512);
      mCtx.lineTo(x + 280, 0);
      mCtx.stroke();
    }

    mCtx.save();
    mCtx.translate(540, 290);
    mCtx.rotate(-0.42);
    mCtx.fillStyle = '#334155';
    mCtx.font = '900 138px Inter, sans-serif';
    mCtx.fillText('STRIX', -230, 40);
    mCtx.restore();
  } else {
    mCtx.fillStyle = '#181c24';
    mCtx.fillRect(0, 0, 1024, 512);
    mCtx.strokeStyle = '#334155';
    mCtx.lineWidth = 4;
    mCtx.strokeRect(18, 18, 988, 476);
    mCtx.fillStyle = '#64748b';
    mCtx.font = 'bold 64px Inter, sans-serif';
    mCtx.fillText(isTuf ? 'TUF M.2 ARMOR' : 'REPUBLIC OF GAMERS', 140, 275);
  }

  const pcbTex = new THREE.CanvasTexture(pcbCanvas);
  const vrmTex = new THREE.CanvasTexture(vrmCanvas);
  const vrmEmissiveTex = new THREE.CanvasTexture(vrmEmissiveCanvas);
  const m2Tex = new THREE.CanvasTexture(m2Canvas);

  [pcbTex, vrmTex, vrmEmissiveTex, m2Tex].forEach((t) => {
    t.anisotropy = 8;
    t.needsUpdate = true;
  });

  const bundle = {
    isStrixWhite,
    isTuf,
    pcbTex,
    vrmTex,
    vrmEmissiveTex,
    m2Tex,
  };
  moboSurfaceCache.set(cacheKey, bundle);
  return bundle;
}

let cachedLcdTex = null;
export function createKrakenLcdTexture() {
  if (cachedLcdTex) return cachedLcdTex;
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#07090e';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.arc(256, 256, 212, -Math.PI * 0.75, Math.PI * 0.75);
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 28px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LIQUID TEMP', 256, 168);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 116px Inter, sans-serif';
  ctx.fillText('38°C', 256, 288);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 26px Inter, sans-serif';
  ctx.fillText('PUMP 2640 RPM', 256, 356);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  cachedLcdTex = tex;
  return tex;
}
