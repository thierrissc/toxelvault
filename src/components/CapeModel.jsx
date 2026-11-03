import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CAPE_SEGMENTS = 14;
const CAPE_WIDTH = 1.08;
const CAPE_TOTAL_HEIGHT = 1.68;
const CAPE_DEPTH = 0.07;

/**
 * Generates a BoxGeometry for one horizontal slice of the articulated cape,
 * with UV coordinates mapped so that all slices together display the full
 * texture seamlessly from top (v=1) to bottom (v=0).
 */
function createCapeSegmentGeometry(segIndex, totalSegments) {
  const segH = CAPE_TOTAL_HEIGHT / totalSegments;
  // Slightly overlap height by 2% to avoid micro-gaps when bending
  const geom = new THREE.BoxGeometry(CAPE_WIDTH, segH * 1.04, CAPE_DEPTH);
  // Shift geometry down by segH / 2 so pivot is at the top hinge of this segment
  geom.translate(0, -segH / 2, 0);

  const uvAttr = geom.attributes.uv;
  const posAttr = geom.attributes.position;
  const normAttr = geom.attributes.normal;

  const vTop = 1 - segIndex / totalSegments;
  const vBottom = 1 - (segIndex + 1) / totalSegments;

  for (let i = 0; i < uvAttr.count; i++) {
    const nx = normAttr.getX(i);
    const ny = normAttr.getY(i);
    const nz = normAttr.getZ(i);
    const px = posAttr.getX(i);
    const py = posAttr.getY(i); // ranges from 0 at top to -segH at bottom

    const localV = 1 + py / segH; // 1 at top, 0 at bottom
    const v = THREE.MathUtils.lerp(vBottom, vTop, Math.max(0, Math.min(1, localV)));
    const u = (px + CAPE_WIDTH / 2) / CAPE_WIDTH;

    if (Math.abs(nz) > 0.5) {
      // Front and back faces of the cape show full banner artwork
      uvAttr.setXY(i, nz < 0 ? 1 - u : u, v);
    } else if (Math.abs(nx) > 0.5) {
      // Left/right border edges sample the border columns of the texture
      uvAttr.setXY(i, nx < 0 ? 0.02 : 0.98, v);
    } else if (Math.abs(ny) > 0.5) {
      uvAttr.setXY(i, u, vTop);
    }
  }

  uvAttr.needsUpdate = true;
  return geom;
}

/**
 * Recursive articulated chain for the Voxel Cape so each segment inherits
 * the rotation and translation of its parent segment, creating a natural
 * cloth-like sinusoidal wave.
 */
function ArticulatedCapeSegment({
  index,
  total,
  segmentGeometries,
  segmentRefs,
  capeMaterial,
}) {
  const segH = CAPE_TOTAL_HEIGHT / total;

  return (
    <group
      ref={(el) => {
        segmentRefs.current[index] = el;
      }}
      position={[0, index === 0 ? 0 : -segH, 0]}
    >
      <mesh
        geometry={segmentGeometries[index]}
        material={capeMaterial}
        castShadow
        receiveShadow
      />
      {index + 1 < total && (
        <ArticulatedCapeSegment
          index={index + 1}
          total={total}
          segmentGeometries={segmentGeometries}
          segmentRefs={segmentRefs}
          capeMaterial={capeMaterial}
        />
      )}
    </group>
  );
}

