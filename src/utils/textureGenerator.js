import * as THREE from 'three';

export const HARDWARE_CATEGORIES = [
  { id: 'case', label: 'Gabinete', shortLabel: 'CASE' },
  { id: 'motherboard', label: 'Placa-Mãe', shortLabel: 'MOBO' },
  { id: 'cpu', label: 'Processador', shortLabel: 'CPU' },
  { id: 'cooler', label: 'Resfriamento', shortLabel: 'COOLER' },
  { id: 'gpu', label: 'Placa de Vídeo', shortLabel: 'GPU' },
  { id: 'ram', label: 'Memória RAM', shortLabel: 'RAM' },
  { id: 'storage', label: 'Armazenamento', shortLabel: 'SSD' },
  { id: 'psu', label: 'Fonte (PSU)', shortLabel: 'PSU' },
];

export const HARDWARE_CATALOG = {
  case: [
    {
      id: 'case_hyte_dual',
      name: 'Voxel O11 Vision Panoramic',
      brand: 'VOXEL LABS',
      tier: 'Mítico',
      tierColor: 'from-cyan-500/20 to-fuchsia-500/20 text-cyan-300 border-cyan-400/40',
      price: 1290,
      wattage: 15,
      airflowScore: 96,
      style: 'panoramic_dark',
      chassisColor: '#11141d',
      interiorColor: '#0b0d14',
      accentColor: '#22d3ee',
      glassTint: '#38bdf8',
      fanCount: 6,
      formFactor: 'ATX Dual-Chamber Panoramic',
      dimensions: '465 x 285 x 459 mm',
      description:
        'Gabinete aquário dual-chamber com vidro temperado panorâmico em 2 faces sem coluna frontal e 6 ventoinhas ARGB Infinity Mirror.',
    },
    {
      id: 'case_stealth_mesh',
      name: 'CyberMesh Airflow Pro Black',
      brand: 'CORSAIR-VX',
      tier: 'Lendário',
      tierColor: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-400/40',
      price: 890,
      wattage: 12,
      airflowScore: 99,
      style: 'mesh_stealth',
      chassisColor: '#18181b',
      interiorColor: '#09090b',
      accentColor: '#f59e0b',
      glassTint: '#94a3b8',
      fanCount: 4,
      formFactor: 'Mid-Tower High Airflow',
      dimensions: '450 x 230 x 466 mm',
      description:
        'Frente em malha metálica microperfurada com alto fluxo de ar estático e acabamento anodizado furtivo.',
    },
    {
      id: 'case_snow_white',
      name: 'NZXT-VX H9 Elite Snow Edition',
      brand: 'NZXT-VX',
      tier: 'Exclusivo',
      tierColor: 'from-sky-400/20 to-indigo-500/20 text-sky-200 border-sky-400/40',
      price: 1450,
      wattage: 15,
      airflowScore: 94,
      style: 'panoramic_white',
      chassisColor: '#e2e8f0',
      interiorColor: '#cbd5e1',
      accentColor: '#38bdf8',
      glassTint: '#e0f2fe',
      fanCount: 6,
      formFactor: 'ATX Showpiece White',
      dimensions: '466 x 290 x 495 mm',
      description:
        'Chassi branco glacial em aço escovado com vidro ultra-clear e iluminação difusa para setups clean.',
    },
  ],

  motherboard: [
    {
      id: 'mobo_rog_maximus',
      name: 'ROG Crosshair X870E Extreme',
      brand: 'ASUS ROG-VX',
      tier: 'Mítico',
      tierColor: 'from-cyan-500/20 to-fuchsia-500/20 text-cyan-300 border-cyan-400/40',
      price: 3890,
      wattage: 55,
      socket: 'AM5 / LGA-VX',
      pcbColor: '#0d1117',
      vrmColor: '#1e293b',
      accentColor: '#ec4899',
      chipset: 'X870E PCIe 5.0',
      memorySupport: 'DDR5 até 8400 MT/s',
      vrmPhases: '20+2+2 Power Stages (110A)',
      description:
        'Placa-mãe entusiasta com dissipadores VRM maciços em alumínio CNC, display OLED no I/O shield e blindagem térmica M.2.',
    },
    {
      id: 'mobo_aorus_master',
      name: 'AORUS Z890 Tachyon Titanium',
      brand: 'GIGABYTE-VX',
      tier: 'Lendário',
      tierColor: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-400/40',
      price: 2790,
      wattage: 48,
      socket: 'AM5 / LGA-VX',
      pcbColor: '#111827',
      vrmColor: '#475569',
      accentColor: '#f59e0b',
      chipset: 'Z890 PCIe 5.0',
      memorySupport: 'DDR5 até 8800 MT/s',
      vrmPhases: '18+1+2 Digital VRM',
      description:
        'Armadura térmica em titânio escovado com trilhas de cobre 2x e slot PCIe Gen5 reforçado em aço.',
    },
    {
      id: 'mobo_nzxt_white',
      name: 'N7 B850 Matte White Armor',
      brand: 'NZXT-VX',
      tier: 'Exclusivo',
      tierColor: 'from-sky-400/20 to-indigo-500/20 text-sky-200 border-sky-400/40',
      price: 2150,
      wattage: 42,
      socket: 'AM5 / LGA-VX',
      pcbColor: '#1e293b',
      vrmColor: '#f1f5f9',
      accentColor: '#38bdf8',
      chipset: 'B850 Full Cover',
      memorySupport: 'DDR5 até 7600 MT/s',
      vrmPhases: '16+2+1 DrMOS',
      description:
        'Cobertura metálica integral em branco fosco que oculta o PCB para uma estética minimalista impecável.',
    },
  ],

  cpu: [
    {
      id: 'cpu_ryzen9_9950x3d',
      name: 'Ryzen 9 9950X3D 16-Core V-Cache',
      brand: 'AMD-VX',
      tier: 'Mítico',
      tierColor: 'from-cyan-500/20 to-fuchsia-500/20 text-cyan-300 border-cyan-400/40',
      price: 4290,
      wattage: 170,
      cores: '16 Cores / 32 Threads',
      boostClock: '5.7 GHz Boost',
      cache: '144 MB 3D V-Cache',
      ihsStyle: 'amd_octopus',
      perfScore: 99,
      description:
        'Processador topo de linha com tecnologia 3D V-Cache de segunda geração para desempenho extremo em jogos e renderização 3D.',
    },
    {
      id: 'cpu_core_ultra9',
      name: 'Core Ultra 9 285K Unlocked',
      brand: 'INTEL-VX',
      tier: 'Lendário',
      tierColor: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-400/40',
      price: 3850,
      wattage: 195,
      cores: '24 Cores (8P + 16E)',
      boostClock: '5.8 GHz Thermal Velocity',
      cache: '76 MB Smart Cache',
      ihsStyle: 'intel_rect',
      perfScore: 95,
      description:
        'Arquitetura híbrida desbloqueada para overclock com NPU dedicada e altíssima performance multi-thread.',
    },
    {
      id: 'cpu_ryzen7_9800x3d',
      name: 'Ryzen 7 9800X3D Gaming King',
      brand: 'AMD-VX',
      tier: 'Lendário',
      tierColor: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-400/40',
      price: 2990,
      wattage: 120,
      cores: '8 Cores / 16 Threads',
      boostClock: '5.4 GHz Boost',
      cache: '104 MB 3D V-Cache',
      ihsStyle: 'amd_octopus',
      perfScore: 94,
      description:
        'O processador mais eficiente do mundo para jogos competitivos, mantendo temperaturas baixas e FPS altíssimo.',
    },
  ],

  cooler: [
    {
      id: 'cooler_aio_360_lcd',
      name: 'Kraken Z73 360mm AIO LCD Telemetry',
      brand: 'VOXEL COOLING',
      tier: 'Mítico',
      tierColor: 'from-cyan-500/20 to-fuchsia-500/20 text-cyan-300 border-cyan-400/40',
      price: 1690,
      wattage: 25,
      type: 'aio_360',
      coolingCapacityW: 320,
      radiatorColor: '#111827',
      pumpAccent: '#22d3ee',
      noiseDb: '21.4 dBA',
      description:
        'Watercooler selado de 360mm no topo com tela LCD circular exibindo temperatura em tempo real, tubos trançados e 3 fans ARGB.',
    },
    {
      id: 'cooler_air_dualtower',
      name: 'DarkRock Assassin IV Dual-Tower',
      brand: 'DEEPCOOL-VX',
      tier: 'Lendário',
      tierColor: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-400/40',
      price: 780,
      wattage: 12,
      type: 'air_dual',
      coolingCapacityW: 280,
      radiatorColor: '#1e293b',
      pumpAccent: '#f59e0b',
      noiseDb: '19.8 dBA',
      description:
        'Air cooler monumental de torre dupla com 7 heatpipes de cobre sinterizado e duas ventoinhas PWM silenciosas.',
    },
    {
      id: 'cooler_aio_white',
      name: 'LianLi Galahad II Trinity 360 White',
      brand: 'LIANLI-VX',
      tier: 'Exclusivo',
      tierColor: 'from-sky-400/20 to-indigo-500/20 text-sky-200 border-sky-400/40',
      price: 1540,
      wattage: 25,
      type: 'aio_360',
      coolingCapacityW: 310,
      radiatorColor: '#f1f5f9',
      pumpAccent: '#38bdf8',
      noiseDb: '22.1 dBA',
      description:
        'Radiador triplo de alta densidade em branco neve com bloco de bomba em espelho infinito ARGB.',
    },
  ],

  gpu: [
    {
      id: 'gpu_rtx_5090_rog',
      name: 'GeForce RTX 5090 ROG Astral 32GB',
      brand: 'NVIDIA / ROG-VX',
      tier: 'Mítico',
      tierColor: 'from-cyan-500/20 to-fuchsia-500/20 text-cyan-300 border-cyan-400/40',
      price: 12490,
      wattage: 450,
      vram: '32 GB GDDR7 (512-bit)',
      lengthScale: 1.0,
      fanCount: 3,
      shroudColor: '#111827',
      trimColor: '#ec4899',
      badgeText: 'GEFORCE RTX 5090',
      perfScore: 100,
      description:
        'Placa de vídeo monstruosa Triple-Slot com câmara de vapor patenteada, 3 ventoinhas Axial-Tech, barra LED cyberpunk e backplate escovado.',
    },
    {
      id: 'gpu_rx_8900xtx_nitro',
      name: 'Radeon RX 8900 XTX Sapphire Nitro+',
      brand: 'AMD / SAPPHIRE',
      tier: 'Lendário',
      tierColor: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-400/40',
      price: 7890,
      wattage: 355,
      vram: '24 GB GDDR6X (384-bit)',
      lengthScale: 0.94,
      fanCount: 3,
      shroudColor: '#334155',
      trimColor: '#06b6d4',
      badgeText: 'RADEON RX NITRO+',
      perfScore: 91,
      description:
        'Design industrial prateado com barra de luz ARGB fluida de ponta a ponta e construção robusta Tri-X Cooling.',
    },
    {
      id: 'gpu_rtx_5080_aero',
      name: 'GeForce RTX 5080 Aero OC White 16GB',
      brand: 'GIGABYTE-VX',
      tier: 'Exclusivo',
      tierColor: 'from-sky-400/20 to-indigo-500/20 text-sky-200 border-sky-400/40',
      price: 8490,
      wattage: 320,
      vram: '16 GB GDDR7 (256-bit)',
      lengthScale: 0.9,
      fanCount: 3,
      shroudColor: '#f8fafc',
      trimColor: '#38bdf8',
      badgeText: 'RTX 5080 AERO',
      perfScore: 89,
      description:
        'Carenagem branca perolada com detalhes em titânio escovado, ideal para builds criativas e minimalistas.',
    },
  ],

  ram: [
    {
      id: 'ram_dominator_64_4x',
      name: '64GB (4x16GB) Dominator Titanium DDR5-7200',
      brand: 'CORSAIR-VX',
      tier: 'Mítico',
      tierColor: 'from-cyan-500/20 to-fuchsia-500/20 text-cyan-300 border-cyan-400/40',
      price: 2190,
      wattage: 22,
      sticks: 4,
      capacity: '64 GB (4x 16GB)',
      speed: '7200 MT/s CL34',
      heatsinkColor: '#0f172a',
      description:
        '4 módulos preenchendo todos os slots DIMM com barra superior de 11 LEDs endereçáveis e dissipador em alumínio forjado.',
    },
    {
      id: 'ram_trident_32_2x',
      name: '32GB (2x16GB) Trident Z5 Royal Silver DDR5-6400',
      brand: 'G.SKILL-VX',
      tier: 'Lendário',
      tierColor: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-400/40',
      price: 1190,
      wattage: 14,
      sticks: 2,
      capacity: '32 GB (2x 16GB Dual-Channel)',
      speed: '6400 MT/s CL30',
      heatsinkColor: '#cbd5e1',
      description:
        '2 módulos em Dual-Channel nos slots A2/B2 com difusor cristalino e acabamento espelhado prateado.',
    },
    {
      id: 'ram_vengeance_white_4x',
      name: '128GB (4x32GB) Vengeance RGB White DDR5-6800',
      brand: 'CORSAIR-VX',
      tier: 'Exclusivo',
      tierColor: 'from-sky-400/20 to-indigo-500/20 text-sky-200 border-sky-400/40',
      price: 3290,
      wattage: 26,
      sticks: 4,
      capacity: '128 GB (4x 32GB Workstation)',
      speed: '6800 MT/s CL32',
      heatsinkColor: '#f8fafc',
      description:
        'Capacidade massiva para simulações, IA local e edição 8K com dissipadores brancos e topo panorâmico RGB.',
    },
  ],

  storage: [
    {
      id: 'ssd_990pro_4tb',
      name: '4TB 990 PRO PCIe 5.0 NVMe M.2 Heatsink',
      brand: 'SAMSUNG-VX',
      tier: 'Mítico',
      tierColor: 'from-cyan-500/20 to-fuchsia-500/20 text-cyan-300 border-cyan-400/40',
      price: 2390,
      wattage: 10,
      capacity: '4 TB NVMe Gen5',
      readSpeed: '14,200 MB/s Leitura',
      heatsinkColor: '#111827',
      accentColor: '#ef4444',
      dualDrive: true,
      description:
        'Par de SSDs M.2 NVMe Gen5 com dissipador térmico angulado e LED de status integrado diretamente na placa-mãe.',
    },
    {
      id: 'ssd_sn850x_2tb',
      name: '2TB WD_BLACK SN850X NVMe M.2 RGB',
      brand: 'WD_BLACK-VX',
      tier: 'Lendário',
      tierColor: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-400/40',
      price: 1190,
      wattage: 8,
      capacity: '2 TB NVMe Gen4',
      readSpeed: '7,300 MB/s Leitura',
      heatsinkColor: '#1e293b',
      accentColor: '#f59e0b',
      dualDrive: false,
      description:
        'SSD M.2 de baixa latência com dissipador extrudado industrial para carregamento instantâneo de texturas.',
    },
  ],

  psu: [
    {
      id: 'psu_rog_thor_1200',
      name: 'ROG Thor 1200W Platinum II OLED Display',
      brand: 'ASUS ROG-VX',
      tier: 'Mítico',
      tierColor: 'from-cyan-500/20 to-fuchsia-500/20 text-cyan-300 border-cyan-400/40',
      price: 2490,
      capacityW: 1200,
      efficiency: '80 Plus Platinum II',
      bodyColor: '#0f172a',
      accentColor: '#22d3ee',
      description:
        'Fonte modular de 1200W ATX 3.1 com painel OLED lateral exibindo o consumo real em Watts em tempo real.',
    },
    {
      id: 'psu_corsair_1000e',
      name: 'RM1000e 1000W 80+ Gold ATX 3.1 Modular',
      brand: 'CORSAIR-VX',
      tier: 'Lendário',
      tierColor: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-400/40',
      price: 1290,
      capacityW: 1000,
      efficiency: '80 Plus Gold',
      bodyColor: '#18181b',
      accentColor: '#f59e0b',
      description:
        'Fonte silenciosa com conector nativo 12V-2x6 PCIe 5.1 e capacitores japoneses 105°C.',
    },
    {
      id: 'psu_superflower_850_white',
      name: 'Leadex VII 850W Pro Snow White Gold',
      brand: 'SUPERFLOWER-VX',
      tier: 'Exclusivo',
      tierColor: 'from-sky-400/20 to-indigo-500/20 text-sky-200 border-sky-400/40',
      price: 980,
      capacityW: 850,
      efficiency: '80 Plus Gold',
      bodyColor: '#f1f5f9',
      accentColor: '#38bdf8',
      description:
        'Chassi branco fosco com cabos flat brancos trançados e conectores iluminados em cristal.',
    },
  ],
};

