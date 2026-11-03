import React, { useEffect, useState, useMemo } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { SNAP_POINTS } from '../utils/textureGenerator';

// Singleton DRACOLoader + GLTFLoader configured for compressed real hardware .glb assets
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// In-memory cache of loaded GLTF scenes or error states
const gltfCache = new Map();

/**
 * Builds a pure wireframe BoundingBox (THREE.Box3Helper) strictly for fallback
 * when a .glb file is missing on disk. Uses ZERO primitive mesh geometries.
 */
function createWireframeBoundingBoxHelper(sizeArray = [0.5, 0.5, 0.5], colorHex = '#ef4444') {
  const halfX = (sizeArray[0] || 0.5) / 2;
  const halfY = (sizeArray[1] || 0.5) / 2;
  const halfZ = (sizeArray[2] || 0.5) / 2;

  const box3 = new THREE.Box3(
    new THREE.Vector3(-halfX, -halfY, -halfZ),
    new THREE.Vector3(halfX, halfY, halfZ)
  );
  return new THREE.Box3Helper(box3, new THREE.Color(colorHex));
}

/**
 * Loads a real .glb / .gltf model using Three.js GLTFLoader + DRACOLoader.
 * If the file does not exist in /public/models/... (or returns HTML 404),
 * renders ONLY a THREE.Box3Helper wireframe bounding box and displays an HTML
 * diagnostic tag showing the exact missing .glb path.
 */
function GltfSocketPart({
  part,
  socketName,
  snapConfig,
  customOverrideUrl,
  showBoundingLabels = true,
  wireframeMode = false,
  children,
}) {
  const [loadState, setLoadState] = useState({
    status: 'loading', // 'loading' | 'loaded' | 'missing'
    scene: null,
    errorMsg: '',
  });

  const targetUrl = customOverrideUrl || part?.model3dPath;

  useEffect(() => {
    let isMounted = true;
    if (!targetUrl) return undefined;

    if (gltfCache.has(targetUrl)) {
      const cached = gltfCache.get(targetUrl);
      setLoadState({
        status: cached.status,
        scene: cached.scene ? cached.scene.clone(true) : null,
        errorMsg: cached.errorMsg,
      });
      return undefined;
    }

    setLoadState({ status: 'loading', scene: null, errorMsg: '' });

    // Pre-flight check to ensure Vite doesn't return index.html (text/html) for missing .glb files
    fetch(targetUrl, { method: 'HEAD' })
      .then((res) => {
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok || contentType.includes('text/html')) {
          throw new Error(`Arquivo .GLB ausente em /public${targetUrl}`);
        }

        gltfLoader.load(
          targetUrl,
          (gltf) => {
            if (!isMounted) return;
            const cloned = gltf.scene.clone(true);
            gltfCache.set(targetUrl, {
              status: 'loaded',
              scene: gltf.scene,
              errorMsg: '',
            });
            setLoadState({
              status: 'loaded',
              scene: cloned,
              errorMsg: '',
            });
          },
          undefined,
          (err) => {
            if (!isMounted) return;
            const msg = err?.message || `Falha ao decodificar ${targetUrl}`;
            gltfCache.set(targetUrl, {
              status: 'missing',
              scene: null,
              errorMsg: msg,
            });
            setLoadState({
              status: 'missing',
              scene: null,
              errorMsg: msg,
            });
          }
        );
      })
      .catch((err) => {
        if (!isMounted) return;
        const msg = err?.message || `Missing GLB: ${targetUrl}`;
        gltfCache.set(targetUrl, {
          status: 'missing',
          scene: null,
          errorMsg: msg,
        });
        setLoadState({
          status: 'missing',
          scene: null,
          errorMsg: msg,
        });
      });

    return () => {
      isMounted = false;
    };
  }, [targetUrl]);

  // Apply wireframe toggle to loaded GLTF materials if requested
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

  // Socket Snap Coordinates (Vector3 Position + Euler Rotation + Part MountOffset)
  const { socketPos, socketRot, partScale, partOffsetPos, partOffsetRot, bboxHelper } =
    useMemo(() => {
      const sPos = snapConfig?.position || [0, 0, 0];
      const sRot = snapConfig?.rotation || [0, 0, 0];
      const mPos = part?.mountOffset?.position || [0, 0, 0];
      const mRot = part?.mountOffset?.rotation || [0, 0, 0];
      const mScale = part?.mountOffset?.scale || [1, 1, 1];
      const bboxSize = snapConfig?.boundingBoxSize || [0.4, 0.4, 0.4];

      // Color-code bounding boxes per category for clear socket visualization when .glb is missing
      const colorMap = {
        case: '#475569',
        motherboard: '#38bdf8',
        cpu: '#f59e0b',
        cooler: '#22d3ee',
        gpu: '#f43f5e',
        ram: '#a855f7',
        storage: '#10b981',
        psu: '#eab308',
      };
      const helper = createWireframeBoundingBoxHelper(
        [
          bboxSize[0] * mScale[0],
          bboxSize[1] * mScale[1],
          bboxSize[2] * mScale[2],
        ],
        colorMap[part?.category] || '#ef4444'
      );

      return {
        socketPos: new THREE.Vector3(...sPos),
        socketRot: new THREE.Euler(...sRot),
        partOffsetPos: new THREE.Vector3(...mPos),
        partOffsetRot: new THREE.Euler(...mRot),
        partScale: new THREE.Vector3(...mScale),
        bboxHelper: helper,
      };
    }, [snapConfig, part]);

  return (
    <group position={socketPos} rotation={socketRot} name={`Socket_${socketName}`}>
      {/* Fine-tune MountOffset wrapper for the loaded GLB or Fallback BoundingBox */}
      <group position={partOffsetPos} rotation={partOffsetRot} scale={partScale}>
        {loadState.status === 'loaded' && loadState.scene ? (
          <primitive object={loadState.scene} />
        ) : (
          /* Fallback Wireframe BoundingBox (THREE.Box3Helper) + Missing Path Diagnostic Badge */
          <group>
            <primitive object={bboxHelper} />
            {showBoundingLabels && part && (
              <Html
                position={[0, 0, 0]}
                center
                distanceFactor={4.2}
                zIndexRange={[10, 0]}
              >
                <div className="pointer-events-none select-none rounded-lg bg-[#0d1017]/95 border border-rose-500/50 px-2.5 py-1.5 shadow-xl text-left min-w-[185px] backdrop-blur-md">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-tech text-[9px] uppercase tracking-wider text-rose-400 font-bold">
                      [{socketName}] GLB MISSING
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                  </div>
                  <p className="text-[10px] font-semibold text-white truncate mt-0.5">
                    {part.name}
                  </p>
                  <p className="font-mono-tech text-[9px] text-amber-300/90 truncate mt-0.5">
                    public{targetUrl}
                  </p>
                </div>
              </Html>
            )}
          </group>
        )}
      </group>

      {/* Child sockets anchored to this component (e.g., Motherboard attached to Case, or CPU/GPU/RAM attached to Motherboard) */}
      {children}
    </group>
  );
}

