import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import {
  SNAP_POINTS,
  createMotherboardPcbTexture,
  createGpuBackplateTexture,
  createKrakenLcdTexture,
  createHardwareLabelTexture,
  createFanHubStickerTexture,
  createBraidedSleeveTexture,
  createSoftRgbGradientTexture,
} from '../utils/textureGenerator';

// Singleton DRACOLoader + GLTFLoader for real .glb / .gltf files
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

const gltfCache = new Map();

/**
 * Creates a curved aerodynamic fan blade using THREE.ExtrudeGeometry
 * so each of the 9 fan blades has real 3D curvature and 35-degree pitch.
 */
function createCurvedBladeGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0.055, -0.012);
  shape.quadraticCurveTo(0.125, -0.03, 0.196, -0.014);
  shape.lineTo(0.199, 0.023);
  shape.quadraticCurveTo(0.125, 0.034, 0.055, 0.012);
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
 * using THREE.ExtrudeGeometry + Path hole so the fan frame is a real hollowed shroud.
 */
function createChamferedFanFrameGeometry() {
  const s = 0.24;
  const c = 0.04;
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
    bevelThickness: 0.005,
    bevelSize: 0.005,
    bevelSegments: 3,
  });
  geom.center();
  return geom;
}

/**
 * Creates an asymmetric geometric DDR5 RAM heatsink profile with beveled top fins
 */
function createAsymmetricRamHeatsinkGeometry() {
  const shape = new THREE.Shape();
  // Bottom edge along DIMM slot
  shape.moveTo(-0.205, -0.048);
  shape.lineTo(0.205, -0.048);
  // Right angled shoulder
  shape.lineTo(0.21, 0.018);
  shape.lineTo(0.155, 0.044);
  // Asymmetric central dip & angular fin peak
  shape.lineTo(0.035, 0.032);
  shape.lineTo(-0.045, 0.048);
  shape.lineTo(-0.165, 0.046);
  shape.lineTo(-0.21, 0.022);
  shape.closePath();

  const geom = new THREE.ExtrudeGeometry(shape, {
    steps: 1,
    depth: 0.028,
    bevelEnabled: true,
    bevelThickness: 0.003,
    bevelSize: 0.003,
    bevelSegments: 2,
  });
  geom.center();
  return geom;
}

const sharedBladeGeometry = createCurvedBladeGeometry();
const sharedFanFrameGeometry = createChamferedFanFrameGeometry();
const sharedRamHeatsinkGeometry = createAsymmetricRamHeatsinkGeometry();
const FAN_PITCH_35_RAD = (35 * Math.PI) / 180; // Exact 35° blade pitch

/**
 * High-Detail 120mm Industrial Fan:
 * - Chamfered 120mm hollowed frame
 * - Rubber anti-vibration corner dampeners on all 4 mounting corners
 * - Translucent diffuser ring with soft controlled gradient emission
 * - 9 curved blades angled at 35° pitch + textured center sticker hub
 */
function RealisticFan120({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  frameMat,
  rubberMat,
  bladeMat,
  diffuserMat,
  hubStickerMat,
  hubMetalMat,
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

      {/* 4 Rubber Anti-Vibration Dampener Pads on the 4 mounting corners + Screw Inserts */}
      {[
        [-0.195, -0.195],
        [0.195, -0.195],
        [-0.195, 0.195],
        [0.195, 0.195],
      ].map(([cx, cy], idx) => (
        <group key={idx} position={[cx, cy, 0]}>
          {/* Molded Rubber Dampener Pad */}
          <RoundedBox args={[0.068, 0.068, 0.072]} radius={0.01} smoothness={2} material={rubberMat} />
          {/* Stainless Screw Core */}
          <mesh rotation={[Math.PI / 2, 0, 0]} material={hubMetalMat}>
            <cylinderGeometry args={[0.011, 0.011, 0.076, 12]} />
          </mesh>
        </group>
      ))}

      {/* 4 Rear Stator Support Struts holding the motor hub */}
      {[0.6, 2.1, 3.7, 5.2].map((ang, idx) => (
        <mesh
          key={idx}
          position={[Math.cos(ang) * 0.11, Math.sin(ang) * 0.11, -0.025]}
          rotation={[0, 0, ang]}
          material={frameMat}
        >
          <boxGeometry args={[0.19, 0.013, 0.008]} />
        </mesh>
      ))}

      {/* Translucent Diffuser Halo Ring with Soft Controlled Light Gradient */}
      <mesh position={[0, 0, 0.028]} material={diffuserMat}>
        <torusGeometry args={[0.208, 0.009, 16, 48]} />
      </mesh>

      {/* Spinning Rotor: Center Motor Hub + Textured Sticker + 9 Curved 35° Blades */}
      <group ref={(el) => onRegisterFan(fanIndex, el)}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={frameMat}>
          <cylinderGeometry args={[0.068, 0.068, 0.056, 32]} />
        </mesh>
        {/* Machined Aluminum Outer Hub Bezel */}
        <mesh position={[0, 0, 0.029]} material={hubMetalMat}>
          <ringGeometry args={[0.052, 0.066, 32]} />
        </mesh>
        {/* Center Hub Brand Sticker Texture */}
        <mesh position={[0, 0, 0.0295]} material={hubStickerMat}>
          <circleGeometry args={[0.052, 32]} />
        </mesh>

        {/* 9 Curved ExtrudeGeometry Blades pitched at 35° */}
        {Array.from({ length: 9 }).map((_, idx) => {
          const angle = (idx / 9) * Math.PI * 2;
          return (
            <group key={idx} rotation={[0, 0, angle]}>
              <mesh
                geometry={sharedBladeGeometry}
                position={[0.125, 0, 0.004]}
                rotation={[FAN_PITCH_35_RAD, 0.14, 0]}
                material={bladeMat}
                castShadow
                receiveShadow
              />
            </group>
          );
        })}
      </group>
    </group>
  );
}

/**
 * Braided Nylon Sleeved Hose / Power Cable using CatmullRomCurve3
 */
