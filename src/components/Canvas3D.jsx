import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';
import CapeModel from './CapeModel';

/**
 * Studio Lighting + HDRI <Environment /> for realistic metallic & glass reflections on .GLB models
 */
function StudioEnvironmentRig({ envPreset = 'city' }) {
  return (
    <>
      <ambientLight intensity={0.65} color="#f8fafc" />
      <directionalLight
        position={[4.5, 6.0, 5.0]}
        intensity={2.2}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-4.0, 3.0, 3.0]} intensity={1.1} color="#cbd5e1" />
      <Suspense fallback={null}>
        <Environment preset={envPreset} />
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
  envPreset = 'city',
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
          position: [2.35, 0.85, 3.25],
          fov: 40,
          near: 0.1,
          far: 100,
        }}
      >
        <StudioEnvironmentRig envPreset={envPreset} />

        {/* Real GLTF/GLB Socket Assembly with Missing-GLB Wireframe BoundingBox Fallback */}
        <CapeModel
          build={build}
          customGlbOverrides={customGlbOverrides}
          showBoundingLabels={showBoundingLabels}
          wireframe={wireframe}
          explodedView={explodedView}
        />

        {/* Soft Studio Contact Shadows */}
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
