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

export const OFFICIAL_CATEGORY_FALLBACKS = {
  gpu: 'https://m.media-amazon.com/images/I/619ChWVOpoL._AC_SL1000_.jpg',
  case: 'https://m.media-amazon.com/images/I/51MvaxlXd3L._AC_SL1000_.jpg',
  motherboard: 'https://m.media-amazon.com/images/I/81p4nj7F2tL._AC_SL1000_.jpg',
  cpu: 'https://m.media-amazon.com/images/I/71jxHGiiiNL._AC_SL1000_.jpg',
  cooler: 'https://m.media-amazon.com/images/I/51b1eskcQBL._AC_SL1000_.jpg',
  ram: 'https://m.media-amazon.com/images/I/61XlVUhmP+L._AC_SL1000_.jpg',
  storage: 'https://m.media-amazon.com/images/I/71OWtcxKgvL._AC_SL1000_.jpg',
  psu: 'https://m.media-amazon.com/images/I/715RNiMcRfL._AC_SL1000_.jpg',
};

export const STRICT_KEYWORD_RULES_BY_CATEGORY = {
  gpu: [
    { match: 'AERO', url: 'https://m.media-amazon.com/images/I/71awqTBwgtL._AC_SL1000_.jpg' },
    { match: 'WHITE', url: 'https://m.media-amazon.com/images/I/71awqTBwgtL._AC_SL1000_.jpg' },
    { match: '7900', url: 'https://m.media-amazon.com/images/I/81tvHo10s2L._AC_SL1000_.jpg' },
    { match: '7800', url: 'https://m.media-amazon.com/images/I/81tvHo10s2L._AC_SL1000_.jpg' },
    { match: 'RADEON', url: 'https://m.media-amazon.com/images/I/81tvHo10s2L._AC_SL1000_.jpg' },
    { match: 'SAPPHIRE', url: 'https://m.media-amazon.com/images/I/81tvHo10s2L._AC_SL1000_.jpg' },
    { match: 'NITRO', url: 'https://m.media-amazon.com/images/I/81tvHo10s2L._AC_SL1000_.jpg' },
    { match: '4090', url: 'https://m.media-amazon.com/images/I/619ChWVOpoL._AC_SL1000_.jpg' },
    { match: '4080', url: 'https://m.media-amazon.com/images/I/619ChWVOpoL._AC_SL1000_.jpg' },
    { match: '4070', url: 'https://m.media-amazon.com/images/I/619ChWVOpoL._AC_SL1000_.jpg' },
    { match: 'RTX', url: 'https://m.media-amazon.com/images/I/619ChWVOpoL._AC_SL1000_.jpg' },
    { match: 'GEFORCE', url: 'https://m.media-amazon.com/images/I/619ChWVOpoL._AC_SL1000_.jpg' },
  ],
  case: [
    { match: 'WHITE', url: 'https://m.media-amazon.com/images/I/71CcCJVLTtL._AC_SL1000_.jpg' },
    { match: 'SNOW', url: 'https://m.media-amazon.com/images/I/71CcCJVLTtL._AC_SL1000_.jpg' },
    { match: 'HYTE', url: 'https://m.media-amazon.com/images/I/51MvaxlXd3L._AC_SL1000_.jpg' },
    { match: 'O11', url: 'https://m.media-amazon.com/images/I/51MvaxlXd3L._AC_SL1000_.jpg' },
    { match: 'LIAN LI', url: 'https://m.media-amazon.com/images/I/51MvaxlXd3L._AC_SL1000_.jpg' },
    { match: '4000D', url: 'https://m.media-amazon.com/images/I/71snmM3aCwL._AC_SL1000_.jpg' },
    { match: 'CORSAIR', url: 'https://m.media-amazon.com/images/I/71snmM3aCwL._AC_SL1000_.jpg' },
    { match: 'NZXT', url: 'https://m.media-amazon.com/images/I/71Mwj6gKcdL._AC_SL1000_.jpg' },
    { match: 'H9', url: 'https://m.media-amazon.com/images/I/71Mwj6gKcdL._AC_SL1000_.jpg' },
    { match: 'H6', url: 'https://m.media-amazon.com/images/I/71Mwj6gKcdL._AC_SL1000_.jpg' },
  ],
  motherboard: [
    { match: 'X870-A', url: 'https://m.media-amazon.com/images/I/81MH+nx+shL._AC_SL1000_.jpg' },
    { match: 'B850-A', url: 'https://m.media-amazon.com/images/I/81MH+nx+shL._AC_SL1000_.jpg' },
    { match: 'B650-A', url: 'https://m.media-amazon.com/images/I/81MH+nx+shL._AC_SL1000_.jpg' },
    { match: 'WHITE', url: 'https://m.media-amazon.com/images/I/81MH+nx+shL._AC_SL1000_.jpg' },
    { match: 'ICE', url: 'https://m.media-amazon.com/images/I/81MH+nx+shL._AC_SL1000_.jpg' },
    { match: 'CROSSHAIR', url: 'https://m.media-amazon.com/images/I/81o1in2ebRL._AC_SL1000_.jpg' },
    { match: 'X870E', url: 'https://m.media-amazon.com/images/I/81o1in2ebRL._AC_SL1000_.jpg' },
    { match: 'X670E', url: 'https://m.media-amazon.com/images/I/81o1in2ebRL._AC_SL1000_.jpg' },
    { match: 'MAXIMUS', url: 'https://m.media-amazon.com/images/I/612+3pyMUbL._AC_SL1000_.jpg' },
    { match: 'Z790', url: 'https://m.media-amazon.com/images/I/612+3pyMUbL._AC_SL1000_.jpg' },
    { match: 'TUF', url: 'https://m.media-amazon.com/images/I/81p4nj7F2tL._AC_SL1000_.jpg' },
    { match: 'MSI', url: 'https://m.media-amazon.com/images/I/81R7FOmeOoL._AC_SL1000_.jpg' },
    { match: 'GIGABYTE', url: 'https://m.media-amazon.com/images/I/81QyMksmunL._AC_SL1000_.jpg' },
    { match: 'AORUS', url: 'https://m.media-amazon.com/images/I/81QyMksmunL._AC_SL1000_.jpg' },
    { match: 'ASROCK', url: 'https://m.media-amazon.com/images/I/71VAf1UbEML._AC_SL1000_.jpg' },
    { match: 'STEEL LEGEND', url: 'https://m.media-amazon.com/images/I/71VAf1UbEML._AC_SL1000_.jpg' },
    { match: 'STRIX', url: 'https://m.media-amazon.com/images/I/81MH+nx+shL._AC_SL1000_.jpg' },
  ],
  cpu: [
    { match: 'INTEL', url: 'https://m.media-amazon.com/images/I/61C1DOLRK4L._AC_SL1000_.jpg' },
    { match: 'CORE I', url: 'https://m.media-amazon.com/images/I/61C1DOLRK4L._AC_SL1000_.jpg' },
    { match: 'CORE ULTRA', url: 'https://m.media-amazon.com/images/I/61C1DOLRK4L._AC_SL1000_.jpg' },
    { match: 'RYZEN', url: 'https://m.media-amazon.com/images/I/71jxHGiiiNL._AC_SL1000_.jpg' },
    { match: 'AMD', url: 'https://m.media-amazon.com/images/I/71jxHGiiiNL._AC_SL1000_.jpg' },
  ],
  cooler: [
    { match: 'KRAKEN', url: 'https://m.media-amazon.com/images/I/51b1eskcQBL._AC_SL1000_.jpg' },
    { match: 'NZXT', url: 'https://m.media-amazon.com/images/I/51b1eskcQBL._AC_SL1000_.jpg' },
  ],
  ram: [
    { match: 'DOMINATOR', url: 'https://m.media-amazon.com/images/I/61OdVLSeCKL._AC_SL1000_.jpg' },
    { match: 'VENGEANCE', url: 'https://m.media-amazon.com/images/I/71xOTU97xEL._AC_SL1000_.jpg' },
    { match: 'CORSAIR', url: 'https://m.media-amazon.com/images/I/71xOTU97xEL._AC_SL1000_.jpg' },
    { match: 'TRIDENT', url: 'https://m.media-amazon.com/images/I/61XlVUhmP+L._AC_SL1000_.jpg' },
    { match: 'G.SKILL', url: 'https://m.media-amazon.com/images/I/61XlVUhmP+L._AC_SL1000_.jpg' },
  ],
  storage: [
    { match: 'SAMSUNG', url: 'https://m.media-amazon.com/images/I/71OWtcxKgvL._AC_SL1000_.jpg' },
    { match: '990', url: 'https://m.media-amazon.com/images/I/71OWtcxKgvL._AC_SL1000_.jpg' },
  ],
  psu: [
    { match: 'CORSAIR', url: 'https://m.media-amazon.com/images/I/715RNiMcRfL._AC_SL1000_.jpg' },
    { match: 'ASUS', url: 'https://m.media-amazon.com/images/I/715RNiMcRfL._AC_SL1000_.jpg' },
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
  const category = part?.category || 'gpu';
  const fallbackUrl =
    OFFICIAL_CATEGORY_FALLBACKS[category] || OFFICIAL_CATEGORY_FALLBACKS.gpu;

  if (!part) return fallbackUrl;

  const candidate = part.realPhotoUrl || part.imageUrl;
  if (isAssetValidForCategory(category, candidate)) {
    return candidate;
  }

  const upperName = String(part.name || '').toUpperCase();
  const upperBrand = String(part.brand || '').toUpperCase();
  const rules = STRICT_KEYWORD_RULES_BY_CATEGORY[category] || [];

  for (const rule of rules) {
    if (upperName.includes(rule.match) || upperBrand.includes(rule.match)) {
      if (isAssetValidForCategory(category, rule.url)) {
        return rule.url;
      }
    }
  }

  return fallbackUrl;
}

export const CHASSIS_INTERNAL_BOUNDS = {
  min: [-1.82, -1.94, -1.3],
  max: [1.78, 1.94, 1.28],
  chamferLimit: 2.42,
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
