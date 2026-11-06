import React, { useMemo, useRef, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import {
  SNAP_POINTS,
  DEFAULT_RGB_CONFIG,
  MODEL_MANIFEST,
  createHerringboneVentAlphaTexture,
  createHoneycombGrilleAlphaTexture,
  createMotherboardSurfaceTextures,
  createKrakenLcdTexture,
} from '../utils/textureGenerator';

const DRACO_DECODER_PATH =
  MODEL_MANIFEST.dracoDecoderPath ||
  'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

class GlbOverrideBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback || null;
    return this.props.children;
  }
}

function CustomGlbModel({ url, wireframe = false }) {
  const gltf = useGLTF(url, DRACO_DECODER_PATH);
  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((n) => {
      if (n.isMesh) {
        n.castShadow = true;
        n.receiveShadow = true;
        if (n.material) {
          n.material = n.material.clone();
          n.material.wireframe = wireframe;
        }
      }
    });
    return clone;
  }, [gltf.scene, wireframe]);

  return <primitive object={scene} />;
}

function RubberGrommet({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  width = 0.26,
  height = 0.62,
  isWhiteCase = false,
  wireframe = false,
}) {
  const outerColor = isWhiteCase ? '#d1d5db' : '#181b22';
  const slitColor = isWhiteCase ? '#4b5563' : '#060709';

  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.032]} />
        <meshStandardMaterial
          color={outerColor}
          roughness={0.82}
          metalness={0.08}
          wireframe={wireframe}
        />
      </mesh>
      <mesh position={[0, 0, 0.004]}>
        <boxGeometry args={[width * 0.72, height * 0.84, 0.03]} />
        <meshStandardMaterial
          color={isWhiteCase ? '#cbd5e1' : '#111318'}
          roughness={0.88}
          metalness={0.05}
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
  const bladeColor = isWhite ? '#f8fafc' : '#262f3f';

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.56, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.18, 0.08, 0.24]} />
        <meshStandardMaterial
          color={frameColor}
          roughness={0.42}
          metalness={0.35}
          wireframe={wireframe}
        />
      </mesh>
      <mesh position={[0, -0.56, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.18, 0.08, 0.24]} />
        <meshStandardMaterial
          color={frameColor}
          roughness={0.42}
          metalness={0.35}
          wireframe={wireframe}
        />
      </mesh>
      <mesh position={[-0.56, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 1.02, 0.24]} />
        <meshStandardMaterial
          color={frameColor}
          roughness={0.42}
          metalness={0.35}
          wireframe={wireframe}
        />
      </mesh>
      <mesh position={[0.56, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 1.02, 0.24]} />
        <meshStandardMaterial
          color={frameColor}
          roughness={0.42}
          metalness={0.35}
          wireframe={wireframe}
        />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.54, 0.54, 0.23, 32, 1, true]} />
        <meshStandardMaterial
          color={frameColor}
          roughness={0.38}
          metalness={0.4}
          side={THREE.DoubleSide}
          wireframe={wireframe}
        />
      </mesh>

      <mesh position={[0, 0, 0.115]} material={rgbMat}>
        <torusGeometry args={[0.53, 0.022, 14, 36]} />
      </mesh>
      <mesh position={[0, 0, -0.115]} material={rgbMat}>
        <torusGeometry args={[0.53, 0.018, 14, 36]} />
      </mesh>

      <group ref={impellerRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.17, 0.17, 0.16, 24]} />
          <meshStandardMaterial
            color="#cbd5e1"
            metalness={0.9}
            roughness={0.2}
            wireframe={wireframe}
          />
        </mesh>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
          <group key={idx} rotation={[0, 0, (idx / 9) * Math.PI * 2]}>
            <mesh
              position={[0.03, 0.31, 0]}
              rotation={[0.42, 0.22, -0.26]}
              castShadow
            >
              <boxGeometry args={[0.13, 0.35, 0.016]} />
              <meshStandardMaterial
                color={bladeColor}
                roughness={0.28}
                metalness={0.35}
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
  showCaseFans = false,
  wireframe = false,
  herringboneAlpha,
  rgbFanMat,
  onRegisterImpeller,
}) {
  const upperName = String(casePart?.name || '').toUpperCase();
  const isWhiteCase =
    String(casePart?.chassisColor || '').toLowerCase() === '#f3f4f6' ||
    String(casePart?.chassisColor || '').toLowerCase() === '#cbd5e1' ||
    upperName.includes('WHITE') ||
    upperName.includes('SNOW') ||
    upperName.includes('SILVER');

  const chassisHex = isWhiteCase ? '#f3f4f6' : casePart?.chassisColor || '#121316';
  const interiorHex = isWhiteCase ? '#e5e7eb' : '#14171e';
  const accentTrimHex = isWhiteCase ? '#d1d5db' : '#1b1f29';
  const shadowCavernHex = isWhiteCase ? '#1e293b' : '#050608';
  const silkscreenHex = isWhiteCase ? '#e2e8f0' : '#090b0f';

  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#ffffff'),
        transmission: 0.98,
        roughness: 0.02,
        metalness: 0.0,
        ior: 1.5,
        thickness: 0.08,
        transparent: true,
        opacity: 1.0,
        reflectivity: 0.92,
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
          roughness={0.42}
          metalness={0.35}
          wireframe={wireframe}
        />
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
          roughness={0.42}
          metalness={0.35}
          wireframe={wireframe}
        />
      </mesh>

      <mesh position={[-0.35, 2.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.3, 0.08, 2.8]} />
        <meshStandardMaterial
          color={chassisHex}
          roughness={0.42}
          metalness={0.35}
          wireframe={wireframe}
        />
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
          roughness={0.42}
          metalness={0.35}
          wireframe={wireframe}
        />
      </mesh>

      <mesh position={[0, 0, -1.37]} castShadow receiveShadow>
        <boxGeometry args={[4.0, 4.04, 0.06]} />
        <meshStandardMaterial
          color={chassisHex}
          roughness={0.45}
          metalness={0.38}
          wireframe={wireframe}
        />
      </mesh>

      <mesh position={[-1.96, 0, -0.82]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 4.04, 1.16]} />
        <meshStandardMaterial
          color={chassisHex}
          roughness={0.42}
          metalness={0.38}
          wireframe={wireframe}
        />
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
          roughness={0.38}
          metalness={0.4}
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
              roughness={0.35}
              metalness={0.72}
              wireframe={wireframe}
            />
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
              color={isWhiteCase ? '#475569' : '#1e2430'}
              roughness={0.38}
              metalness={0.68}
              wireframe={wireframe}
            />
          </mesh>
        ))}
      </group>

      <mesh position={[-0.45, 0.08, -0.34]} castShadow receiveShadow>
        <boxGeometry args={[2.56, 3.62, 0.05]} />
        <meshStandardMaterial
          color={interiorHex}
          roughness={0.48}
          metalness={0.32}
          wireframe={wireframe}
        />
      </mesh>

      <mesh position={[-0.62, 0.18, -0.31]}>
        <boxGeometry args={[1.05, 1.15, 0.055]} />
        <meshStandardMaterial
          color={isWhiteCase ? '#d1d5db' : '#0b0d12'}
          roughness={0.55}
          metalness={0.25}
          wireframe={wireframe}
        />
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
          roughness={0.46}
          metalness={0.34}
          wireframe={wireframe}
        />
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
          roughness={0.38}
          metalness={0.4}
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
          metalness={0.32}
          wireframe={wireframe}
        />
      </mesh>
      <mesh
        position={[-0.08, -1.69, 0.38]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[3.32, 1.65]} />
        <meshStandardMaterial
          color={chassisHex}
          roughness={0.38}
          metalness={0.38}
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
            roughness={0.35}
            metalness={0.6}
            wireframe={wireframe}
          />
        </mesh>
        <mesh position={[0, 0.048, 0]}>
          <boxGeometry args={[0.98, 0.02, 0.04]} />
          <meshStandardMaterial
            color="#cbd5e1"
            metalness={0.92}
            roughness={0.18}
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
            roughness={0.4}
            metalness={0.35}
            wireframe={wireframe}
          />
        </mesh>
        <mesh position={[0.02, 0, 0.065]}>
          <boxGeometry args={[0.14, 0.09, 0.02]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[-0.18, 0, 0.065]}>
          <boxGeometry args={[0.08, 0.045, 0.02]} />
          <meshStandardMaterial color="#090b0f" roughness={0.4} metalness={0.8} />
        </mesh>
        <mesh position={[0.22, 0, 0.065]}>
          <boxGeometry args={[0.08, 0.045, 0.02]} />
          <meshStandardMaterial color="#090b0f" roughness={0.4} metalness={0.8} />
        </mesh>
        <mesh position={[-0.32, 0, 0.065]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.02, 16]} />
          <meshStandardMaterial color="#090b0f" roughness={0.4} metalness={0.8} />
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
            metalness={0.75}
            roughness={0.28}
            wireframe={wireframe}
          />
        </mesh>
      ))}

      {showCaseFans && (
        <group name="CaseInstalledFansGroup">
          {[1.18, 0.0, -1.18].map((yPos, idx) => (
            <CaseFan120
              key={`side-fan-${idx}`}
              position={[1.38, yPos, -0.22]}
              isWhite={isWhiteCase}
              wireframe={wireframe}
              rgbMat={rgbFanMat}
              onRegisterImpeller={onRegisterImpeller}
            />
          ))}
          <CaseFan120
            position={[-1.82, 0.78, 0.48]}
            rotation={[0, Math.PI / 2, 0]}
            isWhite={isWhiteCase}
            wireframe={wireframe}
            rgbMat={rgbFanMat}
            onRegisterImpeller={onRegisterImpeller}
          />
        </group>
      )}

      {showGlass && (
        <group name="Panoramic3PieceGlass">
          <mesh position={[-0.38, 0, 1.38]} material={glassMaterial}>
            <boxGeometry args={[3.18, 3.96, 0.025]} />
          </mesh>
          <mesh position={[-0.38, 1.98, 1.38]}>
            <boxGeometry args={[3.2, 0.09, 0.032]} />
            <meshStandardMaterial color={silkscreenHex} roughness={0.6} />
          </mesh>
          <mesh position={[-0.38, -1.98, 1.38]}>
            <boxGeometry args={[3.2, 0.09, 0.032]} />
            <meshStandardMaterial color={silkscreenHex} roughness={0.6} />
          </mesh>

          <mesh
            position={[1.56, 0, 0.96]}
            rotation={[0, Math.PI / 4, 0]}
            material={glassMaterial}
          >
            <boxGeometry args={[1.06, 3.96, 0.025]} />
          </mesh>

          <mesh
            position={[1.96, 0, -0.22]}
            rotation={[0, Math.PI / 2, 0]}
            material={glassMaterial}
          >
            <boxGeometry args={[1.92, 3.96, 0.025]} />
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
  onRegisterRgbMat,
}) {
  const surfaceBundle = useMemo(
    () => createMotherboardSurfaceTextures(moboPart),
    [moboPart]
  );

  const isStrixWhite = Boolean(surfaceBundle?.isStrixWhite);
  const heatsinkHex = isStrixWhite ? '#e2e8f0' : moboPart?.vrmColor || '#1c2029';
  const dimmColor = isStrixWhite ? '#1e293b' : '#14171f';

  const rogEyeMat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      map: surfaceBundle?.vrmTex || null,
      emissiveMap: surfaceBundle?.vrmEmissiveTex || null,
      emissive: new THREE.Color(isStrixWhite ? '#facc15' : '#38bdf8'),
      emissiveIntensity: 2.2,
      roughness: 0.24,
      metalness: 0.78,
      wireframe,
    });
    return m;
  }, [surfaceBundle, isStrixWhite, wireframe]);

  useEffect(() => {
    if (!onRegisterRgbMat || isStrixWhite) return undefined;
    return onRegisterRgbMat(rogEyeMat, 'cooler');
  }, [rogEyeMat, isStrixWhite, onRegisterRgbMat]);

  return (
    <group name="ParametricMotherboardNode">
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.44, 3.05, 0.06]} />
        <meshStandardMaterial
          map={surfaceBundle?.pcbTex || null}
          color="#ffffff"
          roughness={0.44}
          metalness={0.25}
          wireframe={wireframe}
        />
      </mesh>

      <mesh
        position={[-0.88, 0.56, 0.16]}
        material={rogEyeMat}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.56, 1.68, 0.26]} />
      </mesh>

      <mesh position={[-0.08, 1.28, 0.14]} castShadow receiveShadow>
        <boxGeometry args={[1.18, 0.34, 0.22]} />
        <meshStandardMaterial
          color={heatsinkHex}
          roughness={0.24}
          metalness={0.86}
          wireframe={wireframe}
        />
      </mesh>

      <group position={[-0.18, 0.68, 0.05]} name="CpuSocketMechanism">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.64, 0.68, 0.04]} />
          <meshStandardMaterial
            color="#cbd5e1"
            metalness={0.94}
            roughness={0.18}
            wireframe={wireframe}
          />
        </mesh>
        <mesh position={[0, 0, 0.025]} castShadow>
          <boxGeometry args={[0.52, 0.56, 0.03]} />
          <meshStandardMaterial
            color={hasCpu ? '#64748b' : '#1e293b'}
            metalness={0.85}
            roughness={0.25}
            wireframe={wireframe}
          />
        </mesh>
        <mesh position={[0.35, 0, 0.02]} rotation={[0, 0, 0.04]}>
          <cylinderGeometry args={[0.012, 0.012, 0.68, 12]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.15} />
        </mesh>
      </group>

      {[0.42, 0.55, 0.68, 0.81].map((xSlot, idx) => (
        <group key={`dimm-${idx}`} position={[xSlot, 0.68, 0.06]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.052, 1.36, 0.08]} />
            <meshStandardMaterial
              color={dimmColor}
              roughness={0.45}
              metalness={0.3}
              wireframe={wireframe}
            />
          </mesh>
          <mesh position={[0, 0.71, 0.02]}>
            <boxGeometry args={[0.06, 0.06, 0.09]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.71, 0.02]}>
            <boxGeometry args={[0.06, 0.06, 0.09]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}

      <mesh position={[1.12, 0.52, 0.07]} castShadow>
        <boxGeometry args={[0.1, 0.62, 0.11]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[-0.78, 1.44, 0.07]} castShadow>
        <boxGeometry args={[0.42, 0.1, 0.11]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.2} />
      </mesh>

      <mesh position={[-0.22, -0.04, 0.09]} castShadow receiveShadow>
        <boxGeometry args={[1.08, 0.34, 0.12]} />
        <meshStandardMaterial
          color={heatsinkHex}
          roughness={0.22}
          metalness={0.88}
          wireframe={wireframe}
        />
      </mesh>

      <mesh position={[-0.14, -0.38, 0.06]} castShadow>
        <boxGeometry args={[1.18, 0.09, 0.09]} />
        <meshStandardMaterial
          color="#e2e8f0"
          metalness={0.96}
          roughness={0.14}
          wireframe={wireframe}
        />
      </mesh>

      <mesh position={[0.12, -0.84, 0.09]} castShadow receiveShadow>
        <boxGeometry args={[1.76, 0.72, 0.12]} />
        <meshStandardMaterial
          map={surfaceBundle?.m2Tex || null}
          color="#ffffff"
          roughness={0.24}
          metalness={0.84}
          wireframe={wireframe}
        />
      </mesh>

      <mesh position={[-0.14, -1.32, 0.06]} castShadow>
        <boxGeometry args={[1.18, 0.08, 0.08]} />
        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.92}
          roughness={0.18}
          wireframe={wireframe}
        />
      </mesh>

      <mesh
        position={[0.72, -1.32, 0.05]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.11, 0.11, 0.03, 24]} />
        <meshStandardMaterial color="#f1f5f9" metalness={0.96} roughness={0.12} />
      </mesh>
    </group>
  );
}

