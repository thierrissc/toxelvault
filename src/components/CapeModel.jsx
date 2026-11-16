import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import ModelLoader from './ModelLoader';
import {
  SNAP_POINTS,
  DEFAULT_RGB_CONFIG,
  createHerringboneVentAlphaTexture,
  createHoneycombGrilleAlphaTexture,
  createMotherboardSurfaceTextures,
  createKrakenLcdTexture,
} from '../utils/textureGenerator';
import {
  clampToContainer,
  clampPsuToRearChamber,
  CHASSIS_INTERNAL_BOUNDS,
} from '../utils/assetValidator';

const CASE_WIDTH = 3.8;
const CASE_HEIGHT = 4.2;
const CASE_DEPTH = 3.2;
const CASE_CHAMFER = 0.7;

function createChamferedPlateGeometry(width, depth, chamfer, thickness) {
  const hw = width * 0.5;
  const hd = depth * 0.5;
  const shape = new THREE.Shape();
  shape.moveTo(-hw, -hd);
  shape.lineTo(hw - chamfer, -hd);
  shape.lineTo(hw, -hd + chamfer);
  shape.lineTo(hw, hd);
  shape.lineTo(-hw, hd);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: false,
  });
  geo.rotateX(-Math.PI / 2);
  return geo;
}

function createBeveledBoxGeometry(width, height, depth, bevel = 0.014) {
  const b = Math.min(bevel, width * 0.2, height * 0.2, depth * 0.25);
  const hw = Math.max(0.01, width * 0.5 - b);
  const hh = Math.max(0.01, height * 0.5 - b);
  const extDepth = Math.max(0.01, depth - b * 2);

  const shape = new THREE.Shape();
  shape.moveTo(-hw, -hh);
  shape.lineTo(hw, -hh);
  shape.lineTo(hw, hh);
  shape.lineTo(-hw, hh);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: extDepth,
    bevelEnabled: true,
    bevelThickness: b,
    bevelSize: b,
    bevelSegments: 3,
  });
  geo.translate(0, 0, -extDepth * 0.5);
  geo.computeVertexNormals();
  return geo;
}

function RubberGrommet({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  width = 0.24,
  height = 0.58,
  isWhiteCase = false,
  wireframe = false,
}) {
  const outerColor = isWhiteCase ? '#b8c0cc' : '#181b22';
  const innerColor = isWhiteCase ? '#9ca3af' : '#101217';
  const slitColor = isWhiteCase ? '#374151' : '#050608';
  const edgeColor = isWhiteCase ? '#9ca3af' : '#2a2e37';

  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.04]} />
        <meshStandardMaterial
          color={outerColor}
          roughness={0.78}
          metalness={0.1}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>
      <mesh position={[0, 0, 0.005]}>
        <boxGeometry args={[width * 0.72, height * 0.84, 0.036]} />
        <meshStandardMaterial
          color={innerColor}
          roughness={0.85}
          metalness={0.06}
          wireframe={wireframe}
        />
      </mesh>
      <mesh position={[0, 0, 0.012]}>
        <boxGeometry args={[0.022, height * 0.78, 0.038]} />
        <meshStandardMaterial
          color={slitColor}
          roughness={0.95}
          metalness={0.02}
          wireframe={wireframe}
        />
      </mesh>
    </group>
  );
}

