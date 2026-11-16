export const CORRUPTED_ASSET_BLACKLIST = new Set([
  '810WDL8XS1L',
  '71iESqOEpeL',
  '51gIbHFh7LL',
  '91ITeh+6zRL',
  '610RTWemhSL',
]);

export const STRICT_CATEGORY_WHITELIST = {
  gpu: new Set([
    'https://m.media-amazon.com/images/I/619ChWVOpoL._AC_SL1000_.jpg',
    'https://m.media-amazon.com/images/I/81tvHo10s2L._AC_SL1000_.jpg',
    'https://m.media-amazon.com/images/I/71awqTBwgtL._AC_SL1000_.jpg',
  ]),
  case: new Set([
    'https://m.media-amazon.com/images/I/71CcCJVLTtL._AC_SL1000_.jpg',
    'https://m.media-amazon.com/images/I/51MvaxlXd3L._AC_SL1000_.jpg',
    'https://m.media-amazon.com/images/I/61i70Cp4GHL._AC_SL1000_.jpg',
    'https://m.media-amazon.com/images/I/71snmM3aCwL._AC_SL1000_.jpg',
    'https://m.media-amazon.com/images/I/71Mwj6gKcdL._AC_SL1000_.jpg',
  ]),
  motherboard: new Set([
    'https://m.media-amazon.com/images/I/81MH+nx+shL._AC_SL1000_.jpg',
    'https://m.media-amazon.com/images/I/81p4nj7F2tL._AC_SL1000_.jpg',
    'https://m.media-amazon.com/images/I/81o1in2ebRL._AC_SL1000_.jpg',
    'https://m.media-amazon.com/images/I/612+3pyMUbL._AC_SL1000_.jpg',
    'https://m.media-amazon.com/images/I/81R7FOmeOoL._AC_SL1000_.jpg',
    'https://m.media-amazon.com/images/I/81QyMksmunL._AC_SL1000_.jpg',
    'https://m.media-amazon.com/images/I/71VAf1UbEML._AC_SL1000_.jpg',
  ]),
  cpu: new Set([
    'https://m.media-amazon.com/images/I/71jxHGiiiNL._AC_SL1000_.jpg',
    'https://m.media-amazon.com/images/I/61C1DOLRK4L._AC_SL1000_.jpg',
  ]),
  cooler: new Set([
    'https://m.media-amazon.com/images/I/51b1eskcQBL._AC_SL1000_.jpg',
  ]),
  ram: new Set([
    'https://m.media-amazon.com/images/I/61XlVUhmP+L._AC_SL1000_.jpg',
    'https://m.media-amazon.com/images/I/61OdVLSeCKL._AC_SL1000_.jpg',
    'https://m.media-amazon.com/images/I/71xOTU97xEL._AC_SL1000_.jpg',
  ]),
  storage: new Set([
    'https://m.media-amazon.com/images/I/71OWtcxKgvL._AC_SL1000_.jpg',
  ]),
  psu: new Set([
    'https://m.media-amazon.com/images/I/715RNiMcRfL._AC_SL1000_.jpg',
  ]),
};

export const EXACT_PART_ASSET_BY_ID = {
  case_hyte_y70_white:
    'https://m.media-amazon.com/images/I/71CcCJVLTtL._AC_SL1000_.jpg',
  case_hyte_y70_black:
    'https://m.media-amazon.com/images/I/51MvaxlXd3L._AC_SL1000_.jpg',
  case_lianli_o11_vision:
    'https://m.media-amazon.com/images/I/61i70Cp4GHL._AC_SL1000_.jpg',
  case_corsair_4000d_airflow:
    'https://m.media-amazon.com/images/I/71snmM3aCwL._AC_SL1000_.jpg',
  mobo_asus_rog_strix_x870a:
    'https://m.media-amazon.com/images/I/81MH+nx+shL._AC_SL1000_.jpg',
  mobo_asus_b650m_plus:
    'https://m.media-amazon.com/images/I/81p4nj7F2tL._AC_SL1000_.jpg',
  mobo_asus_rog_crosshair_x870e:
    'https://m.media-amazon.com/images/I/81o1in2ebRL._AC_SL1000_.jpg',
  mobo_asus_rog_maximus_z790:
    'https://m.media-amazon.com/images/I/612+3pyMUbL._AC_SL1000_.jpg',
  cpu_ryzen_7_7800x3d:
    'https://m.media-amazon.com/images/I/71jxHGiiiNL._AC_SL1000_.jpg',
  cpu_intel_i9_14900k:
    'https://m.media-amazon.com/images/I/61C1DOLRK4L._AC_SL1000_.jpg',
  gpu_rtx_4070_rog_strix:
    'https://m.media-amazon.com/images/I/619ChWVOpoL._AC_SL1000_.jpg',
  gpu_rx_7900_xtx_sapphire:
    'https://m.media-amazon.com/images/I/81tvHo10s2L._AC_SL1000_.jpg',
  ram_gskill_trident_z5_32gb:
    'https://m.media-amazon.com/images/I/61XlVUhmP+L._AC_SL1000_.jpg',
  ram_corsair_dominator_64gb:
    'https://m.media-amazon.com/images/I/61OdVLSeCKL._AC_SL1000_.jpg',
  cooler_nzxt_kraken_360:
    'https://m.media-amazon.com/images/I/51b1eskcQBL._AC_SL1000_.jpg',
  storage_samsung_990_pro_2tb:
    'https://m.media-amazon.com/images/I/71OWtcxKgvL._AC_SL1000_.jpg',
  psu_corsair_rm1000x_shift:
    'https://m.media-amazon.com/images/I/715RNiMcRfL._AC_SL1000_.jpg',
};