/**
 * Hierarchical Socket Snap-Point Assembly:
 * Case (root_chassis)
 *  ├── PSU (mount_psu)
 *  └── Motherboard (mount_motherboard)
 *       ├── CPU (socket_cpu)
 *       ├── CPU Cooler (mount_cooler)
 *       ├── GPU (slot_pcie_x16)
 *       ├── RAM Stick 1..4 (slot_ram_1..4)
 *       └── NVMe M.2 Storage (slot_m2_1)
 */
export default function CapeModel({
  build,
  customGlbOverrides = {},
  showBoundingLabels = true,
  wireframe = false,
  explodedView = false,
}) {
  const caseSnaps = SNAP_POINTS.case;
  const moboSnaps = SNAP_POINTS.motherboard;

  // Apply exploded view offsets to socket snap coordinates if enabled
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
      {/* 1. ROOT SOCKET: PC CASE CHASSIS */}
      <GltfSocketPart
        part={build.case}
        socketName="root_chassis"
        snapConfig={caseSnaps.root_chassis}
        customOverrideUrl={customGlbOverrides.case}
        showBoundingLabels={showBoundingLabels}
        wireframeMode={wireframe}
      >
        {/* 2. CASE CHILD SOCKET: POWER SUPPLY (mount_psu) */}
        <GltfSocketPart
          part={build.psu}
          socketName="mount_psu"
          snapConfig={getExplodedSnap(caseSnaps.mount_psu, [-0.45, -0.15, 0])}
          customOverrideUrl={customGlbOverrides.psu}
          showBoundingLabels={showBoundingLabels}
          wireframeMode={wireframe}
        />

        {/* 3. CASE CHILD SOCKET: MOTHERBOARD TRAY (mount_motherboard) */}
        <GltfSocketPart
          part={build.motherboard}
          socketName="mount_motherboard"
          snapConfig={getExplodedSnap(caseSnaps.mount_motherboard, [0, 0, 0.15])}
          customOverrideUrl={customGlbOverrides.motherboard}
          showBoundingLabels={showBoundingLabels}
          wireframeMode={wireframe}
        >
          {/* 3A. MOTHERBOARD SOCKET: CPU (socket_cpu) */}
          <GltfSocketPart
            part={build.cpu}
            socketName="socket_cpu"
            snapConfig={getExplodedSnap(moboSnaps.socket_cpu, [0, 0, 0.25])}
            customOverrideUrl={customGlbOverrides.cpu}
            showBoundingLabels={showBoundingLabels}
            wireframeMode={wireframe}
          />

          {/* 3B. MOTHERBOARD SOCKET: CPU COOLER (mount_cooler) */}
          <GltfSocketPart
            part={build.cooler}
            socketName="mount_cooler"
            snapConfig={getExplodedSnap(moboSnaps.mount_cooler, [0, 0.15, 0.55])}
            customOverrideUrl={customGlbOverrides.cooler}
            showBoundingLabels={showBoundingLabels}
            wireframeMode={wireframe}
          />

          {/* 3C. MOTHERBOARD SOCKET: GRAPHICS CARD (slot_pcie_x16) */}
          <GltfSocketPart
            part={build.gpu}
            socketName="slot_pcie_x16"
            snapConfig={getExplodedSnap(moboSnaps.slot_pcie_x16, [0, -0.1, 0.65])}
            customOverrideUrl={customGlbOverrides.gpu}
            showBoundingLabels={showBoundingLabels}
            wireframeMode={wireframe}
          />

          {/* 3D. MOTHERBOARD SOCKETS: DDR5 RAM SLOTS (slot_ram_1..4) */}
          {populatedRamSlots.map((slotKey, idx) => (
            <GltfSocketPart
              key={slotKey}
              part={build.ram}
              socketName={slotKey}
              snapConfig={getExplodedSnap(moboSnaps[slotKey], [0.15, 0, 0.35 + idx * 0.05])}
              customOverrideUrl={customGlbOverrides.ram}
              showBoundingLabels={showBoundingLabels && idx === 0}
              wireframeMode={wireframe}
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
          />
        </GltfSocketPart>
      </GltfSocketPart>
    </group>
  );
}