function CaseFan120({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  fanSize = 0.92,
  isWhite = false,
  wireframe = false,
  rgbMat,
  onRegisterImpeller,
}) {
  const impellerRef = useRef(null);

  useEffect(() => {
    if (impellerRef.current && onRegisterImpeller) {
      return onRegisterImpeller(impellerRef.current);
    }
    return undefined;
  }, [onRegisterImpeller]);

  const frameColor = isWhite ? '#e5e7eb' : '#151820';
  const bladeColor = isWhite ? '#d1d5db' : '#252d3d';
  const edgeColor = isWhite ? '#9ca3af' : '#2a2e37';

  const half = fanSize * 0.5;
  const barThick = fanSize * 0.07;
  const depth = 0.18;
  const radius = fanSize * 0.43;

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, half - barThick * 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[fanSize, barThick, depth]} />
        <meshStandardMaterial
          color={frameColor}
          roughness={0.35}
          metalness={0.2}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>
      <mesh position={[0, -half + barThick * 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[fanSize, barThick, depth]} />
        <meshStandardMaterial
          color={frameColor}
          roughness={0.35}
          metalness={0.2}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>
      <mesh position={[-half + barThick * 0.5, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[barThick, fanSize - barThick * 2, depth]} />
        <meshStandardMaterial
          color={frameColor}
          roughness={0.35}
          metalness={0.2}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>
      <mesh position={[half - barThick * 0.5, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[barThick, fanSize - barThick * 2, depth]} />
        <meshStandardMaterial
          color={frameColor}
          roughness={0.35}
          metalness={0.2}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius, radius, depth - 0.01, 32, 1, true]} />
        <meshStandardMaterial
          color={frameColor}
          roughness={0.35}
          metalness={0.2}
          side={THREE.DoubleSide}
          wireframe={wireframe}
        />
      </mesh>

      <mesh position={[0, 0, depth * 0.5]} material={rgbMat}>
        <torusGeometry args={[radius * 0.98, 0.013, 12, 36]} />
      </mesh>
      <mesh position={[0, 0, -depth * 0.5]} material={rgbMat}>
        <torusGeometry args={[radius * 0.98, 0.011, 12, 36]} />
      </mesh>

      <group ref={impellerRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[radius * 0.3, radius * 0.3, depth * 0.72, 24]} />
          <meshStandardMaterial
            color="#94a3b8"
            metalness={0.75}
            roughness={0.28}
            wireframe={wireframe}
          />
        </mesh>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
          <group key={idx} rotation={[0, 0, (idx / 9) * Math.PI * 2]}>
            <mesh
              position={[0.02, radius * 0.58, 0]}
              rotation={[0.42, 0.22, -0.26]}
              castShadow
            >
              <boxGeometry args={[radius * 0.22, radius * 0.62, 0.012]} />
              <meshStandardMaterial
                color={bladeColor}
                roughness={0.35}
                metalness={0.2}
                wireframe={wireframe}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

function HyteY70PanoramicCase({
  casePart,
  showGlass = true,
  fanConfig = { side: true, bottom: true, rear: true, top: true },
  wireframe = false,
  herringboneAlpha,
  rgbFanMat,
  onRegisterImpeller,
}) {
  const glassDoorPivotRef = useRef(null);

  const upperName = String(casePart?.name || '').toUpperCase();
  const isWhiteCase =
    String(casePart?.chassisColor || '').toLowerCase() === '#e5e7eb' ||
    String(casePart?.chassisColor || '').toLowerCase() === '#d8dce3' ||
    String(casePart?.chassisColor || '').toLowerCase() === '#f3f4f6' ||
    String(casePart?.chassisColor || '').toLowerCase() === '#cbd5e1' ||
    upperName.includes('WHITE') ||
    upperName.includes('SNOW') ||
    upperName.includes('SILVER');

  const chassisHex = isWhiteCase ? '#e5e7eb' : casePart?.chassisColor || '#121316';
  const interiorHex = isWhiteCase ? '#d1d5db' : '#14171e';
  const accentTrimHex = isWhiteCase ? '#cbd5e1' : '#1b1f29';
  const shadowCavernHex = isWhiteCase ? '#334155' : '#050608';
  const edgeColor = isWhiteCase ? '#9ca3af' : '#2a2e37';

  const halfW = CASE_WIDTH * 0.5;
  const halfH = CASE_HEIGHT * 0.5;
  const halfD = CASE_DEPTH * 0.5;
  const sideDoorWidth = CASE_WIDTH - CASE_CHAMFER;
  const chamferWidth = CASE_CHAMFER * Math.SQRT2;
  const rightGlassWidth = CASE_DEPTH - CASE_CHAMFER;

  const outerPlateGeo = useMemo(
    () => createChamferedPlateGeometry(CASE_WIDTH, CASE_DEPTH, CASE_CHAMFER, 0.08),
    []
  );

  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#ffffff'),
        transmission: 0.98,
        roughness: 0.02,
        metalness: 0.0,
        ior: 1.52,
        thickness: 0.05,
        transparent: true,
        opacity: 1.0,
        reflectivity: 0.9,
        depthWrite: false,
        wireframe,
      }),
    [wireframe]
  );

  useFrame((_, delta) => {
    if (!glassDoorPivotRef.current) return;
    const targetAngle = showGlass ? 0 : -Math.PI * 0.62;
    glassDoorPivotRef.current.rotation.y = THREE.MathUtils.lerp(
      glassDoorPivotRef.current.rotation.y,
      targetAngle,
      Math.min(1, delta * 7.5)
    );
  });

  return (
    <group name="CaseGroup">
      <mesh
        position={[0, -halfH, 0]}
        geometry={outerPlateGeo}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={chassisHex}
          roughness={0.35}
          metalness={0.2}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>

      <mesh
        position={[0, halfH - 0.08, 0]}
        geometry={outerPlateGeo}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={chassisHex}
          roughness={0.35}
          metalness={0.2}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>

      <group name="DualChamberRearEnclosure">
        <mesh position={[0, 0, -halfD + 0.035]} castShadow receiveShadow>
          <boxGeometry args={[CASE_WIDTH, CASE_HEIGHT - 0.16, 0.07]} />
          <meshStandardMaterial
            color={chassisHex}
            roughness={0.35}
            metalness={0.2}
            wireframe={wireframe}
          />
          <Edges threshold={15} color={edgeColor} />
        </mesh>

        <mesh
          position={[-0.75, 0.15, -halfD - 0.005]}
          rotation={[0, Math.PI, 0]}
        >
          <planeGeometry args={[1.45, 2.85]} />
          <meshStandardMaterial
            color={chassisHex}
            roughness={0.35}
            metalness={0.2}
            alphaMap={herringboneAlpha}
            transparent
            alphaTest={0.45}
            side={THREE.DoubleSide}
            wireframe={wireframe}
          />
        </mesh>

        <mesh position={[halfW - 0.035, 0, -0.95]} castShadow receiveShadow>
          <boxGeometry args={[0.07, CASE_HEIGHT - 0.16, 1.3]} />
          <meshStandardMaterial
            color={chassisHex}
            roughness={0.35}
            metalness={0.2}
            wireframe={wireframe}
          />
          <Edges threshold={15} color={edgeColor} />
        </mesh>

        <mesh position={[-halfW + 0.04, 0.92, -0.92]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 2.08, 1.32]} />
          <meshStandardMaterial
            color={chassisHex}
            roughness={0.35}
            metalness={0.2}
            wireframe={wireframe}
          />
          <Edges threshold={15} color={edgeColor} />
        </mesh>

        <mesh position={[-halfW + 0.04, -1.62, -0.92]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 0.72, 1.32]} />
          <meshStandardMaterial
            color={chassisHex}
            roughness={0.35}
            metalness={0.2}
            wireframe={wireframe}
          />
          <Edges threshold={15} color={edgeColor} />
        </mesh>

        <group position={[-halfW + 0.04, -0.58, -0.92]} name="RearPsuCutoutBezel">
          <mesh position={[0, 0.68, 0]} castShadow>
            <boxGeometry args={[0.09, 0.08, 0.84]} />
            <meshStandardMaterial
              color="#111318"
              roughness={0.45}
              metalness={0.4}
            />
            <Edges threshold={15} color="#2a2e37" />
          </mesh>
          <mesh position={[0, -0.68, 0]} castShadow>
            <boxGeometry args={[0.09, 0.08, 0.84]} />
            <meshStandardMaterial
              color="#111318"
              roughness={0.45}
              metalness={0.4}
            />
            <Edges threshold={15} color="#2a2e37" />
          </mesh>
          <mesh position={[0, 0, -0.4]} castShadow>
            <boxGeometry args={[0.09, 1.44, 0.08]} />
            <meshStandardMaterial
              color="#111318"
              roughness={0.45}
              metalness={0.4}
            />
            <Edges threshold={15} color="#2a2e37" />
          </mesh>
          <mesh position={[0, 0, 0.4]} castShadow>
            <boxGeometry args={[0.09, 1.44, 0.08]} />
            <meshStandardMaterial
              color="#111318"
              roughness={0.45}
              metalness={0.4}
            />
            <Edges threshold={15} color="#2a2e37" />
          </mesh>
        </group>
      </group>

      <mesh position={[-halfW + 0.03, 0.72, 0.56]}>
        <boxGeometry args={[0.04, 1.56, 1.24]} />
        <meshBasicMaterial color={shadowCavernHex} />
      </mesh>
      <mesh
        position={[-halfW + 0.06, 0.72, 0.56]}
        rotation={[0, Math.PI / 2, 0]}
        castShadow
        receiveShadow
      >
        <planeGeometry args={[1.28, 1.62]} />
        <meshStandardMaterial
          color={chassisHex}
          roughness={0.35}
          metalness={0.2}
          alphaMap={herringboneAlpha}
          transparent
          alphaTest={0.45}
          side={THREE.DoubleSide}
          wireframe={wireframe}
        />
      </mesh>

      <group position={[-halfW + 0.05, -0.82, 0.56]} name="RearPcieSlotRail">
        <mesh position={[0, -0.02, -0.62]} castShadow>
          <boxGeometry args={[0.08, 1.22, 0.1]} />
          <meshStandardMaterial
            color={accentTrimHex}
            roughness={0.35}
            metalness={0.35}
          />
          <Edges threshold={15} color={edgeColor} />
        </mesh>
        {[0, 1, 2, 3, 4, 5, 6].map((slotIdx) => (
          <mesh
            key={`pcie-cover-${slotIdx}`}
            position={[0, 0.42 - slotIdx * 0.14, -0.22]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.05, 0.095, 0.68]} />
            <meshStandardMaterial
              color={isWhiteCase ? '#94a3b8' : '#272e3d'}
              roughness={0.35}
              metalness={0.45}
              wireframe={wireframe}
            />
            <Edges threshold={15} color={edgeColor} />
          </mesh>
        ))}

        {[0, 1, 2].map((vSlot) => (
          <mesh
            key={`vert-pcie-${vSlot}`}
            position={[0, -0.05, 0.28 + vSlot * 0.11]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.05, 0.88, 0.075]} />
            <meshStandardMaterial
              color={isWhiteCase ? '#64748b' : '#1e2430'}
              roughness={0.35}
              metalness={0.45}
              wireframe={wireframe}
            />
            <Edges threshold={15} color={edgeColor} />
          </mesh>
        ))}
      </group>

      <group name="WeldedCentralPartitionAndFanMount">
        <mesh position={[-0.64, 0.1, -0.3]} castShadow receiveShadow>
          <boxGeometry args={[2.46, 3.84, 0.06]} />
          <meshStandardMaterial
            color={interiorHex}
            roughness={0.35}
            metalness={0.2}
            wireframe={wireframe}
          />
          <Edges threshold={15} color={edgeColor} />
        </mesh>

        <mesh position={[-0.78, 0.22, -0.27]}>
          <boxGeometry args={[0.98, 1.08, 0.062]} />
          <meshStandardMaterial
            color={isWhiteCase ? '#b8c0cc' : '#0b0d12'}
            roughness={0.4}
            metalness={0.2}
            wireframe={wireframe}
          />
          <Edges threshold={15} color={edgeColor} />
        </mesh>

        {[
          [-1.68, 1.48],
          [-0.64, 1.48],
          [0.38, 1.48],
          [-1.68, 0.14],
          [-0.64, 0.14],
          [0.38, 0.14],
          [-1.68, -1.18],
          [-0.64, -1.18],
          [0.38, -1.18],
        ].map(([sx, sy], idx) => (
          <mesh
            key={`standoff-${idx}`}
            position={[sx, sy, -0.24]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.024, 0.024, 0.06, 8]} />
            <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.25} />
          </mesh>
        ))}

        <mesh
          position={[0.66, 0.1, -0.22]}
          rotation={[0, -0.38, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.34, 3.84, 0.06]} />
          <meshStandardMaterial
            color={accentTrimHex}
            roughness={0.35}
            metalness={0.2}
            wireframe={wireframe}
          />
          <Edges threshold={15} color={edgeColor} />
        </mesh>

        <group position={[1.32, 0.1, -0.28]} name="SideFanLBracketAssembly">
          <mesh position={[0, 0, -0.06]}>
            <boxGeometry args={[1.06, 3.84, 0.05]} />
            <meshBasicMaterial color={shadowCavernHex} />
          </mesh>

          <mesh position={[0, 0, -0.02]} castShadow receiveShadow>
            <planeGeometry args={[1.04, 3.68]} />
            <meshStandardMaterial
              color={chassisHex}
              roughness={0.35}
              metalness={0.2}
              alphaMap={herringboneAlpha}
              transparent
              alphaTest={0.45}
              side={THREE.DoubleSide}
              wireframe={wireframe}
            />
          </mesh>

          <mesh position={[-0.5, 0, 0.06]} castShadow receiveShadow>
            <boxGeometry args={[0.06, 3.84, 0.22]} />
            <meshStandardMaterial
              color={accentTrimHex}
              roughness={0.35}
              metalness={0.28}
              wireframe={wireframe}
            />
            <Edges threshold={15} color={edgeColor} />
          </mesh>

          <mesh position={[0.5, 0, 0.06]} castShadow receiveShadow>
            <boxGeometry args={[0.06, 3.84, 0.22]} />
            <meshStandardMaterial
              color={accentTrimHex}
              roughness={0.35}
              metalness={0.28}
              wireframe={wireframe}
            />
            <Edges threshold={15} color={edgeColor} />
          </mesh>

          <mesh position={[0, 1.54, 0.06]} castShadow receiveShadow>
            <boxGeometry args={[1.06, 0.1, 0.22]} />
            <meshStandardMaterial
              color={accentTrimHex}
              roughness={0.35}
              metalness={0.28}
              wireframe={wireframe}
            />
            <Edges threshold={15} color={edgeColor} />
          </mesh>

          <mesh position={[0, -1.54, 0.06]} castShadow receiveShadow>
            <boxGeometry args={[1.06, 0.1, 0.22]} />
            <meshStandardMaterial
              color={accentTrimHex}
              roughness={0.35}
              metalness={0.28}
              wireframe={wireframe}
            />
            <Edges threshold={15} color={edgeColor} />
          </mesh>

          {[
            [-0.48, 1.48],
            [0.48, 1.48],
            [-0.48, 0.48],
            [0.48, 0.48],
            [-0.48, -0.48],
            [0.48, -0.48],
            [-0.48, -1.48],
            [0.48, -1.48],
          ].map(([bx, by], bIdx) => (
            <mesh
              key={`fan-bolt-${bIdx}`}
              position={[bx, by, 0.175]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.02, 0.02, 0.02, 12]} />
              <meshStandardMaterial color="#111318" metalness={0.8} roughness={0.3} />
            </mesh>
          ))}
        </group>
      </group>

      <group position={[-0.42, 1.96, 0.02]} name="TopRadiatorCeilingRails">
        <mesh position={[0, 0, -0.44]} castShadow>
          <boxGeometry args={[2.76, 0.08, 0.06]} />
          <meshStandardMaterial
            color={accentTrimHex}
            roughness={0.35}
            metalness={0.28}
          />
          <Edges threshold={15} color={edgeColor} />
        </mesh>
        <mesh position={[0, 0, 0.44]} castShadow>
          <boxGeometry args={[2.76, 0.08, 0.06]} />
          <meshStandardMaterial
            color={accentTrimHex}
            roughness={0.35}
            metalness={0.28}
          />
          <Edges threshold={15} color={edgeColor} />
        </mesh>
      </group>

      <RubberGrommet
        position={[-1.12, 1.72, -0.27]}
        rotation={[0, 0, Math.PI / 2]}
        width={0.2}
        height={0.56}
        isWhiteCase={isWhiteCase}
        wireframe={wireframe}
      />
      <RubberGrommet
        position={[-0.28, 1.72, -0.27]}
        rotation={[0, 0, Math.PI / 2]}
        width={0.2}
        height={0.56}
        isWhiteCase={isWhiteCase}
        wireframe={wireframe}
      />
      <RubberGrommet
        position={[0.66, 0.64, -0.19]}
        rotation={[0, -0.38, 0]}
        width={0.2}
        height={0.68}
        isWhiteCase={isWhiteCase}
        wireframe={wireframe}
      />
      <RubberGrommet
        position={[0.66, -0.28, -0.19]}
        rotation={[0, -0.38, 0]}
        width={0.2}
        height={0.68}
        isWhiteCase={isWhiteCase}
        wireframe={wireframe}
      />

      <mesh position={[0, -1.84, 0.58]} castShadow receiveShadow>
        <boxGeometry args={[3.68, 0.28, 1.76]} />
        <meshStandardMaterial
          color={interiorHex}
          roughness={0.35}
          metalness={0.2}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>
      <mesh
        position={[-0.18, -1.69, 0.52]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[3.12, 1.56]} />
        <meshStandardMaterial
          color={chassisHex}
          roughness={0.35}
          metalness={0.2}
          alphaMap={herringboneAlpha}
          transparent
          alphaTest={0.45}
          side={THREE.DoubleSide}
          wireframe={wireframe}
        />
      </mesh>

      <group position={[-0.76, -1.65, 0.36]} name="FloorPcieRiserBase">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.18, 0.1, 0.16]} />
          <meshStandardMaterial
            color="#111318"
            roughness={0.4}
            metalness={0.5}
            wireframe={wireframe}
          />
          <Edges threshold={15} color="#2a2e37" />
        </mesh>
        <mesh position={[0, 0.055, 0]}>
          <boxGeometry args={[1.08, 0.025, 0.045]} />
          <meshStandardMaterial
            color="#94a3b8"
            metalness={0.85}
            roughness={0.22}
            wireframe={wireframe}
          />
        </mesh>
      </group>

      <group
        position={[
          halfW - CASE_CHAMFER * 0.5,
          -halfH + 0.04,
          halfD - CASE_CHAMFER * 0.5,
        ]}
        rotation={[0, Math.PI / 4, 0]}
        name="FrontChamferIoPanel"
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[chamferWidth, 0.08, 0.08]} />
          <meshStandardMaterial
            color={chassisHex}
            roughness={0.35}
            metalness={0.2}
            wireframe={wireframe}
          />
          <Edges threshold={15} color={edgeColor} />
        </mesh>
        <mesh position={[0.02, 0, 0.042]}>
          <boxGeometry args={[0.12, 0.05, 0.015]} />
          <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.6} />
        </mesh>
        <mesh position={[-0.16, 0, 0.042]}>
          <boxGeometry args={[0.07, 0.035, 0.015]} />
          <meshStandardMaterial color="#090b0f" roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[0.2, 0, 0.042]}>
          <boxGeometry args={[0.07, 0.035, 0.015]} />
          <meshStandardMaterial color="#090b0f" roughness={0.4} metalness={0.7} />
        </mesh>
      </group>

      {[
        [-1.55, -1.2],
        [1.35, -1.2],
        [-1.55, 1.2],
        [1.0, 1.2],
      ].map(([fx, fz], idx) => (
        <mesh
          key={`foot-${idx}`}
          position={[fx, -halfH - 0.05, fz]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.16, 0.18, 0.1, 24]} />
          <meshStandardMaterial
            color="#1e293b"
            metalness={0.65}
            roughness={0.32}
            wireframe={wireframe}
          />
        </mesh>
      ))}

      <group name="CaseInstalledFansGroup">
        {fanConfig?.side !== false &&
          [1.0, 0.0, -1.0].map((yPos, idx) => (
            <CaseFan120
              key={`side-fan-${idx}`}
              position={[1.32, yPos + 0.1, -0.19]}
              fanSize={0.92}
              isWhite={isWhiteCase}
              wireframe={wireframe}
              rgbMat={rgbFanMat}
              onRegisterImpeller={onRegisterImpeller}
            />
          ))}

        {fanConfig?.rear !== false && (
          <CaseFan120
            position={[-1.76, 0.72, 0.56]}
            rotation={[0, Math.PI / 2, 0]}
            fanSize={0.9}
            isWhite={isWhiteCase}
            wireframe={wireframe}
            rgbMat={rgbFanMat}
            onRegisterImpeller={onRegisterImpeller}
          />
        )}

        {fanConfig?.bottom !== false &&
          [-1.12, -0.18, 0.76].map((xPos, idx) => (
            <CaseFan120
              key={`bottom-fan-${idx}`}
              position={[xPos, -1.61, 0.52]}
              rotation={[-Math.PI / 2, 0, 0]}
              fanSize={0.88}
              isWhite={isWhiteCase}
              wireframe={wireframe}
              rgbMat={rgbFanMat}
              onRegisterImpeller={onRegisterImpeller}
            />
          ))}
      </group>

      <group
        ref={glassDoorPivotRef}
        name="SideGlassDoorPivot"
        position={[-halfW, 0, halfD - 0.015]}
      >
        <mesh position={[sideDoorWidth * 0.5, 0, 0]} material={glassMaterial}>
          <boxGeometry args={[sideDoorWidth, CASE_HEIGHT - 0.16, 0.022]} />
          <Edges threshold={15} color="#111318" />
        </mesh>
        <mesh position={[sideDoorWidth * 0.5, halfH - 0.11, 0]}>
          <boxGeometry args={[sideDoorWidth, 0.065, 0.026]} />
          <meshStandardMaterial
            color="#111318"
            roughness={0.65}
            metalness={0.2}
          />
        </mesh>
        <mesh position={[sideDoorWidth * 0.5, -halfH + 0.11, 0]}>
          <boxGeometry args={[sideDoorWidth, 0.065, 0.026]} />
          <meshStandardMaterial
            color="#111318"
            roughness={0.65}
            metalness={0.2}
          />
        </mesh>
        <mesh position={[0.03, 0, 0]}>
          <boxGeometry args={[0.06, CASE_HEIGHT - 0.16, 0.026]} />
          <meshStandardMaterial
            color="#111318"
            roughness={0.65}
            metalness={0.2}
          />
        </mesh>
      </group>

      {showGlass && (
        <group name="PanoramicFixedFrontGlass">
          <group
            position={[
              halfW - CASE_CHAMFER * 0.5,
              0,
              halfD - CASE_CHAMFER * 0.5,
            ]}
            rotation={[0, Math.PI / 4, 0]}
          >
            <mesh material={glassMaterial}>
              <boxGeometry args={[chamferWidth, CASE_HEIGHT - 0.16, 0.022]} />
              <Edges threshold={15} color="#111318" />
            </mesh>
            <mesh position={[0, halfH - 0.11, 0]}>
              <boxGeometry args={[chamferWidth, 0.065, 0.026]} />
              <meshStandardMaterial
                color="#111318"
                roughness={0.65}
                metalness={0.2}
              />
            </mesh>
            <mesh position={[0, -halfH + 0.11, 0]}>
              <boxGeometry args={[chamferWidth, 0.065, 0.026]} />
              <meshStandardMaterial
                color="#111318"
                roughness={0.65}
                metalness={0.2}
              />
            </mesh>
          </group>

          <group
            position={[halfW - 0.015, 0, -CASE_CHAMFER * 0.5]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <mesh material={glassMaterial}>
              <boxGeometry args={[rightGlassWidth, CASE_HEIGHT - 0.16, 0.022]} />
              <Edges threshold={15} color="#111318" />
            </mesh>
            <mesh position={[0, halfH - 0.11, 0]}>
              <boxGeometry args={[rightGlassWidth, 0.065, 0.026]} />
              <meshStandardMaterial
                color="#111318"
                roughness={0.65}
                metalness={0.2}
              />
            </mesh>
            <mesh position={[0, -halfH + 0.11, 0]}>
              <boxGeometry args={[rightGlassWidth, 0.065, 0.026]} />
              <meshStandardMaterial
                color="#111318"
                roughness={0.65}
                metalness={0.2}
              />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
}

function ParametricMotherboard({
  moboPart,
  hasCpu = false,
  wireframe = false,
}) {
  const surfaceBundle = useMemo(
    () => createMotherboardSurfaceTextures(moboPart),
    [moboPart]
  );

  const isStrixWhite = Boolean(surfaceBundle?.isStrixWhite);
  const heatsinkHex = isStrixWhite ? '#e5e7eb' : moboPart?.vrmColor || '#1c2029';
  const dimmColor = isStrixWhite ? '#1e293b' : '#14171f';
  const edgeColor = isStrixWhite ? '#9ca3af' : '#2a2e37';

  const vrmLeftGeo = useMemo(
    () => createBeveledBoxGeometry(0.48, 1.58, 0.2, 0.016),
    []
  );
  const vrmTopGeo = useMemo(
    () => createBeveledBoxGeometry(0.92, 0.32, 0.16, 0.014),
    []
  );
  const m2TopGeo = useMemo(
    () => createBeveledBoxGeometry(1.02, 0.28, 0.1, 0.012),
    []
  );
  const m2LowerGeo = useMemo(
    () => createBeveledBoxGeometry(1.62, 0.78, 0.1, 0.014),
    []
  );

  const rogEyeMat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      map: surfaceBundle?.vrmTex || null,
      emissiveMap: surfaceBundle?.vrmEmissiveTex || null,
      emissive: new THREE.Color(isStrixWhite ? '#f59e0b' : '#38bdf8'),
      emissiveIntensity: 1.2,
      roughness: 0.32,
      metalness: 0.55,
      wireframe,
    });
    return m;
  }, [surfaceBundle, isStrixWhite, wireframe]);

  return (
    <group name="ParametricMotherboardNode">
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.36, 2.96, 0.06]} />
        <meshStandardMaterial
          map={surfaceBundle?.pcbTex || null}
          color={isStrixWhite ? '#1e222d' : '#11141c'}
          roughness={0.5}
          metalness={0.28}
          wireframe={wireframe}
        />
        <Edges threshold={15} color="#2a2e37" />
      </mesh>

      <mesh
        position={[-0.88, 0.54, 0.13]}
        geometry={vrmLeftGeo}
        material={rogEyeMat}
        castShadow
        receiveShadow
      >
        <Edges threshold={15} color={edgeColor} />
      </mesh>

      <mesh
        position={[-0.14, 1.28, 0.11]}
        geometry={vrmTopGeo}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={heatsinkHex}
          roughness={0.32}
          metalness={0.62}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>

      <group position={[-0.18, 0.66, 0.04]} name="CpuSocketAssembly">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.64, 0.7, 0.04]} />
          <meshStandardMaterial
            color="#94a3b8"
            metalness={0.78}
            roughness={0.28}
            wireframe={wireframe}
          />
          <Edges threshold={15} color="#475569" />
        </mesh>

        <mesh position={[0, 0, 0.028]}>
          <boxGeometry args={[0.46, 0.52, 0.025]} />
          <meshStandardMaterial
            color={hasCpu ? '#94a3b8' : '#1e293b'}
            metalness={hasCpu ? 0.8 : 0.35}
            roughness={0.28}
            wireframe={wireframe}
          />
        </mesh>

        <mesh position={[0, 0.32, 0.048]} castShadow>
          <boxGeometry args={[0.6, 0.055, 0.024]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.82} roughness={0.22} />
        </mesh>
        <mesh position={[0, -0.32, 0.048]} castShadow>
          <boxGeometry args={[0.6, 0.055, 0.024]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.82} roughness={0.22} />
        </mesh>
        <mesh position={[-0.28, 0, 0.048]} castShadow>
          <boxGeometry args={[0.048, 0.64, 0.024]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.82} roughness={0.22} />
        </mesh>
        <mesh position={[0.28, 0, 0.048]} castShadow>
          <boxGeometry args={[0.048, 0.64, 0.024]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.82} roughness={0.22} />
        </mesh>

        <mesh position={[0.35, 0.02, 0.035]}>
          <cylinderGeometry args={[0.012, 0.012, 0.66, 12]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.2} />
        </mesh>
      </group>

      {[0.4, 0.53, 0.66, 0.79].map((xPos, idx) => (
        <group key={`dimm-slot-${idx}`} position={[xPos, 0.66, 0.05]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.052, 1.32, 0.06]} />
            <meshStandardMaterial
              color={dimmColor}
              roughness={0.45}
              metalness={0.25}
              wireframe={wireframe}
            />
          </mesh>
          <mesh position={[0, 0.68, 0.02]}>
            <boxGeometry args={[0.06, 0.055, 0.08]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.4} />
          </mesh>
          <mesh position={[0, -0.68, 0.02]}>
            <boxGeometry args={[0.06, 0.055, 0.08]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.4} />
          </mesh>
        </group>
      ))}

      <mesh
        position={[-0.16, -0.02, 0.08]}
        geometry={m2TopGeo}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={heatsinkHex}
          roughness={0.32}
          metalness={0.62}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>

      <mesh
        position={[0.08, -0.66, 0.085]}
        geometry={m2LowerGeo}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          map={surfaceBundle?.m2Tex || null}
          color={isStrixWhite ? '#e5e7eb' : '#1e2430'}
          roughness={0.34}
          metalness={0.58}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>

      {[-0.34, -1.12].map((ySlot, sIdx) => (
        <group key={`pcie-x16-${sIdx}`} position={[-0.12, ySlot, 0.055]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.14, 0.085, 0.08]} />
            <meshStandardMaterial
              color="#cbd5e1"
              metalness={0.82}
              roughness={0.24}
              wireframe={wireframe}
            />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[1.08, 0.032, 0.055]} />
            <meshStandardMaterial color="#090b0f" roughness={0.6} />
          </mesh>
        </group>
      ))}

      <mesh position={[1.08, 0.5, 0.065]} castShadow>
        <boxGeometry args={[0.12, 0.62, 0.1]} />
        <meshStandardMaterial color="#0f172a" roughness={0.45} metalness={0.3} />
      </mesh>

      <mesh position={[-0.7, 1.38, 0.065]} castShadow>
        <boxGeometry args={[0.3, 0.12, 0.1]} />
        <meshStandardMaterial color="#0f172a" roughness={0.45} metalness={0.3} />
      </mesh>

      <mesh
        position={[0.64, -1.24, 0.045]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.1, 0.1, 0.03, 24]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.2} />
      </mesh>
    </group>
  );
}

