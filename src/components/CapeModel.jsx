import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import {
  SNAP_POINTS,
  createMotherboardPcbTexture,
  createGpuBackplateTexture,
  createKrakenLcdTexture,
  createHardwareLabelTexture,
} from '../utils/textureGenerator';

// Singleton DRACOLoader + GLTFLoader for real .glb / .gltf files
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

const gltfCache = new Map();

/**
 * Creates a curved aerodynamic fan blade using THREE.ExtrudeGeometry
 * so each of the 9 fan blades has real 3D curvature and 30-degree pitch.
 */
function createCurvedBladeGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0.055, -0.012);
  shape.quadraticCurveTo(0.125, -0.028, 0.195, -0.014);
  shape.lineTo(0.198, 0.022);
  shape.quadraticCurveTo(0.125, 0.032, 0.055, 0.012);
  shape.closePath();

  const extrudeSettings = {
    steps: 1,
    depth: 0.006,
    bevelEnabled: true,
    bevelThickness: 0.002,
    bevelSize: 0.002,
    bevelSegments: 2,
  };

  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.center();
  return geom;
}

/**
 * Creates a 120mm chamfered octagon fan housing frame with a circular central bore
 * using THREE.ExtrudeGeometry + Path hole so the fan frame is a real hollowed shroud,
 * not a flat solid box.
 */
function createChamferedFanFrameGeometry() {
  const s = 0.24;
  const c = 0.038;
  const shape = new THREE.Shape();
  shape.moveTo(-s + c, -s);
  shape.lineTo(s - c, -s);
  shape.lineTo(s, -s + c);
  shape.lineTo(s, s - c);
  shape.lineTo(s - c, s);
  shape.lineTo(-s + c, s);
  shape.lineTo(-s, s - c);
  shape.lineTo(-s, -s + c);
  shape.closePath();

  // Circular bore hole in center of frame
  const hole = new THREE.Path();
  hole.absarc(0, 0, 0.214, 0, Math.PI * 2, false);
  shape.holes.push(hole);

  const geom = new THREE.ExtrudeGeometry(shape, {
    steps: 1,
    depth: 0.062,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 2,
  });
  geom.center();
  return geom;
}

const sharedBladeGeometry = createCurvedBladeGeometry();
const sharedFanFrameGeometry = createChamferedFanFrameGeometry();

/**
 * High-Detail 120mm Fan with Chamfered Hollow Frame, 4 Stator Struts,
 * Brushed Metallic Center Hub with Brand Emblem, 9 Curved ExtrudeGeometry Blades
 * pitched at 30° (Math.PI / 6), and Soft Diffused LED Halo Ring.
 */
function RealisticFan120({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  frameMat,
  bladeMat,
  rgbMat,
  hubMat,
  onRegisterFan,
  fanIndex,
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Hollowed Chamfered 120mm Square Housing */}
      <mesh
        geometry={sharedFanFrameGeometry}
        material={frameMat}
        castShadow
        receiveShadow
      />

      {/* 4 Rubber Anti-Vibration Corner Pads + Mounting Screws */}
      {[
        [-0.2, -0.2],
        [0.2, -0.2],
        [-0.2, 0.2],
        [0.2, 0.2],
      ].map(([cx, cy], idx) => (
        <mesh key={idx} position={[cx, cy, 0]} rotation={[Math.PI / 2, 0, 0]} material={hubMat}>
          <cylinderGeometry args={[0.012, 0.012, 0.068, 12]} />
        </mesh>
      ))}

      {/* 4 Rear Stator Support Struts holding the motor hub */}
      {[0.6, 2.1, 3.7, 5.2].map((ang, idx) => (
        <mesh
          key={idx}
          position={[Math.cos(ang) * 0.11, Math.sin(ang) * 0.11, -0.024]}
          rotation={[0, 0, ang]}
          material={frameMat}
        >
          <boxGeometry args={[0.19, 0.012, 0.008]} />
        </mesh>
      ))}

      {/* Soft Diffused LED Ring Inside Bore */}
      <mesh position={[0, 0, 0.028]} material={rgbMat}>
        <torusGeometry args={[0.208, 0.007, 12, 36]} />
      </mesh>

      {/* Spinning Rotor: Center Motor Hub + Metallic Logo Cap + 9 Curved 30° Blades */}
      <group ref={(el) => onRegisterFan(fanIndex, el)}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={frameMat}>
          <cylinderGeometry args={[0.068, 0.068, 0.056, 28]} />
        </mesh>
        {/* Brushed Aluminum Hub Cap */}
        <mesh position={[0, 0, 0.029]} material={hubMat}>
          <circleGeometry args={[0.052, 28]} />
        </mesh>
        <mesh position={[0, 0, 0.03]} material={rgbMat}>
          <ringGeometry args={[0.038, 0.048, 28]} />
        </mesh>

        {/* 9 Curved ExtrudeGeometry Blades pitched at 30° */}
        {Array.from({ length: 9 }).map((_, idx) => {
          const angle = (idx / 9) * Math.PI * 2;
          return (
            <group key={idx} rotation={[0, 0, angle]}>
              <mesh
                geometry={sharedBladeGeometry}
                position={[0.125, 0, 0.004]}
                rotation={[Math.PI / 6, 0.12, 0]}
                material={bladeMat}
                castShadow
              />
            </group>
          );
        })}
      </group>
    </group>
  );
}

/**
 * Braided Sleeved Tube / Power Cable using CatmullRomCurve3
 */
