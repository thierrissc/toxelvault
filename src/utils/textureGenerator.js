import * as THREE from 'three';

export const HARDWARE_CATEGORIES = [
  { id: 'case', label: 'Case', ptLabel: 'Gabinete', iconName: 'Box' },
  { id: 'cpu', label: 'CPU', ptLabel: 'Processador', iconName: 'Cpu' },
  { id: 'motherboard', label: 'Motherboard', ptLabel: 'Placa-Mãe', iconName: 'CircuitBoard' },
  { id: 'gpu', label: 'GPU', ptLabel: 'Placa de Vídeo', iconName: 'MonitorPlay' },
  { id: 'ram', label: 'RAM', ptLabel: 'Memória RAM', iconName: 'MemoryStick' },
  { id: 'cooler', label: 'CPU Cooler', ptLabel: 'CPU Cooler', iconName: 'Fan' },
  { id: 'storage', label: 'Storage', ptLabel: 'Armazenamento', iconName: 'HardDrive' },
  { id: 'psu', label: 'Power Supply', ptLabel: 'Fonte (PSU)', iconName: 'Zap' },
  { id: 'fans', label: 'Case Fans', ptLabel: 'Ventoinhas', iconName: 'Wind' },
];

export const HARDWARE_CATALOG = {
  case: [
    {
      id: 'hyte_y70_touch_black',
      name: 'HYTE Y70 Dual-Chamber Panoramic Pitch Black',
      brand: 'HYTE',
      price: 219.99,
      wattage: 0,
      inStock: true,
      style: 'panoramic_3piece',
      chassisColor: '#16181d',
      interiorColor: '#101216',
      accentColor: '#e11d48',
      formFactor: 'ATX Mid Tower Dual-Chamber',
      maxGpuLength: '422 mm',
      dimensions: '470 x 320 x 470 mm',
      specs: {
        'Form Factor': 'ATX / Micro-ATX / Mini-ITX',
        'Volume': '70.7 L Dual-Chamber',
        'Side Panel': '3-Piece Panoramic Tempered Glass',
        'Max GPU Length': '422 mm (4-Slot Vertical/Horizontal)',
        'Radiator Support': '360mm Top & 360mm Side',
        'Drive Bays': '2x 3.5" / 4x 2.5"',
      },
      merchants: [
        { name: 'Amazon', shipping: 'FREE s/h', stock: 'In stock', price: 219.99 },
        { name: 'Newegg', shipping: 'FREE s/h', stock: 'In stock', price: 224.99 },
        { name: 'Best Buy', shipping: 'FREE s/h', stock: 'In stock', price: 229.99 },
      ],
      priceHistory: [239, 229, 229, 219.99, 219.99, 224.99, 219.99],
    },
    {
      id: 'lianli_o11_vision_chrome',
      name: 'Lian Li O11 Vision Three-Side Tempered Glass Black',
      brand: 'Lian Li',
      price: 149.99,
      wattage: 0,
      inStock: true,
      style: 'panoramic_vision',
      chassisColor: '#121317',
      interiorColor: '#0d0e12',
      accentColor: '#38bdf8',
      formFactor: 'ATX Mid Tower Vision',
      maxGpuLength: '455 mm',
      dimensions: '480 x 304 x 464 mm',
      specs: {
        'Form Factor': 'E-ATX (Under 280mm) / ATX',
        'Side Panel': '3-Sided Columnless Tempered Glass',
        'Max GPU Length': '455 mm',
        'Max CPU Cooler': '167 mm',
        'Material': 'Aluminum + 4mm Clear Tempered Glass',
        'Fan Mounts': 'Up to 8x 120mm Fans',
      },
      merchants: [
        { name: 'Amazon', shipping: 'FREE s/h', stock: 'In stock', price: 149.99 },
        { name: 'B&H Photo', shipping: 'FREE s/h', stock: 'In stock', price: 154.99 },
        { name: 'Walmart', shipping: '$6.99 s/h', stock: 'In stock', price: 159.0 },
      ],
      priceHistory: [169, 159, 159, 149.99, 154.99, 149.99, 149.99],
    },
    {
      id: 'nzxt_h9_elite_white',
      name: 'NZXT H9 Flow Dual-Chamber Matte Snow White',
      brand: 'NZXT',
      price: 159.99,
      wattage: 0,
      inStock: true,
      style: 'panoramic_white',
      chassisColor: '#f1f5f9',
      interiorColor: '#e2e8f0',
      accentColor: '#38bdf8',
      formFactor: 'ATX Mid Tower White',
      maxGpuLength: '435 mm',
      dimensions: '495 x 290 x 466 mm',
      specs: {
        'Form Factor': 'ATX / Micro-ATX / Mini-ITX',
        'Side Panel': 'Wraparound Ultra-Clear Glass',
        'Max GPU Length': '435 mm',
        'Max CPU Cooler': '165 mm',
        'Color': 'Matte Snow White',
        'Cable Management': 'Dual-Chamber 91mm Space',
      },
      merchants: [
        { name: 'Amazon', shipping: 'FREE s/h', stock: 'In stock', price: 159.99 },
        { name: 'Best Buy', shipping: 'FREE s/h', stock: 'In stock', price: 164.99 },
        { name: 'Newegg', shipping: 'FREE s/h', stock: 'In stock', price: 169.99 },
      ],
      priceHistory: [189, 179, 169, 164.99, 159.99, 159.99, 159.99],
    },
    {
      id: 'corsair_4000d_airflow',
      name: 'Corsair 4000D Airflow Perforated Steel Black',
      brand: 'Corsair',
      price: 104.99,
      wattage: 0,
      inStock: true,
      style: 'mesh_airflow',
      chassisColor: '#1e2028',
      interiorColor: '#14161c',
      accentColor: '#facc15',
      formFactor: 'ATX Mid Tower Airflow',
      maxGpuLength: '360 mm',
      dimensions: '453 x 230 x 466 mm',
      specs: {
        'Form Factor': 'ATX / E-ATX',
        'Front Panel': 'High-Airflow Steel Mesh',
        'Side Panel': 'Tempered Glass',
        'Max GPU Length': '360 mm',
        'Max CPU Cooler': '170 mm',
        'RapidRoute': '25mm Cable Routing Channel',
      },
      merchants: [
        { name: 'Amazon', shipping: 'FREE s/h', stock: 'In stock', price: 104.99 },
        { name: 'Walmart', shipping: 'FREE s/h', stock: 'In stock', price: 104.99 },
        { name: 'Best Buy', shipping: 'FREE s/h', stock: 'In stock', price: 109.99 },
      ],
      priceHistory: [109, 104.99, 94.99, 104.99, 104.99, 104.99, 104.99],
    },
  ],

  cpu: [
    {
      id: 'amd_ryzen_7_9800x3d',
      name: 'AMD Ryzen 7 9800X3D',
      brand: 'AMD',
      price: 479.0,
      wattage: 120,
      inStock: true,
      socket: 'AM5',
      cores: '8 Cores',
      threads: '16 Threads',
      boostClock: '5.2 GHz',
      baseClock: '4.7 GHz',
      series: 'Ryzen 7 9000',
      microarch: 'Zen 5',
      l3Cache: '96 MB 2nd Gen 3D V-Cache',
      perfScore: 98,
      specs: {
        'Socket': 'AM5',
        'Total Cores': '8 Cores / 16 Threads',
        'Boost Clock': '5.2 GHz',
        'Base Clock': '4.7 GHz',
        'Microarchitecture': 'Zen 5 (Granite Ridge)',
        'Cache L3': '96 MB 3D V-Cache',
        'TDP / PPT': '120 W / 162 W',
      },
      merchants: [
        { name: 'Amazon', shipping: 'FREE s/h', stock: 'In stock', price: 479.0 },
        { name: 'Walmart', shipping: 'FREE s/h', stock: 'In stock', price: 479.0 },
        { name: 'Best Buy', shipping: 'FREE s/h', stock: 'In stock', price: 489.0 },
      ],
      priceHistory: [499, 489, 479, 479, 484, 479, 479],
    },
    {
      id: 'amd_ryzen_9_9950x3d',
      name: 'AMD Ryzen 9 9950X3D',
      brand: 'AMD',
      price: 699.0,
      wattage: 170,
      inStock: true,
      socket: 'AM5',
      cores: '16 Cores',
      threads: '32 Threads',
      boostClock: '5.7 GHz',
      baseClock: '4.3 GHz',
      series: 'Ryzen 9 9000',
      microarch: 'Zen 5',
      l3Cache: '128 MB 3D V-Cache',
      perfScore: 100,
      specs: {
        'Socket': 'AM5',
        'Total Cores': '16 Cores / 32 Threads',
        'Boost Clock': '5.7 GHz',
        'Base Clock': '4.3 GHz',
        'Microarchitecture': 'Zen 5 (Granite Ridge)',
        'Cache L3': '128 MB 3D V-Cache',
        'TDP / PPT': '170 W / 230 W',
      },
      merchants: [
        { name: 'Amazon', shipping: 'FREE s/h', stock: 'In stock', price: 699.0 },
        { name: 'Newegg', shipping: 'FREE s/h', stock: 'In stock', price: 699.0 },
        { name: 'Best Buy', shipping: 'FREE s/h', stock: 'In stock', price: 709.99 },
      ],
      priceHistory: [749, 729, 699, 699, 715, 699, 699],
    },
    {
      id: 'amd_ryzen_7_7800x3d',
      name: 'AMD Ryzen 7 7800X3D',
      brand: 'AMD',
      price: 363.99,
      wattage: 120,
      inStock: true,
      socket: 'AM5',
      cores: '8 Cores',
      threads: '16 Threads',
      boostClock: '5.0 GHz',
      baseClock: '4.2 GHz',
      series: 'Ryzen 7 7000',
      microarch: 'Zen 4',
      l3Cache: '96 MB 3D V-Cache',
      perfScore: 93,
      specs: {
        'Socket': 'AM5',
        'Total Cores': '8 Cores / 16 Threads',
        'Boost Clock': '5.0 GHz',
        'Base Clock': '4.2 GHz',
        'Microarchitecture': 'Zen 4 (Raphael)',
        'Cache L3': '96 MB 3D V-Cache',
        'TDP / PPT': '120 W / 162 W',
      },
      merchants: [
        { name: 'Amazon', shipping: 'FREE s/h', stock: 'In stock', price: 363.99 },
        { name: 'Walmart', shipping: 'FREE s/h', stock: 'In stock', price: 369.0 },
        { name: 'Best Buy', shipping: 'FREE s/h', stock: 'In stock', price: 379.99 },
      ],
      priceHistory: [399, 389, 375, 363.99, 363.99, 369, 363.99],
    },
    {
      id: 'intel_core_ultra_9_285k',
      name: 'Intel Core Ultra 9 285K',
      brand: 'Intel',
      price: 589.0,
      wattage: 195,
      inStock: true,
      socket: 'LGA 1851',
      cores: '24 Cores',
      threads: '24 Threads (8P+16E)',
      boostClock: '5.7 GHz',
      baseClock: '3.7 GHz',
      series: 'Core Ultra 9',
      microarch: 'Arrow Lake',
      l3Cache: '36 MB Smart Cache',
      perfScore: 96,
      specs: {
        'Socket': 'LGA 1851',
        'Total Cores': '24 Cores (8P + 16E)',
        'Boost Clock': '5.7 GHz',
        'Microarchitecture': 'Arrow Lake-S',
        'Cache L2 / L3': '40 MB / 36 MB',
        'Processor Base Power': '125 W (250W MTP)',
      },
      merchants: [
        { name: 'Amazon', shipping: 'FREE s/h', stock: 'In stock', price: 589.0 },
        { name: 'Newegg', shipping: 'FREE s/h', stock: 'In stock', price: 589.99 },
        { name: 'B&H Photo', shipping: 'FREE s/h', stock: 'In stock', price: 599.0 },
      ],
      priceHistory: [629, 619, 599, 589, 589, 594, 589],
    },
    {
      id: 'intel_core_i9_14900k',
      name: 'Intel Core i9-14900K',
      brand: 'Intel',
      price: 439.0,
      wattage: 210,
      inStock: true,
      socket: 'LGA 1700',
      cores: '24 Cores',
      threads: '32 Threads (8P+16E)',
      boostClock: '6.0 GHz',
      baseClock: '3.2 GHz',
      series: 'Core i9 14th Gen',
      microarch: 'Raptor Lake Refresh',
      l3Cache: '36 MB Smart Cache',
      perfScore: 94,
      specs: {
        'Socket': 'LGA 1700',
        'Total Cores': '24 Cores (8P + 16E) / 32 Threads',
        'Boost Clock': '6.0 GHz Thermal Velocity',
        'Microarchitecture': 'Raptor Lake Refresh',
        'Cache L3': '36 MB Intel Smart Cache',
        'Maximum Turbo Power': '253 W',
      },
      merchants: [
        { name: 'Amazon', shipping: 'FREE s/h', stock: 'In stock', price: 439.0 },
        { name: 'Walmart', shipping: 'FREE s/h', stock: 'In stock', price: 444.99 },
        { name: 'Best Buy', shipping: 'FREE s/h', stock: 'In stock', price: 449.0 },
      ],
      priceHistory: [519, 489, 469, 449, 439, 444, 439],
    },
  ],

  motherboard: [
    {
      id: 'asus_rog_crosshair_x870e_hero',
      name: 'ASUS ROG Crosshair X870E Hero ATX',
      brand: 'ASUS',
      price: 649.99,
      wattage: 55,
      inStock: true,
      socket: 'AM5',
      formFactor: 'ATX',
      pcbColor: '#13161c',
      vrmColor: '#222731',
      accentColor: '#38bdf8',
      chipset: 'AMD X870E',
      memorySlots: '4x DDR5 (Up to 8600 MT/s)',
      specs: {
        'Socket / Chipset': 'AM5 / AMD X870E',
        'Form Factor': 'ATX (30.5 cm x 24.4 cm)',
        'Power Stages': '18+2+2 Teamed Power Stages (110A)',
        'Memory': '4x DIMM DDR5, Max 256GB, DDR5-8600+(OC)',
        'M.2 Slots': '5x M.2 Slots (3x PCIe 5.0 x4, 2x PCIe 4.0 x4)',
        'Networking': 'Wi-Fi 7 + Dual Ethernet (5Gb & 2.5Gb)',
      },
      merchants: [
        { name: 'Amazon', shipping: 'FREE s/h', stock: 'In stock', price: 649.99 },
        { name: 'Newegg', shipping: 'FREE s/h', stock: 'In stock', price: 649.99 },
        { name: 'B&H Photo', shipping: 'FREE s/h', stock: 'In stock', price: 659.99 },
      ],
      priceHistory: [699, 679, 659, 649.99, 649.99, 649.99, 649.99],
    },
    {
      id: 'msi_mpg_x870e_carbon',
      name: 'MSI MPG X870E Carbon WiFi ATX',
      brand: 'MSI',
      price: 489.99,
      wattage: 50,
      inStock: true,
      socket: 'AM5',
      formFactor: 'ATX',
      pcbColor: '#111318',
      vrmColor: '#2c323d',
      accentColor: '#a855f7',
      chipset: 'AMD X870E',
      memorySlots: '4x DDR5 (Up to 8400 MT/s)',
      specs: {
        'Socket / Chipset': 'AM5 / AMD X870E',
        'Form Factor': 'ATX',
        'Power Design': '18+2+1 Duet Rail Power System (110A SPS)',
        'Memory': '4x DDR5 DIMM, Up to 8400+ MT/s',
        'Expansion': '2x PCIe 5.0 x16 Steel Armor II',
        'Storage': '4x M.2 Shield Frozr II',
      },
      merchants: [
        { name: 'Amazon', shipping: 'FREE s/h', stock: 'In stock', price: 489.99 },
        { name: 'Best Buy', shipping: 'FREE s/h', stock: 'In stock', price: 499.99 },
      ],
      priceHistory: [499, 499, 489.99, 489.99, 489.99, 489.99, 489.99],
    },
    {
      id: 'gigabyte_x870_aorus_elite_ice',
      name: 'GIGABYTE X870 AORUS Elite WIFI7 ICE White',
      brand: 'GIGABYTE',
      price: 289.99,
      wattage: 45,
      inStock: true,
      socket: 'AM5',
      formFactor: 'ATX',
      pcbColor: '#cbd5e1',
      vrmColor: '#e2e8f0',
      accentColor: '#38bdf8',
      chipset: 'AMD X870',
      memorySlots: '4x DDR5 (Up to 8200 MT/s)',
      specs: {
        'Socket / Chipset': 'AM5 / AMD X870',
        'Aesthetic': 'Silver & White PCB + White Heatsink Armor',
        'Power Stages': '16+2+2 Twin Digital VRM',
        'Memory': '4x DDR5 DIMM, Max 256GB',
        'EZ-Latch': 'PCIe 5.0 & M.2 EZ-Latch Plus Toolless',
      },
      merchants: [
        { name: 'Amazon', shipping: 'FREE s/h', stock: 'In stock', price: 289.99 },
        { name: 'Newegg', shipping: 'FREE s/h', stock: 'In stock', price: 289.99 },
      ],
      priceHistory: [319, 309, 299, 289.99, 289.99, 289.99, 289.99],
    },
    {
      id: 'asus_rog_maximus_z890_hero',
      name: 'ASUS ROG Maximus Z890 Hero (LGA 1851 / 1700)',
      brand: 'ASUS',
      price: 629.99,
      wattage: 55,
      inStock: true,
      socket: 'LGA 1851 / 1700',
      formFactor: 'ATX',
      pcbColor: '#12151c',
      vrmColor: '#1e2430',
      accentColor: '#60a5fa',
      chipset: 'Intel Z890',
      memorySlots: '4x DDR5 NITROPath (Up to 9200 MT/s)',
      specs: {
        'Socket / Chipset': 'LGA 1851 / Intel Z890',
        'Power Stages': '22+1+2+2 Power Stages',
        'Memory': '4x DIMM DDR5 NITROPath DRAM Technology',
        'M.2 Support': '6x M.2 Slots (3x PCIe 5.0)',
        'Connectivity': 'Dual Thunderbolt 4 + Wi-Fi 7',
      },
      merchants: [
        { name: 'Amazon', shipping: 'FREE s/h', stock: 'In stock', price: 629.99 },
        { name: 'Newegg', shipping: 'FREE s/h', stock: 'In stock', price: 629.99 },
      ],
      priceHistory: [699, 669, 649, 629.99, 629.99, 629.99, 629.99],
    },
  ],

  gpu: [
    {
      id: 'asus_rog_astral_rtx_5090',
      name: 'ASUS ROG Astral GeForce RTX 5090 OC 32GB',
      brand: 'NVIDIA / ASUS',
      price: 2299.99,
      wattage: 575,
      inStock: true,
      vram: '32 GB GDDR7',
      boostClock: '2610 MHz',
      lengthMm: 357,
      lengthScale: 1.04,
      slotWidth: '3.8-Slot',
      shroudColor: '#1c2029',
      trimColor: '#475569',
      ledColor: '#38bdf8',
      badgeText: 'GEFORCE RTX 5090',
      perfScore: 100,
      specs: {
        'GPU Architecture': 'NVIDIA Blackwell GB202',
        'VRAM': '32 GB GDDR7 (512-bit, 1792 GB/s)',
        'CUDA Cores': '21,760 Cores',
        'Cooling': 'Quad-Fan Vapor Chamber + Phase-Change Pad',
        'Dimensions': '357.6 x 149.3 x 76 mm (3.8-Slot)',
        'Power Connector': '1x 16-pin 12V-2x6 (575W TGP)',
      },
      merchants: [
        { name: 'Amazon', shipping: 'FREE s/h', stock: 'In stock', price: 2299.99 },
        { name: 'Best Buy', shipping: 'FREE s/h', stock: 'In stock', price: 2299.99 },
        { name: 'Newegg', shipping: 'FREE s/h', stock: 'In stock', price: 2349.99 },
      ],
      priceHistory: [2499, 2399, 2349, 2299.99, 2299.99, 2299.99, 2299.99],
    },
    {
      id: 'nvidia_rtx_5080_fe',
      name: 'NVIDIA GeForce RTX 5080 Founders Edition 16GB',
      brand: 'NVIDIA',
      price: 999.99,
      wattage: 360,
      inStock: true,
      vram: '16 GB GDDR7',
      boostClock: '2617 MHz',
      lengthMm: 304,
      lengthScale: 0.9,
      slotWidth: '2-Slot SFF-Ready',
      shroudColor: '#272a33',
      trimColor: '#94a3b8',
      ledColor: '#f8fafc',
      badgeText: 'GEFORCE RTX 5080',
      perfScore: 88,
      specs: {
        'GPU Architecture': 'NVIDIA Blackwell GB203',
        'VRAM': '16 GB GDDR7 (256-bit, 960 GB/s)',
        'CUDA Cores': '10,752 Cores',
        'Cooling': 'Double Flow-Through 2-Slot Design',
        'Dimensions': '304 x 137 x 40 mm (2-Slot)',
        'Power Connector': '1x 16-pin 12V-2x6 (360W TGP)',
      },
      merchants: [
        { name: 'Best Buy', shipping: 'FREE s/h', stock: 'In stock', price: 999.99 },
        { name: 'NVIDIA Store', shipping: 'FREE s/h', stock: 'In stock', price: 999.99 },
      ],
      priceHistory: [1099, 999.99, 999.99, 999.99, 999.99, 999.99, 999.99],
    },
    {
      id: 'sapphire_nitro_rx_7900xtx',
      name: 'Sapphire NITRO+ Radeon RX 7900 XTX Vapor-X 24GB',
      brand: 'AMD / Sapphire',
      price: 919.99,
      wattage: 355,
      inStock: true,
      vram: '24 GB GDDR6',
      boostClock: '2680 MHz',
      lengthMm: 320,
      lengthScale: 0.95,
      slotWidth: '3.5-Slot',
      shroudColor: '#3f4756',
      trimColor: '#cbd5e1',
      ledColor: '#f59e0b',
      badgeText: 'SAPPHIRE NITRO+',
      perfScore: 86,
      specs: {
        'GPU Architecture': 'AMD RDNA 3 (Navi 31)',
        'VRAM': '24 GB GDDR6 (384-bit)',
        'Stream Processors': '6,144 Units',
        'Cooling': 'Vapor-X Chamber + Tri-X Axial Fans',
        'ARGB Bar': 'Dual Full-Length ARGB Light Strip',
        'Dimensions': '320 x 135.75 x 71.6 mm',
      },
      merchants: [
        { name: 'Amazon', shipping: 'FREE s/h', stock: 'In stock', price: 919.99 },
        { name: 'Newegg', shipping: 'FREE s/h', stock: 'In stock', price: 929.99 },
      ],
      priceHistory: [999, 959, 939, 919.99, 919.99, 929, 919.99],
    },
    {
      id: 'gigabyte_aero_rtx_4080_super_white',
      name: 'GIGABYTE GeForce RTX 4080 SUPER AERO OC 16GB White',
      brand: 'NVIDIA / GIGABYTE',
      price: 1049.99,
      wattage: 320,
      inStock: true,
      vram: '16 GB GDDR6X',
      boostClock: '2595 MHz',
      lengthMm: 342,
      lengthScale: 0.98,
      slotWidth: '3.5-Slot',
      shroudColor: '#f1f5f9',
      trimColor: '#cbd5e1',
      ledColor: '#38bdf8',
      badgeText: 'RTX AERO OC',
      perfScore: 85,
      specs: {
        'GPU Architecture': 'NVIDIA Ada Lovelace AD103',
        'VRAM': '16 GB GDDR6X (256-bit)',
        'CUDA Cores': '10,240 Cores',
        'Cooling': 'WINDFORCE 3x 110mm Alternate Spinning Fans',
        'Dimensions': '342 x 150 x 75 mm',
      },
      merchants: [
        { name: 'Amazon', shipping: 'FREE s/h', stock: 'In stock', price: 1049.99 },
        { name: 'B&H Photo', shipping: 'FREE s/h', stock: 'In stock', price: 1059.99 },
      ],
      priceHistory: [1099, 1079, 1049.99, 1049.99, 1049.99, 1049.99, 1049.99],
    },
  ],

  ram: [
    {
      id: 'gskill_trident_z5_neo_64gb_2x32',
      name: 'G.Skill Trident Z5 Neo RGB 64GB (2x32GB) DDR5-6000 CL30',
      brand: 'G.Skill',
      price: 204.99,
      wattage: 14,
      inStock: true,
      sticks: 2,
      capacity: '64 GB (2 x 32 GB)',
      speed: 'DDR5-6000',
      casLatency: 'CL30-40-40-96',
      heatsinkColor: '#181b22',
      specs: {
        'Capacity': '64 GB (2 x 32 GB Dual-Channel)',
        'Speed / Timings': 'DDR5-6000 MT/s (PC5-48000) • CL30',
        'Voltage': '1.40V AMD EXPO & Intel XMP 3.0',
        'Heatspreader': 'CNC Brushed Black Aluminum + Streamlined RGB Bar',
      },
      merchants: [
        { name: 'Amazon', shipping: 'FREE s/h', stock: 'In stock', price: 204.99 },
        { name: 'Newegg', shipping: 'FREE s/h', stock: 'In stock', price: 204.99 },
      ],
      priceHistory: [219, 214, 209, 204.99, 204.99, 204.99, 204.99],
    },
    {
      id: 'corsair_dominator_titanium_64gb_4x16',
      name: 'Corsair Dominator Titanium RGB 64GB (4x16GB) DDR5-6600 CL32',
      brand: 'Corsair',
      price: 289.99,
      wattage: 22,
      inStock: true,
      sticks: 4,
      capacity: '64 GB (4 x 16 GB)',
      speed: 'DDR5-6600',
      casLatency: 'CL32-39-39-76',
      heatsinkColor: '#1e222b',
      specs: {
        'Capacity': '64 GB (4 x 16 GB Quad-DIMM)',
        'Speed / Timings': 'DDR5-6600 MT/s • CL32',
        'Cooling': 'Patented Corsair DHX Cooling + Forged Aluminum',
        'Lighting': '11 Individually Addressable CAPELLIX RGB LEDs per Module',
      },
      merchants: [
        { name: 'Amazon', shipping: 'FREE s/h', stock: 'In stock', price: 289.99 },
        { name: 'Best Buy', shipping: 'FREE s/h', stock: 'In stock', price: 299.99 },
      ],
      priceHistory: [319, 309, 299, 289.99, 289.99, 289.99, 289.99],
    },
    {
      id: 'corsair_vengeance_rgb_white_32gb_2x16',
      name: 'Corsair Vengeance RGB White 32GB (2x16GB) DDR5-6000 CL30',
      brand: 'Corsair',
      price: 114.99,
      wattage: 12,
      inStock: true,
      sticks: 2,
      capacity: '32 GB (2 x 16 GB)',
      speed: 'DDR5-6000',
      casLatency: 'CL30-36-36-76',
      heatsinkColor: '#f1f5f9',
      specs: {
        'Capacity': '32 GB (2 x 16 GB Dual-Channel)',
        'Speed / Timings': 'DDR5-6000 MT/s • CL30',
        'Color': 'Matte White Heatspreader',
        'Lighting': '10-Zone Panoramic RGB Light Bar',
      },
      merchants: [
        { name: 'Amazon', shipping: 'FREE s/h', stock: 'In stock', price: 114.99 },
        { name: 'Walmart', shipping: 'FREE s/h', stock: 'In stock', price: 118.99 },
      ],
      priceHistory: [129, 124, 119, 114.99, 114.99, 114.99, 114.99],
    },
  ],

  cooler: [
    {
      id: 'nzxt_kraken_elite_360_rgb',
      name: 'NZXT Kraken Elite 360 RGB (2.36" LCD Display) Black',
      brand: 'NZXT',
      price: 279.99,
      wattage: 22,
      inStock: true,
      type: 'aio_360',
      radiatorSize: '360 mm',
      radiatorColor: '#161920',
      noiseDb: '30.6 dBA',
      specs: {
        'Cooler Type': '360mm All-In-One Liquid Cooler',
        'LCD Display': '2.36" Wide-Angle Circular LCD (640x640, 60Hz)',
        'Pump Speed': '800 - 2,800 ± 300 RPM (Asetek 8th Gen)',
        'Fans': '3x F120 RGB Core Fluid Dynamic Bearing Fans',
        'Tubing': '400mm Ultra-Low Evaporation Nylon-Braided Rubber',
      },
      merchants: [
        { name: 'Amazon', shipping: 'FREE s/h', stock: 'In stock', price: 279.99 },
        { name: 'Best Buy', shipping: 'FREE s/h', stock: 'In stock', price: 284.99 },
      ],
      priceHistory: [299, 289, 279.99, 279.99, 279.99, 279.99, 279.99],
    },
    {
      id: 'lianli_galahad_ii_lcd_white',
      name: 'Lian Li Galahad II LCD SL-INF 360mm AIO White',
      brand: 'Lian Li',
      price: 249.99,
      wattage: 24,
      inStock: true,
      type: 'aio_360',
      radiatorSize: '360 mm',
      radiatorColor: '#f1f5f9',
      noiseDb: '29.0 dBA',
      specs: {
        'Cooler Type': '360mm AIO Liquid Cooler',
        'LCD Screen': '2.88" IPS LCD Screen (480x480)',
        'Fans': '3x UNI FAN SL-INF 120mm Daisy-Chain Infinity Mirror',
        'Pump': 'Asetek 8th Gen 3-Phase Motor up to 3600 RPM',
      },
      merchants: [
        { name: 'Amazon', shipping: 'FREE s/h', stock: 'In stock', price: 249.99 },
        { name: 'Newegg', shipping: 'FREE s/h', stock: 'In stock', price: 254.99 },
      ],
      priceHistory: [269, 259, 249.99, 249.99, 249.99, 249.99, 249.99],
    },
    {
      id: 'noctua_nh_d15_g2_chromax',
      name: 'Noctua NH-D15 chromax.black Dual-Tower 8-Heatpipe Air Cooler',
      brand: 'Noctua',
      price: 119.95,
      wattage: 10,
      inStock: true,
      type: 'air_dual',
      radiatorSize: '165 mm Height',
      radiatorColor: '#181a20',
      noiseDb: '24.6 dBA',
      specs: {
        'Cooler Type': 'Dual-Tower 6/8 Soldered Heatpipe Air Cooler',
        'Fans': '2x NF-A15 HS-PWM chromax.black 140mm Fans',
        'Height / Weight': '165 mm / 1,320 g',
        'Acoustics': 'Max 24.6 dB(A) Ultra-Quiet Operation',
      },
      merchants: [
        { name: 'Amazon', shipping: 'FREE s/h', stock: 'In stock', price: 119.95 },
        { name: 'Newegg', shipping: 'FREE s/h', stock: 'In stock', price: 119.95 },
      ],
      priceHistory: [119.95, 119.95, 119.95, 119.95, 119.95, 119.95, 119.95],
    },
  ],

  storage: [
    {
      id: 'samsung_990_pro_4tb',
      name: 'Samsung 990 PRO 4TB PCIe 4.0 NVMe M.2 Heatsink',
      brand: 'Samsung',
      price: 309.99,
      wattage: 8,
      inStock: true,
      capacity: '4 TB',
      interface: 'PCIe 4.0 x4 NVMe 2.0',
      readSpeed: '7,450 MB/s',
      writeSpeed: '6,900 MB/s',
      dualDrive: true,
      specs: {
        'Capacity': '4 TB (4,000 GB)',
        'Form Factor': 'M.2 2280 with Low-Profile Nickel Heatsink',
        'Sequential Read / Write': '7,450 MB/s Read • 6,900 MB/s Write',
        'NAND / Controller': 'Samsung V-NAND TLC + Pascal Controller (4GB LPDDR4 DRAM)',
      },
      merchants: [
        { name: 'Amazon', shipping: 'FREE s/h', stock: 'In stock', price: 309.99 },
        { name: 'Best Buy', shipping: 'FREE s/h', stock: 'In stock', price: 319.99 },
      ],
      priceHistory: [349, 329, 319, 309.99, 309.99, 309.99, 309.99],
    },
    {
      id: 'wd_black_sn850x_2tb',
      name: 'WD_BLACK SN850X 2TB NVMe M.2 PCIe 4.0 SSD',
      brand: 'Western Digital',
      price: 149.99,
      wattage: 7,
      inStock: true,
      capacity: '2 TB',
      interface: 'PCIe 4.0 x4 NVMe',
      readSpeed: '7,300 MB/s',
      writeSpeed: '6,600 MB/s',
      dualDrive: false,
      specs: {
        'Capacity': '2 TB (2,000 GB)',
        'Form Factor': 'M.2 2280',
        'Sequential Read / Write': '7,300 MB/s Read • 6,600 MB/s Write',
        'Endurance': '1,200 TBW • Game Mode 2.0',
      },
      merchants: [
        { name: 'Amazon', shipping: 'FREE s/h', stock: 'In stock', price: 149.99 },
        { name: 'Walmart', shipping: 'FREE s/h', stock: 'In stock', price: 149.99 },
      ],
      priceHistory: [169, 159, 154, 149.99, 149.99, 149.99, 149.99],
    },
  ],

  psu: [
    {
      id: 'asus_rog_thor_1200p2',
      name: 'ASUS ROG Thor 1200W Platinum II (OLED Wattage Display)',
      brand: 'ASUS',
      price: 329.99,
      wattage: 0,
      capacityW: 1200,
      inStock: true,
      efficiency: '80+ Platinum / Cybenetics Lambda A++',
      modular: 'Full Modular ATX 3.0 / 3.1',
      bodyColor: '#14171f',
      specs: {
        'Wattage': '1200 W Continuous Output',
        'Efficiency Rating': '80 Plus Platinum / Lambda A++ (<15 dB)',
        'Display': 'Magnetic Real-Time Power Draw OLED Panel',
        'Connectors': 'Native 16-Pin PCIe 5.0 12VHPWR (600W)',
      },
      merchants: [
        { name: 'Amazon', shipping: 'FREE s/h', stock: 'In stock', price: 329.99 },
        { name: 'Newegg', shipping: 'FREE s/h', stock: 'In stock', price: 339.99 },
      ],
      priceHistory: [359, 349, 339, 329.99, 329.99, 329.99, 329.99],
    },
    {
      id: 'corsair_rm1000x_shift',
      name: 'Corsair RM1000x SHIFT 1000W 80+ Gold ATX 3.1 Fully Modular',
      brand: 'Corsair',
      price: 189.99,
      wattage: 0,
      capacityW: 1000,
      inStock: true,
      efficiency: '80+ Gold',
      modular: 'Side-Mounted Full Modular ATX 3.1',
      bodyColor: '#181a20',
      specs: {
        'Wattage': '1000 W Continuous Output',
        'Efficiency Rating': '80 Plus Gold / Cybenetics Gold',
        'Interface': 'Patented Side-Mounted Micro-Fit Modular Interface',
        'Capacitors': '100% Industrial-Grade 105°C Japanese Capacitors',
      },
      merchants: [
        { name: 'Amazon', shipping: 'FREE s/h', stock: 'In stock', price: 189.99 },
        { name: 'Best Buy', shipping: 'FREE s/h', stock: 'In stock', price: 189.99 },
      ],
      priceHistory: [209, 199, 189.99, 189.99, 189.99, 189.99, 189.99],
    },
  ],

  fans: [
    {
      id: 'lianli_uni_sl_inf_120_black',
      name: 'Lian Li UNI FAN SL-INFINITY 120mm (Triple Pack + Rear)',
      brand: 'Lian Li',
      price: 109.99,
      wattage: 18,
      inStock: true,
      fanColor: '#16181f',
      rpmRange: '200 - 2100 RPM',
      airflowCfm: '61.3 CFM',
      specs: {
        'Fan Size': '120 x 122.1 x 25 mm (Interlocking Daisy-Chain)',
        'Bearing': 'Fluid Dynamic Bearing (FDB)',
        'Airflow / Pressure': '61.3 CFM • 2.66 mmH2O',
        'Lighting': '40 LEDs per Fan + Front/Side Infinity Mirrors',
      },
      merchants: [
        { name: 'Amazon', shipping: 'FREE s/h', stock: 'In stock', price: 109.99 },
        { name: 'Newegg', shipping: 'FREE s/h', stock: 'In stock', price: 109.99 },
      ],
      priceHistory: [119, 114, 109.99, 109.99, 109.99, 109.99, 109.99],
    },
    {
      id: 'lianli_uni_sl_inf_120_white',
      name: 'Lian Li UNI FAN SL-INFINITY 120mm Snow White Pack',
      brand: 'Lian Li',
      price: 114.99,
      wattage: 18,
      inStock: true,
      fanColor: '#f1f5f9',
      rpmRange: '200 - 2100 RPM',
      airflowCfm: '61.3 CFM',
      specs: {
        'Fan Size': '120 x 122.1 x 25 mm Snow White',
        'Bearing': 'Fluid Dynamic Bearing (FDB)',
        'Airflow / Pressure': '61.3 CFM • 2.66 mmH2O',
        'Lighting': 'Infinity Mirror Hub & Side Diffusers',
      },
      merchants: [
        { name: 'Amazon', shipping: 'FREE s/h', stock: 'In stock', price: 114.99 },
        { name: 'B&H Photo', shipping: 'FREE s/h', stock: 'In stock', price: 114.99 },
      ],
      priceHistory: [124, 119, 114.99, 114.99, 114.99, 114.99, 114.99],
    },
  ],
};