function ParametricCpu({ cpuPart, wireframe = false }) {
  const isIntel = cpuPart?.specs?.socket?.includes('LGA');
  return (
    <group name="ParametricCpuChip">
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.5, isIntel ? 0.56 : 0.5, 0.032]} />
        <meshStandardMaterial
          color="#115e59"
          roughness={0.42}
          metalness={0.35}
          wireframe={wireframe}
        />
      </mesh>
      <mesh position={[0, 0, 0.032]} castShadow receiveShadow>
        <boxGeometry args={[0.4, isIntel ? 0.46 : 0.4, 0.036]} />
        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.85}
          roughness={0.22}
          wireframe={wireframe}
        />
        <Edges threshold={15} color="#475569" />
      </mesh>
    </group>
  );
}

function ParametricGpu({
  gpuPart,
  isWhiteCase = false,
  wireframe = false,
  rgbGpuMat,
  onRegisterImpeller,
}) {
  const imp0 = useRef(null);
  const imp1 = useRef(null);
  const imp2 = useRef(null);

  useEffect(() => {
    if (!onRegisterImpeller) return undefined;
    const cleanups = [imp0.current, imp1.current, imp2.current]
      .filter(Boolean)
      .map((el) => onRegisterImpeller(el));
    return () => cleanups.forEach((fn) => fn && fn());
  }, [onRegisterImpeller]);

  const isWhiteGpu = String(gpuPart?.shroudColor || '')
    .toLowerCase()
    .includes('cbd5e1');
  const shroudHex = isWhiteGpu ? '#e5e7eb' : gpuPart?.shroudColor || '#151820';
  const edgeColor = isWhiteGpu ? '#9ca3af' : '#2a2e37';
  const riserRibbonHex = isWhiteCase ? '#e2e8f0' : '#181b24';
  const L = 2.48;
  const T = 0.52;
  const W = 1.08;
  const finCount = 32;

  const backplateGeo = useMemo(() => {
    const g = createBeveledBoxGeometry(L, W, 0.038, 0.01);
    g.rotateX(Math.PI / 2);
    return g;
  }, [L, W]);

  const shroudGeo = useMemo(() => {
    const g = createBeveledBoxGeometry(L, W, 0.14, 0.016);
    g.rotateX(Math.PI / 2);
    return g;
  }, [L, W]);

  const riserLanes = useMemo(() => {
    const lanes = [-0.36, -0.18, 0, 0.18, 0.36];
    return lanes.map((xOff) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.22 + xOff, 0.02, -W * 0.5 + 0.04),
        new THREE.Vector3(-0.22 + xOff, -0.35, -W * 0.5 - 0.02),
        new THREE.Vector3(-0.22 + xOff, -0.82, -0.08),
        new THREE.Vector3(-0.22 + xOff, -1.42, -0.02),
      ]);
      return new THREE.TubeGeometry(curve, 20, 0.028, 8, false);
    });
  }, [W]);

  return (
    <group name="ParametricGpuNode">
      <mesh
        position={[0, T / 2 - 0.02, 0]}
        geometry={backplateGeo}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={shroudHex}
          metalness={0.62}
          roughness={0.34}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>

      <group position={[-L * 0.5 - 0.01, -0.04, 0]} name="GpuRearIoBracket">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.045, T + 0.18, W - 0.04]} />
          <meshStandardMaterial
            color="#64748b"
            metalness={0.82}
            roughness={0.25}
          />
          <Edges threshold={15} color="#1e293b" />
        </mesh>
        <mesh position={[-0.02, 0.28, -0.38]} castShadow>
          <boxGeometry args={[0.08, 0.1, 0.24]} />
          <meshStandardMaterial
            color="#475569"
            metalness={0.78}
            roughness={0.28}
          />
        </mesh>
        {[-0.44, -0.32].map((bz, idx) => (
          <mesh
            key={`gpu-screw-${idx}`}
            position={[0.02, 0.31, bz]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.024, 0.024, 0.04, 12]} />
            <meshStandardMaterial color="#090b0f" metalness={0.85} roughness={0.2} />
          </mesh>
        ))}
        {[-0.2, -0.02, 0.16, 0.34].map((pz, pIdx) => (
          <mesh key={`dp-port-${pIdx}`} position={[-0.025, 0.02, pz]}>
            <boxGeometry args={[0.01, 0.06, 0.11]} />
            <meshStandardMaterial color="#090b0f" roughness={0.5} />
          </mesh>
        ))}
      </group>

      <group name="GpuPcieSlotAndRiser">
        <mesh position={[-0.22, 0.04, -W * 0.5 + 0.02]} castShadow>
          <boxGeometry args={[1.08, 0.12, 0.08]} />
          <meshStandardMaterial
            color="#d97706"
            metalness={0.88}
            roughness={0.22}
          />
        </mesh>
        {riserLanes.map((geo, idx) => (
          <mesh key={`riser-lane-${idx}`} geometry={geo} castShadow>
            <meshStandardMaterial
              color={riserRibbonHex}
              roughness={0.55}
              metalness={0.2}
            />
          </mesh>
        ))}
      </group>

      <group position={[L * 0.5 - 0.18, -0.84, 0.36]} name="GpuAntiSagSupport">
        <mesh castShadow>
          <cylinderGeometry args={[0.036, 0.044, 1.18, 16]} />
          <meshStandardMaterial
            color="#1e293b"
            metalness={0.78}
            roughness={0.25}
          />
        </mesh>
        <mesh position={[0, 0.56, 0]}>
          <boxGeometry args={[0.14, 0.04, 0.18]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
      </group>

      <group name="GpuAluminumFinArray">
        {Array.from({ length: finCount }).map((_, idx) => {
          const xPos = -L / 2 + 0.1 + (idx / (finCount - 1)) * (L - 0.2);
          return (
            <mesh key={`fin-${idx}`} position={[xPos, 0.02, 0]}>
              <boxGeometry args={[0.02, T * 0.52, W - 0.1]} />
              <meshStandardMaterial
                color="#4b5563"
                metalness={0.8}
                roughness={0.28}
                wireframe={wireframe}
              />
            </mesh>
          );
        })}
      </group>

      {[-0.32, -0.16, 0, 0.16, 0.32].map((zPipe, idx) => (
        <mesh
          key={`hp-${idx}`}
          position={[0, 0.02, zPipe]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.02, 0.02, L - 0.08, 14]} />
          <meshStandardMaterial color="#b45309" metalness={0.88} roughness={0.24} />
        </mesh>
      ))}

      <mesh
        position={[0, -T / 2 + 0.07, 0]}
        geometry={shroudGeo}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={shroudHex}
          metalness={0.52}
          roughness={0.36}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>

      <mesh position={[0.42, T * 0.5 - 0.01, W * 0.5 - 0.08]} castShadow>
        <boxGeometry args={[0.24, 0.07, 0.12]} />
        <meshStandardMaterial color="#090b0f" roughness={0.4} metalness={0.4} />
      </mesh>

      <mesh position={[0, 0.048, W / 2 + 0.008]} material={rgbGpuMat}>
        <boxGeometry args={[L - 0.22, 0.024, 0.015]} />
      </mesh>

      {[-0.76, 0, 0.76].map((fx, fIdx) => {
        const refObj = fIdx === 0 ? imp0 : fIdx === 1 ? imp1 : imp2;
        return (
          <group
            key={`gfan-${fIdx}`}
            position={[fx, -T / 2 + 0.02, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <group ref={refObj}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.11, 0.11, 0.045, 20]} />
                <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.25} />
              </mesh>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((b) => (
                <group key={b} rotation={[0, 0, (b / 9) * Math.PI * 2]}>
                  <mesh
                    position={[0.02, 0.17, 0]}
                    rotation={[0.35, 0.2, -0.25]}
                  >
                    <boxGeometry args={[0.08, 0.2, 0.012]} />
                    <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.35} />
                  </mesh>
                </group>
              ))}
            </group>
          </group>
        );
      })}
    </group>
  );
}

