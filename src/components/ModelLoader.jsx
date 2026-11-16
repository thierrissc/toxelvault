import React, { Suspense, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { clampToContainer, CHASSIS_INTERNAL_BOUNDS } from '../utils/assetValidator';

const DRACO_DECODER_URL =
  'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';
const KTX2_TRANSCODER_URL =
  'https://www.gstatic.com/basis-universal/versioned/2021-04-15-ba1c3e4/';

class GlbLoadErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

function GlbSceneRenderer({
  url,
  category,
  wireframe = false,
  onSocketsDetected,
}) {
  const { gl } = useThree();

  const gltf = useGLTF(url, DRACO_DECODER_URL, true, (loader) => {
    try {
      const ktx2Loader = new KTX2Loader();
      ktx2Loader.setTranscoderPath(KTX2_TRANSCODER_URL);
      ktx2Loader.detectSupport(gl);
      loader.setKTX2Loader(ktx2Loader);
    } catch {
      void 0;
    }
  });

  const { clonedScene, detectedSockets } = useMemo(() => {
    const clone = gltf.scene.clone(true);
    const sockets = {};

    clone.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        if (node.material) {
          node.material = node.material.clone();
          node.material.wireframe = wireframe;
        }
      }
      if (
        node.name &&
        (node.name.startsWith('socket_') ||
          node.name.startsWith('slot_') ||
          node.name.startsWith('mount_') ||
          node.name.startsWith('fan_'))
      ) {
        const pos = new THREE.Vector3();
        const quat = new THREE.Quaternion();
        const euler = new THREE.Euler();
        node.getWorldPosition(pos);
        node.getWorldQuaternion(quat);
        euler.setFromQuaternion(quat);
        const clampedPos = clampToContainer(
          [pos.x, pos.y, pos.z],
          [0.4, 0.4, 0.4],
          CHASSIS_INTERNAL_BOUNDS
        );
        sockets[node.name] = {
          position: clampedPos,
          rotation: [euler.x, euler.y, euler.z],
        };
      }
    });

    if (category && category !== 'case') {
      const box = new THREE.Box3().setFromObject(clone);
      if (!box.isEmpty()) {
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 3.2) {
          const uniformFactor = 2.8 / maxDim;
          clone.scale.setScalar(uniformFactor);
        }
      }
    }

    return { clonedScene: clone, detectedSockets: sockets };
  }, [gltf.scene, wireframe, category]);

  useEffect(() => {
    if (onSocketsDetected && Object.keys(detectedSockets).length > 0) {
      onSocketsDetected(detectedSockets);
    }
  }, [detectedSockets, onSocketsDetected]);

  return <primitive object={clonedScene} />;
}

export default function ModelLoader({
  category,
  customOverrideUrl = null,
  wireframe = false,
  onSocketsDetected,
  fallback = null,
}) {
  if (!customOverrideUrl) {
    return fallback;
  }

  return (
    <GlbLoadErrorBoundary key={customOverrideUrl} fallback={fallback}>
      <Suspense fallback={fallback}>
        <GlbSceneRenderer
          url={customOverrideUrl}
          category={category}
          wireframe={wireframe}
          onSocketsDetected={onSocketsDetected}
        />
      </Suspense>
    </GlbLoadErrorBoundary>
  );
}
