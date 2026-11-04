import * as THREE from 'three';
import catalogData from '../data/partsCatalog.json';

export const HARDWARE_CATEGORIES = catalogData.categories;
export const SNAP_POINTS = catalogData.snapPoints;
export const ALL_PARTS = catalogData.parts;

export const HARDWARE_CATALOG = HARDWARE_CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = ALL_PARTS.filter((p) => p.category === cat.id);
  return acc;
}, {});

export const RGB_PRESETS = [
  { id: 'cyan', label: 'Ciano', color: '#00f2fe' },
  { id: 'cyberpunk', label: 'Roxo Cyberpunk', color: '#a855f7' },
  { id: 'rog', label: 'Vermelho ROG', color: '#ef4444' },
  { id: 'ice', label: 'Branco Gelo', color: '#f8fafc' },
  { id: 'matrix', label: 'Verde Matrix', color: '#10b981' },
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
        detail: `${cpuSocket} vs ${moboSocket}`,
      });
    } else {
      checks.push({
        id: 'socket',
        label: 'Socket CPU vs Placa-Mãe',
        status: 'ok',
        detail: `${cpuSocket || 'AM5'} compatível`,
      });
    }
  } else {
    checks.push({
      id: 'socket',
      label: 'Socket CPU vs Placa-Mãe',
      status: 'pending',
      detail: 'Aguardando seleção de CPU e Placa-Mãe',
    });
  }

  const ramType = build.ram?.specs?.memoryType || (build.ram?.name?.includes('DDR4') ? 'DDR4' : 'DDR5');
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
        detail: `${ramType} vs Placa-Mãe ${moboRamType}`,
      });
    } else {
      checks.push({
        id: 'ram',
        label: 'Tipo de Memória RAM',
        status: 'ok',
        detail: `Padrão ${ramType} compatível`,
      });
    }
  } else {
    checks.push({
      id: 'ram',
      label: 'Tipo de Memória RAM',
      status: 'pending',
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
        detail: `${gpuLen}mm > máx ${maxCaseGpu}mm`,
      });
    } else {
      checks.push({
        id: 'gpu_length',
        label: 'Espaço Físico da GPU',
        status: 'ok',
        detail: `${gpuLen}mm (suporta até ${maxCaseGpu}mm)`,
      });
    }
  } else {
    checks.push({
      id: 'gpu_length',
      label: 'Espaço Físico da GPU',
      status: 'pending',
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
        detail: `${psuWatts}W < ${totalTdp}W consumo`,
      });
    } else if (psuWatts < recommendedPsuWatts) {
      const msg = `Margem de Energia Baixa: Consumo de ${totalTdp}W recomenda fonte de ${recommendedPsuWatts}W (margem de 30%), mas a fonte atual tem ${psuWatts}W.`;
      warnings.push(msg);
      checks.push({
        id: 'psu_power',
        label: 'Potência da Fonte (+30% Margem)',
        status: 'warning',
        detail: `${psuWatts}W (recomendado ${recommendedPsuWatts}W)`,
      });
    } else {
      checks.push({
        id: 'psu_power',
        label: 'Potência da Fonte (+30% Margem)',
        status: 'ok',
        detail: `${psuWatts}W para ${totalTdp}W (rec. ${recommendedPsuWatts}W)`,
      });
    }
  } else {
    checks.push({
      id: 'psu_power',
      label: 'Potência da Fonte (+30% Margem)',
      status: 'pending',
      detail: `Consumo ${totalTdp}W (rec. ${recommendedPsuWatts}W)`,
    });
  }

  return {
    isCompatible: issues.length === 0,
    issues,
    warnings,
    checks,
    totalTdp,
    recommendedPsuWatts,
    psuWatts: psuWatts || 1000,
  };
}

