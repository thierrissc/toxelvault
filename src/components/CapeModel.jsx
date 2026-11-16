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

function RubberGrommet({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  width = 0.26,
  height = 0.62,
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
        <boxGeometry args={[width, height, 0.032]} />
        <meshStandardMaterial
          color={outerColor}
          roughness={0.78}
          metalness={0.1}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>
      <mesh position={[0, 0, 0.004]}>
        <boxGeometry args={[width * 0.72, height * 0.84, 0.03]} />
        <meshStandardMaterial
          color={innerColor}
          roughness={0.85}
          metalness={0.06}
          wireframe={wireframe}
        />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[0.022, height * 0.78, 0.032]} />
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
  scale = 1,
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

  const frameColor = isWhite ? '#d8dce3' : '#151820';
  const bladeColor = isWhite ? '#cfd4dc' : '#252d3d';
  const edgeColor = isWhite ? '#9ca3af' : '#2a2e37';

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.16, 0.08, 0.22]} />
        <meshStandardMaterial
          color={frameColor}
          roughness={0.45}
          metalness={0.15}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>
      <mesh position={[0, -0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.16, 0.08, 0.22]} />
        <meshStandardMaterial
          color={frameColor}
          roughness={0.45}
          metalness={0.15}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>
      <mesh position={[-0.55, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 1.02, 0.22]} />
        <meshStandardMaterial
          color={frameColor}
          roughness={0.45}
          metalness={0.15}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>
      <mesh position={[0.55, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 1.02, 0.22]} />
        <meshStandardMaterial
          color={frameColor}
          roughness={0.45}
          metalness={0.15}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.21, 32, 1, true]} />
        <meshStandardMaterial
          color={frameColor}
          roughness={0.45}
          metalness={0.18}
          side={THREE.DoubleSide}
          wireframe={wireframe}
        />
      </mesh>

      <mesh position={[0, 0, 0.108]} material={rgbMat}>
        <torusGeometry args={[0.51, 0.016, 12, 36]} />
      </mesh>
      <mesh position={[0, 0, -0.108]} material={rgbMat}>
        <torusGeometry args={[0.51, 0.014, 12, 36]} />
      </mesh>

      <group ref={impellerRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.15, 24]} />
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
              position={[0.03, 0.3, 0]}
              rotation={[0.42, 0.22, -0.26]}
              castShadow
            >
              <boxGeometry args={[0.12, 0.33, 0.015]} />
              <meshStandardMaterial
                color={bladeColor}
                roughness={0.4}
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
  const upperName = String(casePart?.name || '').toUpperCase();
  const isWhiteCase =
    String(casePart?.chassisColor || '').toLowerCase() === '#d8dce3' ||
    String(casePart?.chassisColor || '').toLowerCase() === '#f3f4f6' ||
    String(casePart?.chassisColor || '').toLowerCase() === '#cbd5e1' ||
    upperName.includes('WHITE') ||
    upperName.includes('SNOW') ||
    upperName.includes('SILVER');

  const chassisHex = isWhiteCase ? '#d8dce3' : casePart?.chassisColor || '#121316';
  const interiorHex = isWhiteCase ? '#cfd4dc' : '#14171e';
  const accentTrimHex = isWhiteCase ? '#c3c9d4' : '#1b1f29';
  const shadowCavernHex = isWhiteCase ? '#334155' : '#050608';
  const silkscreenHex = isWhiteCase ? '#cfd4dc' : '#090b0f';
  const edgeColor = isWhiteCase ? '#9ca3af' : '#2a2e37';

  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#e2e8f0'),
        transmission: 0.96,
        roughness: 0.04,
        metalness: 0.0,
        ior: 1.5,
        thickness: 0.06,
        transparent: true,
        opacity: 1.0,
        reflectivity: 0.85,
        depthWrite: false,
        wireframe,
      }),
    [wireframe]
  );

  return (
    <group name="HyteY70DualChamberRoot">
      <mesh position={[-0.35, -2.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.3, 0.08, 2.8]} />
        <meshStandardMaterial
          color={chassisHex}
          roughness={0.45}
          metalness={0.15}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>
      <mesh
        position={[1.55, -2.06, -0.35]}
        rotation={[0, Math.PI / 4, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1.05, 0.08, 2.1]} />
        <meshStandardMaterial
          color={chassisHex}
          roughness={0.45}
          metalness={0.15}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>

      <mesh position={[-0.35, 2.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.3, 0.08, 2.8]} />
        <meshStandardMaterial
          color={chassisHex}
          roughness={0.45}
          metalness={0.15}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>
      <mesh
        position={[1.55, 2.06, -0.35]}
        rotation={[0, Math.PI / 4, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1.05, 0.08, 2.1]} />
        <meshStandardMaterial
          color={chassisHex}
          roughness={0.45}
          metalness={0.15}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>

      <mesh position={[0, 0, -1.37]} castShadow receiveShadow>
        <boxGeometry args={[4.0, 4.04, 0.06]} />
        <meshStandardMaterial
          color={chassisHex}
          roughness={0.45}
          metalness={0.15}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>

      <mesh position={[-1.96, 0, -0.82]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 4.04, 1.16]} />
        <meshStandardMaterial
          color={chassisHex}
          roughness={0.45}
          metalness={0.15}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>

      <mesh position={[-1.97, 0.72, 0.48]}>
        <boxGeometry args={[0.04, 1.62, 1.12]} />
        <meshBasicMaterial color={shadowCavernHex} />
      </mesh>
      <mesh
        position={[-1.93, 0.72, 0.48]}
        rotation={[0, Math.PI / 2, 0]}
        castShadow
        receiveShadow
      >
        <planeGeometry args={[1.18, 1.68]} />
        <meshStandardMaterial
          color={chassisHex}
          roughness={0.45}
          metalness={0.15}
          alphaMap={herringboneAlpha}
          transparent
          alphaTest={0.45}
          side={THREE.DoubleSide}
          wireframe={wireframe}
        />
      </mesh>

      <group position={[-1.94, -0.82, 0.48]}>
        {[0, 1, 2, 3, 4, 5, 6].map((slotIdx) => (
          <mesh
            key={`pcie-cover-${slotIdx}`}
            position={[0, 0.42 - slotIdx * 0.14, -0.22]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.05, 0.095, 0.62]} />
            <meshStandardMaterial
              color={isWhiteCase ? '#94a3b8' : '#272e3d'}
              roughness={0.4}
              metalness={0.45}
              wireframe={wireframe}
            />
            <Edges threshold={15} color={edgeColor} />
          </mesh>
        ))}

        {[0, 1, 2].map((vSlot) => (
          <mesh
            key={`vert-pcie-${vSlot}`}
            position={[0, -0.05, 0.25 + vSlot * 0.11]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.05, 0.92, 0.075]} />
            <meshStandardMaterial
              color={isWhiteCase ? '#64748b' : '#1e2430'}
              roughness={0.42}
              metalness={0.45}
              wireframe={wireframe}
            />
            <Edges threshold={15} color={edgeColor} />
          </mesh>
        ))}
      </group>

      <mesh position={[-0.45, 0.08, -0.34]} castShadow receiveShadow>
        <boxGeometry args={[2.56, 3.62, 0.05]} />
        <meshStandardMaterial
          color={interiorHex}
          roughness={0.45}
          metalness={0.15}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>

      <mesh position={[-0.62, 0.18, -0.31]}>
        <boxGeometry args={[1.05, 1.15, 0.055]} />
        <meshStandardMaterial
          color={isWhiteCase ? '#b8c0cc' : '#0b0d12'}
          roughness={0.5}
          metalness={0.15}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>

      <mesh
        position={[0.72, 0.08, -0.24]}
        rotation={[0, -0.42, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.38, 3.62, 0.05]} />
        <meshStandardMaterial
          color={accentTrimHex}
          roughness={0.45}
          metalness={0.15}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>

      <RubberGrommet
        position={[-0.78, 1.65, -0.31]}
        rotation={[0, 0, Math.PI / 2]}
        width={0.22}
        height={0.62}
        isWhiteCase={isWhiteCase}
        wireframe={wireframe}
      />
      <RubberGrommet
        position={[-0.08, 1.65, -0.31]}
        rotation={[0, 0, Math.PI / 2]}
        width={0.22}
        height={0.62}
        isWhiteCase={isWhiteCase}
        wireframe={wireframe}
      />
      <RubberGrommet
        position={[0.72, 0.72, -0.21]}
        rotation={[0, -0.42, 0]}
        width={0.22}
        height={0.74}
        isWhiteCase={isWhiteCase}
        wireframe={wireframe}
      />
      <RubberGrommet
        position={[0.72, -0.28, -0.21]}
        rotation={[0, -0.42, 0]}
        width={0.22}
        height={0.74}
        isWhiteCase={isWhiteCase}
        wireframe={wireframe}
      />

      <mesh position={[1.38, 0.08, -0.38]}>
        <boxGeometry args={[1.08, 3.45, 0.06]} />
        <meshBasicMaterial color={shadowCavernHex} />
      </mesh>
      <mesh position={[1.38, 0.08, -0.33]} castShadow receiveShadow>
        <planeGeometry args={[1.12, 3.48]} />
        <meshStandardMaterial
          color={chassisHex}
          roughness={0.45}
          metalness={0.15}
          alphaMap={herringboneAlpha}
          transparent
          alphaTest={0.45}
          side={THREE.DoubleSide}
          wireframe={wireframe}
        />
      </mesh>

      <mesh position={[-0.08, -1.78, 0.35]} castShadow receiveShadow>
        <boxGeometry args={[3.56, 0.16, 1.98]} />
        <meshStandardMaterial
          color={interiorHex}
          roughness={0.45}
          metalness={0.15}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>
      <mesh
        position={[-0.08, -1.69, 0.38]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[3.32, 1.65]} />
        <meshStandardMaterial
          color={chassisHex}
          roughness={0.45}
          metalness={0.15}
          alphaMap={herringboneAlpha}
          transparent
          alphaTest={0.45}
          side={THREE.DoubleSide}
          wireframe={wireframe}
        />
      </mesh>

      <group position={[-0.95, -1.64, 0.58]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.08, 0.09, 0.14]} />
          <meshStandardMaterial
            color="#111318"
            roughness={0.4}
            metalness={0.5}
            wireframe={wireframe}
          />
          <Edges threshold={15} color="#2a2e37" />
        </mesh>
        <mesh position={[0, 0.048, 0]}>
          <boxGeometry args={[0.98, 0.02, 0.04]} />
          <meshStandardMaterial
            color="#94a3b8"
            metalness={0.85}
            roughness={0.22}
            wireframe={wireframe}
          />
        </mesh>
      </group>

      <group
        position={[1.54, -1.92, 0.94]}
        rotation={[0, Math.PI / 4, 0]}
        name="FrontChamferIoPanel"
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.06, 0.24, 0.12]} />
          <meshStandardMaterial
            color={chassisHex}
            roughness={0.45}
            metalness={0.15}
            wireframe={wireframe}
          />
          <Edges threshold={15} color={edgeColor} />
        </mesh>
        <mesh position={[0.02, 0, 0.065]}>
          <boxGeometry args={[0.14, 0.09, 0.02]} />
          <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.6} />
        </mesh>
        <mesh position={[-0.18, 0, 0.065]}>
          <boxGeometry args={[0.08, 0.045, 0.02]} />
          <meshStandardMaterial color="#090b0f" roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[0.22, 0, 0.065]}>
          <boxGeometry args={[0.08, 0.045, 0.02]} />
          <meshStandardMaterial color="#090b0f" roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[-0.32, 0, 0.065]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.02, 16]} />
          <meshStandardMaterial color="#090b0f" roughness={0.4} metalness={0.7} />
        </mesh>
      </group>

      {[
        [-1.65, -1.1],
        [1.45, -1.1],
        [-1.65, 1.1],
        [1.15, 1.1],
      ].map(([fx, fz], idx) => (
        <mesh
          key={`foot-${idx}`}
          position={[fx, -2.15, fz]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.18, 0.2, 0.12, 24]} />
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
          [1.06, 0.0, -1.06].map((yPos, idx) => (
            <CaseFan120
              key={`side-fan-${idx}`}
              position={[1.36, yPos, -0.22]}
              scale={0.86}
              isWhite={isWhiteCase}
              wireframe={wireframe}
              rgbMat={rgbFanMat}
              onRegisterImpeller={onRegisterImpeller}
            />
          ))}

        {fanConfig?.rear !== false && (
          <CaseFan120
            position={[-1.8, 0.74, 0.48]}
            rotation={[0, Math.PI / 2, 0]}
            scale={0.84}
            isWhite={isWhiteCase}
            wireframe={wireframe}
            rgbMat={rgbFanMat}
            onRegisterImpeller={onRegisterImpeller}
          />
        )}

        {fanConfig?.bottom !== false &&
          [-0.96, 0.0, 0.96].map((xPos, idx) => (
            <CaseFan120
              key={`bottom-fan-${idx}`}
              position={[xPos, -1.58, 0.36]}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={0.78}
              isWhite={isWhiteCase}
              wireframe={wireframe}
              rgbMat={rgbFanMat}
              onRegisterImpeller={onRegisterImpeller}
            />
          ))}
      </group>

      {showGlass && (
        <group name="Panoramic3PieceGlass">
          <mesh position={[-0.38, 0, 1.38]} material={glassMaterial}>
            <boxGeometry args={[3.18, 3.96, 0.025]} />
            <Edges threshold={15} color={edgeColor} />
          </mesh>
          <mesh position={[-0.38, 1.98, 1.38]}>
            <boxGeometry args={[3.2, 0.09, 0.032]} />
            <meshStandardMaterial
              color={silkscreenHex}
              roughness={0.5}
              metalness={0.15}
            />
          </mesh>
          <mesh position={[-0.38, -1.98, 1.38]}>
            <boxGeometry args={[3.2, 0.09, 0.032]} />
            <meshStandardMaterial
              color={silkscreenHex}
              roughness={0.5}
              metalness={0.15}
            />
          </mesh>

          <mesh
            position={[1.56, 0, 0.96]}
            rotation={[0, Math.PI / 4, 0]}
            material={glassMaterial}
          >
            <boxGeometry args={[1.06, 3.96, 0.025]} />
            <Edges threshold={15} color={edgeColor} />
          </mesh>

          <mesh
            position={[1.96, 0, -0.22]}
            rotation={[0, Math.PI / 2, 0]}
            material={glassMaterial}
          >
            <boxGeometry args={[1.92, 3.96, 0.025]} />
            <Edges threshold={15} color={edgeColor} />
          </mesh>
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
  const heatsinkHex = isStrixWhite ? '#d8dce3' : moboPart?.vrmColor || '#1c2029';
  const dimmColor = isStrixWhite ? '#1e293b' : '#14171f';
  const edgeColor = isStrixWhite ? '#9ca3af' : '#2a2e37';

  const rogEyeMat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      map: surfaceBundle?.vrmTex || null,
      emissiveMap: surfaceBundle?.vrmEmissiveTex || null,
      emissive: new THREE.Color(isStrixWhite ? '#f59e0b' : '#38bdf8'),
      emissiveIntensity: 1.25,
      roughness: 0.42,
      metalness: 0.25,
      wireframe,
    });
    return m;
  }, [surfaceBundle, isStrixWhite, wireframe]);

  return (
    <group name="ParametricMotherboardNode">
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.44, 3.05, 0.06]} />
        <meshStandardMaterial
          map={surfaceBundle?.pcbTex || null}
          color={isStrixWhite ? '#1e222d' : '#11141c'}
          roughness={0.58}
          metalness={0.22}
          wireframe={wireframe}
        />
        <Edges threshold={15} color="#2a2e37" />
      </mesh>

      <mesh
        position={[-0.92, 0.56, 0.14]}
        material={rogEyeMat}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.52, 1.65, 0.22]} />
        <Edges threshold={15} color={edgeColor} />
      </mesh>

      <mesh position={[-0.14, 1.32, 0.12]} castShadow receiveShadow>
        <boxGeometry args={[0.96, 0.34, 0.18]} />
        <meshStandardMaterial
          color={heatsinkHex}
          roughness={0.45}
          metalness={0.22}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>

      <group position={[-0.18, 0.68, 0.04]} name="CpuSocketAssembly">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.66, 0.72, 0.04]} />
          <meshStandardMaterial
            color="#94a3b8"
            metalness={0.78}
            roughness={0.28}
            wireframe={wireframe}
          />
          <Edges threshold={15} color="#475569" />
        </mesh>

        <mesh position={[0, 0, 0.028]}>
          <boxGeometry args={[0.48, 0.54, 0.025]} />
          <meshStandardMaterial
            color={hasCpu ? '#94a3b8' : '#1e293b'}
            metalness={hasCpu ? 0.8 : 0.35}
            roughness={0.28}
            wireframe={wireframe}
          />
        </mesh>

        <mesh position={[0, 0.33, 0.048]} castShadow>
          <boxGeometry args={[0.62, 0.06, 0.024]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.82} roughness={0.22} />
        </mesh>
        <mesh position={[0, -0.33, 0.048]} castShadow>
          <boxGeometry args={[0.62, 0.06, 0.024]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.82} roughness={0.22} />
        </mesh>
        <mesh position={[-0.29, 0, 0.048]} castShadow>
          <boxGeometry args={[0.05, 0.66, 0.024]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.82} roughness={0.22} />
        </mesh>
        <mesh position={[0.29, 0, 0.048]} castShadow>
          <boxGeometry args={[0.05, 0.66, 0.024]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.82} roughness={0.22} />
        </mesh>

        <mesh position={[0.36, 0.02, 0.035]}>
          <cylinderGeometry args={[0.012, 0.012, 0.68, 12]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.2} />
        </mesh>
      </group>

      {[0.42, 0.55, 0.68, 0.81].map((xPos, idx) => (
        <group key={`dimm-slot-${idx}`} position={[xPos, 0.68, 0.05]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.055, 1.36, 0.06]} />
            <meshStandardMaterial
              color={dimmColor}
              roughness={0.45}
              metalness={0.25}
              wireframe={wireframe}
            />
          </mesh>
          <mesh position={[0, 0.7, 0.02]}>
            <boxGeometry args={[0.065, 0.06, 0.08]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.4} />
          </mesh>
          <mesh position={[0, -0.7, 0.02]}>
            <boxGeometry args={[0.065, 0.06, 0.08]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.4} />
          </mesh>
        </group>
      ))}

      <mesh position={[-0.16, -0.02, 0.08]} castShadow receiveShadow>
        <boxGeometry args={[1.05, 0.3, 0.1]} />
        <meshStandardMaterial
          color={heatsinkHex}
          roughness={0.45}
          metalness={0.22}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>

      <mesh position={[0.08, -0.68, 0.085]} castShadow receiveShadow>
        <boxGeometry args={[1.68, 0.82, 0.1]} />
        <meshStandardMaterial
          map={surfaceBundle?.m2Tex || null}
          color={isStrixWhite ? '#d8dce3' : '#1e2430'}
          roughness={0.45}
          metalness={0.22}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>

      {[-0.28, -1.16].map((ySlot, sIdx) => (
        <group key={`pcie-x16-${sIdx}`} position={[-0.12, ySlot, 0.055]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.18, 0.09, 0.07]} />
            <meshStandardMaterial
              color="#cbd5e1"
              metalness={0.82}
              roughness={0.24}
              wireframe={wireframe}
            />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[1.12, 0.035, 0.05]} />
            <meshStandardMaterial color="#090b0f" roughness={0.6} />
          </mesh>
        </group>
      ))}

      <mesh position={[1.08, 0.52, 0.065]} castShadow>
        <boxGeometry args={[0.12, 0.62, 0.09]} />
        <meshStandardMaterial color="#0f172a" roughness={0.45} metalness={0.3} />
      </mesh>

      <mesh position={[-0.72, 1.38, 0.065]} castShadow>
        <boxGeometry args={[0.28, 0.12, 0.09]} />
        <meshStandardMaterial color="#0f172a" roughness={0.45} metalness={0.3} />
      </mesh>

      <mesh
        position={[0.66, -1.28, 0.045]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.11, 0.11, 0.03, 24]} />
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
        <boxGeometry args={[0.52, isIntel ? 0.58 : 0.52, 0.032]} />
        <meshStandardMaterial
          color="#115e59"
          roughness={0.42}
          metalness={0.35}
          wireframe={wireframe}
        />
      </mesh>
      <mesh position={[0, 0, 0.032]} castShadow receiveShadow>
        <boxGeometry args={[0.42, isIntel ? 0.48 : 0.42, 0.038]} />
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
  const shroudHex = isWhiteGpu ? '#d8dce3' : gpuPart?.shroudColor || '#151820';
  const edgeColor = isWhiteGpu ? '#9ca3af' : '#2a2e37';
  const L = 2.76;
  const T = 0.54;
  const W = 1.16;
  const finCount = 34;

  return (
    <group name="ParametricGpuNode">
      <mesh position={[0, T / 2 - 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[L, 0.04, W]} />
        <meshStandardMaterial
          color={shroudHex}
          metalness={0.55}
          roughness={0.42}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>

      <group name="GpuAluminumFinArray">
        {Array.from({ length: finCount }).map((_, idx) => {
          const xPos = -L / 2 + 0.1 + (idx / (finCount - 1)) * (L - 0.2);
          return (
            <mesh key={`fin-${idx}`} position={[xPos, 0.02, 0]}>
              <boxGeometry args={[0.022, T * 0.54, W - 0.1]} />
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

      {[-0.34, -0.17, 0, 0.17, 0.34].map((zPipe, idx) => (
        <mesh
          key={`hp-${idx}`}
          position={[0, 0.02, zPipe]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.022, 0.022, L - 0.08, 14]} />
          <meshStandardMaterial color="#b45309" metalness={0.88} roughness={0.24} />
        </mesh>
      ))}

      <mesh position={[0, -T / 2 + 0.075, 0]} castShadow receiveShadow>
        <boxGeometry args={[L, 0.15, W]} />
        <meshStandardMaterial
          color={shroudHex}
          metalness={0.48}
          roughness={0.42}
          wireframe={wireframe}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>

      <mesh position={[0, 0.05, W / 2 + 0.008]} material={rgbGpuMat}>
        <boxGeometry args={[L - 0.24, 0.026, 0.016]} />
      </mesh>

      {[-0.86, 0, 0.86].map((fx, fIdx) => {
        const refObj = fIdx === 0 ? imp0 : fIdx === 1 ? imp1 : imp2;
        return (
          <group
            key={`gfan-${fIdx}`}
            position={[fx, -T / 2 + 0.02, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <group ref={refObj}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.12, 0.12, 0.05, 20]} />
                <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.25} />
              </mesh>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((b) => (
                <group key={b} rotation={[0, 0, (b / 9) * Math.PI * 2]}>
                  <mesh
                    position={[0.02, 0.19, 0]}
                    rotation={[0.35, 0.2, -0.25]}
                  >
                    <boxGeometry args={[0.085, 0.22, 0.012]} />
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

  return (
    <group name="ParametricRamModules">
      {sticks.map((xOff, idx) => (
        <group key={`dimm-stick-${idx}`} position={[xOff, 0, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.06, 1.32, 0.32]} />
            <meshStandardMaterial
              color={hsColor}
              metalness={0.65}
              roughness={0.32}
              wireframe={wireframe}
            />
            <Edges threshold={15} color="#2a2e37" />
          </mesh>
          <mesh position={[0, 0, 0.18]} material={rgbRamMat}>
            <boxGeometry args={[0.052, 1.3, 0.05]} />
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

  const tube1Geo = useMemo(() => {
    const c1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.22, -0.04, 0.22),
      new THREE.Vector3(0.54, 0.18, 0.42),
      new THREE.Vector3(0.72, 0.56, 0.38),
      new THREE.Vector3(0.82, 0.88, 0.24),
    ]);
    return new THREE.TubeGeometry(c1, 24, 0.034, 12, false);
  }, []);

  const tube2Geo = useMemo(() => {
    const c2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.22, 0.08, 0.22),
      new THREE.Vector3(0.48, 0.32, 0.36),
      new THREE.Vector3(0.64, 0.62, 0.32),
      new THREE.Vector3(0.7, 0.88, 0.18),
    ]);
    return new THREE.TubeGeometry(c2, 24, 0.034, 12, false);
  }, []);

  if (isAir) {
    return (
      <group name="ParametricAirCooler">
        <mesh position={[-0.28, 0, 0.42]} castShadow receiveShadow>
          <boxGeometry args={[0.44, 1.14, 0.82]} />
          <meshStandardMaterial
            color="#181b22"
            metalness={0.75}
            roughness={0.32}
            wireframe={wireframe}
          />
          <Edges threshold={15} color="#2a2e37" />
        </mesh>
        <mesh position={[0.28, 0, 0.42]} castShadow receiveShadow>
          <boxGeometry args={[0.44, 1.14, 0.82]} />
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
            position={[0, 0, 0.42]}
            rotation={[0, Math.PI / 2, 0]}
            scale={0.88}
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
        position={[0, 0, 0.2]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.36, 0.38, 0.4, 32]} />
        <meshStandardMaterial
          color={radColor}
          metalness={0.65}
          roughness={0.35}
          wireframe={wireframe}
        />
      </mesh>
      <mesh position={[0, 0, 0.405]} material={rgbCoolerMat}>
        <torusGeometry args={[0.34, 0.018, 16, 36]} />
      </mesh>
      {showDisplays && (
        <mesh position={[0, 0, 0.412]} rotation={[0, 0, 0]}>
          <circleGeometry args={[0.31, 48]} />
          <meshStandardMaterial
            map={lcdTex}
            emissiveMap={lcdTex}
            emissive="#ffffff"
            emissiveIntensity={0.95}
            roughness={0.2}
          />
        </mesh>
      )}

      <group position={[0.24, 1.02, 0.18]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.72, 0.22, 0.92]} />
          <meshStandardMaterial
            color={radColor}
            metalness={0.6}
            roughness={0.38}
            wireframe={wireframe}
          />
          <Edges threshold={15} color="#2a2e37" />
        </mesh>
        {showTopFans &&
          [-0.88, 0, 0.88].map((fx, idx) => (
            <CaseFan120
              key={`rad-fan-${idx}`}
              position={[fx, -0.2, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={0.74}
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

  return (
    <group name="VerticalDualChamberPsu">
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.48, 0.86, 1.38]} />
        <meshStandardMaterial
          color="#12151c"
          metalness={0.58}
          roughness={0.38}
          wireframe={wireframe}
        />
        <Edges threshold={15} color="#2a2e37" />
      </mesh>

      <mesh position={[0, 0, -0.695]}>
        <planeGeometry args={[1.38, 0.76]} />
        <meshStandardMaterial
          color="#090b0f"
          roughness={0.45}
          metalness={0.5}
          alphaMap={honeycombAlpha}
          transparent
          alphaTest={0.45}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[-0.42, 0.12, -0.7]}>
        <boxGeometry args={[0.24, 0.18, 0.03]} />
        <meshStandardMaterial color="#050608" roughness={0.4} metalness={0.6} />
      </mesh>
      {[-0.47, -0.42, -0.37].map((px, i) => (
        <mesh key={`prong-${i}`} position={[px, 0.12, -0.715]}>
          <boxGeometry args={[0.02, 0.05, 0.025]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      <mesh position={[-0.42, -0.14, -0.7]}>
        <boxGeometry args={[0.16, 0.12, 0.03]} />
        <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.3} />
      </mesh>

      {isRogThor && (
        <mesh position={[0, 0.435, 0]}>
          <boxGeometry args={[0.62, 0.02, 0.3]} />
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

function SleevedPowerCables({ hasMobo = true, hasGpu = true }) {
  const mobo24PinGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.66, 0.68, -0.16),
      new THREE.Vector3(0.84, 0.68, -0.12),
      new THREE.Vector3(0.76, 0.68, -0.28),
    ]);
    return new THREE.TubeGeometry(curve, 16, 0.048, 10, false);
  }, []);

  const gpu12VhpwrGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.42, -0.15, 0.98),
      new THREE.Vector3(0.68, -0.22, 0.62),
      new THREE.Vector3(0.74, -0.28, -0.22),
    ]);
    return new THREE.TubeGeometry(curve, 20, 0.036, 10, false);
  }, []);

  return (
    <group name="SleevedPowerCables">
      {hasMobo && (
        <mesh geometry={mobo24PinGeo} castShadow>
          <meshStandardMaterial color="#181b24" roughness={0.65} metalness={0.15} />
        </mesh>
      )}
      {hasGpu && (
        <mesh geometry={gpu12VhpwrGeo} castShadow>
          <meshStandardMaterial color="#181b24" roughness={0.65} metalness={0.15} />
        </mesh>
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
        base[0] + dir[0] * phase * 0.55,
        base[1] + dir[1] * phase * 0.55,
        base[2] + dir[2] * phase * 0.55
      );
    });
  });

  const streams = [
    {
      pos: [1.15, -0.65, -0.05],
      rot: [0, 0, 0.72],
      dir: [-0.8, 0.6, 0.2],
      color: '#38bdf8',
    },
    {
      pos: [1.15, 0.25, -0.05],
      rot: [0, 0, 0.72],
      dir: [-0.8, 0.6, 0.2],
      color: '#38bdf8',
    },
    {
      pos: [-0.75, -1.35, 0.35],
      rot: [0, 0, 0],
      dir: [0, 1.0, 0],
      color: '#38bdf8',
    },
    {
      pos: [0.15, -1.35, 0.35],
      rot: [0, 0, 0],
      dir: [0, 1.0, 0],
      color: '#38bdf8',
    },
    {
      pos: [-1.25, 0.68, 0.38],
      rot: [0, 0, 1.15],
      dir: [-0.9, 0.4, 0],
      color: '#ef4444',
    },
    {
      pos: [-0.45, 1.15, 0.2],
      rot: [0, 0, 0.1],
      dir: [-0.1, 0.95, 0],
      color: '#ef4444',
    },
    {
      pos: [0.25, 1.15, 0.2],
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
            <coneGeometry args={[0.085, 0.22, 16]} />
            <meshBasicMaterial color={s.color} transparent opacity={0.9} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.028, 0.028, 0.52, 12]} />
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

  const expPos = (base, offset) =>
    explodedView
      ? [base[0] + offset[0], base[1] + offset[1], base[2] + offset[2]]
      : base;

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
            />
          )}

          {build.psu && (
            <group
              name="mount_psu"
              position={expPos(psuSocket.position, [-0.55, 0, -0.45])}
              rotation={psuSocket.rotation}
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
              position={expPos(moboSocket.position, [-0.25, 0.06, -0.2])}
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
                  position={expPos(cpuSocket.position, [0, 0.1, 0.35])}
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
                  position={expPos(coolerSocket.position, [0, 0.35, 0.72])}
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
                  position={expPos(gpuSocket.position, [0.35, -0.15, 0.95])}
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
                  position={expPos(ramSocket.position, [0.28, 0.12, 0.55])}
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
                  position={expPos(m2Socket.position, [0, -0.05, 0.42])}
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
