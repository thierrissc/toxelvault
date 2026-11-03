import * as THREE from 'three';

export const SKIN_THEMES = [
  {
    id: 'copper_oxidized',
    name: 'Copper Oxidized',
    subtitle: 'Patina Industrial Relic',
    rarity: 'Mítico',
    rarityColor: 'from-amber-500/20 to-emerald-500/20 text-emerald-300 border-emerald-400/40',
    badgeDot: 'bg-emerald-400',
    floatValue: 0.0428,
    wearLabel: 'Minimal Wear',
    priceCurrent: '1,420 VXL',
    priceChange: '+18.4%',
    priceHistory: [890, 940, 910, 1080, 1190, 1280, 1420],
    defaultMetalness: 0.88,
    defaultRoughness: 0.24,
    defaultEmissiveIntensity: 0.25,
    accentHex: '#2dd4bf',
    secondaryHex: '#d97706',
    description:
      'Liga de cobre ancestral forjada em fornalhas a vapor, apresentando veios de verdete oxidado e reflexo especular intenso.',
    specs: {
      shader: 'MeshStandardMaterial (PBR)',
      resolution: '512x512 px (Nearest Pixelated)',
      uvMap: 'Voxel Grid 16x24',
      serial: '#VV-0084-COPR',
    },
  },
  {
    id: 'master_builder',
    name: 'Master Builder',
    subtitle: 'Royal Architect Edition',
    rarity: 'Lendário',
    rarityColor: 'from-yellow-500/25 to-blue-500/25 text-amber-300 border-amber-400/45',
    badgeDot: 'bg-amber-400',
    floatValue: 0.0084,
    wearLabel: 'Factory New',
    priceCurrent: '2,890 VXL',
    priceChange: '+34.2%',
    priceHistory: [1600, 1750, 1920, 2100, 2450, 2610, 2890],
    defaultMetalness: 0.45,
    defaultRoughness: 0.55,
    defaultEmissiveIntensity: 0.85,
    accentHex: '#f59e0b',
    secondaryHex: '#1d4ed8',
    description:
      'Padrão geométrico sagrado em ouro imperial e azul real profundo, com runas arquitetônicas emissivas e acabamento acetinado.',
    specs: {
      shader: 'MeshStandardMaterial + Emissive Map',
      resolution: '512x512 px (Nearest Pixelated)',
      uvMap: 'Voxel Grid 16x24',
      serial: '#VV-0012-MSTR',
    },
  },
  {
    id: 'home_comfort',
    name: 'Home Comfort',
    subtitle: 'Hearthwood Guild Crest',
    rarity: 'Exclusivo',
    rarityColor: 'from-orange-500/20 to-amber-700/20 text-orange-200 border-orange-400/40',
    badgeDot: 'bg-orange-400',
    floatValue: 0.0142,
    wearLabel: 'Factory New',
    priceCurrent: '960 VXL',
    priceChange: '+9.7%',
    priceHistory: [720, 760, 790, 810, 860, 910, 960],
    defaultMetalness: 0.15,
    defaultRoughness: 0.78,
    defaultEmissiveIntensity: 0.35,
    accentHex: '#fb923c',
    secondaryHex: '#fef3c7',
    description:
      'Tons quentes de carvalho esculpido e bordas creme tecidas à mão, ostentando o emblema central da Guilda do Refúgio.',
    specs: {
      shader: 'MeshStandardMaterial (Matte Wood/Fabric)',
      resolution: '512x512 px (Nearest Pixelated)',
      uvMap: 'Voxel Grid 16x24',
      serial: '#VV-0319-HOME',
    },
  },
  {
    id: 'neon_cyber',
    name: 'Neon Cyber',
    subtitle: 'Night City Overclock v4',
    rarity: 'Mítico',
    rarityColor: 'from-cyan-500/25 to-fuchsia-500/25 text-cyan-300 border-cyan-400/50',
    badgeDot: 'bg-cyan-400',
    floatValue: 0.0019,
    wearLabel: 'Factory New',
    priceCurrent: '4,150 VXL',
    priceChange: '+62.8%',
    priceHistory: [1950, 2240, 2690, 3100, 3480, 3890, 4150],
    defaultMetalness: 0.3,
    defaultRoughness: 0.65,
    defaultEmissiveIntensity: 1.65,
    accentHex: '#06b6d4',
    secondaryHex: '#ec4899',
    description:
      'Malha balística preta fosca integrada com trilhas ópticas em ciano e magenta de alta emissão fotônica.',
    specs: {
      shader: 'MeshStandardMaterial (HDR Emissive)',
      resolution: '512x512 px (Nearest Pixelated)',
      uvMap: 'Voxel Grid 16x24',
      serial: '#VV-0001-CYBR',
    },
  },
];

