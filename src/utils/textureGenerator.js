import * as THREE from 'three';
import catalogData from '../data/partsCatalog.json';

export const HARDWARE_CATEGORIES = catalogData.categories;
export const SNAP_POINTS = catalogData.snapPoints;
export const ALL_PARTS = catalogData.parts;

export const HARDWARE_CATALOG = HARDWARE_CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = ALL_PARTS.filter((p) => p.category === cat.id);
  return acc;
}, {});

export function validateBuildCompatibility(build) {
  const issues = [];
  const warnings = [];

  if (build.cpu && build.motherboard) {
    const cpuSocket = build.cpu.specs?.socket;
    const moboSocket = build.motherboard.specs?.socket;
    if (cpuSocket && moboSocket && cpuSocket !== moboSocket) {
      issues.push(
        `Incompatibilidade de Socket: ${build.cpu.name} (${cpuSocket}) nao encaixa na placa-mae ${build.motherboard.name} (${moboSocket}).`
      );
    }
  }

  if (build.gpu && build.case) {
    const gpuLen = build.gpu.specs?.lengthMm || 0;
    const maxCaseGpu = build.case.specs?.maxGpuLengthMm || 999;
    if (gpuLen > maxCaseGpu) {
      issues.push(
        `Comprimento da GPU excedido: ${build.gpu.name} (${gpuLen}mm) excede o espaco maximo do gabinete ${build.case.name} (${maxCaseGpu}mm).`
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

const packshotPhotoCache = {};
const cleanedUrlCache = new Map();

export function getFallbackProductPhotoDataUri(part) {
  if (!part) return '';
  if (packshotPhotoCache[part.id]) return packshotPhotoCache[part.id];

  const canvas = document.createElement('canvas');
  canvas.width = 360;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 360, 360);

  const shadowGrad = ctx.createRadialGradient(180, 310, 10, 180, 310, 125);
  shadowGrad.addColorStop(0, 'rgba(15, 23, 42, 0.16)');
  shadowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(180, 310, 125, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  const cat = part.category;

  if (cat === 'case') {
    const isCorsair = part.id.includes('4000d');
    const isLianLi = part.id.includes('o11');

    ctx.save();
    ctx.translate(-55, 10);
    ctx.fillStyle = '#181b22';
    ctx.beginPath();
    ctx.moveTo(145, 52);
    ctx.lineTo(275, 34);
    ctx.lineTo(335, 62);
    ctx.lineTo(335, 266);
    ctx.lineTo(210, 288);
    ctx.lineTo(145, 258);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#272c38';
    ctx.fillRect(175, 76, 86, 110);
    ctx.fillStyle = '#334155';
    ctx.fillRect(168, 152, 112, 26);
    ctx.fillStyle = '#38bdf8';
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

    const glassGrad = ctx.createLinearGradient(145, 45, 330, 275);
    glassGrad.addColorStop(0, 'rgba(255,255,255,0.22)');
    glassGrad.addColorStop(0.5, 'rgba(56,189,248,0.05)');
    glassGrad.addColorStop(1, 'rgba(255,255,255,0.16)');
    ctx.fillStyle = glassGrad;
    ctx.fillRect(152, 56, 174, 212);

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 5;
    ctx.strokeRect(150, 52, 178, 220);

    if (isCorsair) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(282, 55, 44, 214);
    } else if (!isLianLi) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(268, 52, 10, 220);
    }
    ctx.restore();
  } else if (cat === 'motherboard') {
    ctx.save();
    ctx.translate(-60, 15);
    ctx.fillStyle = '#0d0f12';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(130, 34, 220, 248, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.fillRect(138, 42, 52, 122);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(142, 48, 44, 18);

    ctx.fillStyle = '#64748b';
    ctx.fillRect(196, 42, 92, 36);
    for (let x = 202; x < 282; x += 8) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x, 44, 3, 32);
    }

    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(204, 88, 56, 56);
    ctx.fillStyle = '#334155';
    ctx.fillRect(214, 98, 36, 36);

    for (let s = 0; s < 4; s++) {
      const sx = 278 + s * 12;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(sx, 80, 6, 74);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(sx - 1, 76, 8, 4);
      ctx.fillRect(sx - 1, 154, 8, 4);
    }

    [174, 228].forEach((py) => {
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(148, py, 132, 9);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(152, py + 2, 124, 5);
    });

    ctx.fillStyle = '#334155';
    ctx.fillRect(148, 188, 192, 34);
    ctx.fillStyle = '#475569';
    ctx.fillRect(256, 226, 84, 46);

    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(234, 252, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (cat === 'cpu') {
    const isIntel = part.brand === 'Intel';
    const is9800 = part.id.includes('9800');

    ctx.save();
    ctx.translate(-55, 22);
    ctx.fillStyle = isIntel ? '#1d4ed8' : '#1f242d';
    ctx.beginPath();
    ctx.roundRect(118, 38, 165, 205, 8);
    ctx.fill();

    ctx.strokeStyle = isIntel ? '#38bdf8' : '#f97316';
    ctx.lineWidth = 4;
    ctx.strokeRect(128, 48, 145, 185);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(isIntel ? 'INTEL CORE' : 'AMD RYZEN', 140, 82);
    ctx.fillStyle = isIntel ? '#93c5fd' : '#fdba74';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(isIntel ? 'i9-14900K' : is9800 ? '7 9800X3D' : '7 7800X3D', 140, 104);

    ctx.fillStyle = '#0f766e';
    ctx.fillRect(238, 138, 110, 110);
    const ihsGrad = ctx.createLinearGradient(248, 148, 340, 240);
    ihsGrad.addColorStop(0, '#f8fafc');
    ihsGrad.addColorStop(0.5, '#cbd5e1');
    ihsGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = ihsGrad;
    ctx.beginPath();
    ctx.roundRect(252, 152, 82, 82, 6);
    ctx.fill();
    ctx.restore();
  } else if (cat === 'gpu') {
    const isFe = part.id.includes('4090');
    const isSapphire = part.id.includes('7900');

    ctx.save();
    ctx.translate(180, 175);
    ctx.scale(0.84, 0.84);
    ctx.rotate(-0.04);

    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-165, -68, 330, 14);
    for (let x = -160; x < 160; x += 4) {
      ctx.fillStyle = '#64748b';
      ctx.fillRect(x, -68, 1.5, 14);
    }

    ctx.fillStyle = isSapphire ? '#272c38' : '#151820';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-175, -56, 350, 116, 10);
    ctx.fill();
    ctx.stroke();

    const fanPositions = isFe ? [-95, 95] : [-108, 0, 108];
    fanPositions.forEach((fx) => {
      const r = 42;
      ctx.fillStyle = '#090b10';
      ctx.beginPath();
      ctx.arc(fx, 4, r, 0, Math.PI * 2);
      ctx.fill();

      for (let b = 0; b < 9; b++) {
        const angle = (b / 9) * Math.PI * 2;
        ctx.save();
        ctx.translate(fx, 4);
        ctx.rotate(angle);
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.moveTo(10, -2);
        ctx.quadraticCurveTo(24, -12, 38, -4);
        ctx.lineTo(38, 7);
        ctx.quadraticCurveTo(22, 2, 10, 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(fx, 4, 12, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  } else if (cat === 'cooler') {
    const isAir = part.coolerStyle === 'air_dual';
    ctx.save();
    ctx.translate(-60, 20);
    if (isAir) {
      ctx.fillStyle = '#181b22';
      ctx.fillRect(132, 52, 74, 190);
      ctx.fillRect(268, 52, 74, 190);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(204, 62, 66, 172);
    } else {
      ctx.fillStyle = '#181b22';
      ctx.beginPath();
      ctx.roundRect(85, 42, 310, 78, 6);
      ctx.fill();
      [138, 240, 342].forEach((fx) => {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(fx, 81, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      ctx.fillStyle = '#090b10';
      ctx.beginPath();
      ctx.arc(235, 208, 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('42°C', 235, 215);
    }
    ctx.restore();
  } else if (cat === 'ram') {
    [-30, 24].forEach((yOff) => {
      ctx.save();
      ctx.translate(180, 175 + yOff);
      ctx.scale(0.88, 0.88);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-140, 22, 280, 6);
      ctx.fillStyle = '#181b22';
      ctx.beginPath();
      ctx.roundRect(-150, -18, 300, 42, 4);
      ctx.fill();
      const rgb = ctx.createLinearGradient(-150, 0, 150, 0);
      rgb.addColorStop(0, '#06b6d4');
      rgb.addColorStop(0.5, '#a855f7');
      rgb.addColorStop(1, '#ec4899');
      ctx.fillStyle = rgb;
      ctx.fillRect(-150, -25, 300, 8);
      ctx.restore();
    });
  } else if (cat === 'storage') {
    ctx.save();
    ctx.translate(-60, 25);
    ctx.fillStyle = '#111318';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(85, 112, 310, 88, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(100, 124, 280, 5);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('SAMSUNG 990 PRO', 104, 160);
    ctx.restore();
  } else {
    ctx.save();
    ctx.translate(-60, 20);
    ctx.fillStyle = '#161922';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(110, 64, 260, 170, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#facc15';
    ctx.fillRect(275, 86, 7, 124);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(part.brand.toUpperCase(), 290, 140);
    ctx.restore();
  }

  const uri = canvas.toDataURL('image/png');
  packshotPhotoCache[part.id] = uri;
  return uri;
}

export function cleanProductImage(imageUrl, part) {
  if (!imageUrl || imageUrl.startsWith('data:')) {
    return Promise.resolve({
      src: imageUrl || getFallbackProductPhotoDataUri(part),
      bgColor: '#ffffff',
    });
  }

  if (cleanedUrlCache.has(imageUrl)) {
    return Promise.resolve(cleanedUrlCache.get(imageUrl));
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const scale = Math.min((size - 24) / img.width, (size - 24) / img.height);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const dx = Math.round((size - w) / 2);
        const dy = Math.round((size - h) / 2);

        ctx.drawImage(img, dx, dy, w, h);
        const imgData = ctx.getImageData(0, 0, size, size);
        const data = imgData.data;

        const cornerSamples = [
          [dx + 2, dy + 2],
          [dx + w - 3, dy + 2],
          [dx + 2, dy + h - 3],
          [dx + w - 3, dy + h - 3],
        ];

        let rSum = 0;
        let gSum = 0;
        let bSum = 0;
        cornerSamples.forEach(([cx, cy]) => {
          const idx = (Math.max(0, Math.min(size - 1, cy)) * size + Math.max(0, Math.min(size - 1, cx))) * 4;
          rSum += data[idx];
          gSum += data[idx + 1];
          bSum += data[idx + 2];
        });

        const bgR = Math.round(rSum / 4);
        const bgG = Math.round(gSum / 4);
        const bgB = Math.round(bSum / 4);

        const tolerance = 38;
        const visited = new Uint8Array(size * size);
        const queue = [];

        for (let x = dx; x < dx + w; x++) {
          queue.push(dy * size + x);
          queue.push((dy + h - 1) * size + x);
        }
        for (let y = dy; y < dy + h; y++) {
          queue.push(y * size + dx);
          queue.push(y * size + (dx + w - 1));
        }

        while (queue.length > 0) {
          const pos = queue.pop();
          if (visited[pos]) continue;
          visited[pos] = 1;

          const pIdx = pos * 4;
          const dr = Math.abs(data[pIdx] - bgR);
          const dg = Math.abs(data[pIdx + 1] - bgG);
          const db = Math.abs(data[pIdx + 2] - bgB);
          const dist = (dr + dg + db) / 3;

          if (dist <= tolerance) {
            data[pIdx + 3] = 0;
            const px = pos % size;
            const py = Math.floor(pos / size);
            if (px > dx) queue.push(pos - 1);
            if (px < dx + w - 1) queue.push(pos + 1);
            if (py > dy) queue.push(pos - size);
            if (py < dy + h - 1) queue.push(pos + size);
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const result = {
          src: canvas.toDataURL('image/png'),
          bgColor: '#ffffff',
        };
        cleanedUrlCache.set(imageUrl, result);
        resolve(result);
      } catch {
        const fallback = {
          src: getFallbackProductPhotoDataUri(part),
          bgColor: '#ffffff',
        };
        cleanedUrlCache.set(imageUrl, fallback);
        resolve(fallback);
      }
    };

    img.onerror = () => {
      const fallback = {
        src: getFallbackProductPhotoDataUri(part),
        bgColor: '#ffffff',
      };
      cleanedUrlCache.set(imageUrl, fallback);
      resolve(fallback);
    };

    img.src = imageUrl;
  });
}

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

export function createMotherboardPcbTexture(pcbColor = '#0d0f12') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = pcbColor;
  ctx.fillRect(0, 0, 1024, 1024);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
  ctx.lineWidth = 1.5;
  for (let i = 40; i < 984; i += 12) {
    ctx.beginPath();
    ctx.moveTo(i, 40);
    ctx.lineTo(i, 410);
    ctx.lineTo(i + 28, 448);
    ctx.lineTo(i + 28, 984);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(203, 213, 225, 0.08)';
  ctx.lineWidth = 1.8;
  for (let y = 160; y < 480; y += 7) {
    ctx.beginPath();
    ctx.moveTo(430, y);
    ctx.lineTo(790, y);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, 976, 976);

  ctx.fillStyle = 'rgba(203, 213, 225, 0.42)';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('B650M GAMING WIFI', 320, 560);
  ctx.font = 'bold 15px monospace';
  ctx.fillText('PCIEX16_1 GEN 5.0', 240, 600);
  ctx.fillText('M.2_1 SOCKET3', 240, 720);

  [
    [48, 48], [512, 48], [976, 48],
    [48, 512], [512, 512], [976, 512],
    [48, 976], [512, 976], [976, 976],
  ].forEach(([x, y]) => {
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(x, y, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#07080b';
    ctx.beginPath();
    ctx.arc(x, y, 6.5, 0, Math.PI * 2);
    ctx.fill();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

export function createM2ArmorLaserTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 512, 256);
  grad.addColorStop(0, '#1e232d');
  grad.addColorStop(0.5, '#2a303c');
  grad.addColorStop(1, '#151820');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let y = 0; y < 256; y += 3) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(28, 220);
  ctx.lineTo(145, 36);
  ctx.lineTo(480, 36);
  ctx.stroke();

  ctx.fillStyle = 'rgba(226, 232, 240, 0.78)';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('M.2 PCIe 5.0 HEATSINK', 155, 118);
  ctx.fillStyle = 'rgba(148, 163, 184, 0.55)';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('THERMAL GUARD ARMOR // LASER ETCHED', 155, 152);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function createGpuBackplateTexture(brand = 'ASUS ROG', badge = 'GEFORCE RTX') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 1024, 512);
  grad.addColorStop(0, '#161922');
  grad.addColorStop(0.5, '#222733');
  grad.addColorStop(1, '#12151c');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let y = 0; y < 512; y += 2) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  ctx.fillStyle = '#050608';
  for (let x = 540; x < 955; x += 22) {
    ctx.beginPath();
    ctx.moveTo(x, 78);
    ctx.lineTo(x + 12, 78);
    ctx.lineTo(x - 18, 434);
    ctx.lineTo(x - 30, 434);
    ctx.closePath();
    ctx.fill();
  }

  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 5;
  ctx.strokeRect(180, 156, 200, 200);
  ctx.fillStyle = '#0b0d13';
  ctx.fillRect(190, 166, 180, 180);

  ctx.fillStyle = '#f1f5f9';
  ctx.font = 'bold 32px sans-serif';
  ctx.fillText(brand.toUpperCase(), 48, 92);
  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'bold 26px monospace';
  ctx.fillText(badge, 48, 448);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

let cachedFanHubTex = null;
export function createFanHubStickerTexture() {
  if (cachedFanHubTex) return cachedFanHubTex;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(128, 128, 8, 128, 128, 124);
  grad.addColorStop(0, '#475569');
  grad.addColorStop(0.55, '#1e293b');
  grad.addColorStop(1, '#0f172a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = 'rgba(226, 232, 240, 0.16)';
  ctx.lineWidth = 1.5;
  for (let r = 18; r < 118; r += 6) {
    ctx.beginPath();
    ctx.arc(128, 128, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(128, 128, 114, 0, Math.PI * 2);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  cachedFanHubTex = tex;
  return tex;
}

let cachedBraidedSleeveTex = null;
export function createBraidedSleeveTexture() {
  if (cachedBraidedSleeveTex) return cachedBraidedSleeveTex;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#12151c';
  ctx.fillRect(0, 0, 256, 256);

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

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(14, 3);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  cachedBraidedSleeveTex = tex;
  return tex;
}

let cachedSoftRgbGradTex = null;
export function createSoftRgbGradientTexture() {
  if (cachedSoftRgbGradTex) return cachedSoftRgbGradTex;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, '#38bdf8');
  grad.addColorStop(0.5, '#818cf8');
  grad.addColorStop(1, '#38bdf8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 128);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  cachedSoftRgbGradTex = tex;
  return tex;
}

export function createKrakenLcdTexture(tempC = 42, gpuTempC = 48, wattage = 422) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#05070b';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 24;
  ctx.beginPath();
  ctx.arc(256, 256, 204, 0, Math.PI * 2);
  ctx.stroke();

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
  ctx.fillText(`GPU ${gpuTempC}°C - ${wattage}W`, 256, 348);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function createHardwareLabelTexture(type = 'ssd', title = '990 PRO', sub = '2TB NVMe M.2') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#111318';
  ctx.fillRect(0, 0, 512, 160);

  if (type === 'ssd') {
    ctx.strokeStyle = '#475569';
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
    ctx.fillText(`${sub} - PCIe 4.0 x4`, 28, 122);
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