// Refined, non-saturated hardware lighting presets (including Stealth Off)
export const RGB_PRESETS = [
  { id: 'arctic_white', name: 'Studio White', primary: '#e2e8f0', secondary: '#94a3b8', intensity: 0.9 },
  { id: 'subtle_ice', name: 'Ice Blue', primary: '#38bdf8', secondary: '#818cf8', intensity: 0.95 },
  { id: 'amd_amber', name: 'Warm Amber', primary: '#f59e0b', secondary: '#ea580c', intensity: 0.85 },
  { id: 'emerald', name: 'Mint Green', primary: '#34d399', secondary: '#38bdf8', intensity: 0.85 },
  { id: 'stealth_off', name: 'Stealth (LEDs Off)', primary: '#334155', secondary: '#1e293b', intensity: 0.08 },
];

export const DEFAULT_BUILD = {
  case: HARDWARE_CATALOG.case[0],
  cpu: HARDWARE_CATALOG.cpu[0],
  motherboard: HARDWARE_CATALOG.motherboard[0],
  gpu: HARDWARE_CATALOG.gpu[0],
  ram: HARDWARE_CATALOG.ram[0],
  cooler: HARDWARE_CATALOG.cooler[0],
  storage: HARDWARE_CATALOG.storage[0],
  psu: HARDWARE_CATALOG.psu[0],
  fans: HARDWARE_CATALOG.fans[0],
};