export default function CapeModel({
  textures,
  themeData,
  windSpeed = 2.4,
  metalness = 0.6,
  roughness = 0.35,
  wireframe = false,
}) {
  const mannequinRef = useRef();
  const headRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const segmentRefs = useRef([]);

  // Pre-build the 14 slice geometries once
  const segmentGeometries = useMemo(() => {
    return Array.from({ length: CAPE_SEGMENTS }, (_, idx) =>
      createCapeSegmentGeometry(idx, CAPE_SEGMENTS)
    );
  }, []);

  // Cape & Primary Armor Material (uses dynamic procedural CanvasTexture)
  const capeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: textures?.map || null,
      emissiveMap: textures?.emissiveMap || null,
      emissive: new THREE.Color('#ffffff'),
      emissiveIntensity: themeData?.defaultEmissiveIntensity ?? 0.6,
      metalness,
      roughness,
      wireframe,
    });
  }, [textures, themeData, metalness, roughness, wireframe]);

  // Secondary Dark Chassis Material for the Voxel Mannequin body
  const chassisMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#131622'),
      metalness: Math.min(1, metalness * 0.75 + 0.15),
      roughness: Math.max(0.15, roughness * 0.85),
      wireframe,
    });
  }, [metalness, roughness, wireframe]);

  // Glowing Visor / Accent Trim Material synchronized with current theme
  const accentMaterial = useMemo(() => {
    const col = new THREE.Color(themeData?.accentHex || '#22d3ee');
    return new THREE.MeshStandardMaterial({
      color: col,
      emissive: col,
      emissiveIntensity: 1.6,
      metalness: 0.5,
      roughness: 0.2,
      wireframe,
    });
  }, [themeData, wireframe]);

  // Real-time animation loop (useFrame): sinusoidal wind wave on articulated cape + subtle idle breathing
  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Subtle idle hover & breathing on the mannequin
    if (mannequinRef.current) {
      mannequinRef.current.position.y = Math.sin(t * 1.6) * 0.035 - 0.15;
    }
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.8) * 0.08;
      headRef.current.rotation.x = Math.sin(t * 1.2) * 0.03;
    }
    if (leftArmRef.current && rightArmRef.current) {
      leftArmRef.current.rotation.x = Math.sin(t * 1.6) * 0.04;
      rightArmRef.current.rotation.x = -Math.sin(t * 1.6) * 0.04;
    }

    // Articulated cape sinusoidal wind physics
    const effectiveWind = Math.max(0.1, windSpeed);
    const baseTilt = 0.14 + effectiveWind * 0.045; // Cape lifts further back as wind increases

    for (let i = 0; i < CAPE_SEGMENTS; i++) {
      const seg = segmentRefs.current[i];
      if (!seg) continue;

      const progress = i / CAPE_SEGMENTS;
      const wavePhase = t * (1.8 + effectiveWind * 1.15) - i * 0.42;
      const secondaryHarmonic = Math.cos(t * (2.9 + effectiveWind) - i * 0.7) * 0.018;

      if (i === 0) {
        // Top hinge attached to shoulders
        seg.rotation.x =
          baseTilt + Math.sin(wavePhase) * 0.05 * (0.4 + effectiveWind * 0.25);
        seg.rotation.z = Math.sin(t * 1.4) * 0.015 * effectiveWind * 0.25;
      } else {
        // Cascading sinusoidal wave along the 14 articulated segments
        const amp = (0.025 + progress * 0.055) * (0.35 + effectiveWind * 0.32);
        seg.rotation.x = Math.sin(wavePhase) * amp + secondaryHarmonic;
        seg.rotation.z = Math.cos(wavePhase * 0.75) * amp * 0.22;
        seg.rotation.y = Math.sin(wavePhase * 0.5) * amp * 0.18;
      }
    }
  });

  return (
    <group ref={mannequinRef} position={[0, -0.15, 0]}>
      {/* ============================================================
          HEAD & CYBER VOXEL HELMET
         ============================================================ */}
      <group ref={headRef} position={[0, 1.38, 0]}>
        {/* Inner Head Block */}
        <mesh material={chassisMaterial} castShadow receiveShadow>
          <boxGeometry args={[0.74, 0.74, 0.74]} />
        </mesh>

        {/* Helmet Crown / Top Plate with Procedural Armor Texture */}
        <mesh position={[0, 0.28, 0]} material={capeMaterial} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.22, 0.8]} />
        </mesh>

        {/* Helmet Cheek Guards */}
        <mesh position={[-0.36, -0.05, 0.04]} material={capeMaterial} castShadow>
          <boxGeometry args={[0.1, 0.48, 0.72]} />
        </mesh>
        <mesh position={[0.36, -0.05, 0.04]} material={capeMaterial} castShadow>
          <boxGeometry args={[0.1, 0.48, 0.72]} />
        </mesh>

        {/* Glowing Cybernetic Visor Strip */}
        <mesh position={[0, 0.03, 0.375]} material={accentMaterial}>
          <boxGeometry args={[0.62, 0.15, 0.04]} />
        </mesh>

        {/* Helmet Crest Fin */}
        <mesh position={[0, 0.44, -0.04]} material={accentMaterial} castShadow>
          <boxGeometry args={[0.12, 0.14, 0.56]} />
        </mesh>
      </group>

      {/* ============================================================
          TORSO & PROCEDURAL BREASTPLATE ARMOR
         ============================================================ */}
      <group position={[0, 0.48, 0]}>
        {/* Core Torso Block */}
        <mesh material={chassisMaterial} castShadow receiveShadow>
          <boxGeometry args={[0.86, 1.06, 0.46]} />
        </mesh>

        {/* Textured Front Chest Cuirass */}
        <mesh position={[0, 0.08, 0.03]} material={capeMaterial} castShadow receiveShadow>
          <boxGeometry args={[0.92, 0.76, 0.48]} />
        </mesh>

        {/* Glowing Power Core on Chest */}
        <mesh position={[0, 0.14, 0.28]} material={accentMaterial}>
          <boxGeometry args={[0.24, 0.24, 0.05]} />
        </mesh>

        {/* Utility Voxel Belt */}
        <mesh position={[0, -0.42, 0]} material={capeMaterial} castShadow>
          <boxGeometry args={[0.9, 0.16, 0.5]} />
        </mesh>
        <mesh position={[0, -0.42, 0.26]} material={accentMaterial}>
          <boxGeometry args={[0.2, 0.12, 0.04]} />
        </mesh>

        {/* Shoulder Cape Clasp / Collar Mounts */}
        <mesh position={[-0.32, 0.52, -0.18]} material={accentMaterial} castShadow>
          <boxGeometry args={[0.22, 0.1, 0.22]} />
        </mesh>
        <mesh position={[0.32, 0.52, -0.18]} material={accentMaterial} castShadow>
          <boxGeometry args={[0.22, 0.1, 0.22]} />
        </mesh>
      </group>

      {/* ============================================================
          LEFT & RIGHT ARMS WITH TEXTURED PAULDRONS
         ============================================================ */}
      <group ref={leftArmRef} position={[-0.66, 0.52, 0]}>
        {/* Arm Base */}
        <mesh position={[0, -0.06, 0]} material={chassisMaterial} castShadow receiveShadow>
          <boxGeometry args={[0.36, 0.96, 0.36]} />
        </mesh>
        {/* Textured Shoulder Pauldron */}
        <mesh position={[-0.04, 0.32, 0]} material={capeMaterial} castShadow receiveShadow>
          <boxGeometry args={[0.46, 0.38, 0.46]} />
        </mesh>
        {/* Gauntlet Cuff */}
        <mesh position={[0, -0.32, 0]} material={capeMaterial} castShadow>
          <boxGeometry args={[0.4, 0.26, 0.4]} />
        </mesh>
        <mesh position={[-0.21, 0.32, 0]} material={accentMaterial}>
          <boxGeometry args={[0.04, 0.18, 0.26]} />
        </mesh>
      </group>

      <group ref={rightArmRef} position={[0.66, 0.52, 0]}>
        {/* Arm Base */}
        <mesh position={[0, -0.06, 0]} material={chassisMaterial} castShadow receiveShadow>
          <boxGeometry args={[0.36, 0.96, 0.36]} />
        </mesh>
        {/* Textured Shoulder Pauldron */}
        <mesh position={[0.04, 0.32, 0]} material={capeMaterial} castShadow receiveShadow>
          <boxGeometry args={[0.46, 0.38, 0.46]} />
        </mesh>
        {/* Gauntlet Cuff */}
        <mesh position={[0, -0.32, 0]} material={capeMaterial} castShadow>
          <boxGeometry args={[0.4, 0.26, 0.4]} />
        </mesh>
        <mesh position={[0.21, 0.32, 0]} material={accentMaterial}>
          <boxGeometry args={[0.04, 0.18, 0.26]} />
        </mesh>
      </group>

      {/* ============================================================
          LEFT & RIGHT LEGS WITH ARMORED GREAVES
         ============================================================ */}
      <group position={[-0.23, -0.56, 0]}>
        <mesh material={chassisMaterial} castShadow receiveShadow>
          <boxGeometry args={[0.38, 1.02, 0.38]} />
        </mesh>
        {/* Knee & Shin Greave */}
        <mesh position={[0, -0.12, 0.03]} material={capeMaterial} castShadow>
          <boxGeometry args={[0.42, 0.52, 0.42]} />
        </mesh>
        <mesh position={[0, 0.06, 0.22]} material={accentMaterial}>
          <boxGeometry args={[0.18, 0.08, 0.04]} />
        </mesh>
      </group>

      <group position={[0.23, -0.56, 0]}>
        <mesh material={chassisMaterial} castShadow receiveShadow>
          <boxGeometry args={[0.38, 1.02, 0.38]} />
        </mesh>
        {/* Knee & Shin Greave */}
        <mesh position={[0, -0.12, 0.03]} material={capeMaterial} castShadow>
          <boxGeometry args={[0.42, 0.52, 0.42]} />
        </mesh>
        <mesh position={[0, 0.06, 0.22]} material={accentMaterial}>
          <boxGeometry args={[0.18, 0.08, 0.04]} />
        </mesh>
      </group>

      {/* ============================================================
          ARTICULATED REAR CAPE (14 SINUSOIDAL SEGMENTS)
         ============================================================ */}
      <group position={[0, 0.98, -0.26]}>
        <ArticulatedCapeSegment
          index={0}
          total={CAPE_SEGMENTS}
          segmentGeometries={segmentGeometries}
          segmentRefs={segmentRefs}
          capeMaterial={capeMaterial}
        />
      </group>

      {/* ============================================================
          DISPLAY HOLOGRAPHIC PEDESTAL RING
         ============================================================ */}
      <group position={[0, -1.12, 0]}>
        <mesh receiveShadow castShadow material={chassisMaterial}>
          <cylinderGeometry args={[1.15, 1.28, 0.1, 32]} />
        </mesh>
        <mesh position={[0, 0.055, 0]} rotation={[-Math.PI / 2, 0, 0]} material={accentMaterial}>
          <ringGeometry args={[1.02, 1.08, 32]} />
        </mesh>
      </group>
    </group>
  );
}
