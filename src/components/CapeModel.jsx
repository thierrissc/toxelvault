import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import {
  SNAP_POINTS,
  createMotherboardPcbTexture,
  createM2ArmorLaserTexture,
  createGpuBackplateTexture,
  createKrakenLcdTexture,
  createHardwareLabelTexture,
  createFanHubStickerTexture,
  createBraidedSleeveTexture,
  createSoftRgbGradientTexture,
} from '../utils/textureGenerator';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

const gltfCache = new Map();

function createCurvedBladeGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0.048, -0.018);
  shape.quadraticCurveTo(0.108, 0.042, 0.178, 0.056);
  shape.absarc(0, 0, 0.186, Math.atan2(0.056, 0.178), Math.atan2(-0.042, 0.181), true);
  shape.quadraticCurveTo(0.118, -0.036, 0.048, -0.018);
  shape.closePath();

  const extrudeSettings = {
    steps: 1,
    depth: 0.007,
    bevelEnabled: true,
    bevelThickness: 0.002,
    bevelSize: 0.002,
    bevelSegments: 2,
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
}

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

function createAsymmetricRamHeatsinkGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.205, -0.048);
  shape.lineTo(0.205, -0.048);
  shape.lineTo(0.21, 0.018);
  shape.lineTo(0.155, 0.044);
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
const FAN_PITCH_30_RAD = (30 * Math.PI) / 180;

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
      <mesh
        geometry={sharedFanFrameGeometry}
        material={frameMat}
        castShadow
        receiveShadow
      />

      {[
        [-0.195, -0.195],
        [0.195, -0.195],
        [-0.195, 0.195],
        [0.195, 0.195],
      ].map(([cx, cy], idx) => (
        <group key={idx} position={[cx, cy, 0]}>
          <RoundedBox args={[0.068, 0.068, 0.072]} radius={0.01} smoothness={2} material={rubberMat} />
          <mesh rotation={[Math.PI / 2, 0, 0]} material={hubMetalMat}>
            <cylinderGeometry args={[0.011, 0.011, 0.076, 12]} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0, 0.024]} material={diffuserMat}>
        <torusGeometry args={[0.21, 0.0045, 16, 64]} />
      </mesh>

      <group ref={(el) => onRegisterFan(fanIndex, el)}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={frameMat}>
          <cylinderGeometry args={[0.066, 0.066, 0.056, 32]} />
        </mesh>

        <mesh position={[0, 0, 0.029]} material={hubMetalMat}>
          <ringGeometry args={[0.05, 0.065, 32]} />
        </mesh>

        <mesh position={[0, 0, 0.0295]} material={hubStickerMat}>
          <circleGeometry args={[0.05, 32]} />
        </mesh>

        {Array.from({ length: 9 }).map((_, idx) => {
          const angle = (idx / 9) * Math.PI * 2;
          return (
            <group key={idx} rotation={[0, 0, angle]}>
              <mesh
                geometry={sharedBladeGeometry}
                position={[0, 0, -0.004]}
                rotation={[FAN_PITCH_30_RAD, 0, 0]}
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

function BraidedTube({ points, radius = 0.022, material }) {
  const tubeGeo = useMemo(() => {
    const vectors = points.map((p) => new THREE.Vector3(...p));
    const curve = new THREE.CatmullRomCurve3(vectors);
    return new THREE.TubeGeometry(curve, 32, radius, 16, false);
  }, [points, radius]);

  return <mesh geometry={tubeGeo} material={material} castShadow receiveShadow />;
}

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

function HighDetailPbrFallback({
  part,
  wireframe,
  showGlass = true,
  onRegisterFan,
  materials,
}) {
  const cat = part?.category;

  const pcbTex = useMemo(
    () => (cat === 'motherboard' ? createMotherboardPcbTexture('#0d0f12') : null),
    [cat]
  );

  const m2ArmorTex = useMemo(
    () => (cat === 'motherboard' ? createM2ArmorLaserTexture() : null),
    [cat]
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

  if (!part) return null;

  if (cat === 'case') {
    const chassisMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(part.chassisColor || '#12151c'),
      metalness: 0.84,
      roughness: 0.32,
      wireframe,
    });
    const interiorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(part.interiorColor || '#0d1016'),
      metalness: 0.25,
      roughness: 0.65,
      wireframe,
    });
    const darkBorderMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#090b0f'),
      metalness: 0.5,
      roughness: 0.4,
      wireframe,
    });

    return (
      <group name="Fallback_HYTE_Y70_Case">
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

        <group position={SNAP_POINTS.case.mount_side_fan_bracket?.position || [0.76, 0.04, -0.22]} name="Anchor_Side_Fan_Bracket">
          <RoundedBox
            position={[0, -0.04, -0.042]}
            args={[0.62, 2.52, 0.032]}
            radius={0.006}
            smoothness={2}
            material={interiorMat}
            castShadow
            receiveShadow
          />

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

          {[-0.76, -0.255, 0.255, 0.76].map((ry, idx) => (
            <RoundedBox
              key={`side_cross_${idx}`}
              position={[0, ry, 0]}
              args={[0.56, 0.036, 0.076]}
              radius={0.005}
              smoothness={2}
              material={chassisMat}
              castShadow
              receiveShadow
            />
          ))}

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

        <RoundedBox
          position={[-1.08, 0, 0]}
          args={[0.05, 2.56, 1.38]}
          radius={0.01}
          smoothness={2}
          material={chassisMat}
          castShadow
          receiveShadow
        />

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

        <group
          position={SNAP_POINTS.case.mount_rear_exhaust_fan?.position || [-1.035, 0.5, 0.16]}
          rotation={[0, Math.PI / 2, 0]}
          name="Anchor_Rear_Exhaust_Fan"
        >
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

        <group
          position={SNAP_POINTS.case.mount_bottom_fan_bracket?.position || [-0.12, -1.23, 0.18]}
          rotation={[-Math.PI / 2, 0, 0]}
          name="Anchor_Bottom_Fan_Bracket"
        >
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

        {showGlass && (
          <>
            <group position={[1.08, 0, 0]} name="Right_Tempered_Glass_Panel">
              <mesh material={materials.glassTransmissionMat} renderOrder={10}>
                <boxGeometry args={[0.014, 2.48, 1.32]} />
              </mesh>
              <mesh position={[0, 1.245, 0]} material={darkBorderMat}>
                <boxGeometry args={[0.02, 0.038, 1.35]} />
              </mesh>
              <mesh position={[0, -1.245, 0]} material={darkBorderMat}>
                <boxGeometry args={[0.02, 0.038, 1.35]} />
              </mesh>
              <mesh position={[0, 0, -0.665]} material={darkBorderMat}>
                <boxGeometry args={[0.02, 2.52, 0.028]} />
              </mesh>
              <mesh position={[0, 0, 0.675]} material={darkBorderMat}>
                <boxGeometry args={[0.018, 2.52, 0.016]} />
              </mesh>
            </group>

            <group position={[0, 0, 0.69]} name="Front_Tempered_Glass_Panel">
              <mesh material={materials.glassTransmissionMat} renderOrder={10}>
                <boxGeometry args={[2.14, 2.48, 0.014]} />
              </mesh>
              <mesh position={[0, 1.245, 0]} material={darkBorderMat}>
                <boxGeometry args={[2.18, 0.038, 0.02]} />
              </mesh>
              <mesh position={[0, -1.245, 0]} material={darkBorderMat}>
                <boxGeometry args={[2.18, 0.038, 0.02]} />
              </mesh>
              <mesh position={[-1.075, 0, 0]} material={darkBorderMat}>
                <boxGeometry args={[0.028, 2.52, 0.02]} />
              </mesh>
              <mesh position={[1.075, 0, 0]} material={darkBorderMat}>
                <boxGeometry args={[0.018, 2.52, 0.02]} />
              </mesh>
            </group>
          </>
        )}
      </group>
    );
  }

  if (cat === 'motherboard') {
    const vrmDarkMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1c2029'),
      metalness: 0.88,
      roughness: 0.26,
      wireframe,
    });
    const dimmSlotMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0f1218'),
      metalness: 0.35,
      roughness: 0.55,
      wireframe,
    });

    return (
      <group name="Fallback_B650M_Motherboard">
        <RoundedBox
          args={[1.26, 1.54, 0.036]}
          radius={0.008}
          smoothness={2}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            map={pcbTex}
            color="#0d0f12"
            metalness={0.28}
            roughness={0.58}
            wireframe={wireframe}
          />
        </RoundedBox>

        <group position={[-0.47, 0.32, 0.074]} name="VRM_Heatsink_Left">
          <RoundedBox
            args={[0.255, 0.82, 0.11]}
            radius={0.012}
            smoothness={3}
            material={vrmDarkMat}
            castShadow
            receiveShadow
          />
          <RoundedBox
            position={[-0.035, 0.04, 0.056]}
            args={[0.14, 0.74, 0.012]}
            radius={0.004}
            smoothness={2}
            material={materials.brushedAluminumMat}
            castShadow
          />
          {Array.from({ length: 10 }).map((_, idx) => (
            <RoundedBox
              key={idx}
              position={[0.068, -0.34 + idx * 0.075, 0.056]}
              args={[0.095, 0.038, 0.024]}
              radius={0.003}
              smoothness={2}
              material={materials.brushedAluminumMat}
              castShadow
            />
          ))}
        </group>

        <group position={[-0.06, 0.65, 0.068]} name="VRM_Heatsink_Top">
          <RoundedBox
            args={[0.58, 0.165, 0.092]}
            radius={0.01}
            smoothness={3}
            material={vrmDarkMat}
            castShadow
            receiveShadow
          />
          <RoundedBox
            position={[0, 0.025, 0.048]}
            args={[0.52, 0.065, 0.01]}
            radius={0.003}
            smoothness={2}
            material={materials.brushedAluminumMat}
            castShadow
          />
          {Array.from({ length: 12 }).map((_, idx) => (
            <RoundedBox
              key={idx}
              position={[-0.24 + idx * 0.044, -0.035, 0.048]}
              args={[0.022, 0.075, 0.02]}
              radius={0.003}
              smoothness={2}
              material={materials.brushedAluminumMat}
              castShadow
            />
          ))}
        </group>

        {Array.from({ length: 10 }).map((_, idx) => (
          <group key={`vrm_top_${idx}`}>
            <RoundedBox
              position={[-0.28 + idx * 0.046, 0.535, 0.034]}
              args={[0.036, 0.036, 0.03]}
              radius={0.004}
              smoothness={2}
              material={vrmDarkMat}
              castShadow
            />
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

        {Array.from({ length: 7 }).map((_, idx) => (
          <group key={`vrm_left_${idx}`}>
            <RoundedBox
              position={[-0.31, 0.12 + idx * 0.052, 0.034]}
              args={[0.036, 0.036, 0.03]}
              radius={0.004}
              smoothness={2}
              material={vrmDarkMat}
              castShadow
            />
            <mesh
              position={[-0.265, 0.12 + idx * 0.052, 0.035]}
              rotation={[Math.PI / 2, 0, 0]}
              material={materials.nickelMat}
              castShadow
            >
              <cylinderGeometry args={[0.012, 0.012, 0.032, 16]} />
            </mesh>
          </group>
        ))}

        {[0, 1, 2, 3].map((slotIdx) => {
          const sx = 0.22 + slotIdx * 0.06;
          return (
            <group key={`dimm_${slotIdx}`} position={[sx, 0.34, 0.036]}>
              <mesh material={dimmSlotMat} castShadow>
                <boxGeometry args={[0.022, 0.44, 0.034]} />
              </mesh>
              <mesh position={[0, 0.232, 0.012]} material={materials.brushedAluminumMat}>
                <boxGeometry args={[0.026, 0.024, 0.036]} />
              </mesh>
              <mesh position={[0, -0.232, 0.012]} material={materials.brushedAluminumMat}>
                <boxGeometry args={[0.026, 0.024, 0.036]} />
              </mesh>
            </group>
          );
        })}

        {[-0.18, -0.62].map((py, idx) => (
          <group key={`pcie_${idx}`} position={[-0.06, py, 0.038]}>
            <RoundedBox
              args={[0.69, 0.042, 0.042]}
              radius={0.005}
              smoothness={2}
              material={idx === 0 ? materials.nickelMat : vrmDarkMat}
              castShadow
            />
            <mesh position={[0, 0, 0.006]} material={dimmSlotMat}>
              <boxGeometry args={[0.65, 0.018, 0.034]} />
            </mesh>
            <mesh position={[0.355, 0, 0.01]} material={materials.brushedAluminumMat}>
              <boxGeometry args={[0.032, 0.048, 0.032]} />
            </mesh>
          </group>
        ))}

        <group position={[0.02, -0.41, 0.046]} name="Lower_M2_And_Chipset_Armor">
          <RoundedBox
            position={[-0.1, 0.05, 0]}
            args={[0.72, 0.22, 0.042]}
            radius={0.006}
            smoothness={3}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              map={m2ArmorTex}
              metalness={0.85}
              roughness={0.28}
              wireframe={wireframe}
            />
          </RoundedBox>

          <RoundedBox
            position={[0.36, -0.04, 0.008]}
            args={[0.38, 0.42, 0.052]}
            radius={0.008}
            smoothness={3}
            material={vrmDarkMat}
            castShadow
            receiveShadow
          />
          <RoundedBox
            position={[0.36, -0.04, 0.036]}
            args={[0.32, 0.34, 0.008]}
            radius={0.004}
            smoothness={2}
            material={materials.brushedAluminumMat}
            castShadow
          />

          <RoundedBox
            position={[-0.14, -0.11, -0.004]}
            args={[0.64, 0.14, 0.036]}
            radius={0.005}
            smoothness={2}
            material={materials.brushedAluminumMat}
            castShadow
            receiveShadow
          />
        </group>

        <group position={[-0.36, -0.62, 0.028]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={vrmDarkMat} castShadow>
            <cylinderGeometry args={[0.054, 0.054, 0.018, 28]} />
          </mesh>
          <mesh
            position={[0, 0, 0.006]}
            rotation={[Math.PI / 2, 0, 0]}
            material={materials.nickelMat}
            castShadow
          >
            <cylinderGeometry args={[0.045, 0.045, 0.015, 28]} />
          </mesh>
        </group>

        <mesh position={[0.56, 0.22, 0.046]} material={dimmSlotMat} castShadow>
          <boxGeometry args={[0.055, 0.3, 0.062]} />
        </mesh>
        <mesh position={[-0.48, 0.72, 0.046]} material={dimmSlotMat} castShadow>
          <boxGeometry args={[0.16, 0.05, 0.052]} />
        </mesh>
      </group>
    );
  }

  if (cat === 'cpu') {
    return (
      <group name="Fallback_AM5_LGA_CPU">
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
        <mesh position={[0, 0, 0.016]}>
          <boxGeometry args={[0.27, 0.27, 0.012]} />
          <meshStandardMaterial color="#0f766e" roughness={0.35} metalness={0.4} wireframe={wireframe} />
        </mesh>
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
              {Array.from({ length: 24 }).map((_, fIdx) => (
                <mesh
                  key={fIdx}
                  position={[0, -0.19 + fIdx * 0.016, 0]}
                  material={materials.nickelMat}
                  castShadow
                >
                  <boxGeometry args={[0.14, 0.005, 0.36]} />
                </mesh>
              ))}
              {[-0.12, -0.04, 0.04, 0.12].map((zOff, hIdx) => (
                <mesh key={hIdx} position={[0, 0, zOff]} material={materials.nickelMat}>
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
        <mesh rotation={[Math.PI / 2, 0, 0]} material={bodyMat} castShadow receiveShadow>
          <cylinderGeometry args={[0.162, 0.174, 0.145, 40]} />
        </mesh>

        <mesh position={[0, 0, 0.056]} rotation={[Math.PI / 2, 0, 0]} material={materials.brushedAluminumMat} castShadow>
          <cylinderGeometry args={[0.172, 0.168, 0.042, 40, 1, true]} />
        </mesh>
        <mesh position={[0, 0, 0.076]} material={materials.brushedAluminumMat}>
          <ringGeometry args={[0.148, 0.172, 40]} />
        </mesh>

        <mesh position={[0, 0, 0.077]} material={materials.diffuserRingMat}>
          <ringGeometry args={[0.138, 0.148, 40]} />
        </mesh>

        <mesh position={[0, 0, 0.0775]} material={materials.krakenLcdMat}>
          <circleGeometry args={[0.138, 40]} />
        </mesh>

        <mesh position={[0, 0, 0.08]} material={materials.mirrorGlassCapMat}>
          <circleGeometry args={[0.148, 40]} />
        </mesh>

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

        <BraidedTube points={hoseA} radius={0.023} material={materials.braidedSleeveMat} />
        <BraidedTube points={hoseB} radius={0.023} material={materials.braidedSleeveMat} />

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
      color: new THREE.Color(part.shroudColor || '#151820'),
      metalness: 0.85,
      roughness: 0.28,
      wireframe,
    });
    const trimMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(part.trimColor || '#475569'),
      metalness: 0.92,
      roughness: 0.22,
      wireframe,
    });
    const gpuLen = 1.26;
    const finCount = 68;

    return (
      <group name="Fallback_TriSlot_GPU">
        <RoundedBox
          position={[-0.14, 0.106, 0]}
          args={[gpuLen * 0.74, 0.016, 0.49]}
          radius={0.004}
          smoothness={2}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            map={gpuBackplateTex}
            metalness={0.88}
            roughness={0.26}
            wireframe={wireframe}
          />
        </RoundedBox>

        <RoundedBox
          position={[0.48, 0.106, -0.17]}
          args={[0.28, 0.016, 0.15]}
          radius={0.003}
          smoothness={2}
          material={shroudMat}
          castShadow
        />
        <RoundedBox
          position={[0.48, 0.106, 0.17]}
          args={[0.28, 0.016, 0.15]}
          radius={0.003}
          smoothness={2}
          material={shroudMat}
          castShadow
        />
        {[-0.08, 0, 0.08].map((zBar, idx) => (
          <mesh
            key={`bp_vent_${idx}`}
            position={[0.46 + idx * 0.04, 0.106, zBar]}
            rotation={[0, 0.45, 0]}
            material={trimMat}
          >
            <boxGeometry args={[0.022, 0.016, 0.22]} />
          </mesh>
        ))}

        <group position={[0, 0.012, 0]} name="Dense_Aluminum_Fins_68">
          {Array.from({ length: finCount }).map((_, fIdx) => (
            <mesh
              key={`fin_${fIdx}`}
              position={[-gpuLen * 0.475 + (fIdx / (finCount - 1)) * (gpuLen * 0.95), 0, 0]}
              material={materials.nickelMat}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[0.0046, 0.135, 0.475]} />
            </mesh>
          ))}
        </group>

        {[-0.036, 0.008, 0.052].map((yOff, idx) => (
          <group key={`chrome_hp_${idx}`}>
            <mesh
              position={[0.01, yOff, 0.238]}
              rotation={[0, 0, Math.PI / 2]}
              material={materials.chromePipeMat}
              castShadow
            >
              <cylinderGeometry args={[0.013, 0.013, gpuLen * 0.96, 20]} />
            </mesh>
            <mesh
              position={[0.01, yOff, -0.06 + idx * 0.08]}
              rotation={[0, 0, Math.PI / 2]}
              material={materials.chromePipeMat}
              castShadow
            >
              <cylinderGeometry args={[0.013, 0.013, gpuLen * 0.98, 20]} />
            </mesh>
          </group>
        ))}

        <RoundedBox
          position={[0, 0.078, 0.244]}
          args={[gpuLen, 0.044, 0.028]}
          radius={0.006}
          smoothness={2}
          material={shroudMat}
          castShadow
        />
        <RoundedBox
          position={[0, -0.064, 0.244]}
          args={[gpuLen, 0.042, 0.028]}
          radius={0.006}
          smoothness={2}
          material={shroudMat}
          castShadow
        />

        <RoundedBox
          position={[0, -0.078, 0]}
          args={[gpuLen, 0.05, 0.49]}
          radius={0.01}
          smoothness={3}
          material={shroudMat}
          castShadow
          receiveShadow
        />

        {[-0.42, -0.14, 0.14, 0.42].map((xPos, idx) => (
          <RoundedBox
            key={`chamfer_accent_${idx}`}
            position={[xPos, -0.068, 0.248]}
            rotation={[0, 0, 0.35]}
            args={[0.036, 0.068, 0.016]}
            radius={0.003}
            smoothness={2}
            material={trimMat}
            castShadow
          />
        ))}

        <group position={[-0.14, 0.078, 0.258]} name="Illuminated_Side_Logo">
          <RoundedBox
            args={[0.48, 0.032, 0.008]}
            radius={0.003}
            smoothness={2}
            material={shroudMat}
          />
          <mesh position={[0, 0, 0.003]} material={materials.diffuserBarMat}>
            <boxGeometry args={[0.44, 0.02, 0.006]} />
          </mesh>
        </group>

        <RoundedBox
          position={[0.34, 0.074, 0.24]}
          args={[0.09, 0.045, 0.045]}
          radius={0.004}
          smoothness={2}
          material={trimMat}
        />
        <BraidedTube
          points={[
            [0.34, 0.05, 0.26],
            [0.34, -0.14, 0.31],
            [0.3, -0.35, 0.1],
            [0.26, -0.45, -0.14],
          ]}
          radius={0.022}
          material={materials.braidedSleeveMat}
        />

        <RoundedBox
          position={[-gpuLen / 2 - 0.015, -0.02, 0]}
          args={[0.026, 0.26, 0.47]}
          radius={0.003}
          smoothness={2}
          material={materials.nickelMat}
        />

        {[-0.36, 0, 0.36].map((xNorm, idx) => (
          <RealisticFan120
            key={`gpu_f_${idx}`}
            position={[xNorm * gpuLen * 0.9, -0.104, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.68}
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
        <mesh
          geometry={sharedRamHeatsinkGeometry}
          rotation={[0, Math.PI / 2, Math.PI / 2]}
          material={matteHeatsinkMat}
          castShadow
          receiveShadow
        />
        <RoundedBox
          position={[0.016, 0.01, -0.004]}
          args={[0.004, 0.36, 0.038]}
          radius={0.001}
          smoothness={2}
          material={materials.brushedAluminumMat}
        />
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
        <mesh position={[0, 0, -0.01]} castShadow>
          <boxGeometry args={[0.48, 0.125, 0.008]} />
          <meshStandardMaterial color="#0f172a" metalness={0.45} roughness={0.38} wireframe={wireframe} />
        </mesh>
        <mesh position={[-0.235, 0, -0.01]} material={materials.copperMat}>
          <boxGeometry args={[0.016, 0.11, 0.01]} />
        </mesh>
        <RoundedBox
          position={[0, 0, 0.008]}
          args={[0.45, 0.122, 0.028]}
          radius={0.005}
          smoothness={3}
          material={materials.brushedAluminumMat}
          castShadow
          receiveShadow
        />
        {[-0.16, -0.1, 0.1, 0.16].map((gx, idx) => (
          <mesh key={idx} position={[gx, 0, 0.023]} material={materials.nickelMat}>
            <boxGeometry args={[0.018, 0.118, 0.004]} />
          </mesh>
        ))}
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

function GltfSocketPart({
  part,
  socketName,
  snapConfig,
  customOverrideUrl,
  showBoundingLabels = false,
  wireframeMode = false,
  showGlass = true,
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
      {part && (
        <group position={partOffsetPos} rotation={partOffsetRot} scale={partScale}>
          {loadState.status === 'loaded' && loadState.scene ? (
            <primitive object={loadState.scene} />
          ) : (
            <HighDetailPbrFallback
              part={part}
              wireframe={wireframeMode}
              showGlass={showGlass}
              onRegisterFan={onRegisterFan}
              materials={materials}
            />
          )}

          {showBoundingLabels && (
            <Html position={[0, 0, 0]} center distanceFactor={4.2} zIndexRange={[10, 0]}>
              <div className="pointer-events-none select-none rounded-lg bg-[#0d1017]/95 border border-sky-500/50 px-2.5 py-1.5 shadow-xl text-left min-w-[175px] backdrop-blur-md">
                <span className="font-mono-tech text-[9px] uppercase tracking-wider text-sky-400 font-bold block">
                  [{socketName}]
                </span>
                <p className="text-[10px] font-semibold text-white truncate">
                  {part.name}
                </p>
              </div>
            </Html>
          )}
        </group>
      )}

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
  showGlass = true,
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
      glassTransmissionMat: new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: wireframe ? 0.22 : 0.1,
        roughness: 0.02,
        metalness: 0.1,
        reflectivity: 0.9,
        depthWrite: false,
        wireframe,
      }),
      mirrorGlassCapMat: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#ffffff'),
        transparent: true,
        opacity: 0.18,
        roughness: 0.02,
        metalness: 0.1,
        reflectivity: 0.9,
        depthWrite: false,
        wireframe,
      }),
      nickelMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#d8dee9'),
        metalness: 0.92,
        roughness: 0.22,
        wireframe,
      }),
      chromePipeMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#f1f5f9'),
        metalness: 0.96,
        roughness: 0.12,
        wireframe,
      }),
      brushedAluminumMat: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#94a3b8'),
        metalness: 0.88,
        roughness: 0.26,
        clearcoat: 0.25,
        clearcoatRoughness: 0.3,
        wireframe,
      }),
      copperMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#d97706'),
        metalness: 0.92,
        roughness: 0.25,
        wireframe,
      }),
      rubberMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#0b0d12'),
        metalness: 0.08,
        roughness: 0.78,
        wireframe,
      }),
      braidedSleeveMat: new THREE.MeshStandardMaterial({
        map: braidedSleeveTex,
        bumpMap: braidedSleeveTex,
        bumpScale: 0.008,
        metalness: 0.35,
        roughness: 0.48,
        wireframe,
      }),
      fanBladeMat: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#27303f'),
        roughness: 0.28,
        metalness: 0.42,
        clearcoat: 0.25,
        wireframe,
      }),
      fanHubStickerMat: new THREE.MeshStandardMaterial({
        map: fanHubStickerTex,
        metalness: 0.8,
        roughness: 0.25,
        wireframe,
      }),
      diffuserRingMat: new THREE.MeshPhysicalMaterial({
        map: softRgbGradTex,
        emissiveMap: softRgbGradTex,
        emissive: new THREE.Color('#38bdf8'),
        emissiveIntensity: 0.85,
        roughness: 0.2,
        metalness: 0.1,
        wireframe,
      }),
      diffuserBarMat: new THREE.MeshPhysicalMaterial({
        map: softRgbGradTex,
        emissiveMap: softRgbGradTex,
        emissive: new THREE.Color('#ffffff'),
        emissiveIntensity: 0.75,
        roughness: 0.2,
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
  const populatedRamSlots = build.ram
    ? ramSticksCount === 4
      ? ['slot_ram_1', 'slot_ram_2', 'slot_ram_3', 'slot_ram_4']
      : ['slot_ram_2', 'slot_ram_4']
    : [];

  return (
    <group name="PC_Socket_Hierarchy_Root">
      <GltfSocketPart
        part={build.case}
        socketName="root_chassis"
        snapConfig={caseSnaps.root_chassis}
        customOverrideUrl={customGlbOverrides.case}
        showBoundingLabels={showBoundingLabels}
        wireframeMode={wireframe}
        showGlass={showGlass}
        onRegisterFan={registerFan}
        materials={materials}
      >
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