function BraidedTube({ points, radius = 0.022, material }) {
  const tubeGeo = useMemo(() => {
    const vectors = points.map((p) => new THREE.Vector3(...p));
    const curve = new THREE.CatmullRomCurve3(vectors);
    return new THREE.TubeGeometry(curve, 28, radius, 12, false);
  }, [points, radius]);

  return <mesh geometry={tubeGeo} material={material} castShadow />;
}

/**
 * High-Detail Multi-Mesh PBR Fallback Renderer with Real Textures & Fine Sub-Components
 */
function HighDetailPbrFallback({
  part,
  wireframe,
  onRegisterFan,
  materials,
}) {
  const cat = part?.category;

  const pcbTex = useMemo(
    () =>
      cat === 'motherboard'
        ? createMotherboardPcbTexture(
            part?.pcbColor || '#111318',
            part?.accentColor || '#f59e0b'
          )
        : null,
    [cat, part?.pcbColor, part?.accentColor]
  );

  const gpuBackplateTex = useMemo(
    () =>
      cat === 'gpu'
        ? createGpuBackplateTexture(part?.brand || 'ASUS ROG', part?.name || 'GEFORCE RTX 4070')
        : null,
    [cat, part?.brand, part?.name]
  );

  const ssdLabelTex = useMemo(
    () =>
      cat === 'storage'
        ? createHardwareLabelTexture('ssd', '990 PRO', part?.specs?.capacity || '2TB NVMe')
        : null,
    [cat, part?.specs?.capacity]
  );

  const psuLabelTex = useMemo(
    () =>
      cat === 'psu'
        ? createHardwareLabelTexture(
            'psu',
            part?.brand === 'ASUS ROG' ? 'ROG THOR' : 'RM1000e',
            `${part?.specs?.wattageCapacity || 1000}W 80+ GOLD`
          )
        : null,
    [cat, part?.brand, part?.specs?.wattageCapacity]
  );

  if (cat === 'case') {
    const chassisMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(part.chassisColor || '#15171e'),
      metalness: 0.72,
      roughness: 0.28,
      wireframe,
    });
    const interiorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(part.interiorColor || '#0f1117'),
      metalness: 0.6,
      roughness: 0.35,
      wireframe,
    });

    return (
      <group name="Fallback_HYTE_Y70_Case">
        {/* Bottom & Top Structural Plates */}
        <mesh position={[0, -1.3, 0]} material={chassisMat} castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.07, 1.38]} />
        </mesh>
        <mesh position={[0, 1.3, 0]} material={chassisMat} castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.06, 1.38]} />
        </mesh>

        {/* 4 Machined Case Feet */}
        {[
          [-0.95, -1.38, -0.55],
          [0.95, -1.38, -0.55],
          [-0.95, -1.38, 0.55],
          [0.95, -1.38, 0.55],
        ].map((pos, idx) => (
          <mesh key={idx} position={pos} material={interiorMat}>
            <cylinderGeometry args={[0.09, 0.1, 0.08, 20]} />
          </mesh>
        ))}

        {/* Rear Spine Wall & Dual-Chamber Motherboard Tray */}
        <mesh position={[0, 0, -0.67]} material={chassisMat} castShadow receiveShadow>
          <boxGeometry args={[2.2, 2.56, 0.04]} />
        </mesh>
        <mesh position={[-0.22, 0, -0.18]} material={interiorMat} castShadow receiveShadow>
          <boxGeometry args={[1.72, 2.52, 0.04]} />
        </mesh>

        {/* Ribbed Rubber Cable Grommets */}
        {[0.45, -0.05, -0.55].map((yPos, idx) => (
          <mesh key={idx} position={[0.42, yPos, -0.155]} material={chassisMat}>
            <boxGeometry args={[0.11, 0.32, 0.025]} />
          </mesh>
        ))}

        {/* Side Recessed Fan Bracket + 3x Realistic 120mm Fans with 9 Curved Blades */}
        <mesh position={[0.76, 0, -0.36]} material={interiorMat}>
          <boxGeometry args={[0.56, 2.52, 0.04]} />
        </mesh>
        {[-0.56, 0, 0.56].map((yPos, idx) => (
          <RealisticFan120
            key={`side_${idx}`}
            position={[0.76, yPos, -0.31]}
            frameMat={interiorMat}
            bladeMat={materials.fanBladeMat}
            rgbMat={materials.rgbCyanMat}
            hubMat={materials.nickelMat}
            onRegisterFan={onRegisterFan}
            fanIndex={idx + 1}
          />
        ))}

        {/* Rear Exhaust Wall + 120mm Exhaust Fan */}
        <mesh position={[-1.08, 0, 0]} material={chassisMat} castShadow>
          <boxGeometry args={[0.05, 2.56, 1.38]} />
        </mesh>
        <RealisticFan120
          position={[-1.02, 0.52, 0.18]}
          rotation={[0, Math.PI / 2, 0]}
          scale={0.92}
          frameMat={interiorMat}
          bladeMat={materials.fanBladeMat}
          rgbMat={materials.rgbCyanMat}
          hubMat={materials.nickelMat}
          onRegisterFan={onRegisterFan}
          fanIndex={0}
        />

        {/* 3x Bottom Intake Fans */}
        {[-0.52, 0, 0.52].map((xPos, idx) => (
          <RealisticFan120
            key={`bot_${idx}`}
            position={[xPos - 0.12, -1.22, 0.18]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={0.92}
            frameMat={interiorMat}
            bladeMat={materials.fanBladeMat}
            rgbMat={materials.rgbPurpleMat}
            hubMat={materials.nickelMat}
            onRegisterFan={onRegisterFan}
            fanIndex={10 + idx}
          />
        ))}

        {/* Panoramic Tempered Glass Panels (MeshPhysicalMaterial with transmission) */}
        <group position={[1.08, 0, 0]}>
          <mesh material={materials.glassTransmissionMat}>
            <boxGeometry args={[0.02, 2.52, 1.34]} />
          </mesh>
          <mesh position={[0, 1.24, 0]} material={chassisMat}>
            <boxGeometry args={[0.03, 0.06, 1.36]} />
          </mesh>
          <mesh position={[0, -1.24, 0]} material={chassisMat}>
            <boxGeometry args={[0.03, 0.06, 1.36]} />
          </mesh>
        </group>

        <group position={[0, 0, 0.69]}>
          <mesh material={materials.glassTransmissionMat}>
            <boxGeometry args={[2.16, 2.52, 0.02]} />
          </mesh>
          <mesh position={[0, 1.24, 0]} material={chassisMat}>
            <boxGeometry args={[2.18, 0.06, 0.028]} />
          </mesh>
          <mesh position={[0, -1.24, 0]} material={chassisMat}>
            <boxGeometry args={[2.18, 0.06, 0.028]} />
          </mesh>
        </group>
      </group>
    );
  }

  if (cat === 'motherboard') {
    const vrmMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(part.vrmColor || '#242832'),
      metalness: 0.82,
      roughness: 0.24,
      wireframe,
    });
    const tufAccentMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(part.accentColor || '#f59e0b'),
      emissive: new THREE.Color(part.accentColor || '#f59e0b'),
      emissiveIntensity: 0.55,
      wireframe,
    });

    return (
      <group name="Fallback_ASUS_TUF_B650M_Motherboard">
        {/* High-Resolution Textured PCB Board */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.26, 1.54, 0.035]} />
          <meshStandardMaterial
            map={pcbTex}
            metalness={0.32}
            roughness={0.48}
            wireframe={wireframe}
          />
        </mesh>

        {/* Left VRM Heatsink Block with Machined Cooling Grooves & TUF Stripes */}
        <group position={[-0.48, 0.34, 0.07]}>
          <mesh material={vrmMat} castShadow>
            <boxGeometry args={[0.24, 0.78, 0.1]} />
          </mesh>
          {/* 8 Machined Cooling Fin Ridges along Left VRM */}
          {Array.from({ length: 8 }).map((_, idx) => (
            <mesh
              key={idx}
              position={[0.06, -0.3 + idx * 0.085, 0.055]}
              material={vrmMat}
              castShadow
            >
              <boxGeometry args={[0.11, 0.045, 0.025]} />
            </mesh>
          ))}
          {/* TUF Yellow/Amber Accent Stripe */}
          <mesh position={[-0.04, 0.12, 0.054]} material={tufAccentMat}>
            <boxGeometry args={[0.07, 0.38, 0.008]} />
          </mesh>
          <mesh position={[-0.04, -0.22, 0.054]} material={tufAccentMat}>
            <boxGeometry args={[0.07, 0.12, 0.008]} />
          </mesh>
        </group>

        {/* Top VRM Heatsink with 10 Vertical Fin Channels */}
        <group position={[-0.06, 0.65, 0.065]}>
          <mesh material={vrmMat} castShadow>
            <boxGeometry args={[0.56, 0.15, 0.085]} />
          </mesh>
          {Array.from({ length: 10 }).map((_, idx) => (
            <mesh
              key={idx}
              position={[-0.22 + idx * 0.048, 0, 0.048]}
              material={vrmMat}
            >
              <boxGeometry args={[0.024, 0.14, 0.022]} />
            </mesh>
          ))}
          <mesh position={[0, 0.04, 0.048]} material={tufAccentMat}>
            <boxGeometry args={[0.42, 0.022, 0.008]} />
          </mesh>
        </group>

        {/* Row of 12 Alloy Chokes & Cylindrical Solid Capacitors around CPU Socket */}
        {Array.from({ length: 10 }).map((_, idx) => (
          <group key={`vrm_cap_${idx}`}>
            {/* Ferrite Choke Cube */}
            <mesh
              position={[-0.28 + idx * 0.046, 0.53, 0.032]}
              material={vrmMat}
            >
              <boxGeometry args={[0.034, 0.034, 0.028]} />
            </mesh>
            {/* Cylindrical Solid Capacitor */}
            <mesh
              position={[-0.28 + idx * 0.046, 0.49, 0.032]}
              rotation={[Math.PI / 2, 0, 0]}
              material={materials.nickelMat}
            >
              <cylinderGeometry args={[0.011, 0.011, 0.028, 12]} />
            </mesh>
          </group>
        ))}

        {/* Rear I/O Audio Capacitors (Gold/Silver cylinders at bottom-left) */}
        {[-0.64, -0.58, -0.52, -0.46, -0.4].map((yPos, idx) => (
          <mesh
            key={`aud_cap_${idx}`}
            position={[-0.56, yPos, 0.034]}
            rotation={[Math.PI / 2, 0, 0]}
            material={materials.copperMat}
          >
            <cylinderGeometry args={[0.016, 0.016, 0.034, 14]} />
          </mesh>
        ))}

        {/* Silver CR2032 CMOS Battery with Retention Clip */}
        <group position={[-0.28, -0.62, 0.028]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={vrmMat}>
            <cylinderGeometry args={[0.052, 0.052, 0.016, 24]} />
          </mesh>
          <mesh position={[0, 0, 0.005]} rotation={[Math.PI / 2, 0, 0]} material={materials.nickelMat}>
            <cylinderGeometry args={[0.044, 0.044, 0.014, 24]} />
          </mesh>
        </group>

        {/* 4x DDR5 DIMM Slots with Top & Bottom Retention Latches */}
        {[0, 1, 2, 3].map((slotIdx) => {
          const sx = 0.22 + slotIdx * 0.06;
          return (
            <group key={`dimm_${slotIdx}`} position={[sx, 0.34, 0.035]}>
              <mesh material={vrmMat}>
                <boxGeometry args={[0.022, 0.44, 0.03]} />
              </mesh>
              {/* Top & Bottom Ejector Latches */}
              <mesh position={[0, 0.23, 0.012]} material={materials.nickelMat}>
                <boxGeometry args={[0.026, 0.022, 0.032]} />
              </mesh>
              <mesh position={[0, -0.23, 0.012]} material={materials.nickelMat}>
                <boxGeometry args={[0.026, 0.022, 0.032]} />
              </mesh>
            </group>
          );
        })}

        {/* Steel-Reinforced PCIe 5.0 x16 SafeSlots with Locking Tab */}
        {[-0.18, -0.54].map((py, idx) => (
          <group key={`pcie_${idx}`} position={[-0.06, py, 0.035]}>
            <mesh material={materials.nickelMat}>
              <boxGeometry args={[0.68, 0.038, 0.038]} />
            </mesh>
            <mesh position={[0.35, 0, 0.01]} material={tufAccentMat}>
              <boxGeometry args={[0.03, 0.045, 0.03]} />
            </mesh>
          </group>
        ))}

        {/* M.2 Thermal Armor Shield & Chipset Heatsink with TUF Graphics */}
        <mesh position={[-0.08, -0.36, 0.042]} material={vrmMat} castShadow>
          <boxGeometry args={[0.56, 0.16, 0.04]} />
        </mesh>
        <mesh position={[0.28, -0.44, 0.048]} material={vrmMat} castShadow>
          <boxGeometry args={[0.38, 0.34, 0.052]} />
        </mesh>
        <mesh position={[0.28, -0.44, 0.076]} material={tufAccentMat}>
          <boxGeometry args={[0.26, 0.032, 0.008]} />
        </mesh>

        {/* 24-Pin ATX Power Header & 8-Pin EPS Header */}
        <mesh position={[0.56, 0.22, 0.045]} material={vrmMat}>
          <boxGeometry args={[0.055, 0.3, 0.06]} />
        </mesh>
        <mesh position={[-0.48, 0.72, 0.045]} material={vrmMat}>
          <boxGeometry args={[0.16, 0.05, 0.05]} />
        </mesh>
      </group>
    );
  }

  if (cat === 'cpu') {
    return (
      <group name="Fallback_AM5_LGA_CPU">
        {/* Socket Retention ILM Frame & Lever */}
        <mesh material={materials.nickelMat}>
          <boxGeometry args={[0.33, 0.35, 0.02]} />
        </mesh>
        <mesh position={[0.18, 0, 0.01]} material={materials.nickelMat}>
          <cylinderGeometry args={[0.006, 0.006, 0.36, 8]} />
        </mesh>
        {/* Green/Teal CPU Package Substrate */}
        <mesh position={[0, 0, 0.015]}>
          <boxGeometry args={[0.27, 0.27, 0.012]} />
          <meshStandardMaterial color="#0f766e" roughness={0.4} metalness={0.3} wireframe={wireframe} />
        </mesh>
        {/* Multi-Notched Nickel Integrated Heat Spreader (IHS) */}
        <mesh position={[0, 0, 0.028]} material={materials.nickelMat} castShadow>
          <boxGeometry
            args={
              part.brand === 'Intel'
                ? [0.21, 0.26, 0.018]
                : [0.23, 0.23, 0.018]
            }
          />
        </mesh>
      </group>
    );
  }

  if (cat === 'cooler') {
    const isAir = part.coolerStyle === 'air_dual';
    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(part.radiatorColor || '#161920'),
      metalness: 0.72,
      roughness: 0.28,
      wireframe,
    });

    if (isAir) {
      return (
        <group position={[0, 0, 0.08]} name="Fallback_Noctua_Air_Cooler">
          {/* Dual Fin Array Towers (22 Stacked Fin Plates each) */}
          {[-0.14, 0.14].map((tx, tIdx) => (
            <group key={tIdx} position={[tx, 0, 0]}>
              {Array.from({ length: 18 }).map((_, fIdx) => (
                <mesh
                  key={fIdx}
                  position={[0, -0.19 + fIdx * 0.022, 0]}
                  material={bodyMat}
                >
                  <boxGeometry args={[0.14, 0.008, 0.36]} />
                </mesh>
              ))}
              {/* 4 Heatpipes piercing the tower */}
              {[-0.12, -0.04, 0.04, 0.12].map((zOff, hIdx) => (
                <mesh key={hIdx} position={[0, 0, zOff]} material={materials.copperMat}>
                  <cylinderGeometry args={[0.014, 0.014, 0.45, 12]} />
                </mesh>
              ))}
            </group>
          ))}
          <RealisticFan120
            position={[0, 0, 0]}
            rotation={[0, Math.PI / 2, 0]}
            scale={0.8}
            frameMat={bodyMat}
            bladeMat={materials.fanBladeMat}
            rgbMat={materials.rgbCyanMat}
            hubMat={materials.nickelMat}
            onRegisterFan={onRegisterFan}
            fanIndex={4}
          />
        </group>
      );
    }

    // NZXT Kraken Elite 360: Cylindrical Pump w/ Circular 42°C LCD + CatmullRom Tubes + 360mm Top Radiator
    return (
      <group name="Fallback_NZXT_Kraken_360">
        {/* Pump Block over CPU Socket */}
        <mesh rotation={[Math.PI / 2, 0, 0]} material={bodyMat} castShadow>
          <cylinderGeometry args={[0.165, 0.175, 0.15, 36]} />
        </mesh>
        <mesh position={[0, 0, 0.077]} material={materials.rgbCyanMat}>
          <ringGeometry args={[0.145, 0.16, 36]} />
        </mesh>
        <mesh position={[0, 0, 0.078]} material={materials.krakenLcdMat}>
          <circleGeometry args={[0.142, 36]} />
        </mesh>

        {/* Top 360mm Radiator + 3x Realistic 120mm Fans */}
        <group position={[0.26, 0.68, 0.2]}>
          <mesh material={bodyMat} castShadow>
            <boxGeometry args={[1.56, 0.095, 0.5]} />
          </mesh>
          {[-0.5, 0, 0.5].map((xPos, idx) => (
            <RealisticFan120
              key={`rad_${idx}`}
              position={[xPos, -0.08, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={0.94}
              frameMat={bodyMat}
              bladeMat={materials.fanBladeMat}
              rgbMat={materials.rgbCyanMat}
              hubMat={materials.nickelMat}
              onRegisterFan={onRegisterFan}
              fanIndex={4 + idx}
            />
          ))}
        </group>

        {/* 2 Flexible Sleeved Liquid Tubes (CatmullRomCurve3) */}
        <BraidedTube
          points={[
            [0.14, 0, 0.02],
            [0.38, 0.08, 0.22],
            [0.58, 0.35, 0.25],
            [0.72, 0.62, 0.2],
          ]}
          radius={0.023}
          material={bodyMat}
        />
        <BraidedTube
          points={[
            [0.1, -0.08, 0.02],
            [0.34, -0.02, 0.26],
            [0.52, 0.28, 0.28],
            [0.64, 0.62, 0.24],
          ]}
          radius={0.023}
          material={bodyMat}
        />
      </group>
    );
  }

  if (cat === 'gpu') {
    const shroudMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(part.shroudColor || '#1c2029'),
      metalness: 0.78,
      roughness: 0.25,
      wireframe,
    });
    const trimMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(part.trimColor || '#475569'),
      metalness: 0.88,
      roughness: 0.2,
      wireframe,
    });
    const gpuLen = 1.24;

    return (
      <group name="Fallback_ROG_Strix_RTX_4070">
        {/* 1. Textured Brushed-Metal ROG Backplate on Top */}
        <mesh position={[0, 0.098, 0]} castShadow receiveShadow>
          <boxGeometry args={[gpuLen * 0.99, 0.012, 0.48]} />
          <meshStandardMaterial
            map={gpuBackplateTex}
            metalness={0.82}
            roughness={0.24}
            wireframe={wireframe}
          />
        </mesh>

        {/* 2. Exposed Individual Silver Aluminum Fin Stack Array in Middle (42 thin metallic plates) */}
        <group position={[0, 0.01, 0]}>
          {Array.from({ length: 42 }).map((_, fIdx) => (
            <mesh
              key={`fin_${fIdx}`}
              position={[-gpuLen * 0.46 + (fIdx / 41) * (gpuLen * 0.92), 0, 0]}
              material={materials.nickelMat}
            >
              <boxGeometry args={[0.007, 0.11, 0.47]} />
            </mesh>
          ))}
        </group>

        {/* 3. 5 Exposed Copper Heatpipes running through the Fin Stack and curving out the end */}
        {[-0.16, -0.08, 0, 0.08, 0.16].map((zOff, idx) => (
          <mesh
            key={`hp_${idx}`}
            position={[0.02, 0.01, zOff]}
            rotation={[0, 0, Math.PI / 2]}
            material={materials.copperMat}
          >
            <cylinderGeometry args={[0.012, 0.012, gpuLen * 0.99, 14]} />
          </mesh>
        ))}

        {/* 4. Chamfered ROG Strix Shroud Frame Rails (Front & Rear Top/Bottom Bezels leaving fins visible) */}
        <mesh position={[0, 0.065, 0.235]} material={shroudMat} castShadow>
          <boxGeometry args={[gpuLen, 0.055, 0.03]} />
        </mesh>
        <mesh position={[0, -0.055, 0.235]} material={shroudMat} castShadow>
          <boxGeometry args={[gpuLen, 0.045, 0.03]} />
        </mesh>
        {/* Bottom Fan Shroud Deck */}
        <mesh position={[0, -0.065, 0]} material={shroudMat} castShadow>
          <boxGeometry args={[gpuLen, 0.04, 0.48]} />
        </mesh>

        {/* Angled Metallic Strix Armor Claws on Front Edge */}
        {[-0.42, -0.14, 0.14, 0.42].map((xPos, idx) => (
          <mesh
            key={`claw_${idx}`}
            position={[xPos, 0.01, 0.244]}
            rotation={[0, 0, 0.35]}
            material={trimMat}
          >
            <boxGeometry args={[0.035, 0.15, 0.015]} />
          </mesh>
        ))}

        {/* 5. Republic of Gamers RGB Light Bar & End-Cap Infinity Ring */}
        <mesh position={[-0.16, 0.068, 0.252]} material={materials.rgbPinkMat}>
          <boxGeometry args={[gpuLen * 0.46, 0.022, 0.008]} />
        </mesh>
        <mesh position={[0.32, 0.068, 0.252]} material={materials.rgbCyanMat}>
          <boxGeometry args={[gpuLen * 0.26, 0.022, 0.008]} />
        </mesh>
        <mesh position={[gpuLen * 0.495, 0.01, 0]} material={materials.rgbPinkMat}>
          <boxGeometry args={[0.012, 0.13, 0.44]} />
        </mesh>

        {/* 6. PCIe 16-Pin 12VHPWR Power Header + Braided Cable */}
        <mesh position={[0.34, 0.065, 0.24]} material={trimMat}>
          <boxGeometry args={[0.09, 0.045, 0.045]} />
        </mesh>
        <BraidedTube
          points={[
            [0.34, 0.04, 0.26],
            [0.34, -0.14, 0.31],
            [0.3, -0.35, 0.1],
            [0.26, -0.45, -0.14],
          ]}
          radius={0.022}
          material={shroudMat}
        />

        {/* 7. Dual-Slot Brushed Steel Rear I/O Bracket */}
        <mesh position={[-gpuLen / 2 - 0.015, -0.02, 0]} material={materials.nickelMat}>
          <boxGeometry args={[0.025, 0.24, 0.46]} />
        </mesh>

        {/* 8. 3x Realistic Axial-Tech Fans on Bottom with 9 Curved 30° Blades spinning */}
        {[-0.36, 0, 0.36].map((xNorm, idx) => (
          <RealisticFan120
            key={`gpu_f_${idx}`}
            position={[xNorm * gpuLen * 0.9, -0.092, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.62}
            frameMat={shroudMat}
            bladeMat={materials.fanBladeMat}
            rgbMat={materials.rgbCyanMat}
            hubMat={materials.nickelMat}
            onRegisterFan={onRegisterFan}
            fanIndex={7 + idx}
          />
        ))}
      </group>
    );
  }

  if (cat === 'ram') {
    const heatMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(part.heatsinkColor || '#181b22'),
      metalness: 0.85,
      roughness: 0.2,
      wireframe,
    });
    return (
      <group name="Fallback_GSkill_Trident_Z5_Stick">
        <mesh material={heatMat} castShadow>
          <boxGeometry args={[0.032, 0.42, 0.11]} />
        </mesh>
        {/* Brushed Aluminum Side Fin Strip */}
        <mesh position={[0.017, 0, 0]} material={materials.nickelMat}>
          <boxGeometry args={[0.003, 0.38, 0.04]} />
        </mesh>
        {/* Diffused Top RGB Bar */}
        <mesh position={[0, 0, 0.06]} material={materials.rgbCyanMat}>
          <boxGeometry args={[0.034, 0.425, 0.022]} />
        </mesh>
      </group>
    );
  }

  if (cat === 'storage') {
    return (
      <group name="Fallback_Samsung_990_PRO_SSD">
        <mesh castShadow>
          <boxGeometry args={[0.46, 0.12, 0.035]} />
          <meshStandardMaterial
            map={ssdLabelTex}
            metalness={0.65}
            roughness={0.28}
            wireframe={wireframe}
          />
        </mesh>
        <mesh position={[0, 0, 0.02]} material={materials.rgbPinkMat}>
          <boxGeometry args={[0.34, 0.014, 0.006]} />
        </mesh>
      </group>
    );
  }

  if (cat === 'psu') {
    return (
      <group name="Fallback_Corsair_RM1000_PSU">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.64, 0.42, 0.44]} />
          <meshStandardMaterial
            color="#161820"
            metalness={0.72}
            roughness={0.28}
            wireframe={wireframe}
          />
        </mesh>
        <mesh position={[0, 0, 0.224]}>
          <planeGeometry args={[0.56, 0.28]} />
          <meshStandardMaterial
            map={psuLabelTex}
            roughness={0.22}
            metalness={0.25}
            wireframe={wireframe}
          />
        </mesh>
      </group>
    );
  }

  return null;
}

