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
