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
  case: {
    ...HARDWARE_CATALOG.case[0],
    imageUrl: HARDWARE_CATALOG.case[0].realPhotoUrl || getFallbackProductPhotoDataUri(HARDWARE_CATALOG.case[0]),
  },
  motherboard: {
    ...HARDWARE_CATALOG.motherboard[0],
    imageUrl: HARDWARE_CATALOG.motherboard[0].realPhotoUrl || getFallbackProductPhotoDataUri(HARDWARE_CATALOG.motherboard[0]),
  },
  cpu: {
    ...HARDWARE_CATALOG.cpu[0],
    imageUrl: HARDWARE_CATALOG.cpu[0].realPhotoUrl || getFallbackProductPhotoDataUri(HARDWARE_CATALOG.cpu[0]),
  },
  cooler: {
    ...HARDWARE_CATALOG.cooler[0],
    imageUrl: HARDWARE_CATALOG.cooler[0].realPhotoUrl || getFallbackProductPhotoDataUri(HARDWARE_CATALOG.cooler[0]),
  },
  gpu: {
    ...HARDWARE_CATALOG.gpu[0],
    imageUrl: HARDWARE_CATALOG.gpu[0].realPhotoUrl || getFallbackProductPhotoDataUri(HARDWARE_CATALOG.gpu[0]),
  },
  ram: {
    ...HARDWARE_CATALOG.ram[0],
    imageUrl: HARDWARE_CATALOG.ram[0].realPhotoUrl || getFallbackProductPhotoDataUri(HARDWARE_CATALOG.ram[0]),
  },
  storage: {
    ...HARDWARE_CATALOG.storage[0],
    imageUrl: HARDWARE_CATALOG.storage[0].realPhotoUrl || getFallbackProductPhotoDataUri(HARDWARE_CATALOG.storage[0]),
  },
  psu: {
    ...HARDWARE_CATALOG.psu[0],
    imageUrl: HARDWARE_CATALOG.psu[0].realPhotoUrl || getFallbackProductPhotoDataUri(HARDWARE_CATALOG.psu[0]),
  },
};

/**
 * Validates hardware compatibility across the active build
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
 * Generates High-Resolution E-Commerce White-Studio Packshot Photos (#ffffff background)
 * Every component is drawn complete, centered with generous margins so nothing is ever cropped,
 * and blends seamlessly with `background-color: #ffffff` and `mix-blend-mode: multiply`.
 */
const packshotPhotoCache = {};

