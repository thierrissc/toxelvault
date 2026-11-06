import catalogData from '../data/partsCatalog.json';

export const GITHUB_DATASET_BASE_URL =
  'https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json/';
export const JSDELIVR_DATASET_BASE_URL =
  'https://cdn.jsdelivr.net/gh/docyx/pc-part-dataset@main/data/json/';

export const DATASET_ENDPOINTS = {
  cpu: 'cpu.json',
  motherboard: 'motherboard.json',
  gpu: 'video-card.json',
  ram: 'memory.json',
  cooler: 'cpu-cooler.json',
  storage: 'internal-hard-drive.json',
  psu: 'power-supply.json',
  case: 'case.json',
};

const CACHE_STORAGE_NAME = 'toxelvault-hardware-dataset-v3';
const LOCAL_STORAGE_PREFIX = 'toxelvault_hw_cat_v3_';
const MAX_NORMALIZED_ITEMS_PER_CATEGORY = 320;

const memoryCategoryCache = new Map();
const wikimediaSearchCache = new Map();

export const REAL_PRODUCT_IMAGE_DICTIONARY = {
  byKeyword: [
    { match: '9800X3D', url: 'https://m.media-amazon.com/images/I/91ITeh+6zRL._AC_SL1500_.jpg' },
    { match: '7800X3D', url: 'https://m.media-amazon.com/images/I/71jxHGiiiNL._AC_SL1500_.jpg' },
    { match: 'RYZEN', url: 'https://m.media-amazon.com/images/I/71jxHGiiiNL._AC_SL1500_.jpg' },
    { match: 'INTEL', url: 'https://m.media-amazon.com/images/I/61C1DOLRK4L._AC_SL1500_.jpg' },
    { match: 'CORE I', url: 'https://m.media-amazon.com/images/I/61C1DOLRK4L._AC_SL1500_.jpg' },
    { match: 'CORE ULTRA', url: 'https://m.media-amazon.com/images/I/61C1DOLRK4L._AC_SL1500_.jpg' },
    { match: '990 PRO', url: 'https://m.media-amazon.com/images/I/71OWtcxKgvL._AC_SL1500_.jpg' },
    { match: '980 PRO', url: 'https://m.media-amazon.com/images/I/71OWtcxKgvL._AC_SL1500_.jpg' },
    { match: 'NH-D15', url: 'https://m.media-amazon.com/images/I/610RTWemhSL._AC_SL1500_.jpg' },
    { match: 'NOCTUA', url: 'https://m.media-amazon.com/images/I/610RTWemhSL._AC_SL1500_.jpg' },
    { match: '7900 XTX', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sapphire_AMD_Radeon_RX_7900_XTX.jpg' },
    { match: 'RADEON', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sapphire_AMD_Radeon_RX_7900_XTX.jpg' },
    { match: '4090', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Palit_GeForce_RTX_5090_Gamerock_20250530_HOF4166_RAW-Export.png' },
    { match: '5090', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Palit_GeForce_RTX_5090_Gamerock_20250530_HOF4166_RAW-Export.png' },
    { match: '4070', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/2023_Gigabyte_GeForce_RTX_4070_Aero_OC_12GB_(3).jpg' },
    { match: 'GEFORCE', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/2023_Gigabyte_GeForce_RTX_4070_Aero_OC_12GB_(3).jpg' },
    { match: 'DOMINATOR', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/16_GiB-DDR4-RAM-Riegel_RAM019FIX_Small_Crop_90_PCNT.png' },
    { match: 'TRIDENT', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/HyperX_Fury_DDR4-RAM_20210611_Vorderseite.png' },
    { match: 'HYTE', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Gaming-PC_20240426_HOF2505-HDR_RAW-Export.png' },
    { match: 'O11', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Gaming-PC_20240426_HOF2511-HDR_RAW-Export.png' },
    { match: '4000D', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Workstation-PC_20240412_HOF2052-HDR_RAW-Export.png' },
  ],
  byCategory: {
    case: 'https://commons.wikimedia.org/wiki/Special:FilePath/Gaming-PC_20240426_HOF2505-HDR_RAW-Export.png',
    motherboard: 'https://commons.wikimedia.org/wiki/Special:FilePath/Computer_motherboard_2.jpg',
    cpu: 'https://m.media-amazon.com/images/I/71jxHGiiiNL._AC_SL1500_.jpg',
    cooler: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Deepcool_cooler.png',
    gpu: 'https://commons.wikimedia.org/wiki/Special:FilePath/2023_Gigabyte_GeForce_RTX_4070_Aero_OC_12GB_(3).jpg',
    ram: 'https://commons.wikimedia.org/wiki/Special:FilePath/HyperX_Fury_DDR4-RAM_20210611_Vorderseite.png',
    storage: 'https://m.media-amazon.com/images/I/71OWtcxKgvL._AC_SL1500_.jpg',
    psu: 'https://commons.wikimedia.org/wiki/Special:FilePath/Full_modular_ATX_power_supply_unit.jpg',
  },
};

export function resolveRealProductPhoto(part) {
  if (!part) return REAL_PRODUCT_IMAGE_DICTIONARY.byCategory.cpu;

  const existing = part.realPhotoUrl || part.imageUrl;
  if (
    typeof existing === 'string' &&
    existing.startsWith('https://') &&
    !existing.includes('sketchfab.com')
  ) {
    return existing;
  }

  const upperName = String(part.name || '').toUpperCase();
  const upperBrand = String(part.brand || '').toUpperCase();

  for (const entry of REAL_PRODUCT_IMAGE_DICTIONARY.byKeyword) {
    if (upperName.includes(entry.match) || upperBrand.includes(entry.match)) {
      return entry.url;
    }
  }

  if (part.category === 'cooler' && part.coolerStyle === 'air_dual') {
    return 'https://m.media-amazon.com/images/I/610RTWemhSL._AC_SL1500_.jpg';
  }
  if (part.category === 'motherboard' && upperBrand.includes('ROG')) {
    return 'https://commons.wikimedia.org/wiki/Special:FilePath/Computer_motherboard_6.jpg';
  }
  if (part.category === 'psu' && upperBrand.includes('ASUS')) {
    return 'https://commons.wikimedia.org/wiki/Special:FilePath/ATX_Computer_power_supply_unit.jpg';
  }

  return (
    REAL_PRODUCT_IMAGE_DICTIONARY.byCategory[part.category] ||
    REAL_PRODUCT_IMAGE_DICTIONARY.byCategory.cpu
  );
}

export async function fetchWikimediaProductImage(part) {
  const basePhoto = resolveRealProductPhoto(part);
  if (!part?.name) return basePhoto;

  const cacheKey = `${part.category}_${part.brand || ''}`;
  if (wikimediaSearchCache.has(cacheKey)) {
    return wikimediaSearchCache.get(cacheKey);
  }

  wikimediaSearchCache.set(cacheKey, basePhoto);
  return basePhoto;
}

const KNOWN_BRANDS = [
  'ASUS ROG',
  'ASUS',
  'AMD',
  'Intel',
  'NVIDIA',
  'MSI',
  'Gigabyte',
  'ASRock',
  'Corsair',
  'G.Skill',
  'Kingston',
  'Crucial',
  'TeamGroup',
  'Patriot',
  'NZXT',
  'Noctua',
  'Thermalright',
  'be quiet!',
  'Arctic',
  'Cooler Master',
  'DeepCool',
  'Lian Li',
  'HYTE',
  'Fractal Design',
  'Phanteks',
  'Montech',
  'Antec',
  'Thermaltake',
  'Samsung',
  'Western Digital',
  'WD',
  'Seagate',
  'Sabrent',
  'Lexar',
  'SK Hynix',
  'Sapphire',
  'PowerColor',
  'XFX',
  'Zotac',
  'PNY',
  'EVGA',
  'Galax',
  'SeaSonic',
  'Super Flower',
  'SilverStone',
  'FSP',
];

export function extractBrandFromName(name = '') {
  const upper = name.toUpperCase();
  if (
    upper.startsWith('ASUS ROG') ||
    upper.includes('ROG STRIX') ||
    upper.includes('ROG CROSSHAIR') ||
    upper.includes('ROG MAXIMUS') ||
    upper.includes('ROG THOR')
  ) {
    return 'ASUS ROG';
  }
  for (const b of KNOWN_BRANDS) {
    if (upper.startsWith(b.toUpperCase() + ' ') || upper === b.toUpperCase()) {
      return b;
    }
  }
  const firstToken = name.trim().split(/\s+/)[0] || 'Generic';
  if (firstToken.toLowerCase() === 'asus') return 'ASUS';
  if (firstToken.toLowerCase() === 'msi') return 'MSI';
  if (firstToken.toLowerCase() === 'evga') return 'EVGA';
  if (firstToken.toLowerCase() === 'nzxt') return 'NZXT';
  if (firstToken.toLowerCase() === 'xfx') return 'XFX';
  if (firstToken.toLowerCase() === 'pny') return 'PNY';
  return firstToken;
}

function createPartId(category, name, index = 0) {
  const slug = String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 44);
  return `${category}_${slug}_${index}`;
}

function inferCpuSocket(raw) {
  if (raw.socket) return String(raw.socket).toUpperCase().replace(/\s+/g, '');
  const arch = String(raw.microarchitecture || '').toLowerCase();
  const name = String(raw.name || '').toUpperCase();

  if (arch.includes('zen 5') || arch.includes('zen 4')) return 'AM5';
  if (
    arch.includes('zen 3') ||
    arch.includes('zen 2') ||
    arch.includes('zen+') ||
    arch === 'zen'
  ) {
    return 'AM4';
  }
  if (arch.includes('arrow lake')) return 'LGA1851';
  if (arch.includes('raptor lake') || arch.includes('alder lake')) return 'LGA1700';
  if (arch.includes('rocket lake') || arch.includes('comet lake')) return 'LGA1200';
  if (name.includes('THREADRIPPER')) return 'sTR5';
  if (
    name.includes('RYZEN 7 9') ||
    name.includes('RYZEN 9 9') ||
    name.includes('RYZEN 5 9') ||
    name.includes('RYZEN 7 7') ||
    name.includes('RYZEN 9 7') ||
    name.includes('RYZEN 5 7')
  ) {
    return 'AM5';
  }
  if (name.includes('RYZEN')) return 'AM4';
  if (name.includes('CORE ULTRA')) return 'LGA1851';
  if (
    name.includes('14900') ||
    name.includes('14700') ||
    name.includes('14600') ||
    name.includes('13900') ||
    name.includes('13700') ||
    name.includes('12900')
  ) {
    return 'LGA1700';
  }
  return 'AM5';
}

export function normalizeDatasetItem(category, raw, index = 0) {
  const name = raw.name || 'Hardware Component';
  const brand = raw.brand || extractBrandFromName(name);
  const price = typeof raw.price === 'number' && raw.price > 0 ? raw.price : 99.99;
  const id = raw.id || createPartId(category, name, index);

  const merchants = raw.merchants || [
    { name: 'Amazon', shipping: 'FREE s/h', stock: 'In stock', price: Number(price.toFixed(2)) },
    { name: 'Newegg', shipping: 'FREE s/h', stock: 'In stock', price: Number((price * 1.02).toFixed(2)) },
  ];

  let model3dPath = `/models/${category}/${id}.glb`;
  let mountOffset = {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  };

  const extraProps = {};
  let specs = {};

  if (category === 'cpu') {
    const socket = inferCpuSocket(raw);
    const cores = raw.core_count || 8;
    const baseClock = raw.core_clock ? `${raw.core_clock} GHz` : '4.2 GHz';
    const boostClock = raw.boost_clock ? `${raw.boost_clock} GHz` : '5.0 GHz';
    const tdpW = raw.tdp || 105;

    model3dPath =
      brand === 'Intel'
        ? '/models/cpus/intel-i9-14900k.glb'
        : name.includes('9800')
        ? '/models/cpus/ryzen-7-9800x3d.glb'
        : '/models/cpus/ryzen-7-7800x3d.glb';

    specs = {
      socket,
      cores: `${cores} Cores / ${cores * 2} Threads`,
      frequency: `${baseClock} Base / ${boostClock} Boost`,
      microarchitecture: raw.microarchitecture || (brand === 'Intel' ? 'Raptor Lake' : 'Zen 5'),
      graphics: raw.graphics || 'Discrete GPU Required',
      dimensionsMm: socket === 'LGA1700' ? '45 x 37.5 mm' : '40 x 40 mm Package',
      tdpW,
    };
  } else if (category === 'motherboard') {
    const socket = String(raw.socket || 'AM5').toUpperCase().replace(/\s+/g, '');
    const formFactor = raw.form_factor || 'ATX';
    const slots = raw.memory_slots || 4;
    const maxMem = raw.max_memory ? `${raw.max_memory} GB` : '192 GB';
    const upperMobo = name.toUpperCase();
    const isWhiteStrix =
      upperMobo.includes('X870-A') ||
      upperMobo.includes('B850-A') ||
      upperMobo.includes('B650-A') ||
      upperMobo.includes('Z790-A') ||
      upperMobo.includes('WHITE') ||
      upperMobo.includes('SILVER') ||
      upperMobo.includes('ICE') ||
      String(raw.color || '').toUpperCase().includes('WHITE') ||
      String(raw.color || '').toUpperCase().includes('SILVER');
    const isRog =
      upperMobo.includes('ROG') ||
      upperMobo.includes('CROSSHAIR') ||
      upperMobo.includes('MAXIMUS') ||
      upperMobo.includes('STRIX');

    model3dPath =
      socket === 'LGA1700'
        ? '/models/motherboards/asus-rog-maximus-z790.glb'
        : isRog
        ? '/models/motherboards/asus-rog-crosshair-x870e.glb'
        : '/models/motherboards/asus-b650m.glb';

    extraProps.pcbColor = '#0d0f12';
    extraProps.vrmColor = isWhiteStrix ? '#f1f5f9' : isRog ? '#1e2430' : '#262b36';
    extraProps.accentColor = isWhiteStrix ? '#f59e0b' : '#94a3b8';
    extraProps.themeVariant = isWhiteStrix
      ? 'strix_white'
      : upperMobo.includes('TUF')
      ? 'tuf_black'
      : 'rog_dark';

    specs = {
      socket,
      formFactor,
      memorySlots: `${slots}x DIMM (Max ${maxMem})`,
      memoryType: socket === 'AM4' || socket === 'LGA1200' ? 'DDR4' : 'DDR5',
      color: raw.color || (isWhiteStrix ? 'White / Brushed Silver' : 'Black / Brushed Aluminum'),
      dimensionsMm: '305 x 244 mm',
      tdpW: 50,
    };
  } else if (category === 'gpu') {
    const vramGb = raw.memory || 12;
    const lengthMm = raw.length || 336;
    const boost = raw.boost_clock ? `${raw.boost_clock} MHz` : '2550 MHz';
    const chipset = raw.chipset || name;
    const isRadeon =
      chipset.toUpperCase().includes('RADEON') || chipset.toUpperCase().includes('RX ');
    const is4090 = chipset.includes('4090') || chipset.includes('5090');

    model3dPath = is4090
      ? '/models/gpus/rtx-4090-fe.glb'
      : isRadeon
      ? '/models/gpus/rx-7900-xtx.glb'
      : '/models/gpus/rtx-4070.glb';

    const scaleX = Math.max(0.85, Math.min(1.06, lengthMm / 336));
    mountOffset = {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [Number(scaleX.toFixed(2)), 1, 1],
    };

    extraProps.shroudColor = raw.color?.toLowerCase().includes('white') ? '#cbd5e1' : '#151820';
    extraProps.trimColor = isRadeon ? '#94a3b8' : '#64748b';

    const estimatedTdp = vramGb >= 24 ? 420 : vramGb >= 16 ? 285 : vramGb >= 12 ? 220 : 165;

    specs = {
      chipset,
      vram: `${vramGb} GB VRAM`,
      frequency: `${boost} Boost Clock`,
      lengthMm,
      dimensionsMm: `${lengthMm} x 140 x 65 mm`,
      color: raw.color || 'Black / Brushed Metal',
      tdpW: estimatedTdp,
    };
  } else if (category === 'ram') {
    const ddrGen = Array.isArray(raw.speed) ? `DDR${raw.speed[0]}` : 'DDR5';
    const speedMhz = Array.isArray(raw.speed) ? raw.speed[1] : 6000;
    const sticks = Array.isArray(raw.modules) ? raw.modules[0] : 2;
    const perStickGb = Array.isArray(raw.modules) ? raw.modules[1] : 16;
    const totalGb = sticks * perStickGb;

    model3dPath =
      sticks >= 4
        ? '/models/ram/corsair-dominator-titanium.glb'
        : '/models/ram/gskill-trident-z5.glb';

    extraProps.heatsinkColor = raw.color?.toLowerCase().includes('white') ? '#e2e8f0' : '#181b22';

    specs = {
      memoryType: ddrGen,
      capacity: `${totalGb} GB (${sticks} x ${perStickGb} GB)`,
      sticks: sticks >= 4 ? 4 : 2,
      frequency: `${speedMhz} MT/s (${ddrGen}-${speedMhz})`,
      casLatency: raw.cas_latency ? `CL${raw.cas_latency}` : 'CL30',
      dimensionsMm: '134 x 44 x 8 mm',
      tdpW: sticks * 5,
    };
  } else if (category === 'cooler') {
    const sizeMm = raw.size || (name.includes('360') ? 360 : name.includes('240') ? 240 : null);
    const isLiquid =
      Boolean(sizeMm && sizeMm >= 240) ||
      name.toUpperCase().includes('KRAKEN') ||
      name.toUpperCase().includes('AIO') ||
      name.toUpperCase().includes('LIQUID') ||
      name.toUpperCase().includes('CORELIQUID') ||
      name.toUpperCase().includes('HYDRO') ||
      name.toUpperCase().includes('LS720') ||
      name.toUpperCase().includes('LT720') ||
      name.toUpperCase().includes('GALAHAD') ||
      name.toUpperCase().includes('ARCTIC LIQUID');

    model3dPath = isLiquid
      ? '/models/coolers/nzxt-kraken-360.glb'
      : '/models/coolers/noctua-nh-d15.glb';

    extraProps.coolerStyle = isLiquid ? 'aio_360' : 'air_dual';
    extraProps.radiatorColor = raw.color?.toLowerCase().includes('white') ? '#cbd5e1' : '#14171f';

    const rpmText = Array.isArray(raw.rpm)
      ? `${raw.rpm[0]} - ${raw.rpm[1]} RPM`
      : raw.rpm
      ? `${raw.rpm} RPM`
      : '500 - 1800 RPM';

    const noiseText = Array.isArray(raw.noise_level)
      ? `${raw.noise_level[0]} - ${raw.noise_level[1]} dBA`
      : raw.noise_level
      ? `${raw.noise_level} dBA`
      : '28.5 dBA';

    specs = {
      coolerType: isLiquid
        ? `${sizeMm || 360}mm Liquid AIO Cooler`
        : 'Dual-Tower Heatpipe Air Cooler',
      fanRpm: rpmText,
      noiseLevel: noiseText,
      supportedSockets: ['AM5', 'AM4', 'LGA1700', 'LGA1851'],
      dimensionsMm: isLiquid ? '360 x 120 x 25 mm' : '160 x 150 x 158 mm',
      tdpW: isLiquid ? 22 : 10,
    };
  } else if (category === 'storage') {
    const capGb = raw.capacity || 2000;
    const capFormatted =
      capGb >= 1000
        ? `${(capGb / 1000).toFixed(capGb % 1000 === 0 ? 0 : 1)} TB (${capGb} GB)`
        : `${capGb} GB`;

    model3dPath = '/models/storage/samsung-990-pro.glb';

    specs = {
      capacity: capFormatted,
      type: String(raw.type || 'SSD'),
      interface: raw.interface || 'M.2 PCIe 4.0 X4',
      formFactor: raw.form_factor || 'M.2-2280',
      cache: raw.cache ? `${raw.cache} MB DRAM Cache` : 'Host Memory Buffer (HMB)',
      dimensionsMm: '80 x 22 x 2.3 mm',
      tdpW: 8,
    };
  } else if (category === 'psu') {
    const watts = raw.wattage || 850;
    const eff = raw.efficiency
      ? `80 PLUS ${String(raw.efficiency).toUpperCase()}`
      : '80 PLUS GOLD';

    model3dPath = brand.includes('ASUS')
      ? '/models/psus/asus-rog-thor-1200w.glb'
      : '/models/psus/corsair-rm1000x.glb';

    specs = {
      wattageCapacity: watts,
      efficiency: eff,
      formFactor: `${raw.type || 'ATX'} (${raw.modular || 'Full'} Modular)`,
      color: raw.color || 'Black',
      dimensionsMm: '160 x 86 x 150 mm',
      tdpW: 0,
    };
  } else if (category === 'case') {
    const caseType = raw.type || 'ATX Mid Tower';
    const upperCase = name.toUpperCase();
    const isWhite =
      String(raw.color || '').toLowerCase().includes('white') ||
      upperCase.includes('WHITE') ||
      upperCase.includes('SNOW');

    model3dPath =
      brand === 'Lian Li'
        ? '/models/cases/lian-li-o11-vision.glb'
        : brand === 'Corsair'
        ? '/models/cases/corsair-4000d-airflow.glb'
        : '/models/cases/hyte-y70-black.glb';

    extraProps.chassisColor = isWhite ? '#f3f4f6' : '#121316';
    extraProps.interiorColor = isWhite ? '#e5e7eb' : '#121316';

    specs = {
      formFactor: caseType.includes('Micro')
        ? 'Micro-ATX / Mini-ITX'
        : 'ATX / Micro-ATX / Mini-ITX',
      maxGpuLengthMm: caseType.includes('Mini') ? 335 : 422,
      sidePanel: raw.side_panel || 'Tempered Glass',
      volume: raw.external_volume ? `${raw.external_volume}L Chamber` : '70L Dual-Chamber',
      dimensionsMm: '420 x 400 x 280 mm',
      tdpW: 0,
    };
  }

  const normalizedItem = {
    id,
    name,
    brand,
    category,
    price,
    specs,
    model3dPath,
    mountOffset: raw.mountOffset || mountOffset,
    merchants,
    ...extraProps,
  };

  const resolvedImg = resolveRealProductPhoto({ ...raw, ...normalizedItem });
  normalizedItem.imageUrl = resolvedImg;
  normalizedItem.realPhotoUrl = resolvedImg;

  return normalizedItem;
}

function scorePartPopularity(category, raw) {
  if (!raw || typeof raw.price !== 'number' || raw.price <= 0) return -999;
  const name = String(raw.name || '').toUpperCase();
  let score = 10;

  if (category === 'cpu') {
    if (
      name.includes('9800X3D') ||
      name.includes('7800X3D') ||
      name.includes('9950X') ||
      name.includes('14900K') ||
      name.includes('14700K') ||
      name.includes('13900K')
    )
      score += 120;
    else if (
      name.includes('RYZEN 7') ||
      name.includes('RYZEN 9') ||
      name.includes('CORE I9') ||
      name.includes('CORE I7') ||
      name.includes('CORE ULTRA')
    )
      score += 70;
    else if (name.includes('RYZEN 5') || name.includes('CORE I5')) score += 45;
  } else if (category === 'motherboard') {
    if (raw.socket === 'AM5' || raw.socket === 'LGA1700' || raw.socket === 'LGA1851') score += 85;
    if (
      name.includes('ROG') ||
      name.includes('TUF') ||
      name.includes('MAG') ||
      name.includes('AORUS') ||
      name.includes('TOMAHAWK')
    )
      score += 50;
  } else if (category === 'gpu') {
    if (
      name.includes('4090') ||
      name.includes('4080') ||
      name.includes('4070') ||
      name.includes('7900 XTX') ||
      name.includes('7900 XT') ||
      name.includes('7800 XT')
    )
      score += 120;
    else if (name.includes('4060') || name.includes('3080') || name.includes('3070')) score += 60;
    if (
      name.includes('ROG STRIX') ||
      name.includes('FOUNDERS') ||
      name.includes('SUPRIM') ||
      name.includes('NITRO+') ||
      name.includes('TUF')
    )
      score += 35;
  } else if (category === 'ram') {
    if (Array.isArray(raw.speed) && raw.speed[0] === 5) score += 90;
    if (
      name.includes('TRIDENT Z5') ||
      name.includes('DOMINATOR') ||
      name.includes('VENGEANCE') ||
      name.includes('FURY')
    )
      score += 50;
  } else if (category === 'cooler') {
    if (
      name.includes('KRAKEN') ||
      name.includes('NH-D15') ||
      name.includes('PEERLESS ASSASSIN') ||
      name.includes('GALAHAD') ||
      name.includes('LIQUID FREEZER') ||
      name.includes('ICUE')
    )
      score += 95;
  } else if (category === 'storage') {
    if (String(raw.interface || '').includes('M.2') && String(raw.type || '') === 'SSD')
      score += 80;
    if (
      name.includes('990 PRO') ||
      name.includes('SN850X') ||
      name.includes('980 PRO') ||
      name.includes('T700')
    )
      score += 70;
  } else if (category === 'psu') {
    if ((raw.wattage || 0) >= 750 && (raw.wattage || 0) <= 1300) score += 75;
    if (
      name.includes('RM1000') ||
      name.includes('RM850') ||
      name.includes('ROG THOR') ||
      name.includes('MAG A') ||
      name.includes('SUPER FLOWER') ||
      name.includes('VERTEX')
    )
      score += 55;
  } else if (category === 'case') {
    if (String(raw.side_panel || '').includes('Tempered Glass')) score += 70;
    if (
      name.includes('HYTE Y70') ||
      name.includes('HYTE Y60') ||
      name.includes('O11') ||
      name.includes('4000D') ||
      name.includes('H9') ||
      name.includes('H6') ||
      name.includes('NORTH') ||
      name.includes('NV7')
    )
      score += 80;
  }

  return score;
}

async function fetchRawDatasetJson(endpointFile) {
  const primaryUrl = `${GITHUB_DATASET_BASE_URL}${endpointFile}`;
  const fallbackUrl = `${JSDELIVR_DATASET_BASE_URL}${endpointFile}`;

  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cache = await window.caches.open(CACHE_STORAGE_NAME);
      const cachedRes = await cache.match(primaryUrl);
      if (cachedRes && cachedRes.ok) {
        return { data: await cachedRes.json(), fromCache: true };
      }
    } catch {
      void 0;
    }
  }

  let response;
  try {
    response = await fetch(primaryUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  } catch {
    response = await fetch(fallbackUrl);
  }

  if (!response || !response.ok) {
    throw new Error(`Failed to fetch dataset endpoint: ${endpointFile}`);
  }

  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cache = await window.caches.open(CACHE_STORAGE_NAME);
      await cache.put(primaryUrl, response.clone());
    } catch {
      void 0;
    }
  }

  const data = await response.json();
  return { data, fromCache: false };
}

export async function fetchCategoryHardware(category, { forceRefresh = false } = {}) {
  if (!forceRefresh && memoryCategoryCache.has(category)) {
    return {
      parts: memoryCategoryCache.get(category),
      source: 'memory-cache',
    };
  }

  const localKey = `${LOCAL_STORAGE_PREFIX}${category}`;

  if (!forceRefresh && typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(localKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hydrated = parsed.map((item) => {
            const realPhoto = resolveRealProductPhoto(item);
            return {
              ...item,
              imageUrl: realPhoto,
              realPhotoUrl: realPhoto,
            };
          });
          memoryCategoryCache.set(category, hydrated);
          return { parts: hydrated, source: 'localStorage-cache' };
        }
      }
    } catch {
      void 0;
    }
  }

  const endpointFile = DATASET_ENDPOINTS[category];
  const seedParts = catalogData.parts
    .filter((p) => p.category === category)
    .map((p) => {
      const realPhoto = resolveRealProductPhoto(p);
      return {
        ...p,
        imageUrl: realPhoto,
        realPhotoUrl: realPhoto,
      };
    });

  if (!endpointFile) {
    memoryCategoryCache.set(category, seedParts);
    return { parts: seedParts, source: 'local-seed' };
  }

  try {
    const { data: rawArray, fromCache } = await fetchRawDatasetJson(endpointFile);

    const validRaw = (Array.isArray(rawArray) ? rawArray : [])
      .filter((r) => r && r.name && typeof r.price === 'number' && r.price > 12)
      .map((r) => ({ raw: r, score: scorePartPopularity(category, r) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_NORMALIZED_ITEMS_PER_CATEGORY);

    const normalizedFromGithub = validRaw.map((entry, idx) =>
      normalizeDatasetItem(category, entry.raw, idx)
    );

    const seenNames = new Set(seedParts.map((s) => s.name.toLowerCase()));
    const combined = [
      ...seedParts,
      ...normalizedFromGithub.filter((item) => {
        const key = item.name.toLowerCase();
        if (seenNames.has(key)) return false;
        seenNames.add(key);
        return true;
      }),
    ];

    memoryCategoryCache.set(category, combined);

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const compactForStorage = combined.slice(0, 180).map((item) => {
          const { imageUrl, realPhotoUrl: _realPhotoUrl, ...rest } = item;
          return { ...rest, imageUrl };
        });
        window.localStorage.setItem(localKey, JSON.stringify(compactForStorage));
      } catch {
        void 0;
      }
    }

    return {
      parts: combined,
      source: fromCache ? 'cache-api' : 'github-cdn',
      totalRawCount: Array.isArray(rawArray) ? rawArray.length : combined.length,
    };
  } catch {
    memoryCategoryCache.set(category, seedParts);
    return { parts: seedParts, source: 'fallback-seed' };
  }
}

export async function preloadAllHardwareCategories({ forceRefresh = false, onProgress } = {}) {
  const categories = Object.keys(DATASET_ENDPOINTS);
  const catalogByCat = {};
  let totalRawRecords = 0;
  let loadedCount = 0;
  let resolvedSource = 'github-cdn';

  await Promise.all(
    categories.map(async (cat) => {
      const res = await fetchCategoryHardware(cat, { forceRefresh });
      catalogByCat[cat] = res.parts;
      totalRawRecords += res.totalRawCount || res.parts.length;
      loadedCount += 1;
      resolvedSource = res.source || resolvedSource;
      if (onProgress) {
        onProgress({
          loadedCount,
          totalCategories: categories.length,
          category: cat,
          source: res.source,
        });
      }
    })
  );

  return {
    catalogByCat,
    source: resolvedSource,
    totalNormalizedCount: Object.values(catalogByCat).reduce(
      (sum, arr) => sum + arr.length,
      0
    ),
    totalRawRecords,
  };
}

export async function clearHardwareDatasetCache() {
  memoryCategoryCache.clear();
  if (typeof window !== 'undefined') {
    if (window.localStorage) {
      Object.keys(DATASET_ENDPOINTS).forEach((cat) => {
        window.localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}${cat}`);
      });
    }
    if ('caches' in window) {
      try {
        await window.caches.delete(CACHE_STORAGE_NAME);
      } catch {
        void 0;
      }
    }
  }
}
