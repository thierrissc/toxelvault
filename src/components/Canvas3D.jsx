import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import CapeModel from './CapeModel';

/**
 * Clean, Neutral 3-Point Hardware Studio Lighting (BuildCores style)
 * No oversaturated neon wash — highlights brushed aluminum, PCB details & clear glass.
 */
function StudioLightingRig({ lightingMode, rgbPreset }) {
  const primaryHex = rgbPreset?.primary || '#e2e8f0';

  if (lightingMode === 'darkroom') {
    return (
      <>
        <ambientLight intensity={0.45} color="#cbd5e1" />
        <directionalLight
          position={[4.5, 5.5, 4.5]}
          intensity={2.2}
          color="#f8fafc"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-4.5, 3.0, 2.5]} intensity={1.1} color="#94a3b8" />
        <pointLight
          position={[-0.1, 0.25, 0.15]}
          intensity={1.4}
          color={primaryHex}
          distance={3.0}
        />
      </>
    );
  }

  if (lightingMode === 'warm') {
    return (
      <>
        <ambientLight intensity={0.85} color="#f8fafc" />
        <hemisphereLight args={['#fef3c7', '#1e293b', 0.85]} />
        <directionalLight
          position={[5, 6.5, 4.5]}
          intensity={2.8}
          color="#fde68a"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-4, 2.5, 2]} intensity={1.2} color="#cbd5e1" />
        <pointLight
          position={[-0.1, 0.25, 0.15]}
          intensity={1.1}
          color={primaryHex}
          distance={3.0}
        />
      </>
    );
  }

  // Default: 'studio' (High-Clarity Neutral Product Studio Lighting)
  return (
    <>
      <ambientLight intensity={0.95} color="#f8fafc" />
      <hemisphereLight args={['#ffffff', '#1e293b', 0.85]} />
      <directionalLight
        position={[4.2, 6, 5.2]}
        intensity={2.7}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-4.5, 3, 3.5]} intensity={1.5} color="#e2e8f0" />
      <spotLight
        position={[0, 5.5, -4.5]}
        intensity={1.8}
        angle={0.6}
        penumbra={0.85}
        color="#cbd5e1"
      />
      {/* Subtle Internal Case Fill so Motherboard, GPU & Cooler are always clearly visible */}
      <pointLight
        position={[-0.1, 0.2, 0.25]}
        intensity={1.25}
        color={primaryHex}
        distance={3.2}
      />
    </>
  );
}

/**
 * Telemetry & HD Screenshot Bridge inside the R3F Context
 */
function SceneBridge({ onStatsUpdate, screenshotHandlerRef }) {
  const { gl, scene, camera } = useThree();
  const frameCount = useRef(0);
  const lastTime = useRef(0);

  useEffect(() => {
    lastTime.current = performance.now();
    if (!screenshotHandlerRef) return;

    screenshotHandlerRef.current = () => {
      const prevBackground = scene.background;
      const prevClearAlpha = gl.getClearAlpha();

      scene.background = null;
      gl.setClearColor(new THREE.Color('#000000'), 0);
      gl.render(scene, camera);

      const dataUrl = gl.domElement.toDataURL('image/png');

      scene.background = prevBackground;
      gl.setClearAlpha(prevClearAlpha);
      gl.render(scene, camera);

      return dataUrl;
    };
  }, [gl, scene, camera, screenshotHandlerRef]);

  useFrame(() => {
    frameCount.current += 1;
    const now = performance.now();
    const elapsed = now - lastTime.current;

    if (elapsed >= 500) {
      const fps = Math.min(144, Math.round((frameCount.current * 1000) / elapsed));
      frameCount.current = 0;
      lastTime.current = now;

      if (onStatsUpdate) {
        onStatsUpdate({
          fps,
          triangles: gl.info.render.triangles || 3840,
          calls: gl.info.render.calls || 74,
        });
      }
    }
  });

  return null;
}

export default function Canvas3D({
  build,
  lcdTexture,
  customBackplateTex,
  rgbPreset,
  fanRpmFactor,
  metalness,
  roughness,
  lightingMode,
  wireframe,
  autoRotate,
  explodedView,
  glassOpen,
  focusedCategory,
  cameraViewTrigger,
  onStatsUpdate,
  screenshotHandlerRef,
}) {
  const controlsRef = useRef();

  useEffect(() => {
    if (!controlsRef.current || !cameraViewTrigger) return;
    const controls = controlsRef.current;
    const cam = controls.object;

    switch (cameraViewTrigger.mode) {
      case 'side':
        cam.position.set(-0.08, 0.12, 3.45);
        controls.target.set(-0.08, 0.05, 0);
        break;
      case 'gpu':
        cam.position.set(0.25, -0.05, 2.25);
        controls.target.set(-0.22, -0.02, 0.1);
        break;
      case 'cpu':
        cam.position.set(0.2, 0.52, 2.05);
        controls.target.set(-0.18, 0.42, -0.05);
        break;
      case 'front':
        cam.position.set(3.25, 0.2, 1.75);
        controls.target.set(0, 0.05, 0);
        break;
      default:
        cam.position.set(2.25, 0.75, 3.15);
        controls.target.set(0, 0.02, 0);
        break;
    }
    controls.update();
  }, [cameraViewTrigger]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#101216]">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          preserveDrawingBuffer: true,
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        camera={{
          position: [2.25, 0.75, 3.15],
          fov: 40,
          near: 0.1,
          far: 100,
        }}
      >
        <StudioLightingRig lightingMode={lightingMode} rgbPreset={rgbPreset} />

        {/* Complete 3D Modular PC Hardware Rig */}
        <CapeModel
          build={build}
          lcdTexture={lcdTexture}
          customBackplateTex={customBackplateTex}
          rgbPreset={rgbPreset}
          fanRpmFactor={fanRpmFactor}
          metalness={metalness}
          roughness={roughness}
          wireframe={wireframe}
          explodedView={explodedView}
          glassOpen={glassOpen}
          focusedCategory={focusedCategory}
        />

        {/* Soft Studio Floor Shadow */}
        <ContactShadows
          position={[0, -1.42, 0]}
          opacity={0.65}
          scale={8.0}
          blur={2.4}
          far={4.5}
          color="#000000"
        />

        {/* Smooth Damped OrbitControls */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          minDistance={1.55}
          maxDistance={6.2}
          minPolarAngle={Math.PI * 0.12}
          maxPolarAngle={Math.PI * 0.82}
          autoRotate={autoRotate}
          autoRotateSpeed={1.1}
          target={[0, 0.02, 0]}
        />

        <SceneBridge
          onStatsUpdate={onStatsUpdate}
          screenshotHandlerRef={screenshotHandlerRef}
        />
      </Canvas>
    </div>
  );
}
