import React, { useMemo, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createMotherboardPcbTexture } from '../utils/textureGenerator';

/**
 * Reusable ARGB 120mm Fan with 7 angled blades, infinity mirror hub & glowing halo ring.
 */
function ArgbFan({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  frameMaterial,
  bladeMaterial,
  rgbPrimaryMaterial,
  onRegisterFan,
  fanIndex,
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Outer Square Frame */}
      <mesh material={frameMaterial} castShadow receiveShadow>
        <boxGeometry args={[0.52, 0.52, 0.08]} />
      </mesh>

      {/* Outer ARGB Halo Ring */}
      <mesh position={[0, 0, 0.042]} material={rgbPrimaryMaterial}>
        <ringGeometry args={[0.21, 0.24, 28]} />
      </mesh>
      <mesh position={[0, 0, -0.042]} rotation={[0, Math.PI, 0]} material={rgbPrimaryMaterial}>
        <ringGeometry args={[0.21, 0.24, 28]} />
      </mesh>

      {/* Spinning Rotor Hub + 7 Blades */}
      <group ref={(el) => onRegisterFan(fanIndex, el)}>
        {/* Center Infinity Hub */}
        <mesh rotation={[Math.PI / 2, 0, 0]} material={frameMaterial}>
          <cylinderGeometry args={[0.075, 0.075, 0.085, 20]} />
        </mesh>
        <mesh position={[0, 0, 0.045]} material={rgbPrimaryMaterial}>
          <circleGeometry args={[0.055, 20]} />
        </mesh>

        {/* 7 Fan Blades */}
        {Array.from({ length: 7 }).map((_, idx) => {
          const angle = (idx / 7) * Math.PI * 2;
          return (
            <group key={idx} rotation={[0, 0, angle]}>
              <mesh
                position={[0.13, 0, 0]}
                rotation={[0.42, 0.15, 0]}
                material={bladeMaterial}
              >
                <boxGeometry args={[0.15, 0.045, 0.015]} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}

/**
 * Braided AIO Liquid Cooling Tubes using CatmullRomCurve3
 */
function BraidedTube({ start, mid1, mid2, end, material }) {
  const tubeGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...start),
      new THREE.Vector3(...mid1),
      new THREE.Vector3(...mid2),
      new THREE.Vector3(...end),
    ]);
    return new THREE.TubeGeometry(curve, 24, 0.028, 12, false);
  }, [start, mid1, mid2, end]);

  return <mesh geometry={tubeGeo} material={material} castShadow />;
}