/**
 * Loads a real .glb/.gltf model via GLTFLoader + DRACOLoader.
 * Automatically falls back to HighDetailPbrFallback when the local .glb is not yet present.
 */
function GltfSocketPart({
  part,
  socketName,
  snapConfig,
  customOverrideUrl,
  showBoundingLabels = false,
  wireframeMode = false,
  onRegisterFan,
  materials,
  children,
}) {
  const [loadState, setLoadState] = useState({
    status: 'loading',
    scene: null,
  });

  const targetUrl = customOverrideUrl || part?.model3dPath;

  useEffect(() => {
    let isMounted = true;
    if (!targetUrl) return undefined;

    if (gltfCache.has(targetUrl)) {
      const cached = gltfCache.get(targetUrl);
      if (cached.status === 'loaded' && cached.scene) {
        Promise.resolve().then(() => {
          if (isMounted) {
            setLoadState({
              status: 'loaded',
              scene: cached.scene.clone(true),
            });
          }
        });
        return undefined;
      }
    }

    const isBlobUrl = targetUrl.startsWith('blob:');
    const checkPromise = isBlobUrl
      ? Promise.resolve(true)
      : fetch(targetUrl, { method: 'HEAD' })
          .then((res) => {
            const ct = res.headers.get('content-type') || '';
            return res.ok && !ct.includes('text/html');
          })
          .catch(() => false);

    checkPromise.then((exists) => {
      if (!isMounted) return;
      if (!exists) {
        gltfCache.set(targetUrl, { status: 'fallback', scene: null });
        setLoadState({ status: 'fallback', scene: null });
        return;
      }

      gltfLoader.load(
        targetUrl,
        (gltf) => {
          if (!isMounted) return;
          gltfCache.set(targetUrl, { status: 'loaded', scene: gltf.scene });
          setLoadState({
            status: 'loaded',
            scene: gltf.scene.clone(true),
          });
        },
        undefined,
        () => {
          if (!isMounted) return;
          gltfCache.set(targetUrl, { status: 'fallback', scene: null });
          setLoadState({ status: 'fallback', scene: null });
        }
      );
    });

    return () => {
      isMounted = false;
    };
  }, [targetUrl]);

  useEffect(() => {
    if (!loadState.scene) return;
    loadState.scene.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => {
            m.wireframe = wireframeMode;
          });
        } else {
          child.material.wireframe = wireframeMode;
        }
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [loadState.scene, wireframeMode]);

  const { socketPos, socketRot, partScale, partOffsetPos, partOffsetRot } =
    useMemo(() => {
      const sPos = snapConfig?.position || [0, 0, 0];
      const sRot = snapConfig?.rotation || [0, 0, 0];
      const mPos = part?.mountOffset?.position || [0, 0, 0];
      const mRot = part?.mountOffset?.rotation || [0, 0, 0];
      const mScale = part?.mountOffset?.scale || [1, 1, 1];

      return {
        socketPos: new THREE.Vector3(...sPos),
        socketRot: new THREE.Euler(...sRot),
        partOffsetPos: new THREE.Vector3(...mPos),
        partOffsetRot: new THREE.Euler(...mRot),
        partScale: new THREE.Vector3(...mScale),
      };
    }, [snapConfig, part]);

  return (
    <group position={socketPos} rotation={socketRot} name={`Socket_${socketName}`}>
      <group position={partOffsetPos} rotation={partOffsetRot} scale={partScale}>
        {loadState.status === 'loaded' && loadState.scene ? (
          <primitive object={loadState.scene} />
        ) : (
          <HighDetailPbrFallback
            part={part}
            wireframe={wireframeMode}
            onRegisterFan={onRegisterFan}
            materials={materials}
          />
        )}

        {showBoundingLabels && part && (
          <Html position={[0, 0, 0]} center distanceFactor={4.2} zIndexRange={[10, 0]}>
            <div className="pointer-events-none select-none rounded-lg bg-[#0d1017]/95 border border-sky-500/50 px-2.5 py-1.5 shadow-xl text-left min-w-[175px] backdrop-blur-md">
              <span className="font-mono-tech text-[9px] uppercase tracking-wider text-sky-400 font-bold block">
                [{socketName}] {loadState.status === 'loaded' ? 'GLB ACTIVE' : 'PBR FALLBACK'}
              </span>
              <p className="text-[10px] font-semibold text-white truncate">
                {part.name}
              </p>
              <p className="font-mono-tech text-[9px] text-amber-300 truncate">
                public{targetUrl}
              </p>
            </div>
          </Html>
        )}
      </group>

      {children}
    </group>
  );
}