export const EXACT_MODEL_MATCHERS_BY_CATEGORY = {
  case: [
    {
      test: (name) => name.includes('HYTE Y70') && (name.includes('WHITE') || name.includes('SNOW')),
      url: 'https://m.media-amazon.com/images/I/71CcCJVLTtL._AC_SL1000_.jpg',
    },
    {
      test: (name) => name.includes('HYTE Y70') && name.includes('BLACK'),
      url: 'https://m.media-amazon.com/images/I/51MvaxlXd3L._AC_SL1000_.jpg',
    },
    {
      test: (name) => name.includes('4000D AIRFLOW'),
      url: 'https://m.media-amazon.com/images/I/71snmM3aCwL._AC_SL1000_.jpg',
    },
    {
      test: (name) => name.includes('H9 FLOW'),
      url: 'https://m.media-amazon.com/images/I/71Mwj6gKcdL._AC_SL1000_.jpg',
    },
    {
      test: (name) => name.includes('O11 VISION'),
      url: 'https://m.media-amazon.com/images/I/61i70Cp4GHL._AC_SL1000_.jpg',
    },
  ],
  motherboard: [
    {
      test: (name) => name.includes('STRIX X870-A') || name.includes('STRIX B650-A') || name.includes('STRIX B850-A'),
      url: 'https://m.media-amazon.com/images/I/81MH+nx+shL._AC_SL1000_.jpg',
    },
    {
      test: (name) => name.includes('TUF GAMING B650-PLUS') || name.includes('TUF GAMING B850-PLUS'),
      url: 'https://m.media-amazon.com/images/I/81p4nj7F2tL._AC_SL1000_.jpg',
    },
    {
      test: (name) => name.includes('CROSSHAIR X870E') || name.includes('CROSSHAIR X670E'),
      url: 'https://m.media-amazon.com/images/I/81o1in2ebRL._AC_SL1000_.jpg',
    },
    {
      test: (name) => name.includes('MAXIMUS Z790') || name.includes('B650M-AYW'),
      url: 'https://m.media-amazon.com/images/I/612+3pyMUbL._AC_SL1000_.jpg',
    },
    {
      test: (name) => name.includes('B650M AORUS ELITE'),
      url: 'https://m.media-amazon.com/images/I/81R7FOmeOoL._AC_SL1000_.jpg',
    },
    {
      test: (name) => name.includes('B550M AORUS ELITE') || name.includes('B650 AORUS ELITE'),
      url: 'https://m.media-amazon.com/images/I/81QyMksmunL._AC_SL1000_.jpg',
    },
    {
      test: (name) => name.includes('STEEL LEGEND'),
      url: 'https://m.media-amazon.com/images/I/71VAf1UbEML._AC_SL1000_.jpg',
    },
  ],
  cpu: [
    {
      test: (name) => name.includes('7800X3D'),
      url: 'https://m.media-amazon.com/images/I/71jxHGiiiNL._AC_SL1000_.jpg',
    },
    {
      test: (name) => name.includes('14900K') || name.includes('14700K'),
      url: 'https://m.media-amazon.com/images/I/61C1DOLRK4L._AC_SL1000_.jpg',
    },
  ],
  gpu: [
    {
      test: (name) => name.includes('AERO') && (name.includes('4070') || name.includes('4080') || name.includes('5070')),
      url: 'https://m.media-amazon.com/images/I/71awqTBwgtL._AC_SL1000_.jpg',
    },
    {
      test: (name) => name.includes('NITRO+') && name.includes('7900 XTX'),
      url: 'https://m.media-amazon.com/images/I/81tvHo10s2L._AC_SL1000_.jpg',
    },
    {
      test: (name) => name.includes('ROG STRIX') && name.includes('4070'),
      url: 'https://m.media-amazon.com/images/I/619ChWVOpoL._AC_SL1000_.jpg',
    },
  ],
  ram: [
    {
      test: (name) => name.includes('TRIDENT Z5'),
      url: 'https://m.media-amazon.com/images/I/61XlVUhmP+L._AC_SL1000_.jpg',
    },
    {
      test: (name) => name.includes('DOMINATOR'),
      url: 'https://m.media-amazon.com/images/I/61OdVLSeCKL._AC_SL1000_.jpg',
    },
    {
      test: (name) => name.includes('VENGEANCE RGB') && name.includes('DDR5'),
      url: 'https://m.media-amazon.com/images/I/71xOTU97xEL._AC_SL1000_.jpg',
    },
  ],
  cooler: [
    {
      test: (name) => name.includes('KRAKEN') && name.includes('360'),
      url: 'https://m.media-amazon.com/images/I/51b1eskcQBL._AC_SL1000_.jpg',
    },
  ],
  storage: [
    {
      test: (name) => name.includes('990 PRO'),
      url: 'https://m.media-amazon.com/images/I/71OWtcxKgvL._AC_SL1000_.jpg',
    },
  ],
  psu: [
    {
      test: (name) => name.includes('RM1000E'),
      url: 'https://m.media-amazon.com/images/I/715RNiMcRfL._AC_SL1000_.jpg',
    },
  ],
};

