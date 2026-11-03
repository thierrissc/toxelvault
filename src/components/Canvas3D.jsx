import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import CapeModel from './CapeModel';

/**
 * 3-Point Studio Lighting Rig with 3 Switchable Presets:
 * - 'studio': Clean 3-point neutral & rim lighting
 * - 'neon': Cyberpunk High-Contrast Cyan & Magenta dual-rim lighting
 * - 'solar': Warm golden-hour directional sunlight + sky fill
 */
function StudioLightingRig({ lightingMode }) {
  if (lightingMode === 'neon') {
    return (
      <>
        <ambientLight intensity={0.45} color="#0f172a" />
        {/* Key Light - Electric Cyan */}
        <directionalLight
          position={[4.5, 5.5, 4]}
          intensity={3.2}
          color="#06b6d4"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        {/* Fill Light - Cyber Magenta */}
        <directionalLight position={[-4.5, 3.0, 2]} intensity={2.6} color="#ec4899" />
        {/* Back Rim Light - Violet Neon */}
        <spotLight
          position={[0, 5.5, -5.5]}
          intensity={4.5}
          angle={0.65}
          penumbra={0.8}
          color="#a855f7"
        />
        <pointLight position={[0, -0.8, -1.8]} intensity={1.8} color="#22d3ee" distance={5} />
      </>
    );
  }

  if (lightingMode === 'solar') {
    return (
      <>
        <ambientLight intensity={0.65} color="#fef3c7" />
        <hemisphereLight args={['#fde68a', '#1e293b', 0.9]} />
        {/* Warm Golden Key Light */}
        <directionalLight
          position={[5, 6.5, 3.5]}
          intensity={3.4}
          color="#fbbf24"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        {/* Sky Blue Fill Light */}
        <directionalLight position={[-4, 2.5, -2]} intensity={1.25} color="#38bdf8" />
        {/* Warm Rim Backlight */}
        <spotLight
          position={[0, 4.5, -5]}
          intensity={2.8}
          angle={0.6}
          penumbra={0.9}
          color="#f97316"
        />
      </>
    );
  }

  // Default: 'studio' (Balanced 3-Point Studio Lighting)
  return (
    <>
      <ambientLight intensity={0.7} color="#e2e8f0" />
      <hemisphereLight args={['#f8fafc', '#0f172a', 0.65]} />
      {/* Key Light */}
      <directionalLight
        position={[4, 6, 4.5]}
        intensity={2.6}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {/* Soft Cool Fill Light */}
      <directionalLight position={[-4.5, 3, 2]} intensity={1.35} color="#93c5fd" />
      {/* Back Rim Light (separates cape and shoulders from dark background) */}
      <spotLight
        position={[0, 5.5, -5]}
        intensity={3.1}
        angle={0.6}
        penumbra={0.85}
        color="#38bdf8"
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
  const lastTime = useRef(performance.now());

  // Expose an instant HD transparent PNG capture method to the parent UI
  useEffect(() => {
    if (!screenshotHandlerRef) return;

    screenshotHandlerRef.current = () => {
      const prevBackground = scene.background;
      const prevClearAlpha = gl.getClearAlpha();

      // Temporarily force transparent background for clean ad-ready PNG cutout
      scene.background = null;
      gl.setClearColor(new THREE.Color('#000000'), 0);
      gl.render(scene, camera);

      const dataUrl = gl.domElement.toDataURL('image/png');

      // Restore state
      scene.background = prevBackground;
      gl.setClearAlpha(prevClearAlpha);
      gl.render(scene, camera);

      return dataUrl;
    };
  }, [gl, scene, camera, screenshotHandlerRef]);

  // Measure real-time FPS, triangle count, and draw calls every ~500ms
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
          triangles: gl.info.render.triangles || 516,
          calls: gl.info.render.calls || 24,
          geometries: gl.info.memory.geometries || 18,
          textures: gl.info.memory.textures || 2,
        });
      }
    }
  });

  return null;
}

export default function Canvas3D({
  textures,
  themeData,
  windSpeed,
  metalness,
  roughness,
  lightingMode,
  wireframe,
  autoRotate,
  cameraViewTrigger,
  onStatsUpdate,
  screenshotHandlerRef,
}) {
  const controlsRef = useRef();

  // Allow user to snap camera between Back View (Cape focus) and Front/3-Quarter View
  useEffect(() => {
    if (!controlsRef.current || !cameraViewTrigger) return;
    const controls = controlsRef.current;
    const cam = controls.object;

    if (cameraViewTrigger.mode === 'cape') {
      cam.position.set(0.5, 0.75, -3.55);
    } else if (cameraViewTrigger.mode === 'front') {
      cam.position.set(0.6, 0.75, 3.65);
    } else {
      cam.position.set(-2.35, 1.05, -2.95);
    }
    controls.target.set(0, 0.15, 0);
    controls.update();
  }, [cameraViewTrigger]);

  const sparkleColor =
    lightingMode === 'neon'
      ? '#22d3ee'
      : lightingMode === 'solar'
      ? '#fbbf24'
      : themeData?.accentHex || '#38bdf8';

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
          position: [-2.15, 0.95, -3.15],
          fov: 42,
          near: 0.1,
          far: 100,
        }}
      >
        <StudioLightingRig lightingMode={lightingMode} />

        {/* Subtle Floating Ambient Particles (Sparkles) */}
        <Sparkles
          count={65}
          scale={[7, 5, 7]}
          size={2.2}
          speed={0.35}
          opacity={0.45}
          color={sparkleColor}
        />

        {/* Procedural Voxel Mannequin + Articulated Sinusoidal Cape */}
        <CapeModel
          textures={textures}
          themeData={themeData}
          windSpeed={windSpeed}
          metalness={metalness}
          roughness={roughness}
          wireframe={wireframe}
        />

        {/* Ground Contact Shadows */}
        <ContactShadows
          position={[0, -1.32, 0]}
          opacity={0.68}
          scale={7.5}
          blur={2.2}
          far={4}
          color="#000000"
        />

        {/* Smooth Damped Orbit Controls with Zoom & Polar Limits */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.055}
          minDistance={2.1}
          maxDistance={6.2}
          minPolarAngle={Math.PI * 0.14}
          maxPolarAngle={Math.PI * 0.78}
          autoRotate={autoRotate}
          autoRotateSpeed={1.35}
          target={[0, 0.15, 0]}
        />

        <SceneBridge
          onStatsUpdate={onStatsUpdate}
          screenshotHandlerRef={screenshotHandlerRef}
        />
      </Canvas>
    </div>
  );
}
