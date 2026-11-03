import React, { useMemo, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createMotherboardPcbTexture } from '../utils/textureGenerator';

/**
 * High-Detail 120mm Case / Radiator Fan (Lian Li UNI FAN SL-INF style)
 * Features octagonal outer frame, anti-vibration corner pads, circular fan tunnel,
 * 9 curved aerodynamic blades, and subtle infinity mirror center hub.
 */
function CaseFan120({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  frameMaterial,
  bladeMaterial,
  ledMaterial,
  onRegisterFan,
  fanIndex,
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Outer Frame Block */}
      <mesh material={frameMaterial} castShadow receiveShadow>
        <boxGeometry args={[0.48, 0.48, 0.065]} />
      </mesh>

      {/* Subtle Side Infinity Strip */}
      <mesh position={[0, 0.242, 0]} material={ledMaterial}>
        <boxGeometry args={[0.38, 0.008, 0.035]} />
      </mesh>
      <mesh position={[0, -0.242, 0]} material={ledMaterial}>
        <boxGeometry args={[0.38, 0.008, 0.035]} />
      </mesh>

      {/* Thin Refined LED Ring Inside Tunnel */}
      <mesh position={[0, 0, 0.034]} material={ledMaterial}>
        <ringGeometry args={[0.205, 0.218, 32]} />
      </mesh>
      <mesh position={[0, 0, -0.034]} rotation={[0, Math.PI, 0]} material={ledMaterial}>
        <ringGeometry args={[0.205, 0.218, 32]} />
      </mesh>

      {/* Spinning Rotor Hub + 9 Aerodynamic Blades */}
      <group ref={(el) => onRegisterFan(fanIndex, el)}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={frameMaterial}>
          <cylinderGeometry args={[0.068, 0.068, 0.068, 24]} />
        </mesh>
        {/* Infinity Mirror Center Cap */}
        <mesh position={[0, 0, 0.035]} material={ledMaterial}>
          <ringGeometry args={[0.032, 0.052, 24]} />
        </mesh>

        {Array.from({ length: 9 }).map((_, idx) => {
          const angle = (idx / 9) * Math.PI * 2;
          return (
            <group key={idx} rotation={[0, 0, angle]}>
              <mesh
                position={[0.125, 0, 0]}
                rotation={[0.48, 0.18, 0]}
                material={bladeMaterial}
              >
                <boxGeometry args={[0.14, 0.038, 0.008]} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}

/**
 * Smooth Braided Sleeved Liquid Tube / Power Cable
 */
function BraidedTube({ points, radius = 0.022, material }) {
  const tubeGeo = useMemo(() => {
    const vectors = points.map((p) => new THREE.Vector3(...p));
    const curve = new THREE.CatmullRomCurve3(vectors);
    return new THREE.TubeGeometry(curve, 28, radius, 12, false);
  }, [points, radius]);

  return <mesh geometry={tubeGeo} material={material} castShadow />;
}

export default function CapeModel({
  build,
  lcdTexture,
  customBackplateTex,
  rgbPreset,
  fanRpmFactor = 2.2,
  metalness = 0.65,
  roughness = 0.32,
  wireframe = false,
  explodedView = false,
  glassOpen = false,
}) {
  const fanRefs = useRef([]);
  const glassDoorRef = useRef();

  // Component group refs for smooth Exploded View inspection
  const moboGroupRef = useRef();
  const cpuGroupRef = useRef();
  const coolerGroupRef = useRef();
  const gpuGroupRef = useRef();
  const ramGroupRef = useRef();
  const ssdGroupRef = useRef();
  const psuGroupRef = useRef();

  const registerFan = useCallback((idx, el) => {
    if (el) fanRefs.current[idx] = el;
  }, []);

  // High-res Motherboard PCB Texture
  const pcbTexture = useMemo(() => {
    return createMotherboardPcbTexture(
      build.motherboard.pcbColor,
      build.motherboard.accentColor
    );
  }, [build.motherboard.pcbColor, build.motherboard.accentColor]);

  // Realistic Materials (de-saturated, authentic hardware anodized aluminum, brushed steel & matte polymers)
  const caseChassisMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(build.case.chassisColor),
        metalness: Math.min(0.85, metalness),
        roughness: Math.max(0.22, roughness),
        wireframe,
      }),
    [build.case.chassisColor, metalness, roughness, wireframe]
  );

  const caseInteriorMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(build.case.interiorColor),
        metalness: Math.min(0.7, metalness * 0.8),
        roughness: Math.max(0.3, roughness),
        wireframe,
      }),
    [build.case.interiorColor, metalness, roughness, wireframe]
  );

  // Ultra-Clear Architectural Tempered Glass (depthWrite: false + low opacity so internal parts are 100% crisp)
  const ultraClearGlassMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#e2e8f0'),
        transparent: true,
        opacity: wireframe ? 0.25 : 0.055,
        roughness: 0.04,
        metalness: 0.05,
        reflectivity: 0.4,
        depthWrite: false,
        wireframe,
      }),
    [wireframe]
  );

  const moboPcbMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: pcbTexture,
        metalness: 0.3,
        roughness: 0.5,
        wireframe,
      }),
    [pcbTexture, wireframe]
  );

  const moboVrmMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(build.motherboard.vrmColor),
        metalness: 0.78,
        roughness: 0.26,
        wireframe,
      }),
    [build.motherboard.vrmColor, wireframe]
  );

  const brushedNickelMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#cbd5e1'),
        metalness: 0.9,
        roughness: 0.2,
        wireframe,
      }),
    [wireframe]
  );

  const copperMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#c2410c'),
        metalness: 0.88,
        roughness: 0.22,
        wireframe,
      }),
    [wireframe]
  );

  const gpuShroudMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(build.gpu.shroudColor),
        metalness: 0.75,
        roughness: 0.28,
        wireframe,
      }),
    [build.gpu.shroudColor, wireframe]
  );

  const gpuTrimMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(build.gpu.trimColor || '#64748b'),
        metalness: 0.88,
        roughness: 0.2,
        wireframe,
      }),
    [build.gpu.trimColor, wireframe]
  );

  const gpuBackplateMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: customBackplateTex || null,
        color: new THREE.Color(
          customBackplateTex ? '#ffffff' : build.gpu.shroudColor
        ),
        metalness: 0.8,
        roughness: 0.25,
        wireframe,
      }),
    [customBackplateTex, build.gpu.shroudColor, wireframe]
  );

  const ramHeatsinkMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(build.ram.heatsinkColor),
        metalness: 0.82,
        roughness: 0.24,
        wireframe,
      }),
    [build.ram.heatsinkColor, wireframe]
  );

  const coolerBodyMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(build.cooler.radiatorColor),
        metalness: 0.7,
        roughness: 0.3,
        wireframe,
      }),
    [build.cooler.radiatorColor, wireframe]
  );

  const fanFrameMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(build.fans?.fanColor || '#16181f'),
        metalness: 0.55,
        roughness: 0.35,
        wireframe,
      }),
    [build.fans?.fanColor, wireframe]
  );

  const psuBodyMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(build.psu.bodyColor),
        metalness: 0.68,
        roughness: 0.32,
        wireframe,
      }),
    [build.psu.bodyColor, wireframe]
  );

  const lcdScreenMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: lcdTexture || null,
        emissiveMap: lcdTexture || null,
        emissive: new THREE.Color('#ffffff'),
        emissiveIntensity: 0.85,
        roughness: 0.12,
        metalness: 0.1,
        wireframe,
      }),
    [lcdTexture, wireframe]
  );

  // Refined, realistic LED diffuser material (not oversaturated)
  const ledPrimaryMat = useMemo(() => {
    const c = new THREE.Color(rgbPreset?.primary || '#e2e8f0');
    const intensity = rgbPreset?.intensity ?? 0.9;
    return new THREE.MeshStandardMaterial({
      color: c,
      emissive: c,
      emissiveIntensity: intensity,
      roughness: 0.25,
      wireframe,
    });
  }, [rgbPreset, wireframe]);

  const ledSecondaryMat = useMemo(() => {
    const c = new THREE.Color(rgbPreset?.secondary || '#94a3b8');
    const intensity = (rgbPreset?.intensity ?? 0.9) * 0.85;
    return new THREE.MeshStandardMaterial({
      color: c,
      emissive: c,
      emissiveIntensity: intensity,
      roughness: 0.25,
      wireframe,
    });
  }, [rgbPreset, wireframe]);

  const fanBladeMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#cbd5e1'),
      transparent: true,
      opacity: 0.72,
      roughness: 0.25,
      metalness: 0.15,
      wireframe,
    });
  }, [wireframe]);

  // Animation loop: rotate all fans & smoothly animate Exploded View / Glass Panel
  useFrame((_, delta) => {
    const speed = Math.max(0.1, fanRpmFactor) * 4.2;
    for (let i = 0; i < fanRefs.current.length; i++) {
      const f = fanRefs.current[i];
      if (f) f.rotation.z -= delta * speed;
    }

    if (glassDoorRef.current) {
      const targetZ = glassOpen || explodedView ? 1.48 : 0.69;
      const targetRotY = glassOpen ? -0.32 : 0;
      glassDoorRef.current.position.z = THREE.MathUtils.lerp(
        glassDoorRef.current.position.z,
        targetZ,
        0.09
      );
      glassDoorRef.current.rotation.y = THREE.MathUtils.lerp(
        glassDoorRef.current.rotation.y,
        targetRotY,
        0.09
      );
    }

    const exp = explodedView ? 1 : 0;
    const lerp = 0.085;

    if (moboGroupRef.current) {
      moboGroupRef.current.position.z = THREE.MathUtils.lerp(
        moboGroupRef.current.position.z,
        -0.14 + exp * 0.12,
        lerp
      );
    }

    if (cpuGroupRef.current) {
      cpuGroupRef.current.position.z = THREE.MathUtils.lerp(
        cpuGroupRef.current.position.z,
        0.04 + exp * 0.28,
        lerp
      );
    }

    if (coolerGroupRef.current) {
      coolerGroupRef.current.position.z = THREE.MathUtils.lerp(
        coolerGroupRef.current.position.z,
        exp * 0.55,
        lerp
      );
    }

    if (gpuGroupRef.current) {
      // Strictly inside the case (Z = 0.16 when closed, Z = 0.65 only when exploded)
      gpuGroupRef.current.position.z = THREE.MathUtils.lerp(
        gpuGroupRef.current.position.z,
        0.16 + exp * 0.52,
        lerp
      );
    }

    if (ramGroupRef.current) {
      ramGroupRef.current.position.z = THREE.MathUtils.lerp(
        ramGroupRef.current.position.z,
        0.07 + exp * 0.36,
        lerp
      );
    }

    if (ssdGroupRef.current) {
      ssdGroupRef.current.position.z = THREE.MathUtils.lerp(
        ssdGroupRef.current.position.z,
        0.035 + exp * 0.26,
        lerp
      );
    }

    if (psuGroupRef.current) {
      psuGroupRef.current.position.z = THREE.MathUtils.lerp(
        psuGroupRef.current.position.z,
        -0.38 - exp * 0.35,
        lerp
      );
    }
  });

  // GPU dimensions strictly scaled to fit inside the ATX chamber with generous front fan clearance
  const gpuLen = 1.24 * (build.gpu.lengthScale || 1.0);
  const isFoundersGpu = build.gpu.id === 'nvidia_rtx_5080_fe';

  return (
    <group position={[0, 0.02, 0]} name="PC_Hardware_Rig_Root">
      {/* =================================================================
          1. REALISTIC DUAL-CHAMBER / ATX CASE CHASSIS (HYTE Y70 / O11 / NZXT / 4000D)
          Dimensions: X [-1.10 to +1.10], Y [-1.32 to +1.32], Z [-0.68 to +0.68]
         ================================================================= */}
      <group name="Case_Chassis">
        {/* Bottom Base Chassis */}
        <mesh position={[0, -1.3, 0]} material={caseChassisMat} castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.07, 1.38]} />
        </mesh>

        {/* Bottom Intake Dust Filter & 3 Bottom Fans */}
        {[-0.52, 0, 0.52].map((xPos, idx) => (
          <CaseFan120
            key={`bot_fan_${idx}`}
            position={[xPos - 0.12, -1.22, 0.18]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={0.92}
            frameMaterial={fanFrameMat}
            bladeMaterial={fanBladeMat}
            ledMaterial={ledSecondaryMat}
            onRegisterFan={registerFan}
            fanIndex={10 + idx}
          />
        ))}

        {/* 4 Machined Case Feet */}
        {[
          [-0.95, -1.38, -0.55],
          [0.95, -1.38, -0.55],
          [-0.95, -1.38, 0.55],
          [0.95, -1.38, 0.55],
        ].map((pos, idx) => (
          <mesh key={idx} position={pos} material={caseInteriorMat} castShadow>
            <cylinderGeometry args={[0.09, 0.1, 0.08, 24]} />
          </mesh>
        ))}

        {/* Top Roof Chassis + Ventilated Mesh Cutout */}
        <mesh position={[0, 1.3, 0]} material={caseChassisMat} castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.06, 1.38]} />
        </mesh>

        {/* Rear Spine Wall (behind motherboard tray) */}
        <mesh position={[0, 0, -0.67]} material={caseChassisMat} castShadow receiveShadow>
          <boxGeometry args={[2.2, 2.56, 0.04]} />
        </mesh>

        {/* Internal Dual-Chamber Motherboard Tray Partition (at Z = -0.18) */}
        <mesh position={[-0.22, 0, -0.18]} material={caseInteriorMat} castShadow receiveShadow>
          <boxGeometry args={[1.72, 2.52, 0.04]} />
        </mesh>

        {/* Rubber Cable Routing Grommets on Motherboard Tray */}
        {[0.45, -0.05, -0.55].map((yPos, idx) => (
          <mesh key={idx} position={[0.42, yPos, -0.155]} material={caseChassisMat}>
            <boxGeometry args={[0.11, 0.32, 0.02]} />
          </mesh>
        ))}

        {/* Recessed Side Fan Mounting Bracket (at Z = -0.34, X = +0.76) */}
        <mesh position={[0.76, 0, -0.36]} material={caseInteriorMat}>
          <boxGeometry args={[0.56, 2.52, 0.04]} />
        </mesh>

        {/* 3x Side Intake 120mm Fans (Lian Li UNI FAN SL-INF) */}
        {[-0.56, 0, 0.56].map((yPos, idx) => (
          <CaseFan120
            key={`side_fan_${idx}`}
            position={[0.76, yPos, -0.31]}
            rotation={[0, 0, 0]}
            scale={0.94}
            frameMaterial={fanFrameMat}
            bladeMaterial={fanBladeMat}
            ledMaterial={ledPrimaryMat}
            onRegisterFan={registerFan}
            fanIndex={idx + 1}
          />
        ))}

        {/* Rear Exhaust Wall (Left at X = -1.08) + PCIe Expansion Slot Brackets */}
        <mesh position={[-1.08, 0, 0]} material={caseChassisMat} castShadow receiveShadow>
          <boxGeometry args={[0.05, 2.56, 1.38]} />
        </mesh>

        {/* Rear 120mm Exhaust Fan */}
        <CaseFan120
          position={[-1.02, 0.52, 0.18]}
          rotation={[0, Math.PI / 2, 0]}
          scale={0.92}
          frameMaterial={fanFrameMat}
          bladeMaterial={fanBladeMat}
          ledMaterial={ledPrimaryMat}
          onRegisterFan={registerFan}
          fanIndex={0}
        />

        {/* Front Panel: Either Perforated Airflow Mesh (4000D) OR Crystal-Clear Panoramic Glass (Y70 / O11 / H9) */}
        {build.case.style === 'mesh_airflow' ? (
          <group position={[1.08, 0, 0]}>
            <mesh material={caseChassisMat} castShadow>
              <boxGeometry args={[0.05, 2.56, 1.38]} />
            </mesh>
            <mesh position={[0.03, 0, 0]} material={caseInteriorMat}>
              <boxGeometry args={[0.015, 2.36, 1.18]} />
            </mesh>
          </group>
        ) : (
          /* Ultra-Clear Front Tempered Glass + Thin Top/Bottom Metal Bezels */
          <group position={[1.08, 0, 0]}>
            <mesh material={ultraClearGlassMat}>
              <boxGeometry args={[0.02, 2.52, 1.34]} />
            </mesh>
            <mesh position={[0, 1.24, 0]} material={caseChassisMat}>
              <boxGeometry args={[0.03, 0.06, 1.36]} />
            </mesh>
            <mesh position={[0, -1.24, 0]} material={caseChassisMat}>
              <boxGeometry args={[0.03, 0.06, 1.36]} />
            </mesh>
            {/* HYTE Y70 Signature Chamfered Corner Pillar Trim */}
            {build.case.style === 'panoramic_3piece' && (
              <mesh position={[-0.02, -0.82, 0.66]} material={caseChassisMat}>
                <boxGeometry args={[0.08, 0.85, 0.08]} />
              </mesh>
            )}
          </group>
        )}

        {/* Side Tempered Glass Window (Ultra-Clear so all internal components are 100% sharp) */}
        <group ref={glassDoorRef} position={[0, 0, 0.69]}>
          <mesh material={ultraClearGlassMat}>
            <boxGeometry args={[2.16, 2.52, 0.02]} />
          </mesh>
          {/* Thin Top & Bottom Structural Glass Bezels */}
          <mesh position={[0, 1.24, 0]} material={caseChassisMat}>
            <boxGeometry args={[2.18, 0.06, 0.028]} />
          </mesh>
          <mesh position={[0, -1.24, 0]} material={caseChassisMat}>
            <boxGeometry args={[2.18, 0.06, 0.028]} />
          </mesh>
        </group>
      </group>

      {/* =================================================================
          2. REALISTIC ATX MOTHERBOARD (ROG Crosshair / MPG Carbon / AORUS ICE / Z890)
         ================================================================= */}
      <group ref={moboGroupRef} position={[-0.32, 0.16, -0.14]} name="Motherboard_Assembly">
        {/* 8-Layer ATX PCB */}
        <mesh material={moboPcbMat} castShadow receiveShadow>
          <boxGeometry args={[1.26, 1.54, 0.035]} />
        </mesh>

        {/* Massive Left I/O VRM Armor Shroud + Polymo / Dragon Display */}
        <mesh position={[-0.48, 0.34, 0.075]} material={moboVrmMat} castShadow>
          <boxGeometry args={[0.25, 0.78, 0.11]} />
        </mesh>
        <mesh position={[-0.44, 0.34, 0.132]} material={ledPrimaryMat}>
          <boxGeometry args={[0.09, 0.42, 0.008]} />
        </mesh>

        {/* Top VRM Heatsink Fin Block + Heatpipe */}
        <mesh position={[-0.06, 0.65, 0.065]} material={moboVrmMat} castShadow>
          <boxGeometry args={[0.56, 0.16, 0.09]} />
        </mesh>

        {/* 2x 8-Pin EPS CPU Power Headers at Top-Left */}
        <mesh position={[-0.48, 0.72, 0.04]} material={caseInteriorMat}>
          <boxGeometry args={[0.18, 0.05, 0.05]} />
        </mesh>

        {/* Lower M.2 Thermal Armor Plate & Chipset Heatsink */}
        <mesh position={[0.08, -0.44, 0.045]} material={moboVrmMat} castShadow>
          <boxGeometry args={[0.88, 0.42, 0.05]} />
        </mesh>
        <mesh position={[0.32, -0.44, 0.072]} material={ledSecondaryMat}>
          <boxGeometry args={[0.28, 0.025, 0.008]} />
        </mesh>

        {/* Steel-Armored PCIe 5.0 x16 Slots */}
        <mesh position={[-0.08, -0.12, 0.035]} material={brushedNickelMat}>
          <boxGeometry args={[0.68, 0.038, 0.038]} />
        </mesh>
        <mesh position={[-0.08, -0.58, 0.035]} material={brushedNickelMat}>
          <boxGeometry args={[0.68, 0.038, 0.038]} />
        </mesh>

        {/* 24-Pin ATX Power Header + Braided Cable Routing into Grommet */}
        <mesh position={[0.56, 0.22, 0.045]} material={caseInteriorMat}>
          <boxGeometry args={[0.055, 0.3, 0.06]} />
        </mesh>
        <BraidedTube
          points={[
            [0.58, 0.22, 0.06],
            [0.68, 0.22, 0.08],
            [0.74, 0.22, -0.04],
          ]}
          radius={0.036}
          material={caseChassisMat}
        />

        {/* Rear Audio Capacitors & CMOS Battery */}
        <mesh position={[-0.28, -0.68, 0.025]} rotation={[Math.PI / 2, 0, 0]} material={brushedNickelMat}>
          <cylinderGeometry args={[0.045, 0.045, 0.015, 20]} />
        </mesh>

        {/* ===============================================================
            3. PROCESSOR (AMD AM5 / Intel LGA Socket + Precision IHS)
           =============================================================== */}
        <group ref={cpuGroupRef} position={[-0.06, 0.34, 0.04]} name="CPU_Processor">
          {/* Socket ILM Retention Mechanism */}
          <mesh material={brushedNickelMat}>
            <boxGeometry args={[0.33, 0.35, 0.02]} />
          </mesh>
          {/* Green/Teal CPU Package PCB */}
          <mesh position={[0, 0, 0.015]}>
            <boxGeometry args={[0.27, 0.27, 0.012]} />
            <meshStandardMaterial color="#0f766e" roughness={0.45} metalness={0.3} wireframe={wireframe} />
          </mesh>
          {/* Nickel-Plated Copper Integrated Heat Spreader (IHS) */}
          <mesh position={[0, 0, 0.028]} material={brushedNickelMat} castShadow>
            <boxGeometry
              args={
                build.cpu.brand === 'Intel'
                  ? [0.21, 0.26, 0.018]
                  : [0.23, 0.23, 0.018]
              }
            />
          </mesh>
        </group>

        {/* ===============================================================
            4. DDR5 RAM MODULES (G.Skill Trident Z5 / Corsair Dominator)
           =============================================================== */}
        <group ref={ramGroupRef} position={[0.31, 0.34, 0.07]} name="RAM_Modules">
          {[0, 1, 2, 3].map((slotIdx) => {
            const isPopulated =
              build.ram.sticks === 4 || slotIdx === 1 || slotIdx === 3;
            const xOffset = (slotIdx - 1.5) * 0.062;

            return (
              <group key={slotIdx} position={[xOffset, 0, 0]}>
                {/* DIMM Slot Latches */}
                <mesh position={[0, 0, -0.045]} material={caseInteriorMat}>
                  <boxGeometry args={[0.022, 0.44, 0.028]} />
                </mesh>

                {isPopulated && (
                  <group position={[0, 0, 0.02]}>
                    {/* Anodized Aluminum Heatspreader */}
                    <mesh material={ramHeatsinkMat} castShadow>
                      <boxGeometry args={[0.032, 0.42, 0.11]} />
                    </mesh>
                    {/* Refined Top Diffused RGB Bar */}
                    <mesh
                      position={[0, 0, 0.06]}
                      material={slotIdx % 2 === 0 ? ledPrimaryMat : ledSecondaryMat}
                    >
                      <boxGeometry args={[0.033, 0.425, 0.018]} />
                    </mesh>
                  </group>
                )}
              </group>
            );
          })}
        </group>

        {/* ===============================================================
            5. STORAGE (Samsung 990 PRO / WD_BLACK SN850X M.2 NVMe SSDs)
           =============================================================== */}
        <group ref={ssdGroupRef} position={[-0.08, -0.26, 0.035]} name="NVMe_Storage">
          {/* Primary PCIe 5.0 M.2 Heatsink */}
          <mesh material={coolerBodyMat} castShadow>
            <boxGeometry args={[0.46, 0.12, 0.04]} />
          </mesh>
          <mesh position={[0, 0, 0.022]} material={ledPrimaryMat}>
            <boxGeometry args={[0.34, 0.015, 0.008]} />
          </mesh>

          {build.storage.dualDrive && (
            <group position={[0, -0.22, 0]}>
              <mesh material={coolerBodyMat} castShadow>
                <boxGeometry args={[0.46, 0.12, 0.04]} />
              </mesh>
              <mesh position={[0, 0, 0.022]} material={ledSecondaryMat}>
                <boxGeometry args={[0.34, 0.015, 0.008]} />
              </mesh>
            </group>
          )}
        </group>
      </group>

      {/* =================================================================
          6. CPU COOLER (NZXT Kraken / Lian Li Galahad 360 AIO OR Noctua NH-D15)
         ================================================================= */}
      <group ref={coolerGroupRef} name="CPU_Cooler_Assembly">
        {build.cooler.type === 'aio_360' ? (
          <group>
            {/* Asetek 8th-Gen Pump Block on CPU Socket with 2.36" LCD Display */}
            <group position={[-0.38, 0.5, -0.02]}>
              <mesh
                rotation={[Math.PI / 2, 0, 0]}
                material={coolerBodyMat}
                castShadow
              >
                <cylinderGeometry args={[0.165, 0.175, 0.15, 36]} />
              </mesh>
              {/* Subtle Chamfered Bezel Ring */}
              <mesh position={[0, 0, 0.077]} material={ledPrimaryMat}>
                <ringGeometry args={[0.145, 0.16, 36]} />
              </mesh>
              {/* High-Contrast Live Telemetry LCD Screen */}
              <mesh position={[0, 0, 0.078]} material={lcdScreenMat}>
                <circleGeometry args={[0.142, 36]} />
              </mesh>
            </group>

            {/* Top-Mounted 360mm Aluminum Radiator + 3x 120mm Fans */}
            <group position={[-0.12, 1.18, 0.18]}>
              <mesh material={coolerBodyMat} castShadow>
                <boxGeometry args={[1.56, 0.095, 0.5]} />
              </mesh>
              {[-0.5, 0, 0.5].map((xPos, idx) => (
                <CaseFan120
                  key={`rad_fan_${idx}`}
                  position={[xPos, -0.08, 0]}
                  rotation={[Math.PI / 2, 0, 0]}
                  scale={0.94}
                  frameMaterial={coolerBodyMat}
                  bladeMaterial={fanBladeMat}
                  ledMaterial={ledPrimaryMat}
                  onRegisterFan={registerFan}
                  fanIndex={4 + idx}
                />
              ))}
            </group>

            {/* Realistic Nylon-Braided Liquid Cooling Tubes with Rotary Fittings */}
            <BraidedTube
              points={[
                [-0.24, 0.5, 0.01],
                [0.08, 0.54, 0.22],
                [0.32, 0.82, 0.26],
                [0.44, 1.12, 0.22],
              ]}
              radius={0.024}
              material={caseInteriorMat}
            />
            <BraidedTube
              points={[
                [-0.28, 0.42, 0.01],
                [0.04, 0.45, 0.28],
                [0.26, 0.76, 0.31],
                [0.35, 1.12, 0.26],
              ]}
              radius={0.024}
              material={caseInteriorMat}
            />
          </group>
        ) : (
          /* Noctua NH-D15 chromax.black Dual-Tower 8-Heatpipe Air Cooler */
          <group position={[-0.38, 0.5, 0.08]}>
            {/* Left & Right Fin Stack Towers */}
            <mesh position={[-0.14, 0, 0]} material={coolerBodyMat} castShadow>
              <boxGeometry args={[0.15, 0.42, 0.36]} />
            </mesh>
            <mesh position={[0.14, 0, 0]} material={coolerBodyMat} castShadow>
              <boxGeometry args={[0.15, 0.42, 0.36]} />
            </mesh>
            {/* 6 Soldered Heatpipe Terminations per Tower */}
            {[-0.13, -0.05, 0.03, 0.11].map((zOff, idx) => (
              <group key={idx}>
                <mesh position={[-0.14, 0, zOff]} material={brushedNickelMat}>
                  <cylinderGeometry args={[0.014, 0.014, 0.45, 12]} />
                </mesh>
                <mesh position={[0.14, 0, zOff]} material={brushedNickelMat}>
                  <cylinderGeometry args={[0.014, 0.014, 0.45, 12]} />
                </mesh>
              </group>
            ))}
            {/* Dual 140mm PWM Fans between & in front of Fin Towers */}
            <CaseFan120
              position={[0, 0, 0]}
              rotation={[0, Math.PI / 2, 0]}
              scale={0.8}
              frameMaterial={coolerBodyMat}
              bladeMaterial={fanBladeMat}
              ledMaterial={ledSecondaryMat}
              onRegisterFan={registerFan}
              fanIndex={4}
            />
            <CaseFan120
              position={[0.26, 0, 0]}
              rotation={[0, Math.PI / 2, 0]}
              scale={0.8}
              frameMaterial={coolerBodyMat}
              bladeMaterial={fanBladeMat}
              ledMaterial={ledSecondaryMat}
              onRegisterFan={registerFan}
              fanIndex={5}
            />
          </group>
        )}
      </group>

      {/* =================================================================
          7. GRAPHICS CARD (ROG Astral RTX 5090 / RTX 5080 FE / Sapphire NITRO+ / AERO)
          Mounted strictly inside the ATX chamber onto the PCIe 5.0 x16 slot
         ================================================================= */}
      <group ref={gpuGroupRef} position={[-0.36, -0.02, 0.16]} name="GPU_Graphics_Card">
        {/* Main Die-Cast Metal Shroud Frame */}
        <mesh material={gpuShroudMat} castShadow receiveShadow>
          <boxGeometry
            args={[
              gpuLen,
              isFoundersGpu ? 0.13 : 0.19,
              0.48,
            ]}
          />
        </mesh>

        {/* Brushed Metal Structural Frame Band */}
        <mesh position={[0, 0, 0.244]} material={gpuTrimMat}>
          <boxGeometry args={[gpuLen * 0.98, 0.045, 0.012]} />
        </mesh>

        {/* Full-Length Metal Backplate (with flow-through vents & custom image support) */}
        <mesh
          position={[0, isFoundersGpu ? 0.07 : 0.1, 0]}
          material={gpuBackplateMat}
          castShadow
        >
          <boxGeometry args={[gpuLen * 0.99, 0.012, 0.47]} />
        </mesh>

        {/* Dense Aluminum Fin Array + Nickel Heatpipes visible from the side */}
        <mesh position={[0, 0, 0]} material={brushedNickelMat}>
          <boxGeometry args={[gpuLen * 0.94, 0.11, 0.49]} />
        </mesh>
        {[-0.12, 0, 0.12].map((zOff, idx) => (
          <mesh
            key={idx}
            position={[0, 0, zOff]}
            rotation={[0, 0, Math.PI / 2]}
            material={copperMat}
          >
            <cylinderGeometry args={[0.012, 0.012, gpuLen * 0.96, 12]} />
          </mesh>
        ))}

        {/* Refined Side LED Accent Strip (ROG Astral / Sapphire NITRO+ light bar) */}
        <mesh position={[0, 0.045, 0.246]} material={ledPrimaryMat}>
          <boxGeometry args={[gpuLen * 0.82, 0.02, 0.01]} />
        </mesh>

        {/* Rear PCIe Dual/Triple Slot Steel I/O Bracket anchored to Case Rear Wall */}
        <mesh position={[-gpuLen / 2 - 0.02, -0.02, 0]} material={brushedNickelMat}>
          <boxGeometry args={[0.03, 0.24, 0.46]} />
        </mesh>

        {/* 16-Pin 12V-2x6 Braided Power Cable cleanly routed down to Motherboard Tray */}
        <BraidedTube
          points={[
            [gpuLen * 0.28, 0.02, 0.25],
            [gpuLen * 0.28, -0.14, 0.3],
            [gpuLen * 0.25, -0.35, 0.12],
            [gpuLen * 0.22, -0.45, -0.14],
          ]}
          radius={0.024}
          material={caseChassisMat}
        />

        {/* 3x Axial-Tech Downward GPU Cooling Fans */}
        {[-0.36, 0, 0.36].map((xNorm, idx) => (
          <CaseFan120
            key={`gpu_fan_${idx}`}
            position={[xNorm * gpuLen * 0.92, isFoundersGpu ? -0.07 : -0.1, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.62}
            frameMaterial={gpuShroudMat}
            bladeMaterial={fanBladeMat}
            ledMaterial={ledSecondaryMat}
            onRegisterFan={registerFan}
            fanIndex={7 + idx}
          />
        ))}
      </group>

      {/* =================================================================
          8. POWER SUPPLY (ASUS ROG Thor 1200W / Corsair RM1000x in Dual-Chamber)
         ================================================================= */}
      <group ref={psuGroupRef} position={[-0.58, -0.68, -0.38]} name="PSU_Power_Supply">
        <mesh material={psuBodyMat} castShadow receiveShadow>
          <boxGeometry args={[0.64, 0.42, 0.44]} />
        </mesh>
        {/* ROG Thor OLED Wattage Panel visible through chamber cutout */}
        <mesh position={[0, 0, 0.225]} material={lcdScreenMat}>
          <planeGeometry args={[0.34, 0.2]} />
        </mesh>
      </group>
    </group>
  );
}