function ParametricRam({ ramPart, wireframe = false, rgbRamMat }) {
  const sticks = ramPart?.specs?.sticks >= 4 ? [0, 0.13, 0.26, 0.39] : [0.13, 0.39];
  const hsColor = ramPart?.heatsinkColor || '#181b22';
  const stickGeo = useMemo(
    () => createBeveledBoxGeometry(0.058, 1.28, 0.3, 0.008),
    []
  );

  return (
    <group name="ParametricRamModules">
      {sticks.map((xOff, idx) => (
        <group key={`dimm-stick-${idx}`} position={[xOff, 0, 0]}>
          <mesh geometry={stickGeo} castShadow receiveShadow>
            <meshStandardMaterial
              color={hsColor}
              metalness={0.68}
              roughness={0.28}
              wireframe={wireframe}
            />
            <Edges threshold={15} color="#2a2e37" />
          </mesh>
          <mesh position={[0, 0, 0.165]} material={rgbRamMat}>
            <boxGeometry args={[0.05, 1.26, 0.045]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ParametricCooler({
  coolerPart,
  wireframe = false,
  showDisplays = true,
  showTopFans = true,
  showCables = true,
  rgbCoolerMat,
  rgbFanMat,
  lcdTex,
  onRegisterImpeller,
}) {
  const isAir = coolerPart?.coolerStyle === 'air_dual';
  const radColor = coolerPart?.radiatorColor || '#14171f';

  const radGeo = useMemo(() => {
    const g = createBeveledBoxGeometry(2.56, 0.88, 0.2, 0.014);
    g.rotateX(Math.PI / 2);
    return g;
  }, []);

  const tube1Geo = useMemo(() => {
    const c1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.2, -0.04, 0.2),
      new THREE.Vector3(0.5, 0.18, 0.38),
      new THREE.Vector3(0.68, 0.56, 0.34),
      new THREE.Vector3(0.76, 0.96, 0.2),
    ]);
    return new THREE.TubeGeometry(c1, 24, 0.032, 12, false);
  }, []);

  const tube2Geo = useMemo(() => {
    const c2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.2, 0.08, 0.2),
      new THREE.Vector3(0.44, 0.32, 0.32),
      new THREE.Vector3(0.58, 0.6, 0.28),
      new THREE.Vector3(0.64, 0.96, 0.14),
    ]);
    return new THREE.TubeGeometry(c2, 24, 0.032, 12, false);
  }, []);

  if (isAir) {
    return (
      <group name="ParametricAirCooler">
        <mesh position={[-0.26, 0, 0.38]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 1.08, 0.76]} />
          <meshStandardMaterial
            color="#181b22"
            metalness={0.75}
            roughness={0.32}
            wireframe={wireframe}
          />
          <Edges threshold={15} color="#2a2e37" />
        </mesh>
        <mesh position={[0.26, 0, 0.38]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 1.08, 0.76]} />
          <meshStandardMaterial
            color="#181b22"
            metalness={0.75}
            roughness={0.32}
            wireframe={wireframe}
          />
          <Edges threshold={15} color="#2a2e37" />
        </mesh>
        {showTopFans && (
          <CaseFan120
            position={[0, 0, 0.38]}
            rotation={[0, Math.PI / 2, 0]}
            fanSize={0.86}
            wireframe={wireframe}
            rgbMat={rgbFanMat}
            onRegisterImpeller={onRegisterImpeller}
          />
        )}
      </group>
    );
  }

  return (
    <group name="ParametricAioCooler">
      <mesh
        position={[0, 0, 0.18]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.35, 0.37, 0.36, 32]} />
        <meshStandardMaterial
          color={radColor}
          metalness={0.65}
          roughness={0.35}
          wireframe={wireframe}
        />
      </mesh>
      <mesh position={[0, 0, 0.365]} material={rgbCoolerMat}>
        <torusGeometry args={[0.33, 0.016, 16, 36]} />
      </mesh>
      {showDisplays && (
        <mesh position={[0, 0, 0.372]} rotation={[0, 0, 0]}>
          <circleGeometry args={[0.3, 48]} />
          <meshStandardMaterial
            map={lcdTex}
            emissiveMap={lcdTex}
            emissive="#ffffff"
            emissiveIntensity={0.95}
            roughness={0.2}
          />
        </mesh>
      )}

      <group position={[0.38, 1.06, 0.14]}>
        <mesh geometry={radGeo} castShadow receiveShadow>
          <meshStandardMaterial
            color={radColor}
            metalness={0.62}
            roughness={0.34}
            wireframe={wireframe}
          />
          <Edges threshold={15} color="#2a2e37" />
        </mesh>
        {showTopFans &&
          [-0.84, 0, 0.84].map((fx, idx) => (
            <CaseFan120
              key={`rad-fan-${idx}`}
              position={[fx, -0.18, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              fanSize={0.82}
              wireframe={wireframe}
              rgbMat={rgbFanMat}
              onRegisterImpeller={onRegisterImpeller}
            />
          ))}
      </group>

      {showCables && (
        <>
          <mesh geometry={tube1Geo} castShadow>
            <meshStandardMaterial color="#11141c" roughness={0.55} metalness={0.22} />
          </mesh>
          <mesh geometry={tube2Geo} castShadow>
            <meshStandardMaterial color="#11141c" roughness={0.55} metalness={0.22} />
          </mesh>
        </>
      )}
    </group>
  );
}