export default function CapeModel({
  build,
  customGlbOverrides = {},
  showBoundingLabels = false,
  wireframe = false,
  explodedView = false,
}) {
  const fanRefs = useRef([]);
  const caseSnaps = SNAP_POINTS.case;
  const moboSnaps = SNAP_POINTS.motherboard;

  const registerFan = useCallback((idx, el) => {
    if (el) fanRefs.current[idx] = el;
  }, []);

  const krakenLcdTex = useMemo(() => createKrakenLcdTexture(42, 48, 422), []);

  const materials = useMemo(() => {
    return {
      glassTransmissionMat: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#ffffff'),
        transparent: true,
        opacity: wireframe ? 0.25 : 0.14,
        transmission: wireframe ? 0 : 0.88,
        roughness: 0.04,
        metalness: 0.05,
        ior: 1.5,
        thickness: 0.04,
        depthWrite: false,
        wireframe,
      }),
      nickelMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#cbd5e1'),
        metalness: 0.92,
        roughness: 0.18,
        wireframe,
      }),
      copperMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#d97706'),
        metalness: 0.9,
        roughness: 0.2,
        wireframe,
      }),
      fanBladeMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#475569'),
        transparent: true,
        opacity: 0.88,
        roughness: 0.22,
        metalness: 0.35,
        wireframe,
      }),
      rgbCyanMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#38bdf8'),
        emissive: new THREE.Color('#38bdf8'),
        emissiveIntensity: 0.95,
        roughness: 0.25,
        wireframe,
      }),
      rgbPurpleMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#818cf8'),
        emissive: new THREE.Color('#818cf8'),
        emissiveIntensity: 0.85,
        roughness: 0.25,
        wireframe,
      }),
      rgbPinkMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#ec4899'),
        emissive: new THREE.Color('#ec4899'),
        emissiveIntensity: 1.05,
        roughness: 0.25,
        wireframe,
      }),
      krakenLcdMat: new THREE.MeshStandardMaterial({
        map: krakenLcdTex,
        emissiveMap: krakenLcdTex,
        emissive: new THREE.Color('#ffffff'),
        emissiveIntensity: 0.9,
        roughness: 0.1,
        wireframe,
      }),
    };
  }, [wireframe, krakenLcdTex]);

  useFrame((_, delta) => {
    for (let i = 0; i < fanRefs.current.length; i++) {
      const f = fanRefs.current[i];
      if (f) f.rotation.z -= delta * 8.5;
    }
  });

  const getExplodedSnap = (snapObj, offsetVec = [0, 0, 0]) => {
    if (!explodedView) return snapObj;
    return {
      ...snapObj,
      position: [
        snapObj.position[0] + offsetVec[0],
        snapObj.position[1] + offsetVec[1],
        snapObj.position[2] + offsetVec[2],
      ],
    };
  };

  const ramSticksCount = build.ram?.specs?.sticks || 2;
  const populatedRamSlots =
    ramSticksCount === 4
      ? ['slot_ram_1', 'slot_ram_2', 'slot_ram_3', 'slot_ram_4']
      : ['slot_ram_2', 'slot_ram_4'];

  return (
    <group name="PC_Socket_Hierarchy_Root">
      {/* 1. ROOT SOCKET: PC CASE */}
      <GltfSocketPart
        part={build.case}
        socketName="root_chassis"
        snapConfig={caseSnaps.root_chassis}
        customOverrideUrl={customGlbOverrides.case}
        showBoundingLabels={showBoundingLabels}
        wireframeMode={wireframe}
        onRegisterFan={registerFan}
        materials={materials}
      >
        {/* 2. CASE SOCKET: POWER SUPPLY */}
        <GltfSocketPart
          part={build.psu}
          socketName="mount_psu"
          snapConfig={getExplodedSnap(caseSnaps.mount_psu, [-0.45, -0.15, 0])}
          customOverrideUrl={customGlbOverrides.psu}
          showBoundingLabels={showBoundingLabels}
          wireframeMode={wireframe}
          onRegisterFan={registerFan}
          materials={materials}
        />

        {/* 3. CASE SOCKET: MOTHERBOARD */}
        <GltfSocketPart
          part={build.motherboard}
          socketName="mount_motherboard"
          snapConfig={getExplodedSnap(caseSnaps.mount_motherboard, [0, 0, 0.15])}
          customOverrideUrl={customGlbOverrides.motherboard}
          showBoundingLabels={showBoundingLabels}
          wireframeMode={wireframe}
          onRegisterFan={registerFan}
          materials={materials}
        >
          {/* 3A. CPU SOCKET */}
          <GltfSocketPart
            part={build.cpu}
            socketName="socket_cpu"
            snapConfig={getExplodedSnap(moboSnaps.socket_cpu, [0, 0, 0.25])}
            customOverrideUrl={customGlbOverrides.cpu}
            showBoundingLabels={showBoundingLabels}
            wireframeMode={wireframe}
            onRegisterFan={registerFan}
            materials={materials}
          />

          {/* 3B. CPU COOLER SOCKET */}
          <GltfSocketPart
            part={build.cooler}
            socketName="mount_cooler"
            snapConfig={getExplodedSnap(moboSnaps.mount_cooler, [0, 0.15, 0.52])}
            customOverrideUrl={customGlbOverrides.cooler}
            showBoundingLabels={showBoundingLabels}
            wireframeMode={wireframe}
            onRegisterFan={registerFan}
            materials={materials}
          />

          {/* 3C. GPU PCIe x16 SOCKET */}
          <GltfSocketPart
            part={build.gpu}
            socketName="slot_pcie_x16"
            snapConfig={getExplodedSnap(moboSnaps.slot_pcie_x16, [0, -0.1, 0.55])}
            customOverrideUrl={customGlbOverrides.gpu}
            showBoundingLabels={showBoundingLabels}
            wireframeMode={wireframe}
            onRegisterFan={registerFan}
            materials={materials}
          />

          {/* 3D. DDR5 RAM SLOTS */}
          {populatedRamSlots.map((slotKey, idx) => (
            <GltfSocketPart
              key={slotKey}
              part={build.ram}
              socketName={slotKey}
              snapConfig={getExplodedSnap(moboSnaps[slotKey], [0.15, 0, 0.35 + idx * 0.05])}
              customOverrideUrl={customGlbOverrides.ram}
              showBoundingLabels={showBoundingLabels && idx === 0}
              wireframeMode={wireframe}
              onRegisterFan={registerFan}
              materials={materials}
            />
          ))}

          {/* 3E. NVMe M.2 STORAGE SOCKET */}
          <GltfSocketPart
            part={build.storage}
            socketName="slot_m2_1"
            snapConfig={getExplodedSnap(moboSnaps.slot_m2_1, [0, 0, 0.3])}
            customOverrideUrl={customGlbOverrides.storage}
            showBoundingLabels={showBoundingLabels}
            wireframeMode={wireframe}
            onRegisterFan={registerFan}
            materials={materials}
          />
        </GltfSocketPart>
      </GltfSocketPart>
    </group>
  );
}