export function recommendOptimalBuild(catalogByCategory, objective = '1440p', maxBudget = 2200) {
  const budgetNum = Math.max(700, Number(maxBudget) || 2200);

  const weights =
    objective === '1080p'
      ? { gpu: 0.36, cpu: 0.2, motherboard: 0.12, ram: 0.08, cooler: 0.06, storage: 0.07, psu: 0.05, case: 0.06 }
      : objective === '4k'
      ? { gpu: 0.45, cpu: 0.19, motherboard: 0.11, ram: 0.07, cooler: 0.06, storage: 0.04, psu: 0.04, case: 0.04 }
      : { gpu: 0.4, cpu: 0.2, motherboard: 0.12, ram: 0.07, cooler: 0.06, storage: 0.05, psu: 0.05, case: 0.05 };

  const getList = (cat) => {
    const list = catalogByCategory?.[cat];
    return Array.isArray(list) && list.length > 0 ? list : HARDWARE_CATALOG[cat] || [];
  };

  const pickClosestUnder = (list, targetPrice, filterFn = () => true) => {
    const candidates = list.filter((item) => item && filterFn(item));
    const pool = candidates.length > 0 ? candidates : list;
    if (pool.length === 0) return null;

    const affordable = pool.filter((item) => item.price <= targetPrice * 1.12);
    if (affordable.length > 0) {
      return affordable.reduce((best, curr) =>
        Math.abs(curr.price - targetPrice) < Math.abs(best.price - targetPrice) ? curr : best
      );
    }
    return pool.reduce((cheapest, curr) => (curr.price < cheapest.price ? curr : cheapest));
  };

  const targetSocket =
    objective === '1080p' && budgetNum < 1100 ? 'AM4' : 'AM5';

  const cpus = getList('cpu');
  const selectedCpu =
    pickClosestUnder(cpus, budgetNum * weights.cpu, (c) => c.specs?.socket === targetSocket) ||
    pickClosestUnder(cpus, budgetNum * weights.cpu);

  const resolvedSocket = selectedCpu?.specs?.socket || 'AM5';
  const expectedRamType =
    resolvedSocket === 'AM4' || resolvedSocket === 'LGA1200' ? 'DDR4' : 'DDR5';

  const mobos = getList('motherboard');
  const selectedMobo =
    pickClosestUnder(mobos, budgetNum * weights.motherboard, (m) => m.specs?.socket === resolvedSocket) ||
    pickClosestUnder(mobos, budgetNum * weights.motherboard);

  const cases = getList('case');
  const selectedCase = pickClosestUnder(cases, budgetNum * weights.case);
  const maxGpuLen = selectedCase?.specs?.maxGpuLengthMm || 420;

  const gpus = getList('gpu');
  const selectedGpu =
    pickClosestUnder(
      gpus,
      budgetNum * weights.gpu,
      (g) => (g.specs?.lengthMm || 310) <= maxGpuLen
    ) || pickClosestUnder(gpus, budgetNum * weights.gpu);

  const rams = getList('ram');
  const selectedRam =
    pickClosestUnder(
      rams,
      budgetNum * weights.ram,
      (r) => (r.specs?.memoryType || 'DDR5') === expectedRamType
    ) || pickClosestUnder(rams, budgetNum * weights.ram);

  const coolers = getList('cooler');
  const selectedCooler = pickClosestUnder(
    coolers,
    budgetNum * weights.cooler,
    (c) => objective !== '4k' || c.coolerStyle === 'aio_360'
  );

  const storages = getList('storage');
  const selectedStorage = pickClosestUnder(storages, budgetNum * weights.storage);

  const partialTdp =
    (selectedCpu?.specs?.tdpW || 120) +
    (selectedMobo?.specs?.tdpW || 50) +
    (selectedGpu?.specs?.tdpW || 220) +
    (selectedRam?.specs?.tdpW || 12) +
    (selectedCooler?.specs?.tdpW || 20) +
    (selectedStorage?.specs?.tdpW || 8);

  const minRequiredWatts = Math.ceil((partialTdp * 1.3) / 50) * 50;

  const psus = getList('psu');
  const selectedPsu =
    pickClosestUnder(
      psus,
      budgetNum * weights.psu,
      (p) => (p.specs?.wattageCapacity || 750) >= minRequiredWatts
    ) ||
    psus.reduce(
      (highest, curr) =>
        (curr.specs?.wattageCapacity || 0) > (highest?.specs?.wattageCapacity || 0)
          ? curr
          : highest,
      psus[0]
    );

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

  const gpuRatio = selectedGpu && selectedCpu ? selectedGpu.price / Math.max(1, selectedCpu.price) : 1.8;
  const bottleneckPct = Math.max(2, Math.min(12, Math.round(Math.abs(gpuRatio - 1.85) * 4)));

  return {
    build: recommendedBuild,
    totalPrice,
    bottleneckPct,
    compatibility: validateBuildCompatibility(recommendedBuild),
  };
}