export function getFallbackProductPhotoDataUri(part) {
  if (!part) return '';
  if (packshotPhotoCache[part.id]) return packshotPhotoCache[part.id];

  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 340;
  const ctx = canvas.getContext('2d');

  // Pure #FFFFFF E-Commerce Studio Backdrop
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 480, 340);

  // Soft studio contact shadow on white floor
  const shadowGrad = ctx.createRadialGradient(240, 292, 10, 240, 292, 145);
  shadowGrad.addColorStop(0, 'rgba(15, 23, 42, 0.16)');
  shadowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(240, 292, 145, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  const cat = part.category;

  if (cat === 'case') {
    const isCorsair = part.id.includes('4000d');
    const isLianLi = part.id.includes('o11');

    ctx.save();
    ctx.fillStyle = '#181b22';
    ctx.beginPath();
    ctx.moveTo(145, 52);
    ctx.lineTo(275, 34);
    ctx.lineTo(340, 62);
    ctx.lineTo(340, 266);
    ctx.lineTo(210, 288);
    ctx.lineTo(145, 258);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#272c38';
    ctx.fillRect(175, 76, 86, 110);
    ctx.fillStyle = '#334155';
    ctx.fillRect(168, 152, 112, 26);
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(172, 160, 100, 4);

    [94, 142, 190].forEach((fy) => {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(286, fy, 17, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(286, fy, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    const glassGrad = ctx.createLinearGradient(145, 45, 335, 275);
    glassGrad.addColorStop(0, 'rgba(255,255,255,0.26)');
    glassGrad.addColorStop(0.45, 'rgba(56,189,248,0.06)');
    glassGrad.addColorStop(1, 'rgba(255,255,255,0.18)');
    ctx.fillStyle = glassGrad;
    ctx.fillRect(152, 56, 176, 212);

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 5;
    ctx.strokeRect(150, 52, 182, 220);

    if (isCorsair) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(285, 55, 46, 214);
    } else if (!isLianLi) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(268, 52, 12, 220);
    }
    ctx.restore();
  } else if (cat === 'motherboard') {
    const isTuf = part.id.includes('b650m');
    const isZ790 = part.id.includes('z790');
    const accent = isTuf ? '#f59e0b' : isZ790 ? '#3b82f6' : '#ef4444';

    ctx.fillStyle = '#0e1015';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(130, 34, 220, 248, 6);
    ctx.fill();
    ctx.stroke();

    // Gold/Copper trace lines on PCB
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.35)';
    ctx.lineWidth = 1.5;
    for (let i = 145; i < 335; i += 12) {
      ctx.beginPath();
      ctx.moveTo(i, 44);
      ctx.lineTo(i, 270);
      ctx.stroke();
    }

    ctx.fillStyle = '#262b36';
    ctx.fillRect(138, 42, 48, 118);
    ctx.fillStyle = accent;
    ctx.fillRect(144, 54, 34, 8);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(isTuf ? 'TUF GAMING' : 'ROG HERO', 143, 84);

    ctx.fillStyle = '#262b36';
    ctx.fillRect(192, 42, 92, 34);
    for (let x = 198; x < 280; x += 8) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x, 44, 3, 30);
    }

    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(204, 88, 56, 56);
    ctx.fillStyle = '#475569';
    ctx.fillRect(214, 98, 36, 36);

    for (let s = 0; s < 4; s++) {
      const sx = 278 + s * 12;
      ctx.fillStyle = s % 2 === 1 ? accent : '#334155';
      ctx.fillRect(sx, 80, 6, 74);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(sx - 1, 76, 8, 4);
      ctx.fillRect(sx - 1, 154, 8, 4);
    }

    [176, 224].forEach((py) => {
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(150, py, 128, 9);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(154, py + 2, 120, 5);
    });

    ctx.fillStyle = '#2d3340';
    ctx.fillRect(154, 192, 118, 24);
    ctx.fillRect(256, 188, 78, 68);
    ctx.fillStyle = accent;
    ctx.fillRect(266, 236, 58, 6);

    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(234, 248, 11, 0, Math.PI * 2);
    ctx.fill();
  } else if (cat === 'cpu') {
    const isIntel = part.brand === 'Intel';
    const is9800 = part.id.includes('9800');

    ctx.fillStyle = isIntel ? '#1d4ed8' : '#1f242d';
    ctx.beginPath();
    ctx.roundRect(118, 38, 175, 215, 8);
    ctx.fill();

    ctx.strokeStyle = isIntel ? '#38bdf8' : '#f97316';
    ctx.lineWidth = 5;
    ctx.strokeRect(128, 48, 155, 195);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(isIntel ? 'INTEL CORE' : 'AMD RYZEN', 142, 82);
    ctx.fillStyle = isIntel ? '#93c5fd' : '#fdba74';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(isIntel ? 'i9-14900K' : is9800 ? '7 9800X3D' : '7 7800X3D', 142, 104);

    ctx.fillStyle = '#0f766e';
    ctx.fillRect(245, 138, 116, 116);
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.strokeRect(245, 138, 116, 116);

    const ihsGrad = ctx.createLinearGradient(255, 148, 350, 244);
    ihsGrad.addColorStop(0, '#f8fafc');
    ihsGrad.addColorStop(0.5, '#cbd5e1');
    ihsGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = ihsGrad;
    ctx.beginPath();
    ctx.roundRect(259, 152, 88, 88, 6);
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isIntel ? 'CORE i9' : 'RYZEN', 303, 192);
    ctx.font = 'bold 10px monospace';
    ctx.fillText(part.specs?.socket || 'AM5', 303, 210);
    ctx.textAlign = 'left';
  } else if (cat === 'gpu') {
    const isFe = part.id.includes('4090');
    const isSapphire = part.id.includes('7900');

    ctx.save();
    ctx.translate(240, 162);
    ctx.rotate(-0.04);

    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-165, -66, 330, 12);
    for (let x = -160; x < 160; x += 6) {
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x, -66, 2, 12);
    }
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-140, -70, 280, 4);

    ctx.fillStyle = isSapphire ? '#334155' : '#181b22';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-175, -56, 350, 116, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isSapphire ? '#cbd5e1' : '#334155';
    ctx.fillRect(-165, -56, 330, 10);
    ctx.fillRect(-165, 50, 330, 10);

    const rgbGrad = ctx.createLinearGradient(-160, 0, 160, 0);
    rgbGrad.addColorStop(0, '#ec4899');
    rgbGrad.addColorStop(0.5, '#8b5cf6');
    rgbGrad.addColorStop(1, '#06b6d4');
    ctx.fillStyle = rgbGrad;
    ctx.fillRect(-155, -48, 310, 5);

    const fanPositions = isFe ? [-95, 95] : [-108, 0, 108];
    fanPositions.forEach((fx) => {
      const r = isFe ? 44 : 42;
      ctx.fillStyle = '#090b10';
      ctx.beginPath();
      ctx.arc(fx, 4, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.stroke();

      for (let b = 0; b < 9; b++) {
        const angle = (b / 9) * Math.PI * 2;
        ctx.save();
        ctx.translate(fx, 4);
        ctx.rotate(angle);
        ctx.fillStyle = '#262b36';
        ctx.beginPath();
        ctx.ellipse(r * 0.52, 0, r * 0.38, 6, 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(fx, 4, 13, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#eab308';
    ctx.fillRect(-125, 60, 135, 8);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-185, -62, 10, 136);
    ctx.restore();
  } else if (cat === 'cooler') {
    const isAir = part.coolerStyle === 'air_dual';
    if (isAir) {
      ctx.fillStyle = '#181b22';
      ctx.fillRect(128, 52, 78, 195);
      ctx.fillRect(268, 52, 78, 195);
      for (let y = 58; y < 240; y += 6) {
        ctx.fillStyle = '#2d3340';
        ctx.fillRect(132, y, 70, 2);
        ctx.fillRect(272, y, 70, 2);
      }
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(204, 62, 66, 178);
      [142, 162, 182, 282, 302, 322].forEach((hx) => {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(hx, 40, 10, 12);
      });
    } else {
      ctx.fillStyle = '#181b22';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(75, 42, 330, 82, 6);
      ctx.fill();
      ctx.stroke();

      [132, 240, 348].forEach((fx) => {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(fx, 83, 34, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      });

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(330, 124);
      ctx.bezierCurveTo(330, 190, 285, 215, 265, 215);
      ctx.stroke();

      ctx.fillStyle = '#090b10';
      ctx.beginPath();
      ctx.arc(230, 212, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('42°C', 230, 218);
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('LIQUID', 230, 192);
      ctx.textAlign = 'left';
    }
  } else if (cat === 'ram') {
    [-34, 24].forEach((yOff) => {
      ctx.save();
      ctx.translate(240, 155 + yOff);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-145, 22, 290, 7);
      ctx.fillStyle = '#181b22';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-155, -18, 310, 42, 4);
      ctx.fill();
      ctx.stroke();
      const rgb = ctx.createLinearGradient(-155, 0, 155, 0);
      rgb.addColorStop(0, '#06b6d4');
      rgb.addColorStop(0.5, '#a855f7');
      rgb.addColorStop(1, '#ec4899');
      ctx.fillStyle = rgb;
      ctx.fillRect(-155, -26, 310, 9);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(part.brand.toUpperCase() + ' DDR5', -55, 8);
      ctx.restore();
    });
  } else if (cat === 'storage') {
    ctx.fillStyle = '#111318';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(75, 112, 330, 92, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#eab308';
    ctx.fillRect(60, 128, 15, 60);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(92, 124, 296, 6);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('SAMSUNG 990 PRO', 96, 162);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('PCIe 4.0 NVMe M.2 SSD • 2TB', 96, 186);
  } else {
    ctx.fillStyle = '#161922';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(105, 64, 270, 176, 8);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    [32, 48, 64].forEach((r) => {
      ctx.beginPath();
      ctx.arc(195, 152, r, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.fillStyle = '#facc15';
    ctx.fillRect(280, 88, 8, 128);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(part.brand.toUpperCase(), 296, 142);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`${part.specs?.wattageCapacity || 1000}W`, 296, 168);
  }

  const uri = canvas.toDataURL('image/png');
  packshotPhotoCache[part.id] = uri;
  return uri;
}

/**
 * High-Resolution (1024x1024) Photorealistic Motherboard PCB Texture
 * Simulates golden/copper integrated circuit traces on a semi-matte black soldermask PCB,
 * complete with BGA pin matrices, differential pair routing, SMD solder pads, and silkscreen markings.
 */
export function createMotherboardPcbTexture(pcbColor = '#0c0e12', accentColor = '#f59e0b') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Semi-matte dark PCB fiberglass soldermask base
  const bgGrad = ctx.createRadialGradient(512, 440, 80, 512, 512, 720);
  bgGrad.addColorStop(0, '#14171f');
  bgGrad.addColorStop(0.6, pcbColor);
  bgGrad.addColorStop(1, '#08090c');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle woven FR-4 fiberglass micro-grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.018)';
  ctx.lineWidth = 1;
  for (let g = 0; g < 1024; g += 8) {
    ctx.beginPath();
    ctx.moveTo(g, 0);
    ctx.lineTo(g, 1024);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, g);
    ctx.lineTo(1024, g);
    ctx.stroke();
  }

  // Golden/Copper Integrated Circuit Signal Buses (Vertical & 45° Angled PCIe/Chipset Routing)
  for (let i = 36; i < 988; i += 9) {
    const isGold = i % 18 === 0;
    ctx.strokeStyle = isGold
      ? 'rgba(234, 179, 8, 0.34)' // Rich Gold IC trace
      : 'rgba(217, 119, 6, 0.24)'; // Burnished Copper trace
    ctx.lineWidth = isGold ? 2.0 : 1.3;
    ctx.beginPath();
    ctx.moveTo(i, 36);
    ctx.lineTo(i, 390);
    ctx.lineTo(i + 34, 434);
    ctx.lineTo(i + 34, 980);
    ctx.stroke();
  }

  // High-Speed Golden DDR5 Serpentine Differential Traces between CPU Socket & DIMM Slots
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.48)';
  ctx.lineWidth = 2.2;
  for (let y = 155; y < 485; y += 5) {
    ctx.beginPath();
    ctx.moveTo(430, y);
    ctx.lineTo(540, y);
    ctx.lineTo(558, y + (y % 10 === 0 ? 4 : -4));
    ctx.lineTo(790, y);
    ctx.stroke();
  }

  // PCIe x16 High-Frequency Copper Lanes from CPU to PCIe Slots
  ctx.strokeStyle = 'rgba(234, 179, 8, 0.42)';
  ctx.lineWidth = 1.8;
  for (let x = 290; x < 540; x += 6) {
    ctx.beginPath();
    ctx.moveTo(x, 380);
    ctx.lineTo(x - 45, 580);
    ctx.lineTo(x - 45, 760);
    ctx.stroke();
  }

  // Gold Via Micro-Holes scattered along IC buses
  ctx.fillStyle = '#eab308';
  for (let vx = 80; vx < 940; vx += 38) {
    for (let vy = 90; vy < 940; vy += 44) {
      if ((vx + vy) % 3 === 0) {
        ctx.beginPath();
        ctx.arc(vx, vy, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // TUF Gaming / ROG Industrial Stencil & Caution Stripes on PCB
  ctx.fillStyle = accentColor;
  for (let s = 0; s < 10; s++) {
    ctx.fillRect(46 + s * 22, 938, 12, 38);
  }
  ctx.strokeStyle = 'rgba(234, 179, 8, 0.45)';
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 24, 976, 976);

  // White PCB Technical Silkscreen Typography & Component Designators
  ctx.fillStyle = 'rgba(248, 250, 252, 0.65)';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('PCIEX16_1 (GEN 5.0)', 230, 595);
  ctx.fillText('M.2_1 SOCKET3 (PCIe 5.0 x4)', 230, 705);
  ctx.fillText('DIMM_A1  DIMM_A2  DIMM_B1  DIMM_B2', 640, 138);
  ctx.fillText('DIGI+ VRM EPU • 14+2 POWER STAGES', 235, 72);

  // Dense SMD Power Stage & Gold Solder Pads around CPU Socket
  for (let i = 0; i < 16; i++) {
    ctx.fillStyle = '#272c38';
    ctx.fillRect(235 + i * 28, 84, 18, 26);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(235 + i * 28, 79, 18, 5);
    ctx.fillRect(235 + i * 28, 110, 18, 5);
  }

  // Gold-Plated Grounding Ring Standoff Mounting Holes
  [
    [48, 48], [512, 48], [976, 48],
    [48, 512], [512, 512], [976, 512],
    [48, 976], [512, 976], [976, 976],
  ].forEach(([x, y]) => {
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#07080b';
    ctx.beginPath();
    ctx.arc(x, y, 7.5, 0, Math.PI * 2);
    ctx.fill();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Generates High-Resolution GPU Backplate Texture (Brushed Anodized Metal + Vent Cutouts + ROG Strix / GeForce RTX Silkscreen)
 */
export function createGpuBackplateTexture(brand = 'ASUS ROG', badge = 'GEFORCE RTX 4070') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Dark Brushed Aluminum Base
  const grad = ctx.createLinearGradient(0, 0, 1024, 512);
  grad.addColorStop(0, '#1e232d');
  grad.addColorStop(0.5, '#2d3442');
  grad.addColorStop(1, '#151921');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Brushed metal horizontal micro-lines
  ctx.strokeStyle = 'rgba(255,255,255,0.045)';
  ctx.lineWidth = 1;
  for (let y = 0; y < 512; y += 2) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Flow-Through Exhaust Vent Slits on the right half of the backplate
  ctx.fillStyle = '#06070a';
  for (let x = 560; x < 955; x += 24) {
    ctx.beginPath();
    ctx.roundRect(x, 76, 13, 358, 4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.22)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Exposed Copper MLCC Capacitor Core Bracket in center-left
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 6;
  ctx.strokeRect(180, 150, 210, 210);
  ctx.fillStyle = '#0d1017';
  ctx.fillRect(190, 160, 190, 190);
  // Gold MLCC capacitor array inside GPU core bracket
  ctx.fillStyle = '#eab308';
  for (let cx = 208; cx < 360; cx += 22) {
    for (let cy = 178; cy < 330; cy += 22) {
      ctx.fillRect(cx, cy, 14, 9);
    }
  }

  // Republic of Gamers / GeForce RTX Silkscreen Typography
  ctx.fillStyle = '#f1f5f9';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText(brand.toUpperCase(), 48, 92);
  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'bold 28px monospace';
  ctx.fillText(badge, 48, 448);

  // Brushed metallic diagonal accent line
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(435, 36);
  ctx.lineTo(525, 476);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Generates High-Resolution Center Fan Hub Sticker Texture (Concentric Brushed Metal + Brand Emblem)
 */
let cachedFanHubTex = null;
export function createFanHubStickerTexture() {
  if (cachedFanHubTex) return cachedFanHubTex;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Dark metallic radial background
  const grad = ctx.createRadialGradient(128, 128, 8, 128, 128, 124);
  grad.addColorStop(0, '#475569');
  grad.addColorStop(0.55, '#1e293b');
  grad.addColorStop(1, '#0f172a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Concentric CD-style machined grooves
  ctx.strokeStyle = 'rgba(226, 232, 240, 0.16)';
  ctx.lineWidth = 1.5;
  for (let r = 18; r < 118; r += 6) {
    ctx.beginPath();
    ctx.arc(128, 128, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Outer precision chrome ring
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(128, 128, 114, 0, Math.PI * 2);
  ctx.stroke();

  // Stylized Axial-Tech / ROG / NZXT Center Emblem
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('ROG', 128, 124);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('AXIAL', 128, 148);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  cachedFanHubTex = tex;
  return tex;
}

/**
 * Generates Repeating Braided Nylon Sleeve Texture for AIO Liquid Hoses & 12VHPWR Cables
 */
let cachedBraidedSleeveTex = null;
export function createBraidedSleeveTexture() {
  if (cachedBraidedSleeveTex) return cachedBraidedSleeveTex;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#12151c';
  ctx.fillRect(0, 0, 256, 256);

  // Interlocking diagonal carbon/nylon weave pattern
  ctx.strokeStyle = '#262c3a';
  ctx.lineWidth = 6;
  for (let i = -256; i < 512; i += 16) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 256, 256);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(i + 256, 0);
    ctx.lineTo(i, 256);
    ctx.stroke();
  }

  // Specular nylon fiber highlights
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
  ctx.lineWidth = 2;
  for (let i = -256; i < 512; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 256, 256);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(14, 3);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  cachedBraidedSleeveTex = tex;
  return tex;
}

/**
 * Generates Soft Translucent ARGB Gradient Texture for Fan Diffuser Rings & RAM Light Bars
 */
let cachedSoftRgbGradTex = null;
export function createSoftRgbGradientTexture() {
  if (cachedSoftRgbGradTex) return cachedSoftRgbGradTex;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, '#38bdf8');
  grad.addColorStop(0.35, '#818cf8');
  grad.addColorStop(0.7, '#c084fc');
  grad.addColorStop(1, '#38bdf8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 128);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  cachedSoftRgbGradTex = tex;
  return tex;
}

/**
 * Generates NZXT Kraken Elite 360 Circular LCD Telemetry Texture (42°C)
 */
export function createKrakenLcdTexture(tempC = 42, gpuTempC = 48, wattage = 422) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#05070b';
  ctx.fillRect(0, 0, 512, 512);

  // Outer gauge track
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 24;
  ctx.beginPath();
  ctx.arc(256, 256, 204, 0, Math.PI * 2);
  ctx.stroke();

  // Active temperature arc
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#38bdf8');
  grad.addColorStop(1, '#818cf8');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 22;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(256, 256, 204, -Math.PI * 0.75, Math.PI * 0.55);
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 26px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('LIQUID COOLER', 256, 152);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 108px sans-serif';
  ctx.fillText(`${tempC}°C`, 256, 272);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 30px monospace';
  ctx.fillText(`GPU ${gpuTempC}°C • ${wattage}W`, 256, 348);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Generates Samsung 990 PRO NVMe M.2 Thermal Spec Sticker & Corsair RM1000e Label Textures
 */
export function createHardwareLabelTexture(type = 'ssd', title = '990 PRO', sub = '2TB NVMe M.2') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#111318';
  ctx.fillRect(0, 0, 512, 160);

  if (type === 'ssd') {
    // Metallic copper/dark thermal sticker border
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 496, 144);

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(20, 18, 472, 10);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px sans-serif';
    ctx.fillText('SAMSUNG', 28, 76);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 36px monospace';
    ctx.fillText(title, 250, 76);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(`${sub} • PCIe 4.0 x4`, 28, 122);
    // Serial barcode lines on right
    ctx.fillStyle = '#e2e8f0';
    for (let bx = 395; bx < 480; bx += 6) {
      ctx.fillRect(bx, 92, 3, 36);
    }
  } else {
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.strokeRect(12, 12, 488, 136);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(24, 28, 14, 104);
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
