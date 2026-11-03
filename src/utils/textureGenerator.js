import catalogData from '../data/partsCatalog.json';

export const HARDWARE_CATEGORIES = catalogData.categories;
export const SNAP_POINTS = catalogData.snapPoints;
export const ALL_PARTS = catalogData.parts;

/**
 * Group parts by category for fast lookup
 */
export const HARDWARE_CATALOG = HARDWARE_CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = ALL_PARTS.filter((p) => p.category === cat.id);
  return acc;
}, {});

/**
 * Default Real PC Hardware Build (100% AM5 Compatible out of the box)
 */
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
 * Validates hardware compatibility across the active build:
 * - CPU Socket vs Motherboard Socket (e.g. AM5 vs LGA1700)
 * - GPU physical length (mm) vs Case max GPU clearance (mm)
 * - Total estimated TDP wattage vs PSU capacity (W)
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
  const psuWatts = build.psu?.specs?.wattageCapacity || 850;
  if (totalTdp * 1.25 > psuWatts) {
    warnings.push(
      `Margem de energia apertada: Consumo de pico estimado (~${Math.round(
        totalTdp * 1.25
      )}W) próximo ao limite da fonte (${psuWatts}W).`
    );
  }

  return {
    isCompatible: issues.length === 0,
    issues,
    warnings,
    totalTdp,
    psuWatts,
  };
}