/**
 * Helper to draw a crisp pixel block on a 16x24 grid scaled to 512x768 (or 512x512).
 */
function drawPixelGrid(ctx, gridW, gridH, canvasW, canvasH, drawFn) {
  const cellW = canvasW / gridW;
  const cellH = canvasH / gridH;

  const setPixel = (gx, gy, color) => {
    if (gx < 0 || gx >= gridW || gy < 0 || gy >= gridH) return;
    ctx.fillStyle = color;
    ctx.fillRect(
      Math.floor(gx * cellW),
      Math.floor(gy * cellH),
      Math.ceil(cellW),
      Math.ceil(cellH)
    );
  };

  const fillRectGrid = (gx, gy, w, h, color) => {
    for (let y = gy; y < gy + h; y++) {
      for (let x = gx; x < gx + w; x++) {
        setPixel(x, y, color);
      }
    }
  };

  drawFn({ setPixel, fillRectGrid, gridW, gridH });
}

/**
 * Deterministic pseudo-random based on coordinates
 */
function hash2D(x, y, seed = 1) {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
  return n - Math.floor(n);
}

/**
 * Draws a specific theme onto diffuse and emissive 2D contexts.
 */
function renderThemeToCanvases(themeId, diffCtx, emisCtx, width = 512, height = 512) {
  const gridW = 16;
  const gridH = 24;

  // Clear emissive to pitch black by default
  emisCtx.fillStyle = '#000000';
  emisCtx.fillRect(0, 0, width, height);

  if (themeId === 'copper_oxidized') {
    drawPixelGrid(diffCtx, gridW, gridH, width, height, ({ setPixel, fillRectGrid }) => {
      // Base metallic copper gradient + hammered pixel noise
      for (let y = 0; y < gridH; y++) {
        for (let x = 0; x < gridW; x++) {
          const r = hash2D(x, y, 11);
          const copperPalette = ['#7c2d12', '#9a3412', '#b45309', '#c2410c', '#d97706'];
          const baseColor = copperPalette[Math.floor(r * copperPalette.length)];
          setPixel(x, y, baseColor);

          // Oxidized verdigris patches (edges and veins)
          const edgeDist = Math.min(x, gridW - 1 - x, y, gridH - 1 - y);
          if ((edgeDist <= 1 && r > 0.35) || (r > 0.76 && (x + y) % 2 === 0)) {
            const patinaPalette = ['#115e59', '#0d9488', '#14b8a6', '#2dd4bf', '#5eead4'];
            setPixel(x, y, patinaPalette[Math.floor((r * 10) % patinaPalette.length)]);
          }
        }
      }

      // Riveted industrial border
      for (let x = 0; x < gridW; x++) {
        setPixel(x, 0, '#431407');
        setPixel(x, gridH - 1, '#134e4a');
      }
      for (let y = 0; y < gridH; y++) {
        setPixel(0, y, y % 3 === 0 ? '#2dd4bf' : '#431407');
        setPixel(gridW - 1, y, y % 3 === 0 ? '#2dd4bf' : '#431407');
      }

      // Central mechanical gear / core emblem
      fillRectGrid(5, 7, 6, 8, '#451a03');
      fillRectGrid(6, 8, 4, 6, '#d97706');
      fillRectGrid(7, 9, 2, 4, '#2dd4bf');

      // Specular metallic highlights
      setPixel(6, 8, '#fde68a');
      setPixel(9, 8, '#fde68a');
      setPixel(4, 4, '#5eead4');
      setPixel(11, 4, '#5eead4');
      setPixel(4, 18, '#2dd4bf');
      setPixel(11, 18, '#2dd4bf');
    });

    // Subtle glowing oxidized core on emissive canvas
    drawPixelGrid(emisCtx, gridW, gridH, width, height, ({ setPixel, fillRectGrid }) => {
      fillRectGrid(7, 9, 2, 4, '#14b8a6');
      setPixel(4, 4, '#0d9488');
      setPixel(11, 4, '#0d9488');
      setPixel(4, 18, '#0d9488');
      setPixel(11, 18, '#0d9488');
    });
  } else if (themeId === 'master_builder') {
    drawPixelGrid(diffCtx, gridW, gridH, width, height, ({ setPixel, fillRectGrid }) => {
      // Deep royal blue background with subtle geometric weave
      for (let y = 0; y < gridH; y++) {
        for (let x = 0; x < gridW; x++) {
          const checker = (x + y) % 2 === 0;
          setPixel(x, y, checker ? '#172554' : '#1e3a8a');
        }
      }

      // Outer ornate golden border
      for (let x = 0; x < gridW; x++) {
        setPixel(x, 0, '#f59e0b');
        setPixel(x, 1, x % 2 === 0 ? '#fbbf24' : '#1e40af');
        setPixel(x, gridH - 1, '#d97706');
        setPixel(x, gridH - 2, x % 2 === 0 ? '#fbbf24' : '#1e40af');
      }
      for (let y = 0; y < gridH; y++) {
        setPixel(0, y, '#f59e0b');
        setPixel(gridW - 1, y, '#f59e0b');
        if (y % 2 === 0) {
          setPixel(1, y, '#fbbf24');
          setPixel(gridW - 2, y, '#fbbf24');
        }
      }

      // Sacred geometric compass / diamond emblem in center
      fillRectGrid(6, 6, 4, 10, '#1d4ed8');
      // Diamond golden frame
      const diamondCoords = [
        [7, 4], [8, 4],
        [6, 5], [9, 5],
        [5, 6], [10, 6],
        [4, 7], [11, 7],
        [4, 8], [11, 8],
        [5, 9], [10, 9],
        [6, 10], [9, 10],
        [7, 11], [8, 11],
      ];
      diamondCoords.forEach(([dx, dy]) => setPixel(dx, dy, '#fbbf24'));

      // Inner glowing crystal
      fillRectGrid(7, 6, 2, 4, '#fef08a');
      setPixel(6, 7, '#38bdf8');
      setPixel(9, 7, '#38bdf8');
      setPixel(6, 8, '#38bdf8');
      setPixel(9, 8, '#38bdf8');

      // Lower chevron stripes
      for (let i = 0; i < 4; i++) {
        setPixel(4 + i, 15 + i, '#fbbf24');
        setPixel(11 - i, 15 + i, '#fbbf24');
        setPixel(4 + i, 18 + i, '#f59e0b');
        setPixel(11 - i, 18 + i, '#f59e0b');
      }
    });

    // Emissive golden runes & crystal core
    drawPixelGrid(emisCtx, gridW, gridH, width, height, ({ setPixel, fillRectGrid }) => {
      fillRectGrid(7, 6, 2, 4, '#f59e0b');
      setPixel(6, 7, '#0ea5e9');
      setPixel(9, 7, '#0ea5e9');
      setPixel(6, 8, '#0ea5e9');
      setPixel(9, 8, '#0ea5e9');
      for (let i = 0; i < 4; i++) {
        setPixel(4 + i, 15 + i, '#d97706');
        setPixel(11 - i, 15 + i, '#d97706');
      }
    });
  } else if (themeId === 'home_comfort') {
    drawPixelGrid(diffCtx, gridW, gridH, width, height, ({ setPixel, fillRectGrid }) => {
      // Warm timber planks background
      const woodShades = ['#451a03', '#5c2408', '#78350f', '#92400e'];
      for (let y = 0; y < gridH; y++) {
        for (let x = 0; x < gridW; x++) {
          const grain = Math.floor((hash2D(x, Math.floor(y / 3), 7) * 10)) % woodShades.length;
          setPixel(x, y, woodShades[grain]);
        }
      }

      // Cream stitched double border
      for (let x = 0; x < gridW; x++) {
        setPixel(x, 0, '#fef3c7');
        setPixel(x, 1, '#fde68a');
        setPixel(x, gridH - 1, '#fef3c7');
        setPixel(x, gridH - 2, '#fde68a');
      }
      for (let y = 0; y < gridH; y++) {
        setPixel(0, y, '#fef3c7');
        setPixel(1, y, y % 2 === 0 ? '#fde68a' : '#78350f');
        setPixel(gridW - 1, y, '#fef3c7');
        setPixel(gridW - 2, y, y % 2 === 0 ? '#fde68a' : '#78350f');
      }

      // Central Hearth Emblem (shield + warm flame/house icon)
      fillRectGrid(4, 5, 8, 12, '#fef3c7');
      fillRectGrid(5, 6, 6, 10, '#7c2d12');

      // Roof / Chevron
      setPixel(7, 7, '#fbbf24');
      setPixel(8, 7, '#fbbf24');
      setPixel(6, 8, '#fbbf24');
      setPixel(9, 8, '#fbbf24');
      setPixel(5, 9, '#fbbf24');
      setPixel(10, 9, '#fbbf24');

      // Cozy hearth fire center
      fillRectGrid(6, 10, 4, 4, '#ea580c');
      fillRectGrid(7, 11, 2, 3, '#fde047');
    });

    // Warm subtle hearth glow in the center
    drawPixelGrid(emisCtx, gridW, gridH, width, height, ({ fillRectGrid }) => {
      fillRectGrid(6, 10, 4, 4, '#9a3412');
      fillRectGrid(7, 11, 2, 3, '#f59e0b');
    });
  } else if (themeId === 'neon_cyber') {
    drawPixelGrid(diffCtx, gridW, gridH, width, height, ({ setPixel, fillRectGrid }) => {
      // Matte carbon black chassis
      for (let y = 0; y < gridH; y++) {
        for (let x = 0; x < gridW; x++) {
          setPixel(x, y, (x + y) % 2 === 0 ? '#090a0f' : '#11131f');
        }
      }

      // Outer cyber circuit trace (cyan & magenta)
      for (let y = 1; y < gridH - 1; y++) {
        setPixel(1, y, y < 12 ? '#06b6d4' : '#ec4899');
        setPixel(gridW - 2, y, y < 12 ? '#06b6d4' : '#ec4899');
      }
      for (let x = 1; x < gridW - 1; x++) {
        setPixel(x, 1, '#06b6d4');
        setPixel(x, gridH - 2, '#ec4899');
      }

      // Central Cyberpunk Voxel Core
      fillRectGrid(5, 5, 6, 6, '#ec4899');
      fillRectGrid(6, 6, 4, 4, '#090a0f');
      fillRectGrid(7, 7, 2, 2, '#22d3ee');

      // Circuit bus lines descending
      for (let y = 11; y < 20; y++) {
        setPixel(5, y, '#06b6d4');
        setPixel(10, y, '#06b6d4');
        if (y % 2 === 0) {
          setPixel(7, y, '#f43f5e');
          setPixel(8, y, '#f43f5e');
        }
      }

      // Corner energy nodes
      setPixel(3, 3, '#22d3ee');
      setPixel(12, 3, '#22d3ee');
      setPixel(3, 20, '#ec4899');
      setPixel(12, 20, '#ec4899');
    });

    // High-output emissive mask for Neon Cyber
    drawPixelGrid(emisCtx, gridW, gridH, width, height, ({ setPixel, fillRectGrid }) => {
      for (let y = 1; y < gridH - 1; y++) {
        setPixel(1, y, y < 12 ? '#06b6d4' : '#ec4899');
        setPixel(gridW - 2, y, y < 12 ? '#06b6d4' : '#ec4899');
      }
      for (let x = 1; x < gridW - 1; x++) {
        setPixel(x, 1, '#06b6d4');
        setPixel(x, gridH - 2, '#ec4899');
      }
      fillRectGrid(5, 5, 6, 6, '#ec4899');
      fillRectGrid(6, 6, 4, 4, '#000000');
      fillRectGrid(7, 7, 2, 2, '#22d3ee');

      for (let y = 11; y < 20; y++) {
        setPixel(5, y, '#06b6d4');
        setPixel(10, y, '#06b6d4');
        if (y % 2 === 0) {
          setPixel(7, y, '#f43f5e');
          setPixel(8, y, '#f43f5e');
        }
      }

      setPixel(3, 3, '#22d3ee');
      setPixel(12, 3, '#22d3ee');
      setPixel(3, 20, '#ec4899');
      setPixel(12, 20, '#ec4899');
    });
  }
}