export function isAssetValidForCategory(category, url) {
  if (!url || typeof url !== 'string') return false;
  for (const badId of CORRUPTED_ASSET_BLACKLIST) {
    if (url.includes(badId)) return false;
  }
  const whitelist = STRICT_CATEGORY_WHITELIST[category];
  if (!whitelist) return false;
  return whitelist.has(url);
}

export function validateAndResolveAssetUrl(part) {
  if (!part) return null;
  const category = part.category || 'gpu';

  if (part.id && EXACT_PART_ASSET_BY_ID[part.id]) {
    return EXACT_PART_ASSET_BY_ID[part.id];
  }

  const directCandidate = part.thumbnail || part.imageUrl || part.realPhotoUrl;
  if (isAssetValidForCategory(category, directCandidate)) {
    const upperName = String(part.name || '').toUpperCase();
    const matchers = EXACT_MODEL_MATCHERS_BY_CATEGORY[category] || [];
    for (const m of matchers) {
      if (m.test(upperName)) {
        return m.url;
      }
    }
  }

  const upperName = String(part.name || '').toUpperCase();
  const matchers = EXACT_MODEL_MATCHERS_BY_CATEGORY[category] || [];
  for (const m of matchers) {
    if (m.test(upperName)) {
      return m.url;
    }
  }

  return null;
}

export const CHASSIS_INTERNAL_BOUNDS = {
  min: [-1.82, -1.94, -1.3],
  max: [1.78, 1.94, 1.28],
  chamferLimit: 2.42,
};

export const REAR_CHAMBER_PSU_BOUNDS = {
  min: [-1.78, -1.86, -1.28],
  max: [-0.48, 1.4, -0.44],
};

export function clampToContainer(
  position = [0, 0, 0],
  partSize = [0.5, 0.5, 0.5],
  bounds = CHASSIS_INTERNAL_BOUNDS
) {
  const halfW = (partSize[0] || 0) * 0.5;
  const halfH = (partSize[1] || 0) * 0.5;
  const halfD = (partSize[2] || 0) * 0.5;

  const minX = bounds.min[0] + halfW;
  const maxX = Math.max(minX, bounds.max[0] - halfW);
  const minY = bounds.min[1] + halfH;
  const maxY = Math.max(minY, bounds.max[1] - halfH);
  const minZ = bounds.min[2] + halfD;
  const maxZ = Math.max(minZ, bounds.max[2] - halfD);

  let x = Math.min(maxX, Math.max(minX, Number(position[0]) || 0));
  const y = Math.min(maxY, Math.max(minY, Number(position[1]) || 0));
  let z = Math.min(maxZ, Math.max(minZ, Number(position[2]) || 0));

  if (typeof bounds.chamferLimit === 'number') {
    const cornerSum = x + halfW + (z + halfD);
    if (cornerSum > bounds.chamferLimit) {
      const excess = cornerSum - bounds.chamferLimit;
      x = Math.max(minX, x - excess * 0.5);
      z = Math.max(minZ, z - excess * 0.5);
    }
  }

  return [Number(x.toFixed(4)), Number(y.toFixed(4)), Number(z.toFixed(4))];
}

export function clampPsuToRearChamber(
  position = [-1.18, -0.55, -0.86],
  psuSize = [1.14, 1.3, 0.7]
) {
  return clampToContainer(position, psuSize, REAR_CHAMBER_PSU_BOUNDS);
}
