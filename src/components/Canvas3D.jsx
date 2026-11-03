import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import CapeModel from './CapeModel';

/**
 * 3-Point Studio Lighting Rig with 3 Switchable Presets + Internal Case PointLight
 */
function StudioLightingRig({ lightingMode, rgbPreset }) {
  const primaryHex = rgbPreset?.primary || '#06b6d4';
  const secondaryHex = rgbPreset?.secondary || '#ec4899';

  if (lightingMode === 'neon') {
    return (
      <>
        <ambientLight intensity={0.5} color="#0f172a" />
        <directionalLight
          position={[4.5, 5.5, 4.5]}
          intensity={3.0}
          color={primaryHex}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight
          position={[-4.5, 3.0, 2.5]}
          intensity={2.4}
          color={secondaryHex}
        />
        <spotLight
          position={[0, 5.5, -5.0]}
          intensity={3.8}
          angle={0.65}
          penumbra={0.8}
          color="#a855f7"
        />
        {/* Internal PC Case Motherboard Chamber Glow */}
        <pointLight
          position={[-0.1, 0.25, 0.1]}
          intensity={2.4}
          color={primaryHex}
          distance={3.2}
        />
      </>
    );
  }

  if (lightingMode === 'solar') {
    return (
      <>
        <ambientLight intensity={0.75} color="#fef3c7" />
        <hemisphereLight args={['#fde68a', '#1e293b', 0.95]} />
        <directionalLight
          position={[5, 6.5, 4.5]}
          intensity={3.2}
          color="#fbbf24"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-4, 2.5, 2]} intensity={1.3} color="#38bdf8" />
        <pointLight
          position={[-0.1, 0.25, 0.1]}
          intensity={1.5}
          color={primaryHex}
          distance={3.0}
        />
      </>
    );
  }

  // Default: 'studio' (Balanced 3-Point Hardware Showcase Lighting)
  return (
    <>
      <ambientLight intensity={0.8} color="#e2e8f0" />
      <hemisphereLight args={['#f8fafc', '#0f172a', 0.75]} />
      <directionalLight
        position={[4.2, 6, 5.0]}
        intensity={2.6}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-4.5, 3, 3]} intensity={1.45} color="#93c5fd" />
      <spotLight
        position={[0, 5.5, -4.5]}
        intensity={2.8}
        angle={0.6}
        penumbra={0.85}
        color={primaryHex}
      />
      {/* Internal Case Chamber ARGB Fill */}
      <pointLight
        position={[-0.1, 0.25, 0.15]}
        intensity={1.8}
        color={primaryHex}
        distance={3.0}
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
          triangles: gl.info.render.triangles || 3420,
          calls: gl.info.render.calls || 68,
          geometries: gl.info.memory.geometries || 42,
          textures: gl.info.memory.textures || 4,
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

  // Snap camera to inspect specific hardware parts or overall PC views
  useEffect(() => {
    if (!controlsRef.current || !cameraViewTrigger) return;
    const controls = controlsRef.current;
    const cam = controls.object;

    switch (cameraViewTrigger.mode) {
      case 'side':
        // Direct view into the tempered glass side window
        cam.position.set(-0.1, 0.15, 3.65);
        controls.target.set(-0.1, 0.05, 0);
        break;
      case 'gpu':
        // Close-up on GPU & Motherboard PCIe slot
        cam.position.set(0.35, -0.05, 2.35);
        controls.target.set(-0.18, 0.02, 0.05);
        break;
      case 'cpu':
        // Close-up on CPU Socket, AIO LCD & DDR5 RAM
        cam.position.set(0.25, 0.55, 2.15);
        controls.target.set(-0.15, 0.42, -0.2);
        break;
      case 'front':
        // Front panoramic glass / intake fans view
        cam.position.set(3.4, 0.25, 1.85);
        controls.target.set(0, 0.05, 0);
        break;
      default:
        // 3/4 Isometric Showcase View
        cam.position.set(2.45, 0.85, 3.35);
        controls.target.set(0, 0.05, 0);
        break;
    }
    controls.update();
  }, [cameraViewTrigger]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
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
          position: [2.45, 0.85, 3.35],
          fov: 42,
          near: 0.1,
          far: 100,
        }}
      >
        <StudioLightingRig lightingMode={lightingMode} rgbPreset={rgbPreset} />

        {/* Subtle Floating Ambient Dust/Cyber Particles */}
        <Sparkles
          count={65}
          scale={[7.5, 5.5, 7.5]}
          size={2.1}
          speed={0.35}
          opacity={0.42}
          color={rgbPreset?.primary || '#22d3ee'}
        />

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

        {/* Ground Contact Shadows */}
        <ContactShadows
          position={[0, -1.42, 0]}
          opacity={0.72}
          scale={8.5}
          blur={2.3}
          far={4.5}
          color="#000000"
        />

        {/* Smooth Damped OrbitControls */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.055}
          minDistance={1.65}
          maxDistance={6.8}
          minPolarAngle={Math.PI * 0.12}
          maxPolarAngle={Math.PI * 0.8}
          autoRotate={autoRotate}
          autoRotateSpeed={1.25}
          target={[0, 0.05, 0]}
        />

        <SceneBridge
          onStatsUpdate={onStatsUpdate}
          screenshotHandlerRef={screenshotHandlerRef}
        />
      </Canvas>
    </div>
  );
}