function BraidedTube({ points, radius = 0.022, material }) {
  const tubeGeo = useMemo(() => {
    const vectors = points.map((p) => new THREE.Vector3(...p));
    const curve = new THREE.CatmullRomCurve3(vectors);
    return new THREE.TubeGeometry(curve, 32, radius, 16, false);
  }, [points, radius]);

  return <mesh geometry={tubeGeo} material={material} castShadow receiveShadow />;
}

/**
 * Dual-Hose Alignment Comb Clip (Presilha de alinhamento das mangueiras do AIO)
 */
function HoseAlignmentClip({ posA, posB, material, trimMat }) {
  const { mid, rotZ, dist } = useMemo(() => {
    const a = new THREE.Vector3(...posA);
    const b = new THREE.Vector3(...posB);
    const m = a.clone().add(b).multiplyScalar(0.5);
    const d = a.distanceTo(b);
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    return { mid: m, rotZ: angle, dist: d };
  }, [posA, posB]);

  return (
    <group position={mid} rotation={[0, 0, rotZ]}>
      <RoundedBox args={[dist + 0.065, 0.042, 0.068]} radius={0.01} smoothness={3} material={material} castShadow />
      <mesh position={[0, 0, 0.035]} material={trimMat}>
        <boxGeometry args={[dist * 0.55, 0.014, 0.004]} />
      </mesh>
    </group>
  );
}