let cachedPcbTex = null;
export function createMotherboardPcbTexture(baseHex = '#0d0f12') {
  if (cachedPcbTex) return cachedPcbTex;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 1024, 1024);

  ctx.strokeStyle = '#181c24';
  ctx.lineWidth = 2;
  for (let i = 0; i < 42; i++) {
    const x = 110 + (i % 21) * 18;
    ctx.beginPath();
    ctx.moveTo(x, 140);
    ctx.lineTo(x, 480);
    ctx.lineTo(x + 28, 520);
    ctx.lineTo(x + 28, 880);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 28; i++) {
    const y = 180 + i * 24;
    ctx.beginPath();
    ctx.moveTo(120, y);
    ctx.lineTo(520, y);
    ctx.lineTo(560, y + 20);
    ctx.lineTo(900, y + 20);
    ctx.stroke();
  }

  ;[
    [54, 54],
    [970, 54],
    [54, 512],
    [970, 512],
    [54, 970],
    [970, 970],
  ].forEach(([mx, my]) => {
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(mx, my, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#090a0f';
    ctx.beginPath();
    ctx.arc(mx, my, 8, 0, Math.PI * 2);
    ctx.fill();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  cachedPcbTex = tex;
  return tex;
}

let cachedM2ArmorTex = null;
export function createM2ArmorLaserTexture() {
  if (cachedM2ArmorTex) return cachedM2ArmorTex;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 1024, 512);
  grad.addColorStop(0, '#1e232d');
  grad.addColorStop(0.5, '#2a303c');
  grad.addColorStop(1, '#171b22');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let y = 0; y < 512; y += 3) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.moveTo(40, 0);
  ctx.lineTo(360, 0);
  ctx.lineTo(260, 512);
  ctx.lineTo(0, 512);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(390 + i * 55, 40);
    ctx.lineTo(330 + i * 55, 470);
    ctx.stroke();
  }

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 34px "Space Grotesk", sans-serif';
  ctx.fillText('B650 ATX', 55, 265);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'bold 24px "JetBrains Mono", monospace';
  ctx.fillText('PCIe 5.0 M.2 SHIELD', 540, 265);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  cachedM2ArmorTex = tex;
  return tex;
}