export default function CapeModel({
  build,
  lcdTexture,
  customBackplateTex,
  rgbPreset,
  fanRpmFactor = 2.4,
  metalness = 0.72,
  roughness = 0.26,
  wireframe = false,
  explodedView = false,
  glassOpen = false,
  focusedCategory = null,
}) {
  const rigGroupRef = useRef();
  const fanRefs = useRef([]);
  const glassDoorRef = useRef();

  // Refs for exploded-view smooth lerp animation
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

  // Procedural Motherboard PCB Texture
  const pcbTexture = useMemo(() => {
    return createMotherboardPcbTexture(
      build.motherboard.pcbColor,
      build.motherboard.accentColor
    );
  }, [build.motherboard.pcbColor, build.motherboard.accentColor]);

  // Materials
  const caseChassisMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(build.case.chassisColor),
        metalness: Math.min(1, metalness),
        roughness: Math.max(0.12, roughness),
        wireframe,
      }),
    [build.case.chassisColor, metalness, roughness, wireframe]
  );

  const caseInteriorMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(build.case.interiorColor),
        metalness: Math.min(1, metalness * 0.8),
        roughness: Math.max(0.2, roughness),
        wireframe,
      }),
    [build.case.interiorColor, metalness, roughness, wireframe]
  );

  const temperedGlassMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(build.case.glassTint),
        transparent: true,
        opacity: wireframe ? 0.35 : 0.16,
        roughness: 0.05,
        metalness: 0.1,
        reflectivity: 0.9,
        wireframe,
      }),
    [build.case.glassTint, wireframe]
  );

  const moboPcbMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: pcbTexture,
        metalness: 0.35,
        roughness: 0.45,
        wireframe,
      }),
    [pcbTexture, wireframe]
  );

  const moboVrmMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(build.motherboard.vrmColor),
        metalness: Math.min(1, metalness + 0.1),
        roughness: Math.max(0.15, roughness * 0.8),
        wireframe,
      }),
    [build.motherboard.vrmColor, metalness, roughness, wireframe]
  );

  const cpuIhsMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#cbd5e1'),
        metalness: 0.92,
        roughness: 0.18,
        wireframe,
      }),
    [wireframe]
  );

  const gpuShroudMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(build.gpu.shroudColor),
        metalness: Math.min(1, metalness),
        roughness: Math.max(0.15, roughness),
        wireframe,
      }),
    [build.gpu.shroudColor, metalness, roughness, wireframe]
  );

  const gpuBackplateMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: customBackplateTex || null,
        color: new THREE.Color(
          customBackplateTex ? '#ffffff' : build.gpu.shroudColor
        ),
        metalness: 0.78,
        roughness: 0.25,
        wireframe,
      }),
    [customBackplateTex, build.gpu.shroudColor, wireframe]
  );

  const ramHeatsinkMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(build.ram.heatsinkColor),
        metalness: 0.85,
        roughness: 0.2,
        wireframe,
      }),
    [build.ram.heatsinkColor, wireframe]
  );

  const coolerBodyMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(build.cooler.radiatorColor),
        metalness: 0.75,
        roughness: 0.28,
        wireframe,
      }),
    [build.cooler.radiatorColor, wireframe]
  );

  const psuBodyMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(build.psu.bodyColor),
        metalness: 0.7,
        roughness: 0.3,
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
        emissiveIntensity: 0.95,
        roughness: 0.1,
        metalness: 0.1,
        wireframe,
      }),
    [lcdTexture, wireframe]
  );

  const rgbPrimaryMat = useMemo(() => {
    const c = new THREE.Color(rgbPreset?.primary || '#06b6d4');
    return new THREE.MeshStandardMaterial({
      color: c,
      emissive: c,
      emissiveIntensity: 2.1,
      roughness: 0.2,
      wireframe,
    });
  }, [rgbPreset, wireframe]);

  const rgbSecondaryMat = useMemo(() => {
    const c = new THREE.Color(rgbPreset?.secondary || '#ec4899');
    return new THREE.MeshStandardMaterial({
      color: c,
      emissive: c,
      emissiveIntensity: 2.0,
      roughness: 0.2,
      wireframe,
    });
  }, [rgbPreset, wireframe]);

  const translucentBladeMat = useMemo(() => {
    const c = new THREE.Color(rgbPreset?.primary || '#22d3ee');
    return new THREE.MeshStandardMaterial({
      color: c,
      emissive: c,
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.75,
      roughness: 0.2,
      wireframe,
    });
  }, [rgbPreset, wireframe]);

  const copperHeatpipeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#d97706'),
        metalness: 0.92,
        roughness: 0.18,
        wireframe,
      }),
    [wireframe]
  );

  // Real-time animation loop: spin all fans, animate exploded view & side glass panel
  useFrame((state, delta) => {
    const speed = Math.max(0.2, fanRpmFactor) * 4.5;
    for (let i = 0; i < fanRefs.current.length; i++) {
      const f = fanRefs.current[i];
      if (f) {
        f.rotation.z -= delta * speed;
      }
    }

    // Smoothly open/close the Tempered Glass Side Panel
    if (glassDoorRef.current) {
      const targetZ = glassOpen || explodedView ? 1.55 : 0.68;
      const targetRotY = glassOpen ? -0.35 : 0;
      glassDoorRef.current.position.z = THREE.MathUtils.lerp(
        glassDoorRef.current.position.z,
        targetZ,
        0.08
      );
      glassDoorRef.current.rotation.y = THREE.MathUtils.lerp(
        glassDoorRef.current.rotation.y,
        targetRotY,
        0.08
      );
    }

    // Smooth Exploded View & Category Highlight offsets
    const exp = explodedView ? 1 : 0;
    const lerpSpeed = 0.08;

    if (moboGroupRef.current) {
      const focusBoost = focusedCategory === 'motherboard' ? 0.18 : 0;
      moboGroupRef.current.position.z = THREE.MathUtils.lerp(
        moboGroupRef.current.position.z,
        -0.44 + exp * 0.15 + focusBoost,
        lerpSpeed
      );
    }

    if (cpuGroupRef.current) {
      const focusBoost = focusedCategory === 'cpu' ? 0.32 : 0;
      cpuGroupRef.current.position.z = THREE.MathUtils.lerp(
        cpuGroupRef.current.position.z,
        0.05 + exp * 0.38 + focusBoost,
        lerpSpeed
      );
    }

    if (coolerGroupRef.current) {
      const focusBoost = focusedCategory === 'cooler' ? 0.35 : 0;
      coolerGroupRef.current.position.z = THREE.MathUtils.lerp(
        coolerGroupRef.current.position.z,
        0 + exp * 0.68 + focusBoost,
        lerpSpeed
      );
    }

    if (gpuGroupRef.current) {
      const focusBoost = focusedCategory === 'gpu' ? 0.35 : 0;
      gpuGroupRef.current.position.z = THREE.MathUtils.lerp(
        gpuGroupRef.current.position.z,
        0.22 + exp * 0.85 + focusBoost,
        lerpSpeed
      );
    }

    if (ramGroupRef.current) {
      const focusBoost = focusedCategory === 'ram' ? 0.3 : 0;
      ramGroupRef.current.position.z = THREE.MathUtils.lerp(
        ramGroupRef.current.position.z,
        0.08 + exp * 0.48 + focusBoost,
        lerpSpeed
      );
    }

    if (ssdGroupRef.current) {
      const focusBoost = focusedCategory === 'storage' ? 0.28 : 0;
      ssdGroupRef.current.position.z = THREE.MathUtils.lerp(
        ssdGroupRef.current.position.z,
        0.04 + exp * 0.35 + focusBoost,
        lerpSpeed
      );
    }

    if (psuGroupRef.current) {
      const focusBoost = focusedCategory === 'psu' ? 0.3 : 0;
      psuGroupRef.current.position.x = THREE.MathUtils.lerp(
        psuGroupRef.current.position.x,
        -0.35 - exp * 0.45,
        lerpSpeed
      );
      psuGroupRef.current.position.z = THREE.MathUtils.lerp(
        psuGroupRef.current.position.z,
        0.05 + focusBoost,
        lerpSpeed
      );
    }
  });

  const gpuLen = 1.38 * (build.gpu.lengthScale || 1.0);

  return (
    <group ref={rigGroupRef} position={[0, 0.05, 0]}>
      {/* =================================================================
          1. PC CASE CHASSIS (ATX Panoramic / Mesh Tower)
         ================================================================= */}
      <group>
        {/* Bottom Base Plate */}
        <mesh position={[0, -1.32, 0]} material={caseChassisMat} castShadow receiveShadow>
          <boxGeometry args={[2.16, 0.08, 1.42]} />
        </mesh>

        {/* 4 Case Feet */}
        {[
          [-0.92, -1.4, -0.56],
          [0.92, -1.4, -0.56],
          [-0.92, -1.4, 0.56],
          [0.92, -1.4, 0.56],
        ].map((pos, idx) => (
          <mesh key={idx} position={pos} material={caseInteriorMat} castShadow>
            <cylinderGeometry args={[0.09, 0.11, 0.08, 16]} />
          </mesh>
        ))}

        {/* Top Roof Panel */}
        <mesh position={[0, 1.32, 0]} material={caseChassisMat} castShadow receiveShadow>
          <boxGeometry args={[2.16, 0.07, 1.42]} />
        </mesh>

        {/* Back Motherboard Tray Wall */}
        <mesh position={[0, 0, -0.56]} material={caseInteriorMat} castShadow receiveShadow>
          <boxGeometry args={[2.12, 2.58, 0.06]} />
        </mesh>

        {/* Rear Exhaust Wall */}
        <mesh position={[-1.05, 0, 0]} material={caseChassisMat} castShadow receiveShadow>
          <boxGeometry args={[0.06, 2.58, 1.4]} />
        </mesh>

        {/* Bottom PSU Shroud Chamber */}
        <mesh position={[-0.22, -0.98, 0.04]} material={caseInteriorMat} castShadow receiveShadow>
          <boxGeometry args={[1.64, 0.6, 1.24]} />
        </mesh>
        {/* Shroud RGB Underglow Accent Strip */}
        <mesh position={[-0.22, -0.68, 0.665]} material={rgbPrimaryMat}>
          <boxGeometry args={[1.62, 0.025, 0.02]} />
        </mesh>

        {/* Front Panel (Panoramic Glass OR Perforated Stealth Mesh) */}
        {build.case.style === 'mesh_stealth' ? (
          <group position={[1.05, 0, 0]}>
            <mesh material={caseChassisMat} castShadow>
              <boxGeometry args={[0.07, 2.58, 1.4]} />
            </mesh>
            {/* Front Vertical ARGB Accent Bars */}
            <mesh position={[0.04, 0, 0.55]} material={rgbPrimaryMat}>
              <boxGeometry args={[0.02, 2.35, 0.03]} />
            </mesh>
            <mesh position={[0.04, 0, -0.55]} material={rgbSecondaryMat}>
              <boxGeometry args={[0.02, 2.35, 0.03]} />
            </mesh>
          </group>
        ) : (
          /* Panoramic Front Glass Panel */
          <mesh position={[1.06, 0, 0]} material={temperedGlassMat}>
            <boxGeometry args={[0.03, 2.56, 1.36]} />
          </mesh>
        )}

        {/* Side Tempered Glass Door (Interactive Open/Close) */}
        <group ref={glassDoorRef} position={[0, 0, 0.68]}>
          <mesh material={temperedGlassMat}>
            <boxGeometry args={[2.1, 2.56, 0.03]} />
          </mesh>
          {/* Top & Bottom Black/White Bezels on Glass */}
          <mesh position={[0, 1.24, 0.01]} material={caseChassisMat}>
            <boxGeometry args={[2.1, 0.08, 0.035]} />
          </mesh>
          <mesh position={[0, -1.24, 0.01]} material={caseChassisMat}>
            <boxGeometry args={[2.1, 0.08, 0.035]} />
          </mesh>
        </group>

        {/* Rear Exhaust 120mm ARGB Fan */}
        <ArgbFan
          position={[-0.98, 0.56, 0.05]}
          rotation={[0, Math.PI / 2, 0]}
          scale={0.95}
          frameMaterial={caseInteriorMat}
          bladeMaterial={translucentBladeMat}
          rgbPrimaryMaterial={rgbPrimaryMat}
          onRegisterFan={registerFan}
          fanIndex={0}
        />

        {/* 3x Side/Front Intake 120mm ARGB Fans */}
        {[-0.65, 0, 0.65].map((yPos, idx) => (
          <ArgbFan
            key={idx}
            position={[0.74, yPos, -0.45]}
            rotation={[0, 0, 0]}
            scale={0.92}
            frameMaterial={caseInteriorMat}
            bladeMaterial={translucentBladeMat}
            rgbPrimaryMaterial={idx % 2 === 0 ? rgbPrimaryMat : rgbSecondaryMat}
            onRegisterFan={registerFan}
            fanIndex={idx + 1}
          />
        ))}
      </group>

      {/* =================================================================
          2. MOTHERBOARD (ATX PCB, VRM Heatsinks, I/O Shield, PCIe Slots)
         ================================================================= */}
      <group ref={moboGroupRef} position={[-0.26, 0.22, -0.44]}>
        {/* Main ATX PCB Board */}
        <mesh material={moboPcbMat} castShadow receiveShadow>
          <boxGeometry args={[1.28, 1.56, 0.04]} />
        </mesh>

        {/* Rear I/O Armor Shroud + RGB Strip */}
        <mesh position={[-0.5, 0.36, 0.09]} material={moboVrmMat} castShadow>
          <boxGeometry args={[0.24, 0.76, 0.14]} />
        </mesh>
        <mesh position={[-0.42, 0.36, 0.165]} material={rgbSecondaryMat}>
          <boxGeometry args={[0.06, 0.62, 0.015]} />
        </mesh>

        {/* Top VRM Heatsink Block */}
        <mesh position={[-0.08, 0.66, 0.07]} material={moboVrmMat} castShadow>
          <boxGeometry args={[0.56, 0.16, 0.11]} />
        </mesh>

        {/* Chipset Heatsink (Bottom Right of Mobo) */}
        <mesh position={[0.32, -0.42, 0.05]} material={moboVrmMat} castShadow>
          <boxGeometry args={[0.38, 0.34, 0.06]} />
        </mesh>
        <mesh position={[0.32, -0.42, 0.085]} material={rgbPrimaryMat}>
          <boxGeometry args={[0.26, 0.04, 0.01]} />
        </mesh>

        {/* Steel-Reinforced PCIe 5.0 x16 Slots */}
        <mesh position={[-0.06, -0.14, 0.035]} material={cpuIhsMat}>
          <boxGeometry args={[0.68, 0.04, 0.04]} />
        </mesh>
        <mesh position={[-0.06, -0.52, 0.035]} material={cpuIhsMat}>
          <boxGeometry args={[0.68, 0.04, 0.04]} />
        </mesh>

        {/* 24-Pin ATX Braided Power Connector */}
        <mesh position={[0.58, 0.24, 0.06]} material={caseInteriorMat}>
          <boxGeometry args={[0.06, 0.32, 0.08]} />
        </mesh>

        {/* ===============================================================
            3. PROCESSOR (CPU Socket AM5 / LGA + Heatspreader IHS)
           =============================================================== */}
        <group ref={cpuGroupRef} position={[-0.06, 0.34, 0.05]}>
          {/* Socket Retention Frame */}
          <mesh material={caseInteriorMat}>
            <boxGeometry args={[0.34, 0.34, 0.025]} />
          </mesh>
          {/* Green/Teal CPU Substrate */}
          <mesh position={[0, 0, 0.018]}>
            <boxGeometry args={[0.28, 0.28, 0.015]} />
            <meshStandardMaterial color="#0f766e" roughness={0.4} metalness={0.3} wireframe={wireframe} />
          </mesh>
          {/* Nickel-Plated Copper IHS */}
          <mesh position={[0, 0, 0.034]} material={cpuIhsMat} castShadow>
            <boxGeometry
              args={
                build.cpu.ihsStyle === 'intel_rect'
                  ? [0.22, 0.26, 0.02]
                  : [0.24, 0.24, 0.02]
              }
            />
          </mesh>
        </group>

        {/* ===============================================================
            4. RAM MODULES (2x or 4x DDR5 RGB Sticks in DIMM Slots)
           =============================================================== */}
        <group ref={ramGroupRef} position={[0.32, 0.34, 0.08]}>
          {[0, 1, 2, 3].map((slotIdx) => {
            const isPopulated =
              build.ram.sticks === 4 || slotIdx === 1 || slotIdx === 3;
            const xOffset = (slotIdx - 1.5) * 0.065;

            return (
              <group key={slotIdx} position={[xOffset, 0, 0]}>
                {/* DIMM Slot Base */}
                <mesh position={[0, 0, -0.05]} material={caseInteriorMat}>
                  <boxGeometry args={[0.025, 0.44, 0.03]} />
                </mesh>

                {/* Populated DDR5 Module + Diffused ARGB Light Bar */}
                {isPopulated && (
                  <group position={[0, 0, 0.02]}>
                    <mesh material={ramHeatsinkMat} castShadow>
                      <boxGeometry args={[0.034, 0.42, 0.11]} />
                    </mesh>
                    {/* Top ARGB Diffuser Strip */}
                    <mesh
                      position={[0, 0, 0.062]}
                      material={slotIdx % 2 === 0 ? rgbPrimaryMat : rgbSecondaryMat}
                    >
                      <boxGeometry args={[0.036, 0.43, 0.022]} />
                    </mesh>
                  </group>
                )}
              </group>
            );
          })}
        </group>

        {/* ===============================================================
            5. STORAGE (NVMe M.2 PCIe 5.0 SSDs with Armored Heatsinks)
           =============================================================== */}
        <group ref={ssdGroupRef} position={[-0.08, -0.31, 0.04]}>
          {/* Primary M.2 Slot Heatsink */}
          <mesh material={coolerBodyMat} castShadow>
            <boxGeometry args={[0.48, 0.13, 0.045]} />
          </mesh>
          <mesh position={[0, 0, 0.026]} material={rgbPrimaryMat}>
            <boxGeometry args={[0.36, 0.022, 0.01]} />
          </mesh>

          {/* Secondary M.2 Drive if Dual-Drive selected */}
          {build.storage.dualDrive && (
            <group position={[0, -0.34, 0]}>
              <mesh material={coolerBodyMat} castShadow>
                <boxGeometry args={[0.48, 0.13, 0.045]} />
              </mesh>
              <mesh position={[0, 0, 0.026]} material={rgbSecondaryMat}>
                <boxGeometry args={[0.36, 0.022, 0.01]} />
              </mesh>
            </group>
          )}
        </group>
      </group>

      {/* =================================================================
          6. CPU COOLER (360mm AIO Liquid Cooler w/ LCD OR Dual-Tower Air)
         ================================================================= */}
      <group ref={coolerGroupRef}>
        {build.cooler.type === 'aio_360' ? (
          <group>
            {/* Cylindrical Pump Block on CPU Socket with Live Telemetry LCD */}
            <group position={[-0.32, 0.56, -0.31]}>
              <mesh
                rotation={[Math.PI / 2, 0, 0]}
                material={coolerBodyMat}
                castShadow
              >
                <cylinderGeometry args={[0.17, 0.18, 0.16, 32]} />
              </mesh>
              {/* Glowing ARGB Ring around Pump */}
              <mesh position={[0, 0, 0.082]} material={rgbPrimaryMat}>
                <ringGeometry args={[0.145, 0.168, 32]} />
              </mesh>
              {/* Circular Live LCD Screen */}
              <mesh position={[0, 0, 0.083]} material={lcdScreenMat}>
                <circleGeometry args={[0.142, 32]} />
              </mesh>
            </group>

            {/* Top 360mm Radiator under Case Roof */}
            <group position={[-0.08, 1.18, 0]}>
              <mesh material={coolerBodyMat} castShadow>
                <boxGeometry args={[1.64, 0.11, 0.54]} />
              </mesh>
              {/* 3x 120mm Radiator Exhaust Fans */}
              {[-0.54, 0, 0.54].map((xPos, idx) => (
                <ArgbFan
                  key={idx}
                  position={[xPos, -0.09, 0]}
                  rotation={[Math.PI / 2, 0, 0]}
                  scale={0.95}
                  frameMaterial={coolerBodyMat}
                  bladeMaterial={translucentBladeMat}
                  rgbPrimaryMaterial={rgbPrimaryMat}
                  onRegisterFan={registerFan}
                  fanIndex={4 + idx}
                />
              ))}
            </group>

            {/* 2 Braided Sleeved Liquid Tubes connecting Pump to Radiator */}
            <BraidedTube
              start={[-0.22, 0.58, -0.28]}
              mid1={[0.12, 0.62, -0.05]}
              mid2={[0.38, 0.88, 0.08]}
              end={[0.48, 1.12, 0.05]}
              material={caseInteriorMat}
            />
            <BraidedTube
              start={[-0.26, 0.5, -0.28]}
              mid1={[0.08, 0.52, 0.02]}
              mid2={[0.32, 0.82, 0.14]}
              end={[0.38, 1.12, 0.1]}
              material={caseInteriorMat}
            />
          </group>
        ) : (
          /* Monumental Dual-Tower Air Cooler w/ Copper Heatpipes & 2 PWM Fans */
          <group position={[-0.32, 0.56, -0.18]}>
            {/* Left Fin Stack Tower */}
            <mesh position={[-0.14, 0, 0]} material={coolerBodyMat} castShadow>
              <boxGeometry args={[0.16, 0.44, 0.36]} />
            </mesh>
            {/* Right Fin Stack Tower */}
            <mesh position={[0.14, 0, 0]} material={coolerBodyMat} castShadow>
              <boxGeometry args={[0.16, 0.44, 0.36]} />
            </mesh>
            {/* Copper Heatpipe Caps on Top */}
            {[-0.12, -0.04, 0.04, 0.12].map((zOff, idx) => (
              <group key={idx}>
                <mesh
                  position={[-0.14, 0, zOff]}
                  material={copperHeatpipeMat}
                >
                  <cylinderGeometry args={[0.015, 0.015, 0.47, 12]} />
                </mesh>
                <mesh
                  position={[0.14, 0, zOff]}
                  material={copperHeatpipeMat}
                >
                  <cylinderGeometry args={[0.015, 0.015, 0.47, 12]} />
                </mesh>
              </group>
            ))}
            {/* Center & Front Air Cooler Fans */}
            <ArgbFan
              position={[0, 0, 0]}
              rotation={[0, Math.PI / 2, 0]}
              scale={0.78}
              frameMaterial={caseInteriorMat}
              bladeMaterial={translucentBladeMat}
              rgbPrimaryMaterial={rgbPrimaryMat}
              onRegisterFan={registerFan}
              fanIndex={4}
            />
            <ArgbFan
              position={[0.27, 0, 0]}
              rotation={[0, Math.PI / 2, 0]}
              scale={0.78}
              frameMaterial={caseInteriorMat}
              bladeMaterial={translucentBladeMat}
              rgbPrimaryMaterial={rgbSecondaryMat}
              onRegisterFan={registerFan}
              fanIndex={5}
            />
          </group>
        )}
      </group>

      {/* =================================================================
          7. GRAPHICS CARD (Triple-Fan Flagship GPU + Custom Backplate)
         ================================================================= */}
      <group ref={gpuGroupRef} position={[-0.16, 0.02, 0.02]}>
        {/* Main Triple-Slot Shroud Body */}
        <mesh material={gpuShroudMat} castShadow receiveShadow>
          <boxGeometry args={[gpuLen, 0.18, 0.56]} />
        </mesh>

        {/* Top Customizable Backplate (Supports Custom Uploaded .PNG/.JPG) */}
        <mesh position={[0, 0.095, 0]} material={gpuBackplateMat} castShadow>
          <boxGeometry args={[gpuLen * 0.98, 0.015, 0.54]} />
        </mesh>

        {/* Exposed Fin Heatsink Core */}
        <mesh position={[0, 0, 0]} material={cpuIhsMat}>
          <boxGeometry args={[gpuLen * 0.95, 0.12, 0.58]} />
        </mesh>

        {/* Front-Facing GEFORCE RTX / RADEON ARGB Light Bar */}
        <mesh position={[0, 0.02, 0.285]} material={rgbPrimaryMat}>
          <boxGeometry args={[gpuLen * 0.86, 0.042, 0.015]} />
        </mesh>
        <mesh position={[0, -0.04, 0.285]} material={rgbSecondaryMat}>
          <boxGeometry args={[gpuLen * 0.55, 0.018, 0.015]} />
        </mesh>

        {/* 16-Pin 12VHPWR Braided Power Cable */}
        <BraidedTube
          start={[gpuLen * 0.3, 0.04, 0.29]}
          mid1={[gpuLen * 0.3, -0.18, 0.36]}
          mid2={[gpuLen * 0.22, -0.45, 0.22]}
          end={[gpuLen * 0.15, -0.7, 0.05]}
          material={caseInteriorMat}
        />

        {/* 3x Axial-Tech Downward GPU Cooling Fans */}
        {[-0.4, 0, 0.4].map((xNorm, idx) => (
          <ArgbFan
            key={idx}
            position={[xNorm * gpuLen * 0.95, -0.095, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.68}
            frameMaterial={gpuShroudMat}
            bladeMaterial={translucentBladeMat}
            rgbPrimaryMaterial={idx === 1 ? rgbSecondaryMat : rgbPrimaryMat}
            onRegisterFan={registerFan}
            fanIndex={7 + idx}
          />
        ))}
      </group>

      {/* =================================================================
          8. POWER SUPPLY (ATX 3.1 PSU in Bottom Cutout Window w/ OLED)
         ================================================================= */}
      <group ref={psuGroupRef} position={[-0.52, -0.98, 0.05]}>
        <mesh material={psuBodyMat} castShadow receiveShadow>
          <boxGeometry args={[0.68, 0.44, 0.56]} />
        </mesh>
        {/* PSU Wattage / Telemetry OLED Window facing user */}
        <mesh position={[0, 0, 0.285]} material={lcdScreenMat}>
          <planeGeometry args={[0.38, 0.24]} />
        </mesh>
        <mesh position={[0, 0.16, 0.285]} material={rgbPrimaryMat}>
          <boxGeometry args={[0.56, 0.025, 0.01]} />
        </mesh>
      </group>
    </group>
  );
}