/**
 * High-Detail Multi-Mesh Photorealistic Industrial PBR Renderer
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
            part?.pcbColor || '#0c0e12',
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
      color: new THREE.Color(part.chassisColor || '#14171f'),
      metalness: 0.86,
      roughness: 0.3,
      wireframe,
    });
    const interiorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(part.interiorColor || '#0f1218'),
      metalness: 0.78,
      roughness: 0.34,
      wireframe,
    });

    return (
      <group name="Fallback_HYTE_Y70_Case">
        {/* Bottom & Top Chamfered Structural Plates */}
        <RoundedBox
          position={[0, -1.3, 0]}
          args={[2.2, 0.075, 1.38]}
          radius={0.015}
          smoothness={3}
          material={chassisMat}
          castShadow
          receiveShadow
        />
        <RoundedBox
          position={[0, 1.3, 0]}
          args={[2.2, 0.065, 1.38]}
          radius={0.015}
          smoothness={3}
          material={chassisMat}
          castShadow
          receiveShadow
        />

        {/* 4 Machined Anodized Case Feet with Rubber Pads */}
        {[
          [-0.95, -1.38, -0.55],
          [0.95, -1.38, -0.55],
          [-0.95, -1.38, 0.55],
          [0.95, -1.38, 0.55],
        ].map((pos, idx) => (
          <group key={idx} position={pos}>
            <mesh material={materials.brushedAluminumMat}>
              <cylinderGeometry args={[0.092, 0.102, 0.075, 24]} />
            </mesh>
            <mesh position={[0, -0.04, 0]} material={materials.rubberMat}>
              <cylinderGeometry args={[0.095, 0.095, 0.015, 24]} />
            </mesh>
          </group>
        ))}

        {/* Rear Spine Wall & Dual-Chamber Motherboard Tray */}
        <RoundedBox
          position={[0, 0, -0.67]}
          args={[2.2, 2.56, 0.04]}
          radius={0.008}
          smoothness={2}
          material={chassisMat}
          castShadow
          receiveShadow
        />
        <RoundedBox
          position={[-0.22, 0, -0.18]}
          args={[1.72, 2.52, 0.042]}
          radius={0.008}
          smoothness={2}
          material={interiorMat}
          castShadow
          receiveShadow
        />

        {/* Ribbed Rubber Cable Grommets */}
        {[0.45, -0.05, -0.55].map((yPos, idx) => (
          <RoundedBox
            key={idx}
            position={[0.42, yPos, -0.155]}
            args={[0.115, 0.32, 0.028]}
            radius={0.008}
            smoothness={2}
            material={materials.rubberMat}
          />
        ))}

        {/* =================================================================
            SIDE FAN BRACKET ANCHOR (mount_side_fan_bracket):
            Matte dark-gray/black steel rail frame + 3x 120mm fans flush & aligned vertically inside the rail
           ================================================================= */}
        <group position={SNAP_POINTS.case.mount_side_fan_bracket?.position || [0.76, 0.04, -0.22]} name="Anchor_Side_Fan_Bracket">
          {/* Recessed Steel Tray Wall behind the bracket */}
          <RoundedBox
            position={[0, -0.04, -0.042]}
            args={[0.62, 2.52, 0.032]}
            radius={0.006}
            smoothness={2}
            material={interiorMat}
            castShadow
            receiveShadow
          />

          {/* Matte Dark-Gray/Black Vertical Mounting Rails (Left & Right C-Channel Chassis Rails) */}
          {[-0.265, 0.265].map((rx, idx) => (
            <RoundedBox
              key={`side_rail_${idx}`}
              position={[rx, 0, 0]}
              args={[0.042, 1.62, 0.078]}
              radius={0.006}
              smoothness={2}
              material={chassisMat}
              castShadow
              receiveShadow
            />
          ))}

          {/* Horizontal Cross-Bar Mounting Ribs & Top/Bottom End Caps */}
          {[-0.76, -0.255, 0.255, 0.76].map((ry, idx) => (
            <RoundedBox
              key={`side_cross_${idx}`}
              position={[0, ry, 0]}
              args={[0.56, 0.036, 0.076]}
              radius={0.005}
              smoothness={2}
              material={chassisMat}
              castShadow
            />
          ))}

          {/* 3x 120mm Side Intake Fans flush inside the vertical bracket rails, facing interior */}
          {[-0.51, 0, 0.51].map((yPos, idx) => (
            <RealisticFan120
              key={`side_${idx}`}
              position={[0, yPos, 0.006]}
              rotation={[0, 0, 0]}
              scale={0.98}
              frameMat={interiorMat}
              rubberMat={materials.rubberMat}
              bladeMat={materials.fanBladeMat}
              diffuserMat={materials.diffuserRingMat}
              hubStickerMat={materials.fanHubStickerMat}
              hubMetalMat={materials.brushedAluminumMat}
              onRegisterFan={onRegisterFan}
              fanIndex={idx + 1}
            />
          ))}
        </group>

        {/* =================================================================
            REAR EXHAUST WALL + I/O SHIELD + REAR FAN GRILL BRACKET (mount_rear_exhaust_fan)
            Fixed directly onto the rear chassis grill, aligned with Motherboard I/O
           ================================================================= */}
        <RoundedBox
          position={[-1.08, 0, 0]}
          args={[0.05, 2.56, 1.38]}
          radius={0.01}
          smoothness={2}
          material={chassisMat}
          castShadow
          receiveShadow
        />

        {/* Rear Motherboard I/O Shield Bezel Plate on the rear wall next to exhaust fan */}
        <group position={[-1.05, 0.48, -0.15]} name="Rear_Mobo_IO_Shield">
          <RoundedBox
            args={[0.025, 0.62, 0.16]}
            radius={0.004}
            smoothness={2}
            material={interiorMat}
          />
          {[-0.2, -0.08, 0.04, 0.16].map((ioY, idx) => (
            <mesh key={idx} position={[0.014, ioY, 0]} material={materials.brushedAluminumMat}>
              <boxGeometry args={[0.006, 0.06, 0.09]} />
            </mesh>
          ))}
        </group>

        {/* Rear Exhaust Fan Bracket Housing + Grill Bars + 120mm Exhaust Fan */}
        <group
          position={SNAP_POINTS.case.mount_rear_exhaust_fan?.position || [-1.035, 0.5, 0.16]}
          rotation={[0, Math.PI / 2, 0]}
          name="Anchor_Rear_Exhaust_Fan"
        >
          {/* Matte Black Rear Grill Mounting Frame */}
          {[-0.24, 0.24].map((offset, idx) => (
            <React.Fragment key={`rear_frame_${idx}`}>
              <RoundedBox
                position={[offset, 0, -0.012]}
                args={[0.036, 0.52, 0.068]}
                radius={0.005}
                smoothness={2}
                material={chassisMat}
                castShadow
              />
              <RoundedBox
                position={[0, offset, -0.012]}
                args={[0.52, 0.036, 0.068]}
                radius={0.005}
                smoothness={2}
                material={chassisMat}
                castShadow
              />
            </React.Fragment>
          ))}

          {/* Perforated Rear Exhaust Grill Slats behind the fan */}
          {[-0.16, -0.08, 0, 0.08, 0.16].map((gy, idx) => (
            <mesh key={`grill_${idx}`} position={[0, gy, -0.032]} material={interiorMat}>
              <boxGeometry args={[0.44, 0.01, 0.008]} />
            </mesh>
          ))}

          {/* 120mm Rear Exhaust Fan flush inside the rear grill frame */}
          <RealisticFan120
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={0.94}
            frameMat={interiorMat}
            rubberMat={materials.rubberMat}
            bladeMat={materials.fanBladeMat}
            diffuserMat={materials.diffuserRingMat}
            hubStickerMat={materials.fanHubStickerMat}
            hubMetalMat={materials.brushedAluminumMat}
            onRegisterFan={onRegisterFan}
            fanIndex={0}
          />
        </group>

        {/* =================================================================
            BOTTOM INTAKE FAN TRAY BRACKET (mount_bottom_fan_bracket)
           ================================================================= */}
        <group
          position={SNAP_POINTS.case.mount_bottom_fan_bracket?.position || [-0.12, -1.23, 0.18]}
          rotation={[-Math.PI / 2, 0, 0]}
          name="Anchor_Bottom_Fan_Bracket"
        >
          {/* Bottom Chassis Rail Tray */}
          {[-0.25, 0.25].map((ry, idx) => (
            <RoundedBox
              key={`bot_rail_${idx}`}
              position={[0, ry, -0.01]}
              args={[1.58, 0.038, 0.068]}
              radius={0.005}
              smoothness={2}
              material={chassisMat}
              castShadow
            />
          ))}
          {[-0.76, -0.255, 0.255, 0.76].map((rx, idx) => (
            <RoundedBox
              key={`bot_cross_${idx}`}
              position={[rx, 0, -0.01]}
              args={[0.036, 0.52, 0.068]}
              radius={0.005}
              smoothness={2}
              material={chassisMat}
            />
          ))}

          {[-0.51, 0, 0.51].map((xPos, idx) => (
            <RealisticFan120
              key={`bot_${idx}`}
              position={[xPos, 0, 0]}
              rotation={[0, 0, 0]}
              scale={0.94}
              frameMat={interiorMat}
              rubberMat={materials.rubberMat}
              bladeMat={materials.fanBladeMat}
              diffuserMat={materials.diffuserRingMat}
              hubStickerMat={materials.fanHubStickerMat}
              hubMetalMat={materials.brushedAluminumMat}
              onRegisterFan={onRegisterFan}
              fanIndex={10 + idx}
            />
          ))}
        </group>

        {/* Tempered Glass Panels: MeshPhysicalMaterial (roughness: 0.05, transmission: 0.95, ior: 1.5) + Edge Bevel Highlights */}
        <group position={[1.08, 0, 0]}>
          <mesh material={materials.glassTransmissionMat}>
            <boxGeometry args={[0.022, 2.52, 1.34]} />
          </mesh>
          {/* Polished Glass Edge Catchlight Strips */}
          <mesh position={[0, 0, 0.67]} material={materials.glassEdgeMat}>
            <boxGeometry args={[0.024, 2.52, 0.008]} />
          </mesh>
          <mesh position={[0, 1.24, 0]} material={chassisMat}>
            <boxGeometry args={[0.032, 0.06, 1.36]} />
          </mesh>
          <mesh position={[0, -1.24, 0]} material={chassisMat}>
            <boxGeometry args={[0.032, 0.06, 1.36]} />
          </mesh>
        </group>

        <group position={[0, 0, 0.69]}>
          <mesh material={materials.glassTransmissionMat}>
            <boxGeometry args={[2.16, 2.52, 0.022]} />
          </mesh>
          {/* Polished Glass Vertical Edge Highlight */}
          <mesh position={[1.075, 0, 0]} material={materials.glassEdgeMat}>
            <boxGeometry args={[0.01, 2.52, 0.025]} />
          </mesh>
          <mesh position={[-1.075, 0, 0]} material={materials.glassEdgeMat}>
            <boxGeometry args={[0.01, 2.52, 0.025]} />
          </mesh>
          <mesh position={[0, 1.24, 0]} material={chassisMat}>
            <boxGeometry args={[2.18, 0.06, 0.03]} />
          </mesh>
          <mesh position={[0, -1.24, 0]} material={chassisMat}>
            <boxGeometry args={[2.18, 0.06, 0.03]} />
          </mesh>
        </group>
      </group>
    );
  }

  if (cat === 'motherboard') {
    const vrmMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(part.vrmColor || '#262b36'),
      metalness: 0.9,
      roughness: 0.28,
      wireframe,
    });
    const tufAccentMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(part.accentColor || '#f59e0b'),
      metalness: 0.65,
      roughness: 0.3,
      wireframe,
    });

    return (
      <group name="Fallback_ASUS_TUF_B650M_Motherboard">
        {/* Semi-Matte Black PCB Board with High-Resolution Golden/Copper IC Trace Canvas Texture */}
        <RoundedBox
          args={[1.26, 1.54, 0.036]}
          radius={0.008}
          smoothness={2}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            map={pcbTex}
            metalness={0.35}
            roughness={0.42}
            wireframe={wireframe}
          />
        </RoundedBox>

        {/* Left VRM Brushed Aluminum Heatsink with Embossed Relief Cuts & Chamfered Edges */}
        <group position={[-0.48, 0.34, 0.072]}>
          <RoundedBox
            args={[0.245, 0.78, 0.105]}
            radius={0.012}
            smoothness={3}
            material={vrmMat}
            castShadow
            receiveShadow
          />
          {/* 9 Brushed Aluminum Embossed Fin Ridges with Relief Cuts */}
          {Array.from({ length: 9 }).map((_, idx) => (
            <RoundedBox
              key={idx}
              position={[0.058, -0.32 + idx * 0.08, 0.056]}
              args={[0.115, 0.044, 0.028]}
              radius={0.004}
              smoothness={2}
              material={materials.brushedAluminumMat}
              castShadow
            />
          ))}
          {/* Anodized TUF Industrial Accent Bars */}
          <mesh position={[-0.045, 0.14, 0.056]} material={tufAccentMat}>
            <boxGeometry args={[0.065, 0.36, 0.008]} />
          </mesh>
          <mesh position={[-0.045, -0.22, 0.056]} material={tufAccentMat}>
            <boxGeometry args={[0.065, 0.12, 0.008]} />
          </mesh>
        </group>

        {/* Top VRM Brushed Aluminum Heatsink with 12 Vertical Machined Channels */}
        <group position={[-0.06, 0.65, 0.068]}>
          <RoundedBox
            args={[0.56, 0.155, 0.088]}
            radius={0.01}
            smoothness={3}
            material={vrmMat}
            castShadow
            receiveShadow
          />
          {Array.from({ length: 12 }).map((_, idx) => (
            <RoundedBox
              key={idx}
              position={[-0.24 + idx * 0.044, 0, 0.048]}
              args={[0.022, 0.145, 0.024]}
              radius={0.003}
              smoothness={2}
              material={materials.brushedAluminumMat}
              castShadow
            />
          ))}
          <mesh position={[0, 0.042, 0.048]} material={tufAccentMat}>
            <boxGeometry args={[0.42, 0.02, 0.008]} />
          </mesh>
        </group>

        {/* Physical L-Shaped Power Delivery Array around CPU Socket:
            Alloy Chokes + Silver Cylindrical Solid Capacitors (Top & Left rows) */}
        {Array.from({ length: 10 }).map((_, idx) => (
          <group key={`vrm_top_${idx}`}>
            {/* Chamfered Alloy Ferrite Choke */}
            <RoundedBox
              position={[-0.28 + idx * 0.046, 0.535, 0.034]}
              args={[0.036, 0.036, 0.03]}
              radius={0.004}
              smoothness={2}
              material={vrmMat}
              castShadow
            />
            {/* Silver Cylindrical Solid Capacitor with polarity marking cap */}
            <mesh
              position={[-0.28 + idx * 0.046, 0.492, 0.035]}
              rotation={[Math.PI / 2, 0, 0]}
              material={materials.nickelMat}
              castShadow
            >
              <cylinderGeometry args={[0.012, 0.012, 0.032, 16]} />
            </mesh>
          </group>
        ))}

        {/* Vertical Column of 7 Silver Cylindrical Solid Capacitors + Chokes on Left of CPU Socket */}
        {Array.from({ length: 7 }).map((_, idx) => (
          <group key={`vrm_left_${idx}`}>
            <RoundedBox
              position={[-0.32, 0.14 + idx * 0.05, 0.034]}
              args={[0.036, 0.036, 0.03]}
              radius={0.004}
              smoothness={2}
              material={vrmMat}
              castShadow
            />
            <mesh
              position={[-0.275, 0.14 + idx * 0.05, 0.035]}
              rotation={[Math.PI / 2, 0, 0]}
              material={materials.nickelMat}
              castShadow
            >
              <cylinderGeometry args={[0.012, 0.012, 0.032, 16]} />
            </mesh>
          </group>
        ))}

        {/* Rear Audio Filtering Gold/Copper Capacitors */}
        {[-0.64, -0.58, -0.52, -0.46, -0.4].map((yPos, idx) => (
          <mesh
            key={`aud_cap_${idx}`}
            position={[-0.56, yPos, 0.035]}
            rotation={[Math.PI / 2, 0, 0]}
            material={materials.copperMat}
            castShadow
          >
            <cylinderGeometry args={[0.016, 0.016, 0.036, 16]} />
          </mesh>
        ))}

        {/* Silver Round CR2032 CMOS Battery with Retention Socket & Positive Contact Clip */}
        <group position={[-0.28, -0.62, 0.028]}>
          {/* Black Plastic Retention Holder Base */}
          <mesh rotation={[Math.PI / 2, 0, 0]} material={vrmMat} castShadow>
            <cylinderGeometry args={[0.056, 0.056, 0.018, 28]} />
          </mesh>
          {/* Mirror-Silver CR2032 Coin Cell */}
          <mesh
            position={[0, 0, 0.006]}
            rotation={[Math.PI / 2, 0, 0]}
            material={materials.nickelMat}
            castShadow
          >
            <cylinderGeometry args={[0.047, 0.047, 0.015, 28]} />
          </mesh>
          {/* Metallic Spring Retention Clip */}
          <mesh position={[0.042, 0, 0.015]} material={materials.brushedAluminumMat}>
            <boxGeometry args={[0.02, 0.024, 0.006]} />
          </mesh>
        </group>

        {/* 4x DDR5 DIMM Slots with Top & Bottom Retention Latches */}
        {[0, 1, 2, 3].map((slotIdx) => {
          const sx = 0.22 + slotIdx * 0.06;
          return (
            <group key={`dimm_${slotIdx}`} position={[sx, 0.34, 0.036]}>
              <mesh material={vrmMat} castShadow>
                <boxGeometry args={[0.022, 0.44, 0.032]} />
              </mesh>
              <mesh position={[0, 0.23, 0.012]} material={materials.brushedAluminumMat}>
                <boxGeometry args={[0.026, 0.022, 0.034]} />
              </mesh>
              <mesh position={[0, -0.23, 0.012]} material={materials.brushedAluminumMat}>
                <boxGeometry args={[0.026, 0.022, 0.034]} />
              </mesh>
            </group>
          );
        })}

        {/* Metal-Armored PCIe 5.0 x16 SafeSlots with Stainless Steel Side Shields & Locking Latch */}
        {[-0.18, -0.54].map((py, idx) => (
          <group key={`pcie_${idx}`} position={[-0.06, py, 0.038]}>
            {/* Outer Stainless Steel Armor Shell */}
            <RoundedBox
              args={[0.69, 0.042, 0.042]}
              radius={0.005}
              smoothness={2}
              material={materials.nickelMat}
              castShadow
            />
            {/* Inner Dark Slot Connector Channel */}
            <mesh position={[0, 0, 0.006]} material={vrmMat}>
              <boxGeometry args={[0.65, 0.018, 0.034]} />
            </mesh>
            {/* Retention Wing Tab */}
            <mesh position={[0.355, 0, 0.01]} material={tufAccentMat}>
              <boxGeometry args={[0.032, 0.048, 0.032]} />
            </mesh>
          </group>
        ))}

        {/* Brushed Aluminum M.2 Thermal Heatsink & Chipset Armor with Relief Grooves */}
        <group position={[-0.08, -0.36, 0.044]}>
          <RoundedBox
            args={[0.56, 0.16, 0.042]}
            radius={0.006}
            smoothness={2}
            material={vrmMat}
            castShadow
          />
          {[-0.04, 0, 0.04].map((ry, rIdx) => (
            <mesh key={rIdx} position={[0, ry, 0.022]} material={materials.brushedAluminumMat}>
              <boxGeometry args={[0.5, 0.012, 0.005]} />
            </mesh>
          ))}
        </group>

        <group position={[0.28, -0.44, 0.05]}>
          <RoundedBox
            args={[0.38, 0.34, 0.054]}
            radius={0.008}
            smoothness={3}
            material={vrmMat}
            castShadow
          />
          <mesh position={[0, 0, 0.029]} material={tufAccentMat}>
            <boxGeometry args={[0.28, 0.028, 0.006]} />
          </mesh>
        </group>

        {/* 24-Pin ATX Power Header & 8-Pin EPS Header */}
        <mesh position={[0.56, 0.22, 0.046]} material={vrmMat} castShadow>
          <boxGeometry args={[0.055, 0.3, 0.062]} />
        </mesh>
        <mesh position={[-0.48, 0.72, 0.046]} material={vrmMat} castShadow>
          <boxGeometry args={[0.16, 0.05, 0.052]} />
        </mesh>
      </group>
    );
  }

  if (cat === 'cpu') {
    return (
      <group name="Fallback_AM5_LGA_CPU">
        {/* Brushed Steel Socket Retention ILM Frame & Lever */}
        <RoundedBox
          args={[0.33, 0.35, 0.022]}
          radius={0.004}
          smoothness={2}
          material={materials.brushedAluminumMat}
          castShadow
        />
        <mesh position={[0.18, 0, 0.01]} material={materials.nickelMat}>
          <cylinderGeometry args={[0.006, 0.006, 0.36, 12]} />
        </mesh>
        {/* Teal/Green Fiberglass CPU Substrate */}
        <mesh position={[0, 0, 0.016]}>
          <boxGeometry args={[0.27, 0.27, 0.012]} />
          <meshStandardMaterial color="#0f766e" roughness={0.35} metalness={0.4} wireframe={wireframe} />
        </mesh>
        {/* Chamfered Nickel-Plated Copper Integrated Heat Spreader (IHS) */}
        <RoundedBox
          position={[0, 0, 0.03]}
          args={part.brand === 'Intel' ? [0.21, 0.26, 0.02] : [0.23, 0.23, 0.02]}
          radius={0.005}
          smoothness={3}
          material={materials.nickelMat}
          castShadow
        />
      </group>
    );
  }

  if (cat === 'cooler') {
    const isAir = part.coolerStyle === 'air_dual';
    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(part.radiatorColor || '#151820'),
      metalness: 0.85,
      roughness: 0.28,
      wireframe,
    });

    if (isAir) {
      return (
        <group position={[0, 0, 0.08]} name="Fallback_Noctua_Air_Cooler">
          {[-0.14, 0.14].map((tx, tIdx) => (
            <group key={tIdx} position={[tx, 0, 0]}>
              {Array.from({ length: 20 }).map((_, fIdx) => (
                <mesh
                  key={fIdx}
                  position={[0, -0.19 + fIdx * 0.02, 0]}
                  material={bodyMat}
                  castShadow
                >
                  <boxGeometry args={[0.14, 0.007, 0.36]} />
                </mesh>
              ))}
              {[-0.12, -0.04, 0.04, 0.12].map((zOff, hIdx) => (
                <mesh key={hIdx} position={[0, 0, zOff]} material={materials.copperMat}>
                  <cylinderGeometry args={[0.014, 0.014, 0.45, 14]} />
                </mesh>
              ))}
            </group>
          ))}
          <RealisticFan120
            position={[0, 0, 0]}
            rotation={[0, Math.PI / 2, 0]}
            scale={0.8}
            frameMat={bodyMat}
            rubberMat={materials.rubberMat}
            bladeMat={materials.fanBladeMat}
            diffuserMat={materials.diffuserRingMat}
            hubStickerMat={materials.fanHubStickerMat}
            hubMetalMat={materials.brushedAluminumMat}
            onRegisterFan={onRegisterFan}
            fanIndex={4}
          />
        </group>
      );
    }

    // NZXT Kraken Elite 360 AIO:
    // - Pump block with machined aluminum outer ring & mirror-glass top displaying 42°C telemetry
    // - Braided nylon hoses with alignment clips (presilhas)
    // - 360mm radiator with 3 chamfered 120mm fans
    const hoseA = [
      [0.14, 0.02, 0.02],
      [0.36, 0.08, 0.22],
      [0.56, 0.35, 0.25],
      [0.7, 0.62, 0.2],
    ];
    const hoseB = [
      [0.11, -0.07, 0.02],
      [0.33, -0.01, 0.25],
      [0.52, 0.29, 0.28],
      [0.64, 0.62, 0.24],
    ];

    return (
      <group name="Fallback_NZXT_Kraken_360">
        {/* Lower Pump Housing */}
        <mesh rotation={[Math.PI / 2, 0, 0]} material={bodyMat} castShadow receiveShadow>
          <cylinderGeometry args={[0.162, 0.174, 0.145, 40]} />
        </mesh>

        {/* Machined Anodized Aluminum Outer Bezel Ring with Chamfered Step */}
        <mesh position={[0, 0, 0.056]} rotation={[Math.PI / 2, 0, 0]} material={materials.brushedAluminumMat} castShadow>
          <cylinderGeometry args={[0.172, 0.168, 0.042, 40, 1, true]} />
        </mesh>
        <mesh position={[0, 0, 0.076]} material={materials.brushedAluminumMat}>
          <ringGeometry args={[0.148, 0.172, 40]} />
        </mesh>

        {/* Soft Translucent Halo Ring inside Pump Bezel */}
        <mesh position={[0, 0, 0.077]} material={materials.diffuserRingMat}>
          <ringGeometry args={[0.138, 0.148, 40]} />
        </mesh>

        {/* Internal LCD Telemetry Display (42°C) */}
        <mesh position={[0, 0, 0.0775]} material={materials.krakenLcdMat}>
          <circleGeometry args={[0.138, 40]} />
        </mesh>

        {/* Mirror-Finish Clearcoat Glass Cap over the LCD */}
        <mesh position={[0, 0, 0.08]} material={materials.mirrorGlassCapMat}>
          <circleGeometry args={[0.148, 40]} />
        </mesh>

        {/* Top 360mm Aluminum Radiator + 3x Realistic 120mm Fans */}
        <group position={[0.26, 0.68, 0.2]}>
          <RoundedBox
            args={[1.56, 0.098, 0.5]}
            radius={0.01}
            smoothness={3}
            material={bodyMat}
            castShadow
            receiveShadow
          />
          {[-0.5, 0, 0.5].map((xPos, idx) => (
            <RealisticFan120
              key={`rad_${idx}`}
              position={[xPos, -0.082, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={0.94}
              frameMat={bodyMat}
              rubberMat={materials.rubberMat}
              bladeMat={materials.fanBladeMat}
              diffuserMat={materials.diffuserRingMat}
              hubStickerMat={materials.fanHubStickerMat}
              hubMetalMat={materials.brushedAluminumMat}
              onRegisterFan={onRegisterFan}
              fanIndex={4 + idx}
            />
          ))}
        </group>

        {/* 2 Braided Nylon Sleeved Liquid Hoses */}
        <BraidedTube points={hoseA} radius={0.023} material={materials.braidedSleeveMat} />
        <BraidedTube points={hoseB} radius={0.023} material={materials.braidedSleeveMat} />

        {/* 2 Hose Alignment Clips (Presilhas de Alinhamento) */}
        <HoseAlignmentClip
          posA={hoseA[1]}
          posB={hoseB[1]}
          material={bodyMat}
          trimMat={materials.brushedAluminumMat}
        />
        <HoseAlignmentClip
          posA={hoseA[2]}
          posB={hoseB[2]}
          material={bodyMat}
          trimMat={materials.brushedAluminumMat}
        />
      </group>
    );
  }

  if (cat === 'gpu') {
    const shroudMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(part.shroudColor || '#1a1e26'),
      metalness: 0.86,
      roughness: 0.28,
      wireframe,
    });
    const trimMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(part.trimColor || '#64748b'),
      metalness: 0.92,
      roughness: 0.24,
      wireframe,
    });
    const gpuLen = 1.24;

    return (
      <group name="Fallback_ROG_Strix_RTX_4070_ThreeLayer">
        {/* =================================================================
            LAYER 1 (TOP): Brushed-Metal Backplate with Ventilation Cutouts
           ================================================================= */}
        <RoundedBox
          position={[0, 0.098, 0]}
          args={[gpuLen * 0.99, 0.015, 0.48]}
          radius={0.004}
          smoothness={2}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            map={gpuBackplateTex}
            metalness={0.9}
            roughness={0.26}
            wireframe={wireframe}
          />
        </RoundedBox>

        {/* =================================================================
            LAYER 2 (MIDDLE): Dense Array of 56 Aluminized Silver Heatsink Fins
            + 5 Exposed Copper Heatpipes running through the fin stack
           ================================================================= */}
        <group position={[0, 0.012, 0]}>
          {Array.from({ length: 56 }).map((_, fIdx) => (
            <mesh
              key={`fin_${fIdx}`}
              position={[-gpuLen * 0.465 + (fIdx / 55) * (gpuLen * 0.93), 0, 0]}
              material={materials.nickelMat}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[0.006, 0.115, 0.468]} />
            </mesh>
          ))}
        </group>

        {/* 5 Exposed Copper Heatpipes piercing the heatsink fin stack */}
        {[-0.16, -0.08, 0, 0.08, 0.16].map((zOff, idx) => (
          <mesh
            key={`hp_${idx}`}
            position={[0.02, 0.012, zOff]}
            rotation={[0, 0, Math.PI / 2]}
            material={materials.copperMat}
            castShadow
          >
            <cylinderGeometry args={[0.0125, 0.0125, gpuLen * 0.995, 16]} />
          </mesh>
        ))}

        {/* =================================================================
            LAYER 3 (BOTTOM): Chamfered Shroud Housing with 3 Recessed Fans
            (9 curved blades at 35° pitch + textured sticker hub)
           ================================================================= */}
        {/* Upper & Lower Chamfered Shroud Frame Rails */}
        <RoundedBox
          position={[0, 0.066, 0.235]}
          args={[gpuLen, 0.052, 0.032]}
          radius={0.006}
          smoothness={2}
          material={shroudMat}
          castShadow
        />
        <RoundedBox
          position={[0, -0.056, 0.235]}
          args={[gpuLen, 0.044, 0.032]}
          radius={0.006}
          smoothness={2}
          material={shroudMat}
          castShadow
        />
        {/* Lower Shroud Deck */}
        <RoundedBox
          position={[0, -0.068, 0]}
          args={[gpuLen, 0.042, 0.48]}
          radius={0.008}
          smoothness={3}
          material={shroudMat}
          castShadow
          receiveShadow
        />

        {/* Angled Brushed Metal Strix Armor Accents */}
        {[-0.42, -0.14, 0.14, 0.42].map((xPos, idx) => (
          <RoundedBox
            key={`claw_${idx}`}
            position={[xPos, 0.01, 0.244]}
            rotation={[0, 0, 0.35]}
            args={[0.036, 0.15, 0.016]}
            radius={0.003}
            smoothness={2}
            material={trimMat}
            castShadow
          />
        ))}

        {/* Controlled Translucent Diffused Light Bar on Side Edge */}
        <mesh position={[-0.12, 0.068, 0.253]} material={materials.diffuserBarMat}>
          <boxGeometry args={[gpuLen * 0.62, 0.018, 0.008]} />
        </mesh>
        <mesh position={[gpuLen * 0.495, 0.01, 0]} material={materials.diffuserBarMat}>
          <boxGeometry args={[0.012, 0.125, 0.44]} />
        </mesh>

        {/* PCIe 16-Pin 12VHPWR Power Header + Braided Nylon Cable */}
        <RoundedBox
          position={[0.34, 0.065, 0.24]}
          args={[0.09, 0.045, 0.045]}
          radius={0.004}
          smoothness={2}
          material={trimMat}
        />
        <BraidedTube
          points={[
            [0.34, 0.04, 0.26],
            [0.34, -0.14, 0.31],
            [0.3, -0.35, 0.1],
            [0.26, -0.45, -0.14],
          ]}
          radius={0.022}
          material={materials.braidedSleeveMat}
        />

        {/* Dual-Slot Stainless Steel Rear I/O Bracket */}
        <RoundedBox
          position={[-gpuLen / 2 - 0.015, -0.02, 0]}
          args={[0.026, 0.24, 0.46]}
          radius={0.003}
          smoothness={2}
          material={materials.nickelMat}
        />

        {/* 3 Recessed Axial-Tech Fans on Bottom with 9 Curved 35° Blades + Textured Hub Sticker */}
        {[-0.36, 0, 0.36].map((xNorm, idx) => (
          <RealisticFan120
            key={`gpu_f_${idx}`}
            position={[xNorm * gpuLen * 0.9, -0.09, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.62}
            frameMat={shroudMat}
            rubberMat={materials.rubberMat}
            bladeMat={materials.fanBladeMat}
            diffuserMat={materials.diffuserRingMat}
            hubStickerMat={materials.fanHubStickerMat}
            hubMetalMat={materials.brushedAluminumMat}
            onRegisterFan={onRegisterFan}
            fanIndex={7 + idx}
          />
        ))}
      </group>
    );
  }

  if (cat === 'ram') {
    const matteHeatsinkMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(part.heatsinkColor || '#181b22'),
      metalness: 0.72,
      roughness: 0.38,
      wireframe,
    });
    return (
      <group name="Fallback_Asymmetric_DDR5_Stick">
        {/* Asymmetric Geometric Extruded Heatsink Armor */}
        <mesh
          geometry={sharedRamHeatsinkGeometry}
          rotation={[0, Math.PI / 2, Math.PI / 2]}
          material={matteHeatsinkMat}
          castShadow
          receiveShadow
        />
        {/* Brushed Aluminum Diagonal Accent Wing */}
        <RoundedBox
          position={[0.016, 0.01, -0.004]}
          args={[0.004, 0.36, 0.038]}
          radius={0.001}
          smoothness={2}
          material={materials.brushedAluminumMat}
        />
        {/* Translucent Top Diffuser Light Bar with Subtle Gradient */}
        <RoundedBox
          position={[0, 0, 0.056]}
          args={[0.03, 0.422, 0.02]}
          radius={0.005}
          smoothness={2}
          material={materials.diffuserBarMat}
        />
      </group>
    );
  }

  if (cat === 'storage') {
    return (
      <group name="Fallback_Samsung_990_PRO_Integrated_Heatsink_SSD">
        {/* Dark Green/Black M.2 2280 PCB Substrate with Gold Key-M Edge */}
        <mesh position={[0, 0, -0.01]} castShadow>
          <boxGeometry args={[0.48, 0.125, 0.008]} />
          <meshStandardMaterial color="#0f172a" metalness={0.45} roughness={0.38} wireframe={wireframe} />
        </mesh>
        <mesh position={[-0.235, 0, -0.01]} material={materials.copperMat}>
          <boxGeometry args={[0.016, 0.11, 0.01]} />
        </mesh>

        {/* Integrated Chamfered Metallic M.2 Heatsink Body */}
        <RoundedBox
          position={[0, 0, 0.008]}
          args={[0.45, 0.122, 0.028]}
          radius={0.005}
          smoothness={3}
          material={materials.brushedAluminumMat}
          castShadow
          receiveShadow
        />

        {/* Machined Cooling Grooves on Integrated M.2 Heatsink */}
        {[-0.16, -0.1, 0.1, 0.16].map((gx, idx) => (
          <mesh key={idx} position={[gx, 0, 0.023]} material={materials.nickelMat}>
            <boxGeometry args={[0.018, 0.118, 0.004]} />
          </mesh>
        ))}

        {/* Thermal Specification Label Sticker on Top Center */}
        <mesh position={[0, 0, 0.024]}>
          <planeGeometry args={[0.38, 0.106]} />
          <meshStandardMaterial
            map={ssdLabelTex}
            metalness={0.35}
            roughness={0.32}
            wireframe={wireframe}
          />
        </mesh>
      </group>
    );
  }

  if (cat === 'psu') {
    return (
      <group name="Fallback_Corsair_RM1000_PSU">
        <RoundedBox
          args={[0.64, 0.42, 0.44]}
          radius={0.012}
          smoothness={3}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color="#151821"
            metalness={0.85}
            roughness={0.32}
            wireframe={wireframe}
          />
        </RoundedBox>
        <mesh position={[0, 0, 0.222]}>
          <planeGeometry args={[0.56, 0.28]} />
          <meshStandardMaterial
            map={psuLabelTex}
            roughness={0.28}
            metalness={0.35}
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
  const fanHubStickerTex = useMemo(() => createFanHubStickerTexture(), []);
  const braidedSleeveTex = useMemo(() => createBraidedSleeveTexture(), []);
  const softRgbGradTex = useMemo(() => createSoftRgbGradientTexture(), []);

  const materials = useMemo(() => {
    return {
      // Tempered Glass: roughness 0.05, transmission 0.95, ior 1.5, subtle edge sheen
      glassTransmissionMat: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#f8fafc'),
        transparent: true,
        opacity: wireframe ? 0.25 : 1.0,
        transmission: wireframe ? 0 : 0.95,
        roughness: 0.05,
        metalness: 0.0,
        ior: 1.5,
        thickness: 0.06,
        reflectivity: 0.65,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        attenuationColor: new THREE.Color('#e2e8f0'),
        attenuationDistance: 2.2,
        depthWrite: false,
        wireframe,
      }),
      glassEdgeMat: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#e2e8f0'),
        transparent: true,
        opacity: 0.42,
        roughness: 0.08,
        metalness: 0.2,
        clearcoat: 1.0,
        wireframe,
      }),
      // Mirror-tinted glass lens over the AIO LCD pump display
      mirrorGlassCapMat: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#ffffff'),
        transparent: true,
        opacity: 0.22,
        roughness: 0.03,
        metalness: 0.15,
        ior: 1.52,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        reflectivity: 0.9,
        depthWrite: false,
        wireframe,
      }),
      // Industrial Aluminum & Nickel Heatsink Fins (metalness 0.85 - 0.95, roughness 0.25 - 0.4)
      nickelMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#d1d5db'),
        metalness: 0.92,
        roughness: 0.26,
        wireframe,
      }),
      brushedAluminumMat: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#94a3b8'),
        metalness: 0.88,
        roughness: 0.28,
        clearcoat: 0.25,
        clearcoatRoughness: 0.3,
        wireframe,
      }),
      // Copper Heatpipes & Capacitors (metalness 0.92, roughness 0.25)
      copperMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#d97706'),
        metalness: 0.92,
        roughness: 0.25,
        wireframe,
      }),
      // Vulcanized Rubber Corner Dampeners
      rubberMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#0b0d12'),
        metalness: 0.08,
        roughness: 0.78,
        wireframe,
      }),
      // Braided Nylon Sleeve Material
      braidedSleeveMat: new THREE.MeshStandardMaterial({
        map: braidedSleeveTex,
        bumpMap: braidedSleeveTex,
        bumpScale: 0.008,
        metalness: 0.35,
        roughness: 0.48,
        wireframe,
      }),
      // Polycarbonate Curved Fan Blades
      fanBladeMat: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#334155'),
        transparent: true,
        opacity: 0.92,
        roughness: 0.26,
        metalness: 0.45,
        clearcoat: 0.35,
        wireframe,
      }),
      // Center Fan Hub Sticker Material
      fanHubStickerMat: new THREE.MeshStandardMaterial({
        map: fanHubStickerTex,
        metalness: 0.8,
        roughness: 0.25,
        wireframe,
      }),
      // Translucent Diffuser Ring (Controlled soft gradient emission, non-opaque)
      diffuserRingMat: new THREE.MeshPhysicalMaterial({
        map: softRgbGradTex,
        emissiveMap: softRgbGradTex,
        emissive: new THREE.Color('#38bdf8'),
        emissiveIntensity: 0.42,
        transparent: true,
        opacity: 0.78,
        transmission: 0.35,
        roughness: 0.32,
        metalness: 0.1,
        wireframe,
      }),
      // Translucent RAM & GPU Diffuser Light Bar (Subtle gradient emission)
      diffuserBarMat: new THREE.MeshPhysicalMaterial({
        map: softRgbGradTex,
        emissiveMap: softRgbGradTex,
        emissive: new THREE.Color('#ffffff'),
        emissiveIntensity: 0.48,
        transparent: true,
        opacity: 0.85,
        transmission: 0.3,
        roughness: 0.28,
        metalness: 0.1,
        wireframe,
      }),
      krakenLcdMat: new THREE.MeshStandardMaterial({
        map: krakenLcdTex,
        emissiveMap: krakenLcdTex,
        emissive: new THREE.Color('#ffffff'),
        emissiveIntensity: 0.72,
        roughness: 0.12,
        wireframe,
      }),
    };
  }, [wireframe, krakenLcdTex, fanHubStickerTex, braidedSleeveTex, softRgbGradTex]);

  useFrame((_, delta) => {
    for (let i = 0; i < fanRefs.current.length; i++) {
      const f = fanRefs.current[i];
      if (f) f.rotation.z -= delta * 7.5;
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