export const RGB_PRESETS = [
  { id: 'cyberpunk', name: 'Cyber Neon', primary: '#06b6d4', secondary: '#ec4899' },
  { id: 'matrix', name: 'Razer Emerald', primary: '#10b981', secondary: '#22d3ee' },
  { id: 'inferno', name: 'Solar Magma', primary: '#f97316', secondary: '#eab308' },
  { id: 'royal', name: 'Ultraviolet', primary: '#8b5cf6', secondary: '#ec4899' },
  { id: 'arctic', name: 'Pure Ice White', primary: '#e0f2fe', secondary: '#38bdf8' },
];

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
 * Generates a realistic high-detail Motherboard PCB CanvasTexture (circuit traces, solder pads, chipset markings).
 */
export function createMotherboardPcbTexture(pcbColor = '#0d1117', accentColor = '#22d3ee') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = pcbColor;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle circuit traces
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 2;
  for (let i = 16; i < 512; i += 18) {
    ctx.beginPath();
    ctx.moveTo(i, 20);
    ctx.lineTo(i, 220);
    ctx.lineTo(i + 24, 244);
    ctx.lineTo(i + 24, 490);
    ctx.stroke();
  }

  // Accent high-speed PCIe lanes
  ctx.strokeStyle = accentColor;
  ctx.globalAlpha = 0.28;
  ctx.lineWidth = 3;
  for (let y = 260; y <= 340; y += 10) {
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(440, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // SMD capacitor grid dots
  ctx.fillStyle = '#94a3b8';
  for (let y = 40; y < 480; y += 32) {
    for (let x = 40; x < 480; x += 40) {
      if ((x + y) % 3 === 0) {
        ctx.fillRect(x, y, 6, 3);
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Generates a live-updating CanvasTexture for the AIO Watercooler LCD screen & PSU OLED display.
 */
export function createLcdTelemetryTexture({
  cpuTemp = 42,
  gpuTemp = 48,
  wattage = 540,
  primaryColor = '#22d3ee',
  secondaryColor = '#ec4899',
  customLogoImg = null,
}) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#05070c';
  ctx.fillRect(0, 0, 256, 256);

  if (customLogoImg) {
    ctx.drawImage(customLogoImg, 0, 0, 256, 256);
    ctx.fillStyle = 'rgba(5, 7, 12, 0.45)';
    ctx.fillRect(0, 0, 256, 256);
  }

  // Glowing outer ring
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(128, 128, 108, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = secondaryColor;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(128, 128, 94, -Math.PI * 0.5, Math.PI * 0.85);
  ctx.stroke();

  // Telemetry readout
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('LIQUID TEMP', 128, 82);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 54px sans-serif';
  ctx.fillText(`${cpuTemp}°C`, 128, 138);

  ctx.fillStyle = primaryColor;
  ctx.font = 'bold 18px monospace';
  ctx.fillText(`GPU ${gpuTemp}°C • ${wattage}W`, 128, 174);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