/**
 * Generates realistic product studio photography thumbnails (like BuildCores white-box product photos)
 * for every real hardware component so the catalog modal & part list look authentic and crisp.
 */
const productPhotoCache = {};

export function getHardwareProductPhoto(category, item) {
  const key = `${category}_${item.id}`;
  if (productPhotoCache[key]) return productPhotoCache[key];

  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 240;
  const ctx = canvas.getContext('2d');

  // Clean Studio White/Light-Gray Photography Backdrop (matching BuildCores product cards)
  const bgGrad = ctx.createRadialGradient(160, 120, 20, 160, 120, 180);
  bgGrad.addColorStop(0, '#ffffff');
  bgGrad.addColorStop(1, '#f1f5f9');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 320, 240);

  // Soft floor contact shadow
  ctx.fillStyle = 'rgba(15, 23, 42, 0.09)';
  ctx.beginPath();
  ctx.ellipse(160, 204, 92, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  if (category === 'cpu') {
    const isIntel = item.brand === 'Intel';
    // 3D Isometric Retail Box (AMD Ryzen orange/dark-grey box or Intel Blue box)
    ctx.save();
    // Front face of box
    ctx.fillStyle = isIntel ? '#1d4ed8' : '#1f242d';
    ctx.beginPath();
    ctx.moveTo(95, 42);
    ctx.lineTo(195, 30);
    ctx.lineTo(195, 188);
    ctx.lineTo(95, 200);
    ctx.closePath();
    ctx.fill();

    // Side face of box
    ctx.fillStyle = isIntel ? '#1e3a8a' : '#11141a';
    ctx.beginPath();
    ctx.moveTo(195, 30);
    ctx.lineTo(232, 46);
    ctx.lineTo(232, 184);
    ctx.lineTo(195, 188);
    ctx.closePath();
    ctx.fill();

    // Accent geometric trim (Ryzen Orange/Silver or Intel Cyan)
    ctx.strokeStyle = isIntel ? '#38bdf8' : '#f97316';
    ctx.lineWidth = 4;
    ctx.strokeRect(104, 52, 82, 132);

    // Metallic CPU IHS window in center of box
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(124, 86, 44, 44);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isIntel ? 'INTEL CORE' : 'AMD RYZEN', 146, 108);

    // Series Number Badge (7 / 9 / i9)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'right';
    const numMatch = item.name.match(/\b(9|7|5|i9|i7)\b/);
    ctx.fillText(numMatch ? numMatch[0] : '9', 184, 178);
    ctx.restore();
  } else if (category === 'gpu') {
    // Detailed Triple-Fan Graphics Card Studio Photo
    const isLight = item.shroudColor === '#f1f5f9';
    ctx.save();
    ctx.translate(160, 118);
    ctx.rotate(-0.08);

    // Card Body
    ctx.fillStyle = isLight ? '#e2e8f0' : '#1e2430';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-115, -48, 230, 96, 8);
    ctx.fill();
    ctx.stroke();

    // Metallic trim bands
    ctx.fillStyle = item.trimColor || '#64748b';
    ctx.fillRect(-110, -48, 220, 8);
    ctx.fillRect(-110, 40, 220, 8);

    // 3 Axial Cooling Fans
    [-72, 0, 72].forEach((fx) => {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(fx, 0, 31, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      for (let b = 0; b < 9; b++) {
        const a = (b / 9) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(fx, 0);
        ctx.lineTo(fx + Math.cos(a) * 29, Math.sin(a) * 29);
        ctx.stroke();
      }

      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(fx, 0, 10, 0, Math.PI * 2);
      ctx.fill();
    });

    // PCIe gold fingers at bottom
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-85, 48, 95, 6);
    ctx.restore();
  } else if (category === 'motherboard') {
    // ATX Motherboard Top-Down Photo
    const isWhite = item.pcbColor === '#cbd5e1';
    ctx.fillStyle = isWhite ? '#cbd5e1' : '#161922';
    ctx.fillRect(92, 30, 136, 174);

    // VRM Heatsinks (Top & Left)
    ctx.fillStyle = isWhite ? '#f8fafc' : '#334155';
    ctx.fillRect(96, 36, 32, 86);
    ctx.fillRect(132, 36, 56, 24);

    // CPU Socket AM5/LGA in center-top
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(140, 70, 36, 36);

    // 4 DDR5 DIMM Slots
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#475569' : '#1e293b';
      ctx.fillRect(188 + i * 7, 64, 4, 48);
    }

    // Steel PCIe x16 Slots & M.2 Heatsinks
    ctx.fillStyle = isWhite ? '#e2e8f0' : '#272c38';
    ctx.fillRect(102, 128, 116, 18);
    ctx.fillRect(102, 156, 116, 22);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.strokeRect(102, 122, 88, 4);
    ctx.strokeRect(102, 150, 88, 4);
  } else if (category === 'ram') {
    // Pair of DDR5 RGB Memory Modules
    const isWhite = item.heatsinkColor === '#f1f5f9';
    [-18, 18].forEach((yOff, idx) => {
      ctx.save();
      ctx.translate(160, 115 + yOff);
      ctx.rotate(-0.12);
      // Gold pins
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-88, 16, 176, 5);
      // Heatspreader body
      ctx.fillStyle = isWhite ? '#e2e8f0' : '#1e232d';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.fillRect(-92, -14, 184, 30);
      ctx.strokeRect(-92, -14, 184, 30);
      // Top RGB diffuser bar
      const rgbGrad = ctx.createLinearGradient(-92, 0, 92, 0);
      rgbGrad.addColorStop(0, '#38bdf8');
      rgbGrad.addColorStop(0.5, '#a855f7');
      rgbGrad.addColorStop(1, '#ec4899');
      ctx.fillStyle = rgbGrad;
      ctx.fillRect(-92, -20, 184, 6);
      ctx.restore();
    });
  } else if (category === 'cooler') {
    if (item.type === 'aio_360') {
      // 360mm Radiator + Circular LCD Pump Block
      const isWhite = item.radiatorColor === '#f1f5f9';
      ctx.fillStyle = isWhite ? '#e2e8f0' : '#1e232d';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.fillRect(58, 42, 204, 52);
      ctx.strokeRect(58, 42, 204, 52);
      // 3 Fans on Radiator
      [92, 160, 228].forEach((fx) => {
        ctx.fillStyle = isWhite ? '#cbd5e1' : '#0f172a';
        ctx.beginPath();
        ctx.arc(fx, 68, 21, 0, Math.PI * 2);
        ctx.fill();
      });
      // Circular LCD Pump Block below
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(160, 156, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('38°C', 160, 161);
    } else {
      // Dual-Tower Air Cooler
      ctx.fillStyle = '#1e232d';
      ctx.fillRect(102, 48, 46, 134);
      ctx.fillRect(172, 48, 46, 134);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(144, 56, 32, 118);
    }
  } else if (category === 'case') {
    // Isometric Panoramic PC Case Photo
    const isWhite = item.chassisColor === '#f1f5f9';
    ctx.fillStyle = isWhite ? '#e2e8f0' : '#1b1f29';
    ctx.strokeStyle = isWhite ? '#94a3b8' : '#334155';
    ctx.lineWidth = 2;
    ctx.fillRect(102, 30, 116, 172);
    ctx.strokeRect(102, 30, 116, 172);
    // Clear Glass Window
    ctx.fillStyle = isWhite ? '#f8fafc' : '#11151d';
    ctx.fillRect(110, 40, 100, 132);
    // Internal RGB Fan hints
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    [62, 96, 130].forEach((fy) => {
      ctx.beginPath();
      ctx.arc(188, fy, 12, 0, Math.PI * 2);
      ctx.stroke();
    });
  } else if (category === 'storage') {
    // M.2 2280 NVMe SSD Stick
    ctx.fillStyle = '#181b22';
    ctx.fillRect(64, 96, 192, 48);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(56, 104, 8, 32);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(76, 106, 156, 4);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(item.brand.toUpperCase() + ' NVMe M.2', 78, 128);
  } else {
    // PSU / Fans
    ctx.fillStyle = '#181b22';
    ctx.fillRect(88, 60, 144, 112);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(88, 60, 144, 112);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(item.capacityW ? `${item.capacityW}W` : '120mm ARGB', 160, 122);
  }

  const dataUrl = canvas.toDataURL('image/png');
  productPhotoCache[key] = dataUrl;
  return dataUrl;
}