/**
 * Generates Three.js CanvasTextures (map + emissiveMap) and a DataURL preview for a preset theme.
 */
export function generateThemeTextures(themeId) {
  const width = 512;
  const height = 512;

  const diffCanvas = document.createElement('canvas');
  diffCanvas.width = width;
  diffCanvas.height = height;
  const diffCtx = diffCanvas.getContext('2d');
  diffCtx.imageSmoothingEnabled = false;

  const emisCanvas = document.createElement('canvas');
  emisCanvas.width = width;
  emisCanvas.height = height;
  const emisCtx = emisCanvas.getContext('2d');
  emisCtx.imageSmoothingEnabled = false;

  renderThemeToCanvases(themeId, diffCtx, emisCtx, width, height);

  const map = new THREE.CanvasTexture(diffCanvas);
  map.magFilter = THREE.NearestFilter;
  map.minFilter = THREE.NearestFilter;
  map.colorSpace = THREE.SRGBColorSpace;
  map.needsUpdate = true;

  const emissiveMap = new THREE.CanvasTexture(emisCanvas);
  emissiveMap.magFilter = THREE.NearestFilter;
  emissiveMap.minFilter = THREE.NearestFilter;
  emissiveMap.colorSpace = THREE.SRGBColorSpace;
  emissiveMap.needsUpdate = true;

  return {
    map,
    emissiveMap,
    previewUrl: diffCanvas.toDataURL('image/png'),
  };
}

