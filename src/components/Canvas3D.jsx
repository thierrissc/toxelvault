import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  ContactShadows,
  Environment,
  Lightformer,
} from '@react-three/drei';
import { EffectComposer, N8AO } from '@react-three/postprocessing';
import * as THREE from 'three';
import CapeModel from './CapeModel';

/**
 * Industrial Studio Lighting Rig + Neutral Studio HDRI Environment + Cool & Warm Rim Lights
 * Configured for realistic specular highlights on brushed aluminum, copper heatpipes, and tempered glass.
 */
function StudioEnvironmentRig({ envPreset = 'studio' }) {
  return (
    <>
      {/* Subtle neutral studio ambient fill */}
      <ambientLight intensity={0.4} color="#f8fafc" />

      {/* Primary Key Studio Softbox Light */}
      <directionalLight
        position={[4.2, 6.2, 5.2]}
        intensity={2.4}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
      />

      {/* Cool Rim Light (Back-Left / Top Edge Highlight for angular case & heatsink contours) */}
      <spotLight
        position={[-4.8, 3.8, -3.6]}
        angle={0.65}
        penumbra={0.85}
        intensity={4.2}
        color="#38bdf8"
        distance={14}
      />
      <directionalLight
        position={[-4.2, 2.4, 2.8]}
        intensity={1.35}
        color="#7dd3fc"
      />

      {/* Warm Rim Light (Back-Right / Lower Edge Highlight for copper heatpipes & chamfered shrouds) */}
      <spotLight
        position={[4.6, -1.8, -3.4]}
        angle={0.7}
        penumbra={0.9}
        intensity={3.6}
        color="#fb923c"
        distance={14}
      />
      <pointLight
        position={[2.8, -1.2, 2.6]}
        intensity={1.1}
        color="#fde68a"
        distance={8}
      />

      {/* Neutral Studio HDRI / Room Environment with Procedural Studio Softbox Lightformers */}
      <Suspense fallback={null}>
        <Environment preset={envPreset} environmentIntensity={1.15} resolution={512}>
          {/* Overhead neutral studio softbox */}
          <Lightformer
            form="rect"
            intensity={2.8}
            color="#ffffff"
            scale={[6, 3, 1]}
            position={[0, 4.5, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          />
          {/* Left cool metallic reflection strip */}
          <Lightformer
            form="rect"
            intensity={2.2}
            color="#bae6fd"
            scale={[4, 5, 1]}
            position={[-4.5, 1.0, -1.5]}
            rotation={[0, Math.PI / 2.2, 0]}
          />
          {/* Right warm industrial reflection strip */}
          <Lightformer
            form="rect"
            intensity={1.9}
            color="#fed7aa"
            scale={[4, 5, 1]}
            position={[4.5, 0.5, -1.5]}
            rotation={[0, -Math.PI / 2.2, 0]}
          />
          {/* Front subtle glass catchlight bar */}
          <Lightformer
            form="rect"
            intensity={1.4}
            color="#f8fafc"
            scale={[2.5, 4, 1]}
            position={[1.8, 1.2, 4.2]}
            target={[0, 0, 0]}
          />
        </Environment>
      </Suspense>
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
          triangles: gl.info.render.triangles || 0,
          calls: gl.info.render.calls || 0,
        });
      }
    }
  });

  return null;
}

export default function Canvas3D({
  build,
  customGlbOverrides,
  showBoundingLabels,
  envPreset = 'studio',
  wireframe,
  autoRotate,
  explodedView,
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
        controls.target.set(-0.2, -0.02, 0.1);
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
        cam.position.set(2.35, 0.85, 3.25);
        controls.target.set(0, 0.02, 0);
        break;
    }
    controls.update();
  }, [cameraViewTrigger]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0c0e13]">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          preserveDrawingBuffer: true,
          alpha: true,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.18,
          powerPreference: 'high-performance',
        }}
        camera={{
          position: [2.35, 0.85, 3.25],
          fov: 40,
          near: 0.1,
          far: 100,
        }}
      >
        <StudioEnvironmentRig envPreset={envPreset} />

        {/* Real GLTF/GLB Socket Assembly with Photorealistic Industrial PBR Fallback */}
        <CapeModel
          build={build}
          customGlbOverrides={customGlbOverrides}
          showBoundingLabels={showBoundingLabels}
          wireframe={wireframe}
          explodedView={explodedView}
        />

        {/* Lightweight Ambient Occlusion (N8AO) for realistic contact shadows between slots, fins & connectors */}
        <EffectComposer disableNormalPass={false} multisampling={4}>
          <N8AO
            aoRadius={0.32}
            distanceFalloff={0.85}
            intensity={2.4}
            color="#030407"
            halfRes={false}
          />
        </EffectComposer>

        {/* Ground Studio Contact Shadows */}
        <ContactShadows
          position={[0, -1.42, 0]}
          opacity={0.75}
          scale={8.0}
          blur={2.1}
          far={4.5}
          color="#000000"
        />

        {/* Smooth Damped OrbitControls */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          minDistance={1.4}
          maxDistance={6.5}
          minPolarAngle={Math.PI * 0.1}
          maxPolarAngle={Math.PI * 0.85}
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
