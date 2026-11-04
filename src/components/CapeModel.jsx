import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import {
  SNAP_POINTS,
  DEFAULT_RGB_CONFIG,
  createMotherboardPcbTexture,
  createM2ArmorLaserTexture,
  createGpuBackplateTexture,
  createKrakenLcdTexture,
  createHardwareLabelTexture,
  createFanHubStickerTexture,
  createFanMotionBlurTexture,
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
  shape.moveTo(0.12, -0.045);
  shape.quadraticCurveTo(0.27, 0.105, 0.445, 0.14);
  shape.absarc(0, 0, 0.468, Math.atan2(0.14, 0.445), Math.atan2(-0.105, 0.455), true);
  shape.quadraticCurveTo(0.295, -0.09, 0.12, -0.045);
  shape.closePath();

  return new THREE.ExtrudeGeometry(shape, {
    steps: 1,
    depth: 0.018,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.005,
    bevelSegments: 2,
  });
}

function createChamferedFanFrameGeometry() {
  const s = 0.6;
  const c = 0.08;
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
  hole.absarc(0, 0, 0.54, 0, Math.PI * 2, false);
  shape.holes.push(hole);

  const geom = new THREE.ExtrudeGeometry(shape, {
    steps: 1,
    depth: 0.23,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 3,
  });
  geom.center();
  return geom;
}

function createAsymmetricRamHeatsinkGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.66, -0.16);
  shape.lineTo(0.66, -0.16);
  shape.lineTo(0.67, 0.06);
  shape.lineTo(0.48, 0.14);
  shape.lineTo(0.11, 0.1);
  shape.lineTo(-0.14, 0.15);
  shape.lineTo(-0.5, 0.14);
  shape.lineTo(-0.67, 0.07);
  shape.closePath();

  const geom = new THREE.ExtrudeGeometry(shape, {
    steps: 1,
    depth: 0.075,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.006,
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
  motionBlurMat,
  isPcOn = true,
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
        [-0.49, -0.49],
        [0.49, -0.49],
        [-0.49, 0.49],
        [0.49, 0.49],
      ].map(([cx, cy], idx) => (
        <group key={idx} position={[cx, cy, 0]}>
          <RoundedBox
            args={[0.16, 0.16, 0.25]}
            radius={0.02}
            smoothness={2}
            material={rubberMat}
          />
          <mesh rotation={[Math.PI / 2, 0, 0]} material={hubMetalMat}>
            <cylinderGeometry args={[0.024, 0.024, 0.256, 12]} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0, 0.095]} material={diffuserMat}>
        <torusGeometry args={[0.532, 0.014, 16, 64]} />
      </mesh>
      <mesh position={[0, 0, -0.095]} material={diffuserMat}>
        <torusGeometry args={[0.532, 0.011, 16, 64]} />
      </mesh>

      {isPcOn && motionBlurMat && (
        <mesh position={[0, 0, 0.04]} material={motionBlurMat}>
          <ringGeometry args={[0.16, 0.49, 48]} />
        </mesh>
      )}

      <group ref={(el) => onRegisterFan(fanIndex, el)}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={frameMat}>
          <cylinderGeometry args={[0.165, 0.165, 0.21, 32]} />
        </mesh>

        <mesh position={[0, 0, 0.106]} material={hubMetalMat}>
          <ringGeometry args={[0.125, 0.162, 32]} />
        </mesh>

        <mesh position={[0, 0, 0.108]} material={hubStickerMat}>
          <circleGeometry args={[0.125, 32]} />
        </mesh>

        {Array.from({ length: 9 }).map((_, idx) => {
          const angle = (idx / 9) * Math.PI * 2;
          return (
            <group key={idx} rotation={[0, 0, angle]}>
              <mesh
                geometry={sharedBladeGeometry}
                position={[0, 0, -0.01]}
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

function BraidedTube({ points, radius = 0.045, material }) {
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
      <RoundedBox
        args={[dist + 0.12, 0.08, 0.13]}
        radius={0.02}
        smoothness={3}
        material={material}
        castShadow
      />
      <mesh position={[0, 0, 0.068]} material={trimMat}>
        <boxGeometry args={[dist * 0.55, 0.028, 0.008]} />
      </mesh>
    </group>
  );
}

function HighDetailPbrFallback({
  part,
  wireframe,
  showGlass = true,
  isPcOn = true,
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
        ? createHardwareLabelTexture('990 PRO', part?.specs?.capacity || '2TB NVMe')
        : null,
    [cat, part?.specs?.capacity]
  );

  const psuLabelTex = useMemo(
    () =>
      cat === 'psu'
        ? createHardwareLabelTexture(
            part?.brand === 'ASUS ROG' ? 'ROG THOR' : 'RM1000e',
            `${part?.specs?.wattageCapacity || 1000}W 80+ GOLD`
          )
        : null,
    [cat, part?.brand, part?.specs?.wattageCapacity]
  );

  if (!part) return null;

  if (cat === 'case') {
    const chassisMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#111318'),
      metalness: 0.72,
      roughness: 0.42,
      wireframe,
    });
    const interiorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#111318'),
      metalness: 0.22,
      roughness: 0.78,
      wireframe,
    });
    const darkBorderMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#090b0f'),
      metalness: 0.45,
      roughness: 0.45,
      wireframe,
    });

    return (
      <group name="Fallback_DualChamber_1to1_Case">
        <RoundedBox
          position={[0, -2.14, 0]}
          args={[4.08, 0.12, 2.86]}
          radius={0.025}
          smoothness={3}
          material={chassisMat}
          castShadow
          receiveShadow
        />
        <RoundedBox
          position={[0, 2.14, 0]}
          args={[4.08, 0.12, 2.86]}
          radius={0.025}
          smoothness={3}
          material={chassisMat}
          castShadow
          receiveShadow
        />

        {[
          [-1.72, -2.26, -1.12],
          [1.72, -2.26, -1.12],
          [-1.72, -2.26, 1.12],
          [1.72, -2.26, 1.12],
        ].map((pos, idx) => (
          <group key={idx} position={pos}>
            <mesh material={materials.brushedAluminumMat}>
              <cylinderGeometry args={[0.18, 0.2, 0.12, 24]} />
            </mesh>
            <mesh position={[0, -0.065, 0]} material={materials.rubberMat}>
              <cylinderGeometry args={[0.19, 0.19, 0.025, 24]} />
            </mesh>
          </group>
        ))}

        <RoundedBox
          position={[0, 0, -1.4]}
          args={[4.08, 4.2, 0.06]}
          radius={0.015}
          smoothness={2}
          material={chassisMat}
          castShadow
          receiveShadow
        />

        <RoundedBox
          position={[-0.52, 0, -0.35]}
          args={[2.86, 4.16, 0.06]}
          radius={0.012}
          smoothness={2}
          material={interiorMat}
          castShadow
          receiveShadow
        />

        {[0.95, 0.0, -0.95].map((yPos, idx) => (
          <RoundedBox
            key={idx}
            position={[0.78, yPos, -0.31]}
            args={[0.18, 0.62, 0.045]}
            radius={0.015}
            smoothness={2}
            material={materials.rubberMat}
          />
        ))}

        <group
          position={SNAP_POINTS.case.mount_side_fan_bracket?.position || [1.22, 0.0, -0.32]}
          name="Anchor_Side_Fan_Bracket_360mm"
        >
          <RoundedBox
            position={[0, 0, -0.14]}
            args={[1.32, 4.12, 0.05]}
            radius={0.01}
            smoothness={2}
            material={interiorMat}
            castShadow
            receiveShadow
          />

          {[-0.62, 0.62].map((rx, idx) => (
            <RoundedBox
              key={`side_rail_${idx}`}
              position={[rx, 0, 0]}
              args={[0.05, 3.72, 0.26]}
              radius={0.008}
              smoothness={2}
              material={chassisMat}
              castShadow
              receiveShadow
            />
          ))}

          {[-1.82, 1.82].map((ry, idx) => (
            <RoundedBox
              key={`side_cross_${idx}`}
              position={[0, ry, 0]}
              args={[1.28, 0.05, 0.26]}
              radius={0.008}
              smoothness={2}
              material={chassisMat}
              castShadow
            />
          ))}

          {[-1.2, 0, 1.2].map((yPos, idx) => (
            <RealisticFan120
              key={`side_${idx}`}
              position={[0, yPos, 0]}
              rotation={[0, 0, 0]}
              scale={1}
              frameMat={interiorMat}
              rubberMat={materials.rubberMat}
              bladeMat={materials.fanBladeMat}
              diffuserMat={materials.fanLedMat}
              hubStickerMat={materials.fanHubStickerMat}
              hubMetalMat={materials.brushedAluminumMat}
              motionBlurMat={materials.motionBlurMat}
              isPcOn={isPcOn}
              onRegisterFan={onRegisterFan}
              fanIndex={idx + 1}
            />
          ))}
        </group>

        <RoundedBox
          position={[-2.01, 0, 0]}
          args={[0.07, 4.2, 2.86]}
          radius={0.015}
          smoothness={2}
          material={chassisMat}
          castShadow
          receiveShadow
        />

        <group position={[-1.96, 0.85, -0.12]} name="Rear_Mobo_IO_Shield">
          <RoundedBox
            args={[0.04, 1.22, 0.34]}
            radius={0.008}
            smoothness={2}
            material={interiorMat}
          />
          {[-0.4, -0.15, 0.1, 0.35].map((ioY, idx) => (
            <mesh key={idx} position={[0.024, ioY, 0]} material={materials.brushedAluminumMat}>
              <boxGeometry args={[0.012, 0.12, 0.2]} />
            </mesh>
          ))}
        </group>

        <group
          position={SNAP_POINTS.case.mount_rear_exhaust_fan?.position || [-1.84, 0.82, 0.48]}
          rotation={[0, Math.PI / 2, 0]}
          name="Anchor_Rear_Exhaust_Fan_120mm"
        >
          <RealisticFan120
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={1}
            frameMat={interiorMat}
            rubberMat={materials.rubberMat}
            bladeMat={materials.fanBladeMat}
            diffuserMat={materials.fanLedMat}
            hubStickerMat={materials.fanHubStickerMat}
            hubMetalMat={materials.brushedAluminumMat}
            motionBlurMat={materials.motionBlurMat}
            isPcOn={isPcOn}
            onRegisterFan={onRegisterFan}
            fanIndex={0}
          />
        </group>

        <group
          position={SNAP_POINTS.case.mount_bottom_fan_bracket?.position || [-0.05, -1.94, 0.45]}
          rotation={[-Math.PI / 2, 0, 0]}
          name="Anchor_Bottom_Fan_Bracket_360mm"
        >
          {[-0.62, 0.62].map((ry, idx) => (
            <RoundedBox
              key={`bot_rail_${idx}`}
              position={[0, ry, -0.02]}
              args={[3.72, 0.05, 0.24]}
              radius={0.008}
              smoothness={2}
              material={chassisMat}
              castShadow
            />
          ))}

          {[-1.2, 0, 1.2].map((xPos, idx) => (
            <RealisticFan120
              key={`bot_${idx}`}
              position={[xPos, 0, 0]}
              rotation={[0, 0, 0]}
              scale={1}
              frameMat={interiorMat}
              rubberMat={materials.rubberMat}
              bladeMat={materials.fanBladeMat}
              diffuserMat={materials.fanLedMat}
              hubStickerMat={materials.fanHubStickerMat}
              hubMetalMat={materials.brushedAluminumMat}
              motionBlurMat={materials.motionBlurMat}
              isPcOn={isPcOn}
              onRegisterFan={onRegisterFan}
              fanIndex={10 + idx}
            />
          ))}
        </group>

        {showGlass && (
          <>
            <group position={[2.01, 0, 0]} name="Front_Panoramic_Glass_Panel">
              <mesh material={materials.glassTransmissionMat} renderOrder={10}>
                <boxGeometry args={[0.025, 4.14, 2.78]} />
              </mesh>
              <mesh position={[0, 2.06, 0]} material={darkBorderMat}>
                <boxGeometry args={[0.036, 0.06, 2.82]} />
              </mesh>
              <mesh position={[0, -2.06, 0]} material={darkBorderMat}>
                <boxGeometry args={[0.036, 0.06, 2.82]} />
              </mesh>
              <mesh position={[0, 0, -1.39]} material={darkBorderMat}>
                <boxGeometry args={[0.036, 4.18, 0.05]} />
              </mesh>
              <mesh position={[0, 0, 1.39]} material={darkBorderMat}>
                <boxGeometry args={[0.032, 4.18, 0.03]} />
              </mesh>
            </group>

            <group position={[0, 0, 1.4]} name="Side_Panoramic_Glass_Panel">
              <mesh material={materials.glassTransmissionMat} renderOrder={10}>
                <boxGeometry args={[3.98, 4.14, 0.025]} />
              </mesh>
              <mesh position={[0, 2.06, 0]} material={darkBorderMat}>
                <boxGeometry args={[4.04, 0.06, 0.036]} />
              </mesh>
              <mesh position={[0, -2.06, 0]} material={darkBorderMat}>
                <boxGeometry args={[4.04, 0.06, 0.036]} />
              </mesh>
              <mesh position={[-2.0, 0, 0]} material={darkBorderMat}>
                <boxGeometry args={[0.05, 4.18, 0.036]} />
              </mesh>
              <mesh position={[2.0, 0, 0]} material={darkBorderMat}>
                <boxGeometry args={[0.03, 4.18, 0.032]} />
              </mesh>
            </group>
          </>
        )}
      </group>
    );
  }

  if (cat === 'motherboard') {
    const vrmDarkMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#181c24'),
      metalness: 0.88,
      roughness: 0.26,
      wireframe,
    });
    const dimmSlotMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0d1016'),
      metalness: 0.35,
      roughness: 0.55,
      wireframe,
    });

    return (
      <group name="Fallback_ATX_1to1_Motherboard">
        <RoundedBox
          args={[2.44, 3.05, 0.06]}
          radius={0.015}
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

        <group position={[-0.92, 0.65, 0.14]} name="VRM_Heatsink_Left">
          <RoundedBox
            args={[0.48, 1.56, 0.22]}
            radius={0.02}
            smoothness={3}
            material={vrmDarkMat}
            castShadow
            receiveShadow
          />
          <RoundedBox
            position={[-0.06, 0.06, 0.115]}
            args={[0.28, 1.42, 0.022]}
            radius={0.008}
            smoothness={2}
            material={materials.brushedAluminumMat}
            castShadow
          />
          {Array.from({ length: 10 }).map((_, idx) => (
            <RoundedBox
              key={idx}
              position={[0.13, -0.64 + idx * 0.14, 0.115]}
              args={[0.18, 0.07, 0.045]}
              radius={0.006}
              smoothness={2}
              material={materials.brushedAluminumMat}
              castShadow
            />
          ))}
        </group>

        <group position={[-0.14, 1.28, 0.13]} name="VRM_Heatsink_Top">
          <RoundedBox
            args={[1.12, 0.32, 0.18]}
            radius={0.018}
            smoothness={3}
            material={vrmDarkMat}
            castShadow
            receiveShadow
          />
          <RoundedBox
            position={[0, 0.045, 0.095]}
            args={[1.0, 0.13, 0.02]}
            radius={0.006}
            smoothness={2}
            material={materials.brushedAluminumMat}
            castShadow
          />
          {Array.from({ length: 12 }).map((_, idx) => (
            <RoundedBox
              key={idx}
              position={[-0.46 + idx * 0.084, -0.065, 0.095]}
              args={[0.042, 0.14, 0.038]}
              radius={0.005}
              smoothness={2}
              material={materials.brushedAluminumMat}
              castShadow
            />
          ))}
        </group>

        {Array.from({ length: 10 }).map((_, idx) => (
          <group key={`vrm_top_${idx}`}>
            <RoundedBox
              position={[-0.54 + idx * 0.09, 1.04, 0.065]}
              args={[0.068, 0.068, 0.055]}
              radius={0.008}
              smoothness={2}
              material={vrmDarkMat}
              castShadow
            />
            <mesh
              position={[-0.54 + idx * 0.09, 0.95, 0.065]}
              rotation={[Math.PI / 2, 0, 0]}
              material={materials.nickelMat}
              castShadow
            >
              <cylinderGeometry args={[0.024, 0.024, 0.06, 16]} />
            </mesh>
          </group>
        ))}

        {Array.from({ length: 7 }).map((_, idx) => (
          <group key={`vrm_left_${idx}`}>
            <RoundedBox
              position={[-0.6, 0.24 + idx * 0.1, 0.065]}
              args={[0.068, 0.068, 0.055]}
              radius={0.008}
              smoothness={2}
              material={vrmDarkMat}
              castShadow
            />
            <mesh
              position={[-0.51, 0.24 + idx * 0.1, 0.065]}
              rotation={[Math.PI / 2, 0, 0]}
              material={materials.nickelMat}
              castShadow
            >
              <cylinderGeometry args={[0.024, 0.024, 0.06, 16]} />
            </mesh>
          </group>
        ))}

        {[0, 1, 2, 3].map((slotIdx) => {
          const sx = 0.42 + slotIdx * 0.13;
          return (
            <group key={`dimm_${slotIdx}`} position={[sx, 0.68, 0.07]}>
              <mesh material={dimmSlotMat} castShadow>
                <boxGeometry args={[0.045, 1.36, 0.07]} />
              </mesh>
              <mesh position={[0, 0.7, 0.02]} material={materials.brushedAluminumMat}>
                <boxGeometry args={[0.055, 0.055, 0.075]} />
              </mesh>
              <mesh position={[0, -0.7, 0.02]} material={materials.brushedAluminumMat}>
                <boxGeometry args={[0.055, 0.055, 0.075]} />
              </mesh>
            </group>
          );
        })}

        {[-0.38, -1.18].map((py, idx) => (
          <group key={`pcie_${idx}`} position={[-0.12, py, 0.075]}>
            <RoundedBox
              args={[1.38, 0.085, 0.085]}
              radius={0.01}
              smoothness={2}
              material={idx === 0 ? materials.nickelMat : vrmDarkMat}
              castShadow
            />
            <mesh position={[0, 0, 0.012]} material={dimmSlotMat}>
              <boxGeometry args={[1.3, 0.036, 0.068]} />
            </mesh>
            <mesh position={[0.72, 0, 0.02]} material={materials.brushedAluminumMat}>
              <boxGeometry args={[0.065, 0.095, 0.065]} />
            </mesh>
          </group>
        ))}

        <group position={[0.04, -0.78, 0.09]} name="Lower_M2_And_Chipset_Armor">
          <RoundedBox
            position={[-0.2, 0.72, 0]}
            args={[1.42, 0.36, 0.08]}
            radius={0.012}
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
            position={[-0.2, 0.02, 0]}
            args={[1.42, 0.56, 0.08]}
            radius={0.012}
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
            position={[0.72, -0.08, 0.015]}
            args={[0.76, 0.88, 0.1]}
            radius={0.015}
            smoothness={3}
            material={vrmDarkMat}
            castShadow
            receiveShadow
          />
          <RoundedBox
            position={[0.72, -0.08, 0.07]}
            args={[0.64, 0.72, 0.016]}
            radius={0.008}
            smoothness={2}
            material={materials.brushedAluminumMat}
            castShadow
          />
        </group>

        <group position={[-0.72, -1.24, 0.055]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={vrmDarkMat} castShadow>
            <cylinderGeometry args={[0.11, 0.11, 0.036, 28]} />
          </mesh>
          <mesh
            position={[0, 0, 0.012]}
            rotation={[Math.PI / 2, 0, 0]}
            material={materials.nickelMat}
            castShadow
          >
            <cylinderGeometry args={[0.092, 0.092, 0.03, 28]} />
          </mesh>
        </group>

        <mesh position={[1.1, 0.45, 0.09]} material={dimmSlotMat} castShadow>
          <boxGeometry args={[0.11, 0.62, 0.12]} />
        </mesh>
      </group>
    );
  }

  if (cat === 'cpu') {
    return (
      <group name="Fallback_AM5_LGA_CPU_1to1">
        <RoundedBox
          args={[0.58, 0.62, 0.045]}
          radius={0.008}
          smoothness={2}
          material={materials.brushedAluminumMat}
          castShadow
        />
        <mesh position={[0.32, 0, 0.02]} material={materials.nickelMat}>
          <cylinderGeometry args={[0.012, 0.012, 0.64, 12]} />
        </mesh>
        <mesh position={[0, 0, 0.032]}>
          <boxGeometry args={[0.46, 0.46, 0.024]} />
          <meshStandardMaterial color="#0f766e" roughness={0.35} metalness={0.4} wireframe={wireframe} />
        </mesh>
        <RoundedBox
          position={[0, 0, 0.058]}
          args={part.brand === 'Intel' ? [0.38, 0.45, 0.038] : [0.4, 0.4, 0.038]}
          radius={0.01}
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
      color: new THREE.Color(part.radiatorColor || '#14171f'),
      metalness: 0.85,
      roughness: 0.28,
      wireframe,
    });

    if (isAir) {
      return (
        <group position={[0, 0, 0.48]} name="Fallback_Noctua_Air_Cooler_1to1">
          {[-0.42, 0.42].map((tx, tIdx) => (
            <group key={tIdx} position={[tx, 0, 0]}>
              {Array.from({ length: 28 }).map((_, fIdx) => (
                <mesh
                  key={fIdx}
                  position={[0, -0.68 + fIdx * 0.05, 0]}
                  material={materials.nickelMat}
                  castShadow
                >
                  <boxGeometry args={[0.48, 0.014, 1.25]} />
                </mesh>
              ))}
              {[-0.36, -0.12, 0.12, 0.36].map((zOff, hIdx) => (
                <mesh key={hIdx} position={[0, 0, zOff]} material={materials.nickelMat}>
                  <cylinderGeometry args={[0.036, 0.036, 1.48, 14]} />
                </mesh>
              ))}
            </group>
          ))}
          <RealisticFan120
            position={[0, 0, 0]}
            rotation={[0, Math.PI / 2, 0]}
            scale={1}
            frameMat={bodyMat}
            rubberMat={materials.rubberMat}
            bladeMat={materials.fanBladeMat}
            diffuserMat={materials.coolerLedMat}
            hubStickerMat={materials.fanHubStickerMat}
            hubMetalMat={materials.brushedAluminumMat}
            motionBlurMat={materials.motionBlurMat}
            isPcOn={isPcOn}
            onRegisterFan={onRegisterFan}
            fanIndex={4}
          />
        </group>
      );
    }

    const hoseA = [
      [0.34, 0.05, 0.12],
      [0.85, 0.18, 0.65],
      [1.15, 0.58, 0.72],
      [1.32, 0.96, 0.55],
    ];
    const hoseB = [
      [0.28, -0.14, 0.12],
      [0.78, 0.02, 0.72],
      [1.08, 0.48, 0.78],
      [1.22, 0.96, 0.62],
    ];

    return (
      <group name="Fallback_NZXT_Kraken_360_1to1">
        <mesh rotation={[Math.PI / 2, 0, 0]} material={bodyMat} castShadow receiveShadow>
          <cylinderGeometry args={[0.41, 0.43, 0.42, 40]} />
        </mesh>

        <mesh position={[0, 0, 0.16]} rotation={[Math.PI / 2, 0, 0]} material={materials.brushedAluminumMat} castShadow>
          <cylinderGeometry args={[0.43, 0.42, 0.11, 40, 1, true]} />
        </mesh>
        <mesh position={[0, 0, 0.215]} material={materials.brushedAluminumMat}>
          <ringGeometry args={[0.37, 0.43, 40]} />
        </mesh>

        <mesh position={[0, 0, 0.218]} material={materials.coolerLedMat}>
          <ringGeometry args={[0.345, 0.372, 40]} />
        </mesh>

        <mesh position={[0, 0, 0.22]} material={materials.krakenLcdMat}>
          <circleGeometry args={[0.345, 40]} />
        </mesh>

        <mesh position={[0, 0, 0.226]} material={materials.mirrorGlassCapMat}>
          <circleGeometry args={[0.37, 40]} />
        </mesh>

        <group position={[0.68, 1.06, 0.58]}>
          <RoundedBox
            args={[3.94, 0.27, 1.22]}
            radius={0.02}
            smoothness={3}
            material={bodyMat}
            castShadow
            receiveShadow
          />
          {[-1.2, 0, 1.2].map((xPos, idx) => (
            <RealisticFan120
              key={`rad_${idx}`}
              position={[xPos, -0.25, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={1}
              frameMat={bodyMat}
              rubberMat={materials.rubberMat}
              bladeMat={materials.fanBladeMat}
              diffuserMat={materials.coolerLedMat}
              hubStickerMat={materials.fanHubStickerMat}
              hubMetalMat={materials.brushedAluminumMat}
              motionBlurMat={materials.motionBlurMat}
              isPcOn={isPcOn}
              onRegisterFan={onRegisterFan}
              fanIndex={4 + idx}
            />
          ))}
        </group>

        <BraidedTube points={hoseA} radius={0.052} material={materials.braidedSleeveMat} />
        <BraidedTube points={hoseB} radius={0.052} material={materials.braidedSleeveMat} />

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
    const gpuLen = 3.36;
    const gpuWidth = 1.4;
    const finCount = 68;

    return (
      <group name="Fallback_TriSlot_GPU_1to1_336x140x65">
        <RoundedBox
          position={[-0.38, 0.29, 0]}
          args={[gpuLen * 0.74, 0.04, gpuWidth]}
          radius={0.01}
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
          position={[1.26, 0.29, -0.48]}
          args={[0.78, 0.04, 0.42]}
          radius={0.008}
          smoothness={2}
          material={shroudMat}
          castShadow
        />
        <RoundedBox
          position={[1.26, 0.29, 0.48]}
          args={[0.78, 0.04, 0.42]}
          radius={0.008}
          smoothness={2}
          material={shroudMat}
          castShadow
        />
        {[-0.22, 0, 0.22].map((zBar, idx) => (
          <mesh
            key={`bp_vent_${idx}`}
            position={[1.2 + idx * 0.12, 0.29, zBar]}
            rotation={[0, 0.45, 0]}
            material={trimMat}
          >
            <boxGeometry args={[0.055, 0.04, 0.62]} />
          </mesh>
        ))}

        <group position={[0, 0.03, 0]} name="Dense_Aluminum_Fins_68">
          {Array.from({ length: finCount }).map((_, fIdx) => (
            <mesh
              key={`fin_${fIdx}`}
              position={[-gpuLen * 0.48 + (fIdx / (finCount - 1)) * (gpuLen * 0.96), 0, 0]}
              material={materials.nickelMat}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[0.012, 0.38, gpuWidth * 0.96]} />
            </mesh>
          ))}
        </group>

        {[-0.1, 0.02, 0.14].map((yOff, idx) => (
          <group key={`chrome_hp_${idx}`}>
            <mesh
              position={[0.02, yOff, gpuWidth * 0.485]}
              rotation={[0, 0, Math.PI / 2]}
              material={materials.chromePipeMat}
              castShadow
            >
              <cylinderGeometry args={[0.034, 0.034, gpuLen * 0.96, 20]} />
            </mesh>
            <mesh
              position={[0.02, yOff, -0.18 + idx * 0.22]}
              rotation={[0, 0, Math.PI / 2]}
              material={materials.chromePipeMat}
              castShadow
            >
              <cylinderGeometry args={[0.034, 0.034, gpuLen * 0.98, 20]} />
            </mesh>
          </group>
        ))}

        <RoundedBox
          position={[0, 0.21, gpuWidth * 0.49]}
          args={[gpuLen, 0.12, 0.075]}
          radius={0.015}
          smoothness={2}
          material={shroudMat}
          castShadow
        />
        <RoundedBox
          position={[0, -0.17, gpuWidth * 0.49]}
          args={[gpuLen, 0.11, 0.075]}
          radius={0.015}
          smoothness={2}
          material={shroudMat}
          castShadow
        />

        <RoundedBox
          position={[0, -0.21, 0]}
          args={[gpuLen, 0.13, gpuWidth]}
          radius={0.025}
          smoothness={3}
          material={shroudMat}
          castShadow
          receiveShadow
        />

        {[-1.12, -0.38, 0.38, 1.12].map((xPos, idx) => (
          <RoundedBox
            key={`chamfer_accent_${idx}`}
            position={[xPos, -0.18, gpuWidth * 0.5]}
            rotation={[0, 0, 0.35]}
            args={[0.095, 0.18, 0.04]}
            radius={0.008}
            smoothness={2}
            material={trimMat}
            castShadow
          />
        ))}

        <group position={[-0.36, 0.21, gpuWidth * 0.515]} name="Illuminated_Side_Logo">
          <RoundedBox
            args={[1.32, 0.088, 0.024]}
            radius={0.008}
            smoothness={2}
            material={shroudMat}
          />
          <mesh position={[0, 0, 0.01]} material={materials.gpuLedMat}>
            <boxGeometry args={[1.22, 0.056, 0.016]} />
          </mesh>
        </group>

        <mesh position={[gpuLen * 0.496, 0.02, 0]} material={materials.gpuLedMat}>
          <boxGeometry args={[0.028, 0.34, gpuWidth * 0.88]} />
        </mesh>

        <RoundedBox
          position={[0.88, 0.2, gpuWidth * 0.48]}
          args={[0.24, 0.11, 0.11]}
          radius={0.01}
          smoothness={2}
          material={trimMat}
        />
        <BraidedTube
          points={[
            [0.88, 0.14, gpuWidth * 0.52],
            [0.88, -0.38, gpuWidth * 0.62],
            [0.78, -0.92, 0.22],
            [0.68, -1.18, -0.35],
          ]}
          radius={0.052}
          material={materials.braidedSleeveMat}
        />

        <RoundedBox
          position={[-gpuLen / 2 - 0.03, -0.04, 0]}
          args={[0.06, 0.65, gpuWidth * 0.96]}
          radius={0.008}
          smoothness={2}
          material={materials.nickelMat}
        />

        {[-1.06, 0, 1.06].map((xPos, idx) => (
          <RealisticFan120
            key={`gpu_f_${idx}`}
            position={[xPos, -0.25, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.82}
            frameMat={shroudMat}
            rubberMat={materials.rubberMat}
            bladeMat={materials.fanBladeMat}
            diffuserMat={materials.gpuLedMat}
            hubStickerMat={materials.fanHubStickerMat}
            hubMetalMat={materials.brushedAluminumMat}
            motionBlurMat={materials.motionBlurMat}
            isPcOn={isPcOn}
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
      <group name="Fallback_Asymmetric_DDR5_Stick_1to1">
        <mesh
          geometry={sharedRamHeatsinkGeometry}
          rotation={[0, Math.PI / 2, Math.PI / 2]}
          material={matteHeatsinkMat}
          castShadow
          receiveShadow
        />
        <RoundedBox
          position={[0.042, 0.02, -0.01]}
          args={[0.01, 1.15, 0.11]}
          radius={0.003}
          smoothness={2}
          material={materials.brushedAluminumMat}
        />
        <RoundedBox
          position={[0, 0, 0.165]}
          args={[0.082, 1.34, 0.065]}
          radius={0.015}
          smoothness={2}
          material={materials.ramLedMat}
        />
      </group>
    );
  }

  if (cat === 'storage') {
    return (
      <group name="Fallback_Samsung_990_PRO_SSD_1to1">
        <mesh position={[0, 0, -0.018]} castShadow>
          <boxGeometry args={[0.8, 0.24, 0.016]} />
          <meshStandardMaterial color="#0f172a" metalness={0.45} roughness={0.38} wireframe={wireframe} />
        </mesh>
        <mesh position={[-0.39, 0, -0.018]} material={materials.copperMat}>
          <boxGeometry args={[0.03, 0.21, 0.02]} />
        </mesh>
        <RoundedBox
          position={[0, 0, 0.015]}
          args={[0.76, 0.23, 0.052]}
          radius={0.01}
          smoothness={3}
          material={materials.brushedAluminumMat}
          castShadow
          receiveShadow
        />
        <mesh position={[0, 0, 0.043]}>
          <planeGeometry args={[0.66, 0.19]} />
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
      <group name="Fallback_Corsair_RM1000_PSU_1to1">
        <RoundedBox
          args={[1.6, 0.86, 1.5]}
          radius={0.025}
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
        <mesh position={[0, 0, 0.755]}>
          <planeGeometry args={[1.38, 0.64]} />
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
  isPcOn = true,
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
              isPcOn={isPcOn}
              onRegisterFan={onRegisterFan}
              materials={materials}
            />
          )}

          {showBoundingLabels && (
            <Html position={[0, 0, 0]} center distanceFactor={6} zIndexRange={[10, 0]}>
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
  isPcOn = true,
  rgbConfig = DEFAULT_RGB_CONFIG,
}) {
  const fanRefs = useRef([]);
  const fansLightRef = useRef(null);
  const ramLightRef = useRef(null);
  const gpuLightRef = useRef(null);
  const coolerLightRef = useRef(null);

  const caseSnaps = SNAP_POINTS.case;
  const moboSnaps = SNAP_POINTS.motherboard;

  const registerFan = useCallback((idx, el) => {
    if (el) fanRefs.current[idx] = el;
  }, []);

  const krakenLcdTex = useMemo(() => createKrakenLcdTexture(42, 48, 2480), []);
  const fanHubStickerTex = useMemo(() => createFanHubStickerTexture(), []);
  const motionBlurTex = useMemo(() => createFanMotionBlurTexture(), []);
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
        color: new THREE.Color('#090b10'),
        metalness: 0.08,
        roughness: 0.82,
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
        roughness: 0.26,
        metalness: 0.42,
        clearcoat: 0.25,
        wireframe,
      }),
      motionBlurMat: new THREE.MeshBasicMaterial({
        map: motionBlurTex,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
      fanHubStickerMat: new THREE.MeshStandardMaterial({
        map: fanHubStickerTex,
        metalness: 0.8,
        roughness: 0.25,
        wireframe,
      }),
      fanLedMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#00f2fe'),
        emissive: new THREE.Color('#00f2fe'),
        emissiveIntensity: 2.5,
        roughness: 0.15,
        metalness: 0.1,
        wireframe,
      }),
      ramLedMat: new THREE.MeshStandardMaterial({
        map: softRgbGradTex,
        color: new THREE.Color('#a855f7'),
        emissive: new THREE.Color('#a855f7'),
        emissiveIntensity: 2.5,
        roughness: 0.15,
        metalness: 0.1,
        wireframe,
      }),
      gpuLedMat: new THREE.MeshStandardMaterial({
        map: softRgbGradTex,
        color: new THREE.Color('#ef4444'),
        emissive: new THREE.Color('#ef4444'),
        emissiveIntensity: 2.5,
        roughness: 0.15,
        metalness: 0.1,
        wireframe,
      }),
      coolerLedMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#00f2fe'),
        emissive: new THREE.Color('#00f2fe'),
        emissiveIntensity: 2.5,
        roughness: 0.15,
        metalness: 0.1,
        wireframe,
      }),
      krakenLcdMat: new THREE.MeshStandardMaterial({
        map: krakenLcdTex,
        emissiveMap: krakenLcdTex,
        emissive: new THREE.Color('#ffffff'),
        emissiveIntensity: 2.2,
        roughness: 0.12,
        wireframe,
      }),
    };
  }, [
    wireframe,
    krakenLcdTex,
    fanHubStickerTex,
    motionBlurTex,
    braidedSleeveTex,
    softRgbGradTex,
  ]);

  const tempColorRef = useRef(new THREE.Color());
  const materialsRef = useRef(null);

  useEffect(() => {
    materialsRef.current = materials;
  }, [materials]);

  useFrame((state, delta) => {
    if (isPcOn) {
      for (let i = 0; i < fanRefs.current.length; i++) {
        const f = fanRefs.current[i];
        if (f) f.rotation.z -= delta * 20.0;
      }
    }

    const mats = materialsRef.current;
    if (!mats) return;

    const mode = rgbConfig?.mode || 'static';
    const lightsActive = isPcOn && mode !== 'off';
    const elapsed = state.clock.getElapsedTime();
    const tempColor = tempColorRef.current;

    const resolveGroupColor = (groupKey, phaseOffset = 0) => {
      if (!lightsActive) {
        return tempColor.set('#1e293b');
      }
      if (mode === 'rainbow') {
        const hue = (elapsed * 0.22 + phaseOffset) % 1;
        return tempColor.setHSL(hue, 0.95, 0.55);
      }
      const hex = rgbConfig?.syncAll
        ? rgbConfig?.globalColor || '#00f2fe'
        : rgbConfig?.groups?.[groupKey] || rgbConfig?.globalColor || '#00f2fe';
      return tempColor.set(hex);
    };

    const pulseFactor =
      !lightsActive
        ? 0
        : mode === 'breathing'
        ? 0.4 + ((Math.sin(elapsed * 2.8) + 1) * 0.5) * 2.3
        : 2.5;

    const cFans = resolveGroupColor('fans', 0.0).clone();
    const cRam = resolveGroupColor('ram', 0.25).clone();
    const cGpu = resolveGroupColor('gpu', 0.5).clone();
    const cCooler = resolveGroupColor('cooler', 0.75).clone();

    mats.fanLedMat.color.copy(cFans);
    mats.fanLedMat.emissive.copy(cFans);
    mats.fanLedMat.emissiveIntensity = pulseFactor;

    mats.ramLedMat.color.copy(cRam);
    mats.ramLedMat.emissive.copy(cRam);
    mats.ramLedMat.emissiveIntensity = pulseFactor;

    mats.gpuLedMat.color.copy(cGpu);
    mats.gpuLedMat.emissive.copy(cGpu);
    mats.gpuLedMat.emissiveIntensity = pulseFactor;

    mats.coolerLedMat.color.copy(cCooler);
    mats.coolerLedMat.emissive.copy(cCooler);
    mats.coolerLedMat.emissiveIntensity = pulseFactor;

    mats.krakenLcdMat.emissiveIntensity = isPcOn ? 2.2 : 0.0;
    mats.krakenLcdMat.color.set(isPcOn ? '#ffffff' : '#111318');

    const pointLightIntensity = lightsActive ? ( pulseFactor / 2.5 ) * 3.8 : 0;

    if (fansLightRef.current) {
      fansLightRef.current.color.copy(cFans);
      fansLightRef.current.intensity = pointLightIntensity;
    }
    if (ramLightRef.current) {
      ramLightRef.current.color.copy(cRam);
      ramLightRef.current.intensity = pointLightIntensity * 0.9;
    }
    if (gpuLightRef.current) {
      gpuLightRef.current.color.copy(cGpu);
      gpuLightRef.current.intensity = pointLightIntensity * 1.1;
    }
    if (coolerLightRef.current) {
      coolerLightRef.current.color.copy(cCooler);
      coolerLightRef.current.intensity = pointLightIntensity * 0.85;
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
      <pointLight
        ref={fansLightRef}
        position={[1.05, 0.0, 0.25]}
        distance={4.8}
        decay={1.8}
        intensity={3.8}
      />
      <pointLight
        ref={ramLightRef}
        position={[0.1, 0.85, 0.35]}
        distance={3.6}
        decay={1.8}
        intensity={3.2}
      />
      <pointLight
        ref={gpuLightRef}
        position={[0.0, -0.25, 0.85]}
        distance={4.5}
        decay={1.8}
        intensity={4.0}
      />
      <pointLight
        ref={coolerLightRef}
        position={[-0.65, 1.05, 0.35]}
        distance={4.0}
        decay={1.8}
        intensity={3.2}
      />

      <GltfSocketPart
        part={build.case}
        socketName="root_chassis"
        snapConfig={caseSnaps.root_chassis}
        customOverrideUrl={customGlbOverrides.case}
        showBoundingLabels={showBoundingLabels}
        wireframeMode={wireframe}
        showGlass={showGlass}
        isPcOn={isPcOn}
        onRegisterFan={registerFan}
        materials={materials}
      >
        <GltfSocketPart
          part={build.psu}
          socketName="mount_psu"
          snapConfig={getExplodedSnap(caseSnaps.mount_psu, [-0.8, -0.25, 0])}
          customOverrideUrl={customGlbOverrides.psu}
          showBoundingLabels={showBoundingLabels}
          wireframeMode={wireframe}
          isPcOn={isPcOn}
          onRegisterFan={registerFan}
          materials={materials}
        />

        <GltfSocketPart
          part={build.motherboard}
          socketName="mount_motherboard"
          snapConfig={getExplodedSnap(caseSnaps.mount_motherboard, [0, 0, 0.25])}
          customOverrideUrl={customGlbOverrides.motherboard}
          showBoundingLabels={showBoundingLabels}
          wireframeMode={wireframe}
          isPcOn={isPcOn}
          onRegisterFan={registerFan}
          materials={materials}
        >
          <GltfSocketPart
            part={build.cpu}
            socketName="socket_cpu"
            snapConfig={getExplodedSnap(moboSnaps.socket_cpu, [0, 0, 0.45])}
            customOverrideUrl={customGlbOverrides.cpu}
            showBoundingLabels={showBoundingLabels}
            wireframeMode={wireframe}
            isPcOn={isPcOn}
            onRegisterFan={registerFan}
            materials={materials}
          />

          <GltfSocketPart
            part={build.cooler}
            socketName="mount_cooler"
            snapConfig={getExplodedSnap(moboSnaps.mount_cooler, [0, 0.25, 0.85])}
            customOverrideUrl={customGlbOverrides.cooler}
            showBoundingLabels={showBoundingLabels}
            wireframeMode={wireframe}
            isPcOn={isPcOn}
            onRegisterFan={registerFan}
            materials={materials}
          />

          <GltfSocketPart
            part={build.gpu}
            socketName="slot_pcie_x16"
            snapConfig={getExplodedSnap(moboSnaps.slot_pcie_x16, [0, -0.2, 0.95])}
            customOverrideUrl={customGlbOverrides.gpu}
            showBoundingLabels={showBoundingLabels}
            wireframeMode={wireframe}
            isPcOn={isPcOn}
            onRegisterFan={registerFan}
            materials={materials}
          />

          {populatedRamSlots.map((slotKey, idx) => (
            <GltfSocketPart
              key={slotKey}
              part={build.ram}
              socketName={slotKey}
              snapConfig={getExplodedSnap(moboSnaps[slotKey], [0.25, 0, 0.6 + idx * 0.08])}
              customOverrideUrl={customGlbOverrides.ram}
              showBoundingLabels={showBoundingLabels && idx === 0}
              wireframeMode={wireframe}
              isPcOn={isPcOn}
              onRegisterFan={registerFan}
              materials={materials}
            />
          ))}

          <GltfSocketPart
            part={build.storage}
            socketName="slot_m2_1"
            snapConfig={getExplodedSnap(moboSnaps.slot_m2_1, [0, 0, 0.5])}
            customOverrideUrl={customGlbOverrides.storage}
            showBoundingLabels={showBoundingLabels}
            wireframeMode={wireframe}
            isPcOn={isPcOn}
            onRegisterFan={registerFan}
            materials={materials}
          />
        </GltfSocketPart>
      </GltfSocketPart>
    </group>
  );
}
