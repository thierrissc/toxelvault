import React, { useMemo, useRef, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import {
  SNAP_POINTS,
  DEFAULT_RGB_CONFIG,
  MODEL_MANIFEST,
  resolveGlbModelPath,
} from '../utils/textureGenerator';

const DRACO_DECODER_PATH =
  MODEL_MANIFEST.dracoDecoderPath ||
  'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

Object.values(MODEL_MANIFEST.models || {}).forEach((categoryMap) => {
  Object.values(categoryMap).forEach((glbUrl) => {
    if (typeof glbUrl === 'string' && glbUrl.endsWith('.glb')) {
      useGLTF.preload(glbUrl, DRACO_DECODER_PATH);
    }
  });
});

class GlbSlotErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function GlbSocketAsset({
  url,
  part,
  rgbGroupKey = 'fans',
  wireframe = false,
  showGlass = true,
  onRegisterDynamicNodes,
}) {
  const gltf = useGLTF(url, DRACO_DECODER_PATH);

  const { clonedScene, impellers, rgbMaterials, lcdMaterials, glassMeshes } = useMemo(() => {
    const clone = gltf.scene.clone(true);
    const foundImpellers = [];
    const foundRgbMats = [];
    const foundLcdMats = [];
    const foundGlassMeshes = [];

    clone.traverse((node) => {
      if (node.name && node.name.startsWith('FanImpeller')) {
        foundImpellers.push(node);
      }

      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;

        const isGlassPanel =
          (node.name && node.name.startsWith('GlassPanel')) ||
          (node.material && node.material.name && node.material.name.startsWith('GlassPanel'));

        const isGlassBorder =
          (node.name && node.name.startsWith('GlassBorder')) ||
          (node.material && node.material.name && node.material.name.startsWith('GlassSilkscreen'));

        if (isGlassPanel) {
          node.material = new THREE.MeshPhysicalMaterial({
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
          });
          node.castShadow = false;
          foundGlassMeshes.push(node);
          return;
        }

        if (isGlassBorder) {
          node.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#090b0f'),
            roughness: 0.72,
            metalness: 0.25,
            wireframe,
          });
          foundGlassMeshes.push(node);
          return;
        }

        if (node.material) {
          const mat = node.material.clone();
          mat.wireframe = wireframe;

          const matName = mat.name || '';
          const nodeName = node.name || '';

          if (matName.startsWith('RGB_') || nodeName.startsWith('RGB_')) {
            mat.emissive = new THREE.Color('#00f2fe');
            mat.emissiveIntensity = 2.4;
            foundRgbMats.push({ mat, groupKey: rgbGroupKey });
          } else if (matName.startsWith('LCD_') || nodeName.startsWith('LCD_')) {
            mat.emissive = new THREE.Color('#38bdf8');
            mat.emissiveIntensity = 1.8;
            foundLcdMats.push(mat);
          }

          node.material = mat;
        }
      }
    });

    return {
      clonedScene: clone,
      impellers: foundImpellers,
      rgbMaterials: foundRgbMats,
      lcdMaterials: foundLcdMats,
      glassMeshes: foundGlassMeshes,
    };
  }, [gltf.scene, wireframe, rgbGroupKey]);

  useEffect(() => {
    glassMeshes.forEach((m) => {
      m.visible = Boolean(showGlass);
    });
  }, [glassMeshes, showGlass]);

  useEffect(() => {
    if (!onRegisterDynamicNodes) return undefined;
    return onRegisterDynamicNodes({
      impellers,
      rgbMaterials,
      lcdMaterials,
    });
  }, [impellers, rgbMaterials, lcdMaterials, onRegisterDynamicNodes]);

  const offset = part?.mountOffset || {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  };

  return (
    <group
      position={offset.position || [0, 0, 0]}
      rotation={offset.rotation || [0, 0, 0]}
      scale={offset.scale || [1, 1, 1]}
    >
      <primitive object={clonedScene} />
    </group>
  );
}