/**
 * Generates a small 2D thumbnail DataURL for the catalog sidebar without creating WebGL textures.
 */
export function generateThemeThumbnail(themeId) {
  const width = 128;
  const height = 192;
  const diffCanvas = document.createElement('canvas');
  diffCanvas.width = width;
  diffCanvas.height = height;
  const diffCtx = diffCanvas.getContext('2d');
  diffCtx.imageSmoothingEnabled = false;

  const emisCanvas = document.createElement('canvas');
  emisCanvas.width = width;
  emisCanvas.height = height;
  const emisCtx = emisCanvas.getContext('2d');

  renderThemeToCanvases(themeId, diffCtx, emisCtx, width, height);
  return diffCanvas.toDataURL('image/png');
}

/**
 * Converts an uploaded user image (.png/.jpg) into a crisp Three.js CanvasTexture
 * and generates a subtle emissive map from bright pixels.
 */
export function createCustomImageTextures(imageElement) {
  const width = 512;
  const height = 512;

  const diffCanvas = document.createElement('canvas');
  diffCanvas.width = width;
  diffCanvas.height = height;
  const diffCtx = diffCanvas.getContext('2d');
  diffCtx.imageSmoothingEnabled = false;
  diffCtx.drawImage(imageElement, 0, 0, width, height);

  const emisCanvas = document.createElement('canvas');
  emisCanvas.width = width;
  emisCanvas.height = height;
  const emisCtx = emisCanvas.getContext('2d');
  emisCtx.fillStyle = '#000000';
  emisCtx.fillRect(0, 0, width, height);

  const map = new THREE.CanvasTexture(diffCanvas);
  map.magFilter = THREE.NearestFilter;
  map.minFilter = THREE.NearestFilter;
  map.colorSpace = THREE.SRGBColorSpace;
  map.needsUpdate = true;

  const emissiveMap = new THREE.CanvasTexture(emisCanvas);
  emissiveMap.magFilter = THREE.NearestFilter;
  emissiveMap.minFilter = THREE.NearestFilter;
  emissiveMap.needsUpdate = true;

  return {
    map,
    emissiveMap,
    previewUrl: diffCanvas.toDataURL('image/png'),
  };
}