/**
 * High-resolution Motherboard PCB Texture with realistic silkscreen, solder traces & VRM capacitor arrays
 */
export function createMotherboardPcbTexture(pcbColor = '#13161c', accentColor = '#38bdf8') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = pcbColor;
  ctx.fillRect(0, 0, 512, 512);

  // Realistic copper-under-soldermask signal routing lines
  ctx.strokeStyle = pcbColor === '#cbd5e1' ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1.5;
  for (let i = 12; i < 500; i += 10) {
    ctx.beginPath();
    ctx.moveTo(i, 16);
    ctx.lineTo(i, 210);
    ctx.lineTo(i + 18, 228);
    ctx.lineTo(i + 18, 496);
    ctx.stroke();
  }

  // Silkscreen diagnostic markings
  ctx.strokeStyle = accentColor;
  ctx.globalAlpha = 0.2;
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, 464, 464);
  ctx.globalAlpha = 1;

  // SMD Choke / Capacitor banks around CPU socket
  ctx.fillStyle = '#64748b';
  for (let i = 0; i < 14; i++) {
    ctx.fillRect(110 + i * 16, 48, 11, 14);
    ctx.fillRect(88, 72 + i * 14, 14, 10);
  }

  // Standoff mounting screw holes with silver ground rings
  [
    [28, 28], [256, 28], [484, 28],
    [28, 256], [256, 256], [484, 256],
    [28, 484], [256, 484], [484, 484],
  ].forEach(([sx, sy]) => {
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(sx, sy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#090a0f';
    ctx.beginPath();
    ctx.arc(sx, sy, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Generates a realistic NZXT Kraken / Lian Li LCD Telemetry Screen Texture
 */
export function createLcdTelemetryTexture({
  cpuTemp = 42,
  gpuTemp = 48,
  wattage = 540,
  primaryColor = '#38bdf8',
  secondaryColor = '#94a3b8',
  customLogoImg = null,
}) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#090b10';
  ctx.fillRect(0, 0, 256, 256);

  if (customLogoImg) {
    ctx.drawImage(customLogoImg, 0, 0, 256, 256);
    ctx.fillStyle = 'rgba(9, 11, 16, 0.45)';
    ctx.fillRect(0, 0, 256, 256);
  }

  // Clean NZXT CAM style circular gauge
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(128, 128, 104, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(128, 128, 104, -Math.PI * 0.75, Math.PI * 0.55);
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CPU / GPU TEMP', 128, 78);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 48px sans-serif';
  ctx.fillText(`${cpuTemp}°`, 128, 134);

  ctx.fillStyle = secondaryColor;
  ctx.font = '600 17px monospace';
  ctx.fillText(`GPU ${gpuTemp}°C • ${wattage}W`, 128, 172);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