function SocketMountNode({
  socketName,
  snapTransform,
  explodedOffset = [0, 0, 0],
  explodedView = false,
  part,
  customGlbUrl,
  rgbGroupKey,
  wireframe,
  showGlass,
  onRegisterDynamicNodes,
  children,
}) {
  const basePos = snapTransform?.position || [0, 0, 0];
  const baseRot = snapTransform?.rotation || [0, 0, 0];

  const finalPos = explodedView
    ? [
        basePos[0] + explodedOffset[0],
        basePos[1] + explodedOffset[1],
        basePos[2] + explodedOffset[2],
      ]
    : basePos;

  const resolvedUrl = resolveGlbModelPath(part, customGlbUrl);

  return (
    <group name={socketName} position={finalPos} rotation={baseRot}>
      {part && resolvedUrl && (
        <GlbSlotErrorBoundary key={resolvedUrl}>
          <Suspense fallback={null}>
            <GlbSocketAsset
              url={resolvedUrl}
              part={part}
              rgbGroupKey={rgbGroupKey}
              wireframe={wireframe}
              showGlass={showGlass}
              onRegisterDynamicNodes={onRegisterDynamicNodes}
            />
          </Suspense>
        </GlbSlotErrorBoundary>
      )}
      {children}
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
}) {
  const dynamicRegistryRef = useRef(new Set());
  const fansLightRef = useRef(null);
  const ramLightRef = useRef(null);
  const gpuLightRef = useRef(null);
  const coolerLightRef = useRef(null);
  const tempColorRef = useRef(new THREE.Color());

  const handleRegisterDynamicNodes = React.useCallback((entry) => {
    dynamicRegistryRef.current.add(entry);
    return () => {
      dynamicRegistryRef.current.delete(entry);
    };
  }, []);

  const caseSnaps = SNAP_POINTS.case;
  const moboSnaps = SNAP_POINTS.motherboard;

  useFrame((state, delta) => {
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

    const groupColors = {
      fans: resolveGroupColor('fans', 0.0),
      ram: resolveGroupColor('ram', 0.25),
      gpu: resolveGroupColor('gpu', 0.5),
      cooler: resolveGroupColor('cooler', 0.75),
    };

    dynamicRegistryRef.current.forEach(({ impellers, rgbMaterials, lcdMaterials }) => {
      if (isPcOn && impellers) {
        for (let i = 0; i < impellers.length; i++) {
          impellers[i].rotation.z -= delta * 20.0;
        }
      }

      if (rgbMaterials) {
        for (let i = 0; i < rgbMaterials.length; i++) {
          const { mat, groupKey } = rgbMaterials[i];
          const col = groupColors[groupKey] || groupColors.fans;
          mat.color.copy(col);
          if (mat.emissive) {
            mat.emissive.copy(col);
            mat.emissiveIntensity = pulseFactor;
          }
        }
      }

      if (lcdMaterials) {
        for (let i = 0; i < lcdMaterials.length; i++) {
          const lcdMat = lcdMaterials[i];
          lcdMat.emissiveIntensity = isPcOn ? 1.8 : 0.0;
        }
      }
    });

    const pointIntensity = lightsActive ? (pulseFactor / 2.5) * 3.6 : 0;

    if (fansLightRef.current) {
      fansLightRef.current.color.copy(groupColors.fans);
      fansLightRef.current.intensity = pointIntensity;
    }
    if (ramLightRef.current) {
      ramLightRef.current.color.copy(groupColors.ram);
      ramLightRef.current.intensity = pointIntensity * 0.9;
    }
    if (gpuLightRef.current) {
      gpuLightRef.current.color.copy(groupColors.gpu);
      gpuLightRef.current.intensity = pointIntensity * 1.1;
    }
    if (coolerLightRef.current) {
      coolerLightRef.current.color.copy(groupColors.cooler);
      coolerLightRef.current.intensity = pointIntensity * 0.85;
    }
  });

  return (
    <group position={[0, 2.22, 0]} name="BuildCoresSocketMatrix">
      <pointLight
        ref={fansLightRef}
        position={[1.05, 0.0, 0.25]}
        distance={5.5}
        decay={2}
        intensity={3.6}
      />
      <pointLight
        ref={ramLightRef}
        position={[0.05, 0.85, 0.15]}
        distance={3.8}
        decay={2}
        intensity={3.2}
      />
      <pointLight
        ref={gpuLightRef}
        position={[0.0, -0.35, 0.65]}
        distance={4.8}
        decay={2}
        intensity={4.0}
      />
      <pointLight
        ref={coolerLightRef}
        position={[-0.65, 0.85, 0.25]}
        distance={4.2}
        decay={2}
        intensity={3.1}
      />

      <SocketMountNode
        socketName="root_chassis"
        snapTransform={caseSnaps.root_chassis}
        explodedOffset={[0, 0, 0]}
        explodedView={explodedView}
        part={build.case}
        customGlbUrl={customGlbOverrides.case}
        rgbGroupKey="fans"
        wireframe={wireframe}
        showGlass={showGlass}
        onRegisterDynamicNodes={handleRegisterDynamicNodes}
      >
        <SocketMountNode
          socketName="mount_psu"
          snapTransform={caseSnaps.mount_psu}
          explodedOffset={[-0.85, -0.35, -0.55]}
          explodedView={explodedView}
          part={build.psu}
          customGlbUrl={customGlbOverrides.psu}
          rgbGroupKey="fans"
          wireframe={wireframe}
          showGlass={showGlass}
          onRegisterDynamicNodes={handleRegisterDynamicNodes}
        />

        <SocketMountNode
          socketName="mount_motherboard"
          snapTransform={caseSnaps.mount_motherboard}
          explodedOffset={[-0.35, 0.08, -0.25]}
          explodedView={explodedView}
          part={build.motherboard}
          customGlbUrl={customGlbOverrides.motherboard}
          rgbGroupKey="cooler"
          wireframe={wireframe}
          showGlass={showGlass}
          onRegisterDynamicNodes={handleRegisterDynamicNodes}
        >
          {build.motherboard && (
            <>
              <SocketMountNode
                socketName="socket_cpu"
                snapTransform={moboSnaps.socket_cpu}
                explodedOffset={[0, 0.12, 0.42]}
                explodedView={explodedView}
                part={build.cpu}
                customGlbUrl={customGlbOverrides.cpu}
                rgbGroupKey="cooler"
                wireframe={wireframe}
                showGlass={showGlass}
                onRegisterDynamicNodes={handleRegisterDynamicNodes}
              />

              <SocketMountNode
                socketName="mount_cooler"
                snapTransform={moboSnaps.mount_cooler}
                explodedOffset={[0, 0.45, 0.85]}
                explodedView={explodedView}
                part={build.cooler}
                customGlbUrl={customGlbOverrides.cooler}
                rgbGroupKey="cooler"
                wireframe={wireframe}
                showGlass={showGlass}
                onRegisterDynamicNodes={handleRegisterDynamicNodes}
              />

              <SocketMountNode
                socketName="slot_pcie_x16"
                snapTransform={moboSnaps.slot_pcie_x16}
                explodedOffset={[0.45, -0.2, 1.15]}
                explodedView={explodedView}
                part={build.gpu}
                customGlbUrl={customGlbOverrides.gpu}
                rgbGroupKey="gpu"
                wireframe={wireframe}
                showGlass={showGlass}
                onRegisterDynamicNodes={handleRegisterDynamicNodes}
              />

              <SocketMountNode
                socketName="slot_ram_1"
                snapTransform={moboSnaps.slot_ram_1}
                explodedOffset={[0.35, 0.15, 0.65]}
                explodedView={explodedView}
                part={build.ram}
                customGlbUrl={customGlbOverrides.ram}
                rgbGroupKey="ram"
                wireframe={wireframe}
                showGlass={showGlass}
                onRegisterDynamicNodes={handleRegisterDynamicNodes}
              />

              <SocketMountNode
                socketName="slot_m2_1"
                snapTransform={moboSnaps.slot_m2_1}
                explodedOffset={[0, -0.08, 0.52]}
                explodedView={explodedView}
                part={build.storage}
                customGlbUrl={customGlbOverrides.storage}
                rgbGroupKey="cooler"
                wireframe={wireframe}
                showGlass={showGlass}
                onRegisterDynamicNodes={handleRegisterDynamicNodes}
              />
            </>
          )}
        </SocketMountNode>
      </SocketMountNode>
    </group>
  );
}