function ParametricDualChamberPsu({
  psuPart,
  wireframe = false,
  honeycombAlpha,
}) {
  const isRogThor = String(psuPart?.name || '').toUpperCase().includes('THOR');
  const psuGeo = useMemo(
    () => createBeveledBoxGeometry(1.14, 1.3, 0.72, 0.016),
    []
  );

  return (
    <group name="VerticalDualChamberPsu">
      <mesh geometry={psuGeo} castShadow receiveShadow>
        <meshStandardMaterial
          color="#12151c"
          metalness={0.6}
          roughness={0.35}
          wireframe={wireframe}
        />
        <Edges threshold={15} color="#2a2e37" />
      </mesh>

      <mesh position={[-0.574, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.64, 1.18]} />
        <meshStandardMaterial
          color="#090b0f"
          roughness={0.42}
          metalness={0.5}
          alphaMap={honeycombAlpha}
          transparent
          alphaTest={0.45}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[-0.576, 0.28, -0.12]}>
        <boxGeometry args={[0.02, 0.2, 0.16]} />
        <meshStandardMaterial color="#050608" roughness={0.4} metalness={0.6} />
      </mesh>
      {[-0.16, -0.12, -0.08].map((pz, i) => (
        <mesh key={`prong-${i}`} position={[-0.585, 0.28, pz]}>
          <boxGeometry args={[0.02, 0.04, 0.018]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      <mesh position={[-0.576, -0.28, -0.12]}>
        <boxGeometry args={[0.02, 0.14, 0.11]} />
        <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.3} />
      </mesh>

      {isRogThor && (
        <mesh position={[0, 0.655, 0]}>
          <boxGeometry args={[0.48, 0.02, 0.24]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#38bdf8"
            emissiveIntensity={1.1}
          />
        </mesh>
      )}
    </group>
  );
}

function SleevedPowerCables({
  hasMobo = true,
  hasGpu = true,
  isWhiteCase = false,
}) {
  const sleeveColor = isWhiteCase ? '#f1f5f9' : '#1e2430';
  const combColor = isWhiteCase ? '#111318' : '#64748b';

  const mobo24Strands = useMemo(() => {
    const offsets = [-0.15, -0.09, -0.03, 0.03, 0.09, 0.15];
    return offsets.map((yOff) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.44, 0.64 + yOff, -0.14),
        new THREE.Vector3(0.62, 0.64 + yOff, -0.06),
        new THREE.Vector3(0.68, 0.64 + yOff, -0.26),
        new THREE.Vector3(0.45, 0.35 + yOff, -0.45),
      ]);
      return new THREE.TubeGeometry(curve, 20, 0.014, 8, false);
    });
  }, []);

  const cpu8PinStrands = useMemo(() => {
    const offsets = [-0.075, -0.025, 0.025, 0.075];
    return offsets.map((xOff) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.34 + xOff, 1.52, -0.14),
        new THREE.Vector3(-1.34 + xOff, 1.72, -0.08),
        new THREE.Vector3(-1.18 + xOff, 1.76, -0.28),
        new THREE.Vector3(-1.18 + xOff, 1.25, -0.48),
      ]);
      return new THREE.TubeGeometry(curve, 20, 0.013, 8, false);
    });
  }, []);

  const gpu12VhpwrStrands = useMemo(() => {
    const offsets = [-0.075, -0.045, -0.015, 0.015, 0.045, 0.075];
    return offsets.map((xOff) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.2 + xOff, 0.04, 0.82),
        new THREE.Vector3(0.18 + xOff, -0.06, 0.92),
        new THREE.Vector3(0.56 + xOff, -0.22, 0.42),
        new THREE.Vector3(0.66 + xOff, -0.28, -0.26),
        new THREE.Vector3(-0.45 + xOff, -0.45, -0.55),
      ]);
      return new THREE.TubeGeometry(curve, 24, 0.013, 8, false);
    });
  }, []);

  return (
    <group name="SleevedPowerCables">
      {hasMobo && (
        <group name="Mobo24PinAndCpu8PinCables">
          {mobo24Strands.map((geo, idx) => (
            <mesh key={`atx24-${idx}`} geometry={geo} castShadow>
              <meshStandardMaterial
                color={sleeveColor}
                roughness={0.55}
                metalness={0.12}
              />
            </mesh>
          ))}
          <mesh position={[0.61, 0.64, -0.09]} castShadow>
            <boxGeometry args={[0.04, 0.36, 0.05]} />
            <meshStandardMaterial color={combColor} roughness={0.35} metalness={0.4} />
          </mesh>

          {cpu8PinStrands.map((geo, idx) => (
            <mesh key={`eps8-${idx}`} geometry={geo} castShadow>
              <meshStandardMaterial
                color={sleeveColor}
                roughness={0.55}
                metalness={0.12}
              />
            </mesh>
          ))}
          <mesh position={[-1.34, 1.66, -0.1]} castShadow>
            <boxGeometry args={[0.2, 0.04, 0.05]} />
            <meshStandardMaterial color={combColor} roughness={0.35} metalness={0.4} />
          </mesh>
        </group>
      )}

      {hasGpu && (
        <group name="Gpu12VhpwrBraidedCable">
          {gpu12VhpwrStrands.map((geo, idx) => (
            <mesh key={`gpu16-${idx}`} geometry={geo} castShadow>
              <meshStandardMaterial
                color={sleeveColor}
                roughness={0.55}
                metalness={0.12}
              />
            </mesh>
          ))}
          <mesh position={[0.22, -0.08, 0.86]} castShadow>
            <boxGeometry args={[0.2, 0.05, 0.05]} />
            <meshStandardMaterial color={combColor} roughness={0.35} metalness={0.4} />
          </mesh>
          <mesh position={[0.52, -0.2, 0.46]} castShadow>
            <boxGeometry args={[0.2, 0.05, 0.05]} />
            <meshStandardMaterial color={combColor} roughness={0.35} metalness={0.4} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function AirflowStreamlines() {
  const groupRef = useRef(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.children.forEach((arrow, idx) => {
      const phase = (t * 1.8 + idx * 0.35) % 1;
      const base = arrow.userData.basePos;
      const dir = arrow.userData.dirVec;
      arrow.position.set(
        base[0] + dir[0] * phase * 0.5,
        base[1] + dir[1] * phase * 0.5,
        base[2] + dir[2] * phase * 0.5
      );
    });
  });

  const streams = [
    {
      pos: [1.05, -0.6, -0.05],
      rot: [0, 0, 0.72],
      dir: [-0.8, 0.6, 0.2],
      color: '#38bdf8',
    },
    {
      pos: [1.05, 0.25, -0.05],
      rot: [0, 0, 0.72],
      dir: [-0.8, 0.6, 0.2],
      color: '#38bdf8',
    },
    {
      pos: [-0.75, -1.35, 0.28],
      rot: [0, 0, 0],
      dir: [0, 1.0, 0],
      color: '#38bdf8',
    },
    {
      pos: [0.15, -1.35, 0.28],
      rot: [0, 0, 0],
      dir: [0, 1.0, 0],
      color: '#38bdf8',
    },
    {
      pos: [-1.25, 0.68, 0.36],
      rot: [0, 0, 1.15],
      dir: [-0.9, 0.4, 0],
      color: '#ef4444',
    },
    {
      pos: [-0.45, 1.12, 0.18],
      rot: [0, 0, 0.1],
      dir: [-0.1, 0.95, 0],
      color: '#ef4444',
    },
    {
      pos: [0.22, 1.12, 0.18],
      rot: [0, 0, 0.1],
      dir: [-0.1, 0.95, 0],
      color: '#f97316',
    },
  ];

  return (
    <group ref={groupRef} name="AirflowStreamlines">
      {streams.map((s, idx) => (
        <group
          key={`flow-${idx}`}
          position={s.pos}
          rotation={s.rot}
          userData={{ basePos: s.pos, dirVec: s.dir }}
        >
          <mesh position={[0, 0.36, 0]}>
            <coneGeometry args={[0.08, 0.2, 16]} />
            <meshBasicMaterial color={s.color} transparent opacity={0.9} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.026, 0.026, 0.48, 12]} />
            <meshBasicMaterial color={s.color} transparent opacity={0.72} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function CapeModel({
  build,
  customGlbOverrides = {},
  wireframe = false,
  explodedView = false,
  showGlass = true,
  showCables = true,
  isPcOn = true,
  rgbConfig = DEFAULT_RGB_CONFIG,
  showAirflow = false,
  showDisplays = true,
  displayConfig = { mode: 'cpu_temp', customText: '42°C' },
  fanConfig = { top: true, side: true, bottom: true, rear: true, rpmMode: 'normal' },
}) {
  const impellersSetRef = useRef(new Set());
  const tempColorRef = useRef(new THREE.Color());
  const [detectedCaseSockets, setDetectedCaseSockets] = useState({});
  const [detectedMoboSockets, setDetectedMoboSockets] = useState({});

  const herringboneAlpha = useMemo(() => createHerringboneVentAlphaTexture(), []);
  const honeycombAlpha = useMemo(() => createHoneycombGrilleAlphaTexture(), []);
  const lcdTex = useMemo(
    () => createKrakenLcdTexture(displayConfig),
    [displayConfig]
  );

  const caseUpperName = String(build?.case?.name || '').toUpperCase();
  const caseChassisHex = String(build?.case?.chassisColor || '').toLowerCase();
  const isWhiteCaseBuild =
    caseChassisHex === '#e5e7eb' ||
    caseChassisHex === '#d8dce3' ||
    caseChassisHex === '#f3f4f6' ||
    caseUpperName.includes('WHITE') ||
    caseUpperName.includes('SNOW');

  const rgbMats = useMemo(
    () => ({
      fans: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#00f2fe'),
        emissive: new THREE.Color('#00f2fe'),
        emissiveIntensity: 1.05,
        roughness: 0.25,
        metalness: 0.1,
        wireframe,
      }),
      ram: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#a855f7'),
        emissive: new THREE.Color('#a855f7'),
        emissiveIntensity: 1.05,
        roughness: 0.25,
        metalness: 0.1,
        wireframe,
      }),
      gpu: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#ef4444'),
        emissive: new THREE.Color('#ef4444'),
        emissiveIntensity: 1.05,
        roughness: 0.25,
        metalness: 0.1,
        wireframe,
      }),
      cooler: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#00f2fe'),
        emissive: new THREE.Color('#00f2fe'),
        emissiveIntensity: 1.05,
        roughness: 0.25,
        metalness: 0.1,
        wireframe,
      }),
    }),
    [wireframe]
  );

  const rgbMatsRef = useRef(rgbMats);
  useEffect(() => {
    rgbMatsRef.current = rgbMats;
  }, [rgbMats]);

  const handleRegisterImpeller = React.useCallback((el) => {
    impellersSetRef.current.add(el);
    return () => {
      impellersSetRef.current.delete(el);
    };
  }, []);

  useFrame((state, delta) => {
    if (isPcOn) {
      const rpmSpeed =
        fanConfig?.rpmMode === 'silent'
          ? 8.5
          : fanConfig?.rpmMode === 'turbo'
          ? 32.0
          : 18.0;
      impellersSetRef.current.forEach((imp) => {
        imp.rotation.z -= delta * rpmSpeed;
      });
    }

    const mode = rgbConfig?.mode || 'static';
    const lightsActive = isPcOn && mode !== 'off';
    const elapsed = state.clock.getElapsedTime();
    const tempColor = tempColorRef.current;

    const resolveGroupColor = (groupKey, phaseOffset = 0) => {
      if (!lightsActive) {
        return tempColor.set('#1e293b').clone();
      }
      if (mode === 'rainbow') {
        const hue = (elapsed * 0.22 + phaseOffset) % 1;
        return tempColor.setHSL(hue, 0.9, 0.52).clone();
      }
      const hex = rgbConfig?.syncAll
        ? rgbConfig?.globalColor || '#00f2fe'
        : rgbConfig?.groups?.[groupKey] || rgbConfig?.globalColor || '#00f2fe';
      return tempColor.set(hex).clone();
    };

    const pulseFactor = !lightsActive
      ? 0
      : mode === 'breathing'
      ? 0.25 + ((Math.sin(elapsed * 2.8) + 1) * 0.5) * 0.95
      : 1.05;

    const cFans = resolveGroupColor('fans', 0.0);
    const cRam = resolveGroupColor('ram', 0.25);
    const cGpu = resolveGroupColor('gpu', 0.5);
    const cCooler = resolveGroupColor('cooler', 0.75);

    const mats = rgbMatsRef.current;
    if (mats) {
      mats.fans.color.copy(cFans);
      mats.fans.emissive.copy(cFans);
      mats.fans.emissiveIntensity = pulseFactor;

      mats.ram.color.copy(cRam);
      mats.ram.emissive.copy(cRam);
      mats.ram.emissiveIntensity = pulseFactor;

      mats.gpu.color.copy(cGpu);
      mats.gpu.emissive.copy(cGpu);
      mats.gpu.emissiveIntensity = pulseFactor;

      mats.cooler.color.copy(cCooler);
      mats.cooler.emissive.copy(cCooler);
      mats.cooler.emissiveIntensity = pulseFactor;
    }
  });

  const caseSnaps = SNAP_POINTS.case;
  const moboSnaps = SNAP_POINTS.motherboard;

  const resolveCaseSocket = (name, fallbackSnap) =>
    detectedCaseSockets[name] || fallbackSnap;
  const resolveMoboSocket = (name, fallbackSnap) =>
    detectedMoboSockets[name] || fallbackSnap;

  const expPos = (base, offset, partSize) => {
    const raw = explodedView
      ? [base[0] + offset[0], base[1] + offset[1], base[2] + offset[2]]
      : base;
    if (explodedView) return raw;
    return clampToContainer(raw, partSize, CHASSIS_INTERNAL_BOUNDS);
  };

  const expPsuPos = (base, offset, psuSize) => {
    const raw = explodedView
      ? [base[0] + offset[0], base[1] + offset[1], base[2] + offset[2]]
      : base;
    if (explodedView) return raw;
    return clampPsuToRearChamber(raw, psuSize);
  };

  const moboSocket = resolveCaseSocket(
    'socket_motherboard',
    caseSnaps.mount_motherboard
  );
  const psuSocket = resolveCaseSocket('slot_psu', caseSnaps.mount_psu);
  const cpuSocket = resolveMoboSocket('socket_cpu', moboSnaps.socket_cpu);
  const coolerSocket = resolveMoboSocket('mount_cooler', moboSnaps.mount_cooler);
  const gpuSocket = resolveMoboSocket('slot_pcie_x16', moboSnaps.slot_pcie_x16);
  const ramSocket = resolveMoboSocket('slot_ram_1', moboSnaps.slot_ram_1);
  const m2Socket = resolveMoboSocket('slot_m2_1', moboSnaps.slot_m2_1);

  return (
    <group position={[0, 2.22, 0]} name="BuildCoresSocketHierarchy">
      {showAirflow && <AirflowStreamlines />}

      {build.case && (
        <group
          name="root_chassis"
          position={caseSnaps.root_chassis.position}
          rotation={caseSnaps.root_chassis.rotation}
        >
          <ModelLoader
            category="case"
            part={build.case}
            customOverrideUrl={customGlbOverrides.case}
            wireframe={wireframe}
            onSocketsDetected={setDetectedCaseSockets}
            fallback={
              <HyteY70PanoramicCase
                casePart={build.case}
                showGlass={showGlass}
                fanConfig={fanConfig}
                wireframe={wireframe}
                herringboneAlpha={herringboneAlpha}
                rgbFanMat={rgbMats.fans}
                onRegisterImpeller={handleRegisterImpeller}
              />
            }
          />

          {showCables && (
            <SleevedPowerCables
              hasMobo={Boolean(build.motherboard)}
              hasGpu={Boolean(build.gpu)}
              isWhiteCase={isWhiteCaseBuild}
            />
          )}

          {build.psu && (
            <group
              name="mount_psu"
              position={expPsuPos(
                psuSocket.position,
                [-0.55, 0, -0.45],
                [1.14, 1.3, 0.72]
              )}
              rotation={[0, 0, 0]}
            >
              <ModelLoader
                category="psu"
                part={build.psu}
                customOverrideUrl={customGlbOverrides.psu}
                wireframe={wireframe}
                fallback={
                  <ParametricDualChamberPsu
                    psuPart={build.psu}
                    wireframe={wireframe}
                    honeycombAlpha={honeycombAlpha}
                  />
                }
              />
            </group>
          )}

          {build.motherboard && (
            <group
              name="mount_motherboard"
              position={expPos(
                moboSocket.position,
                [-0.25, 0.06, -0.2],
                [2.36, 2.96, 0.08]
              )}
              rotation={moboSocket.rotation}
            >
              <ModelLoader
                category="motherboard"
                part={build.motherboard}
                customOverrideUrl={customGlbOverrides.motherboard}
                wireframe={wireframe}
                onSocketsDetected={setDetectedMoboSockets}
                fallback={
                  <ParametricMotherboard
                    moboPart={build.motherboard}
                    hasCpu={Boolean(build.cpu)}
                    wireframe={wireframe}
                  />
                }
              />

              {build.cpu && (
                <group
                  name="socket_cpu"
                  position={expPos(
                    cpuSocket.position,
                    [0, 0.1, 0.35],
                    [0.5, 0.5, 0.06]
                  )}
                  rotation={cpuSocket.rotation}
                >
                  <ModelLoader
                    category="cpu"
                    part={build.cpu}
                    customOverrideUrl={customGlbOverrides.cpu}
                    wireframe={wireframe}
                    fallback={
                      <ParametricCpu cpuPart={build.cpu} wireframe={wireframe} />
                    }
                  />
                </group>
              )}

              {build.cooler && (
                <group
                  name="mount_cooler"
                  position={expPos(
                    coolerSocket.position,
                    [0, 0.35, 0.72],
                    [0.75, 0.75, 0.5]
                  )}
                  rotation={coolerSocket.rotation}
                >
                  <ModelLoader
                    category="cooler"
                    part={build.cooler}
                    customOverrideUrl={customGlbOverrides.cooler}
                    wireframe={wireframe}
                    fallback={
                      <ParametricCooler
                        coolerPart={build.cooler}
                        wireframe={wireframe}
                        showDisplays={showDisplays && isPcOn}
                        showTopFans={fanConfig?.top !== false}
                        showCables={showCables}
                        rgbCoolerMat={rgbMats.cooler}
                        rgbFanMat={rgbMats.fans}
                        lcdTex={lcdTex}
                        onRegisterImpeller={handleRegisterImpeller}
                      />
                    }
                  />
                </group>
              )}

              {build.gpu && (
                <group
                  name="slot_pcie_x16"
                  position={expPos(
                    gpuSocket.position,
                    [0.35, -0.15, 0.95],
                    [2.48, 0.52, 1.08]
                  )}
                  rotation={gpuSocket.rotation}
                >
                  <ModelLoader
                    category="gpu"
                    part={build.gpu}
                    customOverrideUrl={customGlbOverrides.gpu}
                    wireframe={wireframe}
                    fallback={
                      <ParametricGpu
                        gpuPart={build.gpu}
                        isWhiteCase={isWhiteCaseBuild}
                        wireframe={wireframe}
                        rgbGpuMat={rgbMats.gpu}
                        onRegisterImpeller={handleRegisterImpeller}
                      />
                    }
                  />
                </group>
              )}

              {build.ram && (
                <group
                  name="slot_ram_1"
                  position={expPos(
                    ramSocket.position,
                    [0.28, 0.12, 0.55],
                    [0.45, 1.28, 0.35]
                  )}
                  rotation={ramSocket.rotation}
                >
                  <ModelLoader
                    category="ram"
                    part={build.ram}
                    customOverrideUrl={customGlbOverrides.ram}
                    wireframe={wireframe}
                    fallback={
                      <ParametricRam
                        ramPart={build.ram}
                        wireframe={wireframe}
                        rgbRamMat={rgbMats.ram}
                      />
                    }
                  />
                </group>
              )}

              {build.storage && (
                <group
                  name="slot_m2_1"
                  position={expPos(
                    m2Socket.position,
                    [0, -0.05, 0.42],
                    [0.8, 0.22, 0.06]
                  )}
                  rotation={m2Socket.rotation}
                >
                  <ModelLoader
                    category="storage"
                    part={build.storage}
                    customOverrideUrl={customGlbOverrides.storage}
                    wireframe={wireframe}
                    fallback={
                      <mesh castShadow>
                        <boxGeometry args={[0.8, 0.22, 0.028]} />
                        <meshStandardMaterial
                          color="#0b0d12"
                          metalness={0.4}
                          roughness={0.35}
                          wireframe={wireframe}
                        />
                      </mesh>
                    }
                  />
                </group>
              )}
            </group>
          )}
        </group>
      )}
    </group>
  );
}