export function createGpuBackplateTexture(brand = 'ASUS ROG', model = 'GEFORCE RTX 4070') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const bgGrad = ctx.createLinearGradient(0, 0, 1024, 512);
  bgGrad.addColorStop(0, '#14171f');
  bgGrad.addColorStop(0.5, '#1d222d');
  bgGrad.addColorStop(1, '#11131a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 512);

  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 512; i += 3) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(1024, i);
    ctx.stroke();
  }

  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(60, 440);
  ctx.lineTo(440, 70);
  ctx.lineTo(660, 70);
  ctx.stroke();

  ctx.fillStyle = '#090a0e';
  for (let i = 0; i < 11; i++) {
    const x = 640 + i * 30;
    ctx.beginPath();
    ctx.moveTo(x, 85);
    ctx.lineTo(x + 16, 85);
    ctx.lineTo(x - 36, 425);
    ctx.lineTo(x - 52, 425);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 34px "Space Grotesk", sans-serif';
  ctx.fillText('GEFORCE RTX', 85, 240);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 22px "JetBrains Mono", monospace';
  ctx.fillText(brand.toUpperCase(), 85, 290);
  ctx.fillText(model.slice(0, 24).toUpperCase(), 85, 326);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export function createKrakenLcdTexture(cpuTemp = 42, gpuTemp = 48, liquidRpm = 2480) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#05070b';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.arc(256, 256, 220, 0, Math.PI * 2);
  ctx.stroke();

  const ringGrad = ctx.createLinearGradient(0, 0, 512, 512);
  ringGrad.addColorStop(0, '#00f2fe');
  ringGrad.addColorStop(0.5, '#38bdf8');
  ringGrad.addColorStop(1, '#a855f7');
  ctx.strokeStyle = ringGrad;
  ctx.lineWidth = 18;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(256, 256, 220, -Math.PI * 0.75, Math.PI * 0.55);
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 22px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('LIQUID COOLER', 256, 145);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 104px "Space Grotesk", sans-serif';
  ctx.fillText(`${cpuTemp}°`, 264, 260);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 24px "JetBrains Mono", monospace';
  ctx.fillText(`GPU ${gpuTemp}°C`, 256, 325);

  ctx.fillStyle = '#64748b';
  ctx.font = '600 18px "JetBrains Mono", monospace';
  ctx.fillText(`PUMP ${liquidRpm} RPM`, 256, 370);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createHardwareLabelTexture(title = '990 PRO', subtitle = 'PCIe 4.0 NVMe M.2') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#111318';
  ctx.fillRect(0, 0, 512, 256);

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, 496, 240);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 44px "Space Grotesk", sans-serif';
  ctx.fillText(title, 32, 115);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 26px "JetBrains Mono", monospace';
  ctx.fillText(subtitle, 32, 175);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

let cachedFanHubTex = null;
export function createFanHubStickerTexture() {
  if (cachedFanHubTex) return cachedFanHubTex;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0f131a';
  ctx.fillRect(0, 0, 256, 256);

  for (let r = 18; r < 118; r += 8) {
    ctx.strokeStyle = r % 16 === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(148,163,184,0.06)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(128, 128, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(128, 128, 114, 0, Math.PI * 2);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  cachedFanHubTex = tex;
  return tex;
}

let cachedMotionBlurTex = null;
export function createFanMotionBlurTexture() {
  if (cachedMotionBlurTex) return cachedMotionBlurTex;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 256, 256);
  const grad = ctx.createRadialGradient(128, 128, 28, 128, 128, 120);
  grad.addColorStop(0, 'rgba(148, 163, 184, 0.0)');
  grad.addColorStop(0.35, 'rgba(203, 213, 225, 0.16)');
  grad.addColorStop(0.75, 'rgba(148, 163, 184, 0.22)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0.0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(128, 128, 120, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  cachedMotionBlurTex = tex;
  return tex;
}

let cachedBraidedTex = null;
export function createBraidedSleeveTexture() {
  if (cachedBraidedTex) return cachedBraidedTex;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#12151e';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#242938';
  ctx.lineWidth = 4;
  for (let i = -256; i < 512; i += 14) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 256, 256);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(i + 256, 0);
    ctx.lineTo(i, 256);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 2);
  cachedBraidedTex = tex;
  return tex;
}

let cachedSoftRgbTex = null;
export function createSoftRgbGradientTexture() {
  if (cachedSoftRgbTex) return cachedSoftRgbTex;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.5, '#f8fafc');
  grad.addColorStop(1, '#ffffff');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 64);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  cachedSoftRgbTex = tex;
  return tex;
}

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
