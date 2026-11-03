import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import {
  SNAP_POINTS,
  createMotherboardPcbTexture,
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
 * Reusable 120mm ARGB Case / Radiator / GPU Fan with animated rotor & RGB ring
 */
function PbrFan120({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  frameMat,
  bladeMat,
  rgbMat,
  onRegisterFan,
  fanIndex,
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Outer Frame */}
      <mesh material={frameMat} castShadow receiveShadow>
        <boxGeometry args={[0.48, 0.48, 0.065]} />
      </mesh>
      {/* Dual Side & Tunnel RGB Rings */}
      <mesh position={[0, 0, 0.034]} material={rgbMat}>
        <ringGeometry args={[0.202, 0.218, 32]} />
      </mesh>
      <mesh position={[0, 0, -0.034]} rotation={[0, Math.PI, 0]} material={rgbMat}>
        <ringGeometry args={[0.202, 0.218, 32]} />
      </mesh>

      {/* Spinning Rotor + 9 Curved Blades */}
      <group ref={(el) => onRegisterFan(fanIndex, el)}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={frameMat}>
          <cylinderGeometry args={[0.068, 0.068, 0.068, 24]} />
        </mesh>
        <mesh position={[0, 0, 0.036]} material={rgbMat}>
          <ringGeometry args={[0.03, 0.052, 24]} />
        </mesh>
        {Array.from({ length: 9 }).map((_, idx) => {
          const angle = (idx / 9) * Math.PI * 2;
          return (
            <group key={idx} rotation={[0, 0, angle]}>
              <mesh
                position={[0.125, 0, 0]}
                rotation={[0.48, 0.18, 0]}
                material={bladeMat}
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
 * Braided Liquid Cooling Tube / Sleeved Cable using CatmullRomCurve3
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
 * High-Detail Multi-Mesh PBR Fallback Renderer when a local .glb file is not yet in /public/models/
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
            part?.brand === 'ASUS ROG' ? 'ROG THOR' : 'RM1000x',
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
        {/* Bottom & Top Plates */}
        <mesh position={[0, -1.3, 0]} material={chassisMat} castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.07, 1.38]} />
        </mesh>
        <mesh position={[0, 1.3, 0]} material={chassisMat} castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.06, 1.38]} />
        </mesh>

        {/* 4 Case Feet */}
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

        {/* Rear Spine Wall & Dual-Chamber Partition Tray */}
        <mesh position={[0, 0, -0.67]} material={chassisMat} castShadow receiveShadow>
          <boxGeometry args={[2.2, 2.56, 0.04]} />
        </mesh>
        <mesh position={[-0.22, 0, -0.18]} material={interiorMat} castShadow receiveShadow>
          <boxGeometry args={[1.72, 2.52, 0.04]} />
        </mesh>

        {/* Rubber Cable Routing Grommets */}
        {[0.45, -0.05, -0.55].map((yPos, idx) => (
          <mesh key={idx} position={[0.42, yPos, -0.155]} material={chassisMat}>
            <boxGeometry args={[0.11, 0.32, 0.02]} />
          </mesh>
        ))}

        {/* Side Recessed Fan Bracket + 3x 120mm Intake Fans */}
        <mesh position={[0.76, 0, -0.36]} material={interiorMat}>
          <boxGeometry args={[0.56, 2.52, 0.04]} />
        </mesh>
        {[-0.56, 0, 0.56].map((yPos, idx) => (
          <PbrFan120
            key={`side_${idx}`}
            position={[0.76, yPos, -0.31]}
            frameMat={interiorMat}
            bladeMat={materials.fanBladeMat}
            rgbMat={materials.rgbCyanMat}
            onRegisterFan={onRegisterFan}
            fanIndex={idx + 1}
          />
        ))}

        {/* Rear Exhaust Wall + 120mm Exhaust Fan */}
        <mesh position={[-1.08, 0, 0]} material={chassisMat} castShadow>
          <boxGeometry args={[0.05, 2.56, 1.38]} />
        </mesh>
        <PbrFan120
          position={[-1.02, 0.52, 0.18]}
          rotation={[0, Math.PI / 2, 0]}
          scale={0.92}
          frameMat={interiorMat}
          bladeMat={materials.fanBladeMat}
          rgbMat={materials.rgbCyanMat}
          onRegisterFan={onRegisterFan}
          fanIndex={0}
        />

        {/* 3x Bottom Intake Fans */}
        {[-0.52, 0, 0.52].map((xPos, idx) => (
          <PbrFan120
            key={`bot_${idx}`}
            position={[xPos - 0.12, -1.22, 0.18]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={0.92}
            frameMat={interiorMat}
            bladeMat={materials.fanBladeMat}
            rgbMat={materials.rgbPurpleMat}
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
      metalness: 0.8,
      roughness: 0.25,
      wireframe,
    });
    const tufAccentMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(part.accentColor || '#f59e0b'),
      emissive: new THREE.Color(part.accentColor || '#f59e0b'),
      emissiveIntensity: 0.7,
      wireframe,
    });

    return (
      <group name="Fallback_ASUS_B650M_Motherboard">
        {/* PCB Board with Circuit Texture */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.26, 1.54, 0.035]} />
          <meshStandardMaterial
            map={pcbTex}
            metalness={0.3}
            roughness={0.5}
            wireframe={wireframe}
          />
        </mesh>

        {/* Chamfered VRM Heatsinks + TUF / ROG Accent Stripe */}
        <mesh position={[-0.48, 0.34, 0.075]} material={vrmMat} castShadow>
          <boxGeometry args={[0.25, 0.78, 0.11]} />
        </mesh>
        <mesh position={[-0.44, 0.34, 0.132]} material={tufAccentMat}>
          <boxGeometry args={[0.08, 0.44, 0.008]} />
        </mesh>
        <mesh position={[-0.06, 0.65, 0.065]} material={vrmMat} castShadow>
          <boxGeometry args={[0.56, 0.16, 0.09]} />
        </mesh>

        {/* 4x DDR5 DIMM Slots */}
        {[0, 1, 2, 3].map((slotIdx) => (
          <mesh
            key={slotIdx}
            position={[0.22 + slotIdx * 0.06, 0.34, 0.035]}
            material={vrmMat}
          >
            <boxGeometry args={[0.022, 0.44, 0.03]} />
          </mesh>
        ))}

        {/* Steel-Reinforced PCIe x16 Slot */}
        <mesh position={[-0.08, -0.18, 0.035]} material={materials.nickelMat}>
          <boxGeometry args={[0.68, 0.038, 0.038]} />
        </mesh>

        {/* Chipset Heatsink */}
        <mesh position={[0.24, -0.44, 0.045]} material={vrmMat} castShadow>
          <boxGeometry args={[0.42, 0.36, 0.05]} />
        </mesh>
        <mesh position={[0.24, -0.44, 0.072]} material={tufAccentMat}>
          <boxGeometry args={[0.26, 0.025, 0.008]} />
        </mesh>

        {/* 24-Pin ATX Power Header + Braided Cable */}
        <mesh position={[0.56, 0.22, 0.045]} material={vrmMat}>
          <boxGeometry args={[0.055, 0.3, 0.06]} />
        </mesh>
      </group>
    );
  }

  if (cat === 'cpu') {
    return (
      <group name="Fallback_AM5_LGA_CPU">
        {/* Socket Retention Frame */}
        <mesh material={materials.nickelMat}>
          <boxGeometry args={[0.33, 0.35, 0.02]} />
        </mesh>
        {/* CPU Substrate */}
        <mesh position={[0, 0, 0.015]}>
          <boxGeometry args={[0.27, 0.27, 0.012]} />
          <meshStandardMaterial color="#0f766e" roughness={0.4} metalness={0.3} wireframe={wireframe} />
        </mesh>
        {/* Nickel IHS Heatspreader */}
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
          <mesh position={[-0.14, 0, 0]} material={bodyMat} castShadow>
            <boxGeometry args={[0.15, 0.42, 0.36]} />
          </mesh>
          <mesh position={[0.14, 0, 0]} material={bodyMat} castShadow>
            <boxGeometry args={[0.15, 0.42, 0.36]} />
          </mesh>
          <PbrFan120
            position={[0, 0, 0]}
            rotation={[0, Math.PI / 2, 0]}
            scale={0.8}
            frameMat={bodyMat}
            bladeMat={materials.fanBladeMat}
            rgbMat={materials.rgbCyanMat}
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

        {/* Top 360mm Radiator + 3x 120mm Fans (relative to CPU cooler socket) */}
        <group position={[0.26, 0.68, 0.2]}>
          <mesh material={bodyMat} castShadow>
            <boxGeometry args={[1.56, 0.095, 0.5]} />
          </mesh>
          {[-0.5, 0, 0.5].map((xPos, idx) => (
            <PbrFan120
              key={`rad_${idx}`}
              position={[xPos, -0.08, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={0.94}
              frameMat={bodyMat}
              bladeMat={materials.fanBladeMat}
              rgbMat={materials.rgbCyanMat}
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
      roughness: 0.26,
      wireframe,
    });
    const gpuLen = 1.24;

    return (
      <group name="Fallback_ROG_Strix_RTX_4070">
        {/* Angular ROG Shroud */}
        <mesh material={shroudMat} castShadow receiveShadow>
          <boxGeometry args={[gpuLen, 0.19, 0.48]} />
        </mesh>
        {/* Finned Aluminum Heatsink Core + Copper Heatpipes */}
        <mesh material={materials.nickelMat}>
          <boxGeometry args={[gpuLen * 0.94, 0.11, 0.49]} />
        </mesh>
        {[-0.12, 0, 0.12].map((zOff, idx) => (
          <mesh
            key={idx}
            position={[0, 0, zOff]}
            rotation={[0, 0, Math.PI / 2]}
            material={materials.copperMat}
          >
            <cylinderGeometry args={[0.012, 0.012, gpuLen * 0.96, 12]} />
          </mesh>
        ))}
        {/* Brushed Metal Backplate */}
        <mesh position={[0, 0.1, 0]} material={materials.nickelMat} castShadow>
          <boxGeometry args={[gpuLen * 0.99, 0.012, 0.47]} />
        </mesh>
        {/* ROG Strix Side RGB Light Bar */}
        <mesh position={[-0.15, 0.045, 0.246]} material={materials.rgbPinkMat}>
          <boxGeometry args={[gpuLen * 0.48, 0.024, 0.01]} />
        </mesh>
        <mesh position={[0.32, 0.045, 0.246]} material={materials.rgbCyanMat}>
          <boxGeometry args={[gpuLen * 0.28, 0.024, 0.01]} />
        </mesh>
        {/* 16-Pin 12VHPWR Power Cable */}
        <BraidedTube
          points={[
            [0.34, 0.02, 0.25],
            [0.34, -0.14, 0.3],
            [0.3, -0.35, 0.1],
            [0.26, -0.45, -0.14],
          ]}
          radius={0.022}
          material={shroudMat}
        />
        {/* 3x Rotating Axial-Tech Fans */}
        {[-0.36, 0, 0.36].map((xNorm, idx) => (
          <PbrFan120
            key={`gpu_f_${idx}`}
            position={[xNorm * gpuLen * 0.92, -0.1, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.62}
            frameMat={shroudMat}
            bladeMat={materials.fanBladeMat}
            rgbMat={materials.rgbCyanMat}
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
      roughness: 0.22,
      wireframe,
    });
    return (
      <group name="Fallback_GSkill_Trident_Z5_Stick">
        <mesh material={heatMat} castShadow>
          <boxGeometry args={[0.032, 0.42, 0.11]} />
        </mesh>
        {/* Diffused Top RGB Bar */}
        <mesh position={[0, 0, 0.06]} material={materials.rgbCyanMat}>
          <boxGeometry args={[0.034, 0.425, 0.02]} />
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
            metalness={0.6}
            roughness={0.3}
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
            metalness={0.7}
            roughness={0.3}
            wireframe={wireframe}
          />
        </mesh>
        <mesh position={[0, 0, 0.224]}>
          <planeGeometry args={[0.56, 0.28]} />
          <meshStandardMaterial
            map={psuLabelTex}
            roughness={0.2}
            metalness={0.2}
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
 * If the local .glb file is not yet in /public/models/, renders the High-Detail Multi-Mesh PBR Fallback
 * at the exact socket snap coordinates, and only shows the path badge if showBoundingLabels is toggled ON.
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

    // Check if local .glb or blob URL exists
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

        {/* Optional Diagnostic Label ONLY shown when user explicitly toggles "GLB Path Labels" in the top bar */}
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

  // Shared PBR Materials (Tempered Glass with transmission, Nickel, Copper, Kraken 42°C LCD, Subtle RGB)
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
        metalness: 0.9,
        roughness: 0.2,
        wireframe,
      }),
      copperMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#c2410c'),
        metalness: 0.88,
        roughness: 0.22,
        wireframe,
      }),
      fanBladeMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#cbd5e1'),
        transparent: true,
        opacity: 0.72,
        roughness: 0.25,
        metalness: 0.15,
        wireframe,
      }),
      rgbCyanMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#38bdf8'),
        emissive: new THREE.Color('#38bdf8'),
        emissiveIntensity: 1.15,
        roughness: 0.2,
        wireframe,
      }),
      rgbPurpleMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#818cf8'),
        emissive: new THREE.Color('#818cf8'),
        emissiveIntensity: 1.0,
        roughness: 0.2,
        wireframe,
      }),
      rgbPinkMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#ec4899'),
        emissive: new THREE.Color('#ec4899'),
        emissiveIntensity: 1.2,
        roughness: 0.2,
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

  // Animate all case, radiator, and GPU fans smoothly
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
      {/* 1. ROOT SOCKET: PC CASE (HYTE Y70 / O11 / 4000D) */}
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
        {/* 2. CASE SOCKET: POWER SUPPLY (mount_psu) */}
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

        {/* 3. CASE SOCKET: MOTHERBOARD (mount_motherboard) */}
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
          {/* 3A. MOTHERBOARD SOCKET: CPU (socket_cpu) */}
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

          {/* 3B. MOTHERBOARD SOCKET: CPU COOLER (mount_cooler) */}
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

          {/* 3C. MOTHERBOARD SOCKET: GRAPHICS CARD (slot_pcie_x16) */}
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

          {/* 3D. MOTHERBOARD SOCKETS: DDR5 RAM SLOTS A2 & B2 (or A1..B2) */}
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

          {/* 3E. MOTHERBOARD SOCKET: NVMe M.2 STORAGE (slot_m2_1) */}
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