function ParametricCpu({ cpuPart, wireframe = false }) {
  const isIntel = String(cpuPart?.brand || '').toUpperCase().includes('INTEL');
  return (
    <group name="ParametricCpuPackage">
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
          metalness={0.94}
          roughness={0.18}
          wireframe={wireframe}
        />
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

  const shroudHex = gpuPart?.shroudColor || '#151820';
  const L = 3.36;
  const T = 0.65;
  const W = 1.4;

  return (
    <group name="ParametricGpuNode">
      <mesh position={[0, T / 2 - 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[L, 0.045, W]} />
        <meshStandardMaterial
          color={shroudHex}
          metalness={0.82}
          roughness={0.26}
          wireframe={wireframe}
        />
      </mesh>

      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[L - 0.12, T * 0.56, W - 0.08]} />
        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.92}
          roughness={0.22}
          wireframe={wireframe}
        />
      </mesh>

      <mesh position={[0, -T / 2 + 0.09, 0]} castShadow receiveShadow>
        <boxGeometry args={[L, 0.18, W]} />
        <meshStandardMaterial
          color={shroudHex}
          metalness={0.76}
          roughness={0.3}
          wireframe={wireframe}
        />
      </mesh>

      {[-0.42, -0.21, 0, 0.21, 0.42].map((zPipe, idx) => (
        <mesh
          key={`hp-${idx}`}
          position={[0, 0.02, zPipe]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.026, 0.026, L - 0.06, 16]} />
          <meshStandardMaterial color="#d97706" metalness={0.94} roughness={0.2} />
        </mesh>
      ))}

      <mesh position={[0.2, 0.06, W / 2 + 0.015]} material={rgbGpuMat}>
        <boxGeometry args={[2.15, 0.075, 0.04]} />
      </mesh>
      <mesh position={[L / 2 + 0.01, 0, 0]} material={rgbGpuMat}>
        <boxGeometry args={[0.04, T - 0.14, W - 0.24]} />
      </mesh>

      {[-1.04, 0, 1.04].map((fx, fIdx) => {
        const refObj = fIdx === 0 ? imp0 : fIdx === 1 ? imp1 : imp2;
        return (
          <group
            key={`gfan-${fIdx}`}
            position={[fx, -T / 2 + 0.03, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <group ref={refObj}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.14, 0.14, 0.06, 20]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
              </mesh>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((b) => (
                <group key={b} rotation={[0, 0, (b / 9) * Math.PI * 2]}>
                  <mesh
                    position={[0.02, 0.23, 0]}
                    rotation={[0.35, 0.2, -0.25]}
                  >
                    <boxGeometry args={[0.1, 0.27, 0.014]} />
                    <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.4} />
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
            <boxGeometry args={[0.062, 1.32, 0.34]} />
            <meshStandardMaterial
              color={hsColor}
              metalness={0.86}
              roughness={0.22}
              wireframe={wireframe}
            />
          </mesh>
          <mesh position={[0, 0, 0.2]} material={rgbRamMat}>
            <boxGeometry args={[0.068, 1.34, 0.1]} />
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
  rgbCoolerMat,
  rgbFanMat,
  lcdTex,
  onRegisterImpeller,
}) {
  const isAir = coolerPart?.coolerStyle === 'air_dual';
  const radColor = coolerPart?.radiatorColor || '#14171f';

  const tube1Geo = useMemo(() => {
    const c1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.24, -0.05, 0.28),
      new THREE.Vector3(0.75, 0.18, 0.72),
      new THREE.Vector3(1.12, 0.52, 0.76),
      new THREE.Vector3(1.36, 0.88, 0.71),
    ]);
    return new THREE.TubeGeometry(c1, 24, 0.04, 12, false);
  }, []);

  const tube2Geo = useMemo(() => {
    const c2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.24, 0.1, 0.28),
      new THREE.Vector3(0.68, 0.34, 0.64),
      new THREE.Vector3(1.02, 0.6, 0.66),
      new THREE.Vector3(1.2, 0.88, 0.63),
    ]);
    return new THREE.TubeGeometry(c2, 24, 0.04, 12, false);
  }, []);

  if (isAir) {
    return (
      <group name="ParametricAirCooler">
        <mesh position={[-0.28, 0, 0.42]} castShadow receiveShadow>
          <boxGeometry args={[0.44, 1.14, 0.82]} />
          <meshStandardMaterial
            color="#181b22"
            metalness={0.85}
            roughness={0.25}
            wireframe={wireframe}
          />
        </mesh>
        <mesh position={[0.28, 0, 0.42]} castShadow receiveShadow>
          <boxGeometry args={[0.44, 1.14, 0.82]} />
          <meshStandardMaterial
            color="#181b22"
            metalness={0.85}
            roughness={0.25}
            wireframe={wireframe}
          />
        </mesh>
        <CaseFan120
          position={[0, 0, 0.42]}
          rotation={[0, Math.PI / 2, 0]}
          wireframe={wireframe}
          rgbMat={rgbFanMat}
          onRegisterImpeller={onRegisterImpeller}
        />
      </group>
    );
  }

  return (
    <group name="ParametricAioCooler">
      <mesh
        position={[0, 0, 0.22]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.38, 0.4, 0.44, 32]} />
        <meshStandardMaterial
          color={radColor}
          metalness={0.78}
          roughness={0.28}
          wireframe={wireframe}
        />
      </mesh>
      <mesh position={[0, 0, 0.43]} material={rgbCoolerMat}>
        <torusGeometry args={[0.35, 0.022, 16, 36]} />
      </mesh>
      {showDisplays && (
        <mesh position={[0, 0, 0.442]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.014, 32]} />
          <meshStandardMaterial
            map={lcdTex}
            emissiveMap={lcdTex}
            emissive="#ffffff"
            emissiveIntensity={1.6}
            roughness={0.12}
          />
        </mesh>
      )}

      <group position={[0.55, 1.0, 0.71]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3.56, 0.26, 1.18]} />
          <meshStandardMaterial
            color={radColor}
            metalness={0.76}
            roughness={0.32}
            wireframe={wireframe}
          />
        </mesh>
        {[-1.18, 0, 1.18].map((fx, idx) => (
          <CaseFan120
            key={`rad-fan-${idx}`}
            position={[fx, -0.25, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            wireframe={wireframe}
            rgbMat={rgbFanMat}
            onRegisterImpeller={onRegisterImpeller}
          />
        ))}
      </group>

      <mesh geometry={tube1Geo} castShadow>
        <meshStandardMaterial color="#11141c" roughness={0.55} metalness={0.25} />
      </mesh>
      <mesh geometry={tube2Geo} castShadow>
        <meshStandardMaterial color="#11141c" roughness={0.55} metalness={0.25} />
      </mesh>
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
          metalness={0.68}
          roughness={0.36}
          wireframe={wireframe}
        />
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
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
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
            emissiveIntensity={1.8}
          />
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
      arrow.position.y =
        arrow.userData.baseY + Math.sin(t * 3.2 + idx * 0.8) * 0.14;
    });
  });

  const streams = [
    { pos: [1.1, -0.6, 0.1], rot: [0, 0, 0.4], color: '#38bdf8' },
    { pos: [1.1, 0.4, 0.1], rot: [0, 0, 0.4], color: '#38bdf8' },
    { pos: [-0.2, -1.2, 0.3], rot: [0, 0, 0], color: '#38bdf8' },
    { pos: [-0.4, 0.2, 0.3], rot: [0, 0, 0.2], color: '#fb923c' },
    { pos: [-1.3, 0.85, 0.4], rot: [0, 0, 0.9], color: '#ef4444' },
    { pos: [0.1, 1.35, 0.4], rot: [0, 0, 0], color: '#f97316' },
  ];

  return (
    <group ref={groupRef} name="AirflowStreamlines">
      {streams.map((s, idx) => (
        <group
          key={`flow-${idx}`}
          position={s.pos}
          rotation={s.rot}
          userData={{ baseY: s.pos[1] }}
        >
          <mesh position={[0, 0.38, 0]}>
            <coneGeometry args={[0.09, 0.24, 16]} />
            <meshBasicMaterial color={s.color} transparent opacity={0.85} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.032, 0.032, 0.56, 12]} />
            <meshBasicMaterial color={s.color} transparent opacity={0.65} />
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
  isPcOn = true,
  rgbConfig = DEFAULT_RGB_CONFIG,
  showAirflow = false,
  showDisplays = true,
  showCaseFans = false,
}) {
  const impellersSetRef = useRef(new Set());
  const fansLightRef = useRef(null);
  const ramLightRef = useRef(null);
  const gpuLightRef = useRef(null);
  const coolerLightRef = useRef(null);
  const tempColorRef = useRef(new THREE.Color());

  const herringboneAlpha = useMemo(() => createHerringboneVentAlphaTexture(), []);
  const honeycombAlpha = useMemo(() => createHoneycombGrilleAlphaTexture(), []);
  const lcdTex = useMemo(() => createKrakenLcdTexture(), []);

  const rgbMats = useMemo(
    () => ({
      fans: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#00f2fe'),
        emissive: new THREE.Color('#00f2fe'),
        emissiveIntensity: 2.4,
        roughness: 0.15,
        metalness: 0.1,
        wireframe,
      }),
      ram: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#a855f7'),
        emissive: new THREE.Color('#a855f7'),
        emissiveIntensity: 2.4,
        roughness: 0.15,
        metalness: 0.1,
        wireframe,
      }),
      gpu: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#ef4444'),
        emissive: new THREE.Color('#ef4444'),
        emissiveIntensity: 2.4,
        roughness: 0.15,
        metalness: 0.1,
        wireframe,
      }),
      cooler: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#00f2fe'),
        emissive: new THREE.Color('#00f2fe'),
        emissiveIntensity: 2.4,
        roughness: 0.15,
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
      impellersSetRef.current.forEach((imp) => {
        imp.rotation.z -= delta * 20.0;
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
        return tempColor.setHSL(hue, 0.95, 0.55).clone();
      }
      const hex = rgbConfig?.syncAll
        ? rgbConfig?.globalColor || '#00f2fe'
        : rgbConfig?.groups?.[groupKey] || rgbConfig?.globalColor || '#00f2fe';
      return tempColor.set(hex).clone();
    };

    const pulseFactor = !lightsActive
      ? 0
      : mode === 'breathing'
      ? 0.4 + ((Math.sin(elapsed * 2.8) + 1) * 0.5) * 2.3
      : 2.5;

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

    const pointIntensity = lightsActive ? (pulseFactor / 2.5) * 3.4 : 0;

    if (fansLightRef.current) {
      fansLightRef.current.color.copy(cFans);
      fansLightRef.current.intensity = pointIntensity;
    }
    if (ramLightRef.current) {
      ramLightRef.current.color.copy(cRam);
      ramLightRef.current.intensity = pointIntensity * 0.9;
    }
    if (gpuLightRef.current) {
      gpuLightRef.current.color.copy(cGpu);
      gpuLightRef.current.intensity = pointIntensity * 1.1;
    }
    if (coolerLightRef.current) {
      coolerLightRef.current.color.copy(cCooler);
      coolerLightRef.current.intensity = pointIntensity * 0.85;
    }
  });

  const caseSnaps = SNAP_POINTS.case;
  const moboSnaps = SNAP_POINTS.motherboard;

  const expPos = (base, offset) =>
    explodedView
      ? [base[0] + offset[0], base[1] + offset[1], base[2] + offset[2]]
      : base;

  return (
    <group position={[0, 2.22, 0]} name="BuildCoresSocketHierarchy">
      <pointLight
        ref={fansLightRef}
        position={[1.05, 0.0, 0.25]}
        distance={5.5}
        decay={2}
        intensity={3.4}
      />
      <pointLight
        ref={ramLightRef}
        position={[0.05, 0.85, 0.15]}
        distance={3.8}
        decay={2}
        intensity={3.0}
      />
      <pointLight
        ref={gpuLightRef}
        position={[0.0, -0.35, 0.65]}
        distance={4.8}
        decay={2}
        intensity={3.8}
      />
      <pointLight
        ref={coolerLightRef}
        position={[-0.65, 0.85, 0.25]}
        distance={4.2}
        decay={2}
        intensity={3.0}
      />

      {showAirflow && <AirflowStreamlines />}

      {build.case && (
        <group
          name="root_chassis"
          position={caseSnaps.root_chassis.position}
          rotation={caseSnaps.root_chassis.rotation}
        >
          {customGlbOverrides.case ? (
            <GlbOverrideBoundary key={customGlbOverrides.case}>
              <Suspense fallback={null}>
                <CustomGlbModel
                  url={customGlbOverrides.case}
                  wireframe={wireframe}
                />
              </Suspense>
            </GlbOverrideBoundary>
          ) : (
            <HyteY70PanoramicCase
              casePart={build.case}
              showGlass={showGlass}
              showCaseFans={showCaseFans || Boolean(build.cooler)}
              wireframe={wireframe}
              herringboneAlpha={herringboneAlpha}
              rgbFanMat={rgbMats.fans}
              onRegisterImpeller={handleRegisterImpeller}
            />
          )}

          {build.psu && (
            <group
              name="mount_psu"
              position={expPos(caseSnaps.mount_psu.position, [-0.55, 0, -0.45])}
              rotation={caseSnaps.mount_psu.rotation}
            >
              {customGlbOverrides.psu ? (
                <GlbOverrideBoundary key={customGlbOverrides.psu}>
                  <Suspense fallback={null}>
                    <CustomGlbModel
                      url={customGlbOverrides.psu}
                      wireframe={wireframe}
                    />
                  </Suspense>
                </GlbOverrideBoundary>
              ) : (
                <ParametricDualChamberPsu
                  psuPart={build.psu}
                  wireframe={wireframe}
                  honeycombAlpha={honeycombAlpha}
                />
              )}
            </group>
          )}

          {build.motherboard && (
            <group
              name="mount_motherboard"
              position={expPos(
                caseSnaps.mount_motherboard.position,
                [-0.25, 0.06, -0.2]
              )}
              rotation={caseSnaps.mount_motherboard.rotation}
            >
              {customGlbOverrides.motherboard ? (
                <GlbOverrideBoundary key={customGlbOverrides.motherboard}>
                  <Suspense fallback={null}>
                    <CustomGlbModel
                      url={customGlbOverrides.motherboard}
                      wireframe={wireframe}
                    />
                  </Suspense>
                </GlbOverrideBoundary>
              ) : (
                <ParametricMotherboard
                  moboPart={build.motherboard}
                  hasCpu={Boolean(build.cpu)}
                  wireframe={wireframe}
                />
              )}

              {build.cpu && (
                <group
                  name="socket_cpu"
                  position={expPos(moboSnaps.socket_cpu.position, [0, 0.1, 0.35])}
                  rotation={moboSnaps.socket_cpu.rotation}
                >
                  {customGlbOverrides.cpu ? (
                    <GlbOverrideBoundary key={customGlbOverrides.cpu}>
                      <Suspense fallback={null}>
                        <CustomGlbModel
                          url={customGlbOverrides.cpu}
                          wireframe={wireframe}
                        />
                      </Suspense>
                    </GlbOverrideBoundary>
                  ) : (
                    <ParametricCpu cpuPart={build.cpu} wireframe={wireframe} />
                  )}
                </group>
              )}

              {build.cooler && (
                <group
                  name="mount_cooler"
                  position={expPos(
                    moboSnaps.mount_cooler.position,
                    [0, 0.35, 0.72]
                  )}
                  rotation={moboSnaps.mount_cooler.rotation}
                >
                  {customGlbOverrides.cooler ? (
                    <GlbOverrideBoundary key={customGlbOverrides.cooler}>
                      <Suspense fallback={null}>
                        <CustomGlbModel
                          url={customGlbOverrides.cooler}
                          wireframe={wireframe}
                        />
                      </Suspense>
                    </GlbOverrideBoundary>
                  ) : (
                    <ParametricCooler
                      coolerPart={build.cooler}
                      wireframe={wireframe}
                      showDisplays={showDisplays && isPcOn}
                      rgbCoolerMat={rgbMats.cooler}
                      rgbFanMat={rgbMats.fans}
                      lcdTex={lcdTex}
                      onRegisterImpeller={handleRegisterImpeller}
                    />
                  )}
                </group>
              )}

              {build.gpu && (
                <group
                  name="slot_pcie_x16"
                  position={expPos(
                    moboSnaps.slot_pcie_x16.position,
                    [0.35, -0.15, 0.95]
                  )}
                  rotation={moboSnaps.slot_pcie_x16.rotation}
                >
                  {customGlbOverrides.gpu ? (
                    <GlbOverrideBoundary key={customGlbOverrides.gpu}>
                      <Suspense fallback={null}>
                        <CustomGlbModel
                          url={customGlbOverrides.gpu}
                          wireframe={wireframe}
                        />
                      </Suspense>
                    </GlbOverrideBoundary>
                  ) : (
                    <ParametricGpu
                      gpuPart={build.gpu}
                      wireframe={wireframe}
                      rgbGpuMat={rgbMats.gpu}
                      onRegisterImpeller={handleRegisterImpeller}
                    />
                  )}
                </group>
              )}

              {build.ram && (
                <group
                  name="slot_ram_1"
                  position={expPos(
                    moboSnaps.slot_ram_1.position,
                    [0.28, 0.12, 0.55]
                  )}
                  rotation={moboSnaps.slot_ram_1.rotation}
                >
                  {customGlbOverrides.ram ? (
                    <GlbOverrideBoundary key={customGlbOverrides.ram}>
                      <Suspense fallback={null}>
                        <CustomGlbModel
                          url={customGlbOverrides.ram}
                          wireframe={wireframe}
                        />
                      </Suspense>
                    </GlbOverrideBoundary>
                  ) : (
                    <ParametricRam
                      ramPart={build.ram}
                      wireframe={wireframe}
                      rgbRamMat={rgbMats.ram}
                    />
                  )}
                </group>
              )}

              {build.storage && (
                <group
                  name="slot_m2_1"
                  position={expPos(
                    moboSnaps.slot_m2_1.position,
                    [0, -0.05, 0.42]
                  )}
                  rotation={moboSnaps.slot_m2_1.rotation}
                >
                  {customGlbOverrides.storage ? (
                    <GlbOverrideBoundary key={customGlbOverrides.storage}>
                      <Suspense fallback={null}>
                        <CustomGlbModel
                          url={customGlbOverrides.storage}
                          wireframe={wireframe}
                        />
                      </Suspense>
                    </GlbOverrideBoundary>
                  ) : (
                    <mesh castShadow>
                      <boxGeometry args={[0.8, 0.22, 0.028]} />
                      <meshStandardMaterial
                        color="#0b0d12"
                        metalness={0.4}
                        roughness={0.35}
                        wireframe={wireframe}
                      />
                    </mesh>
                  )}
                </group>
              )}
            </group>
          )}
        </group>
      )}
    </group>
  );
}
