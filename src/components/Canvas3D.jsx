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
import { DEFAULT_RGB_CONFIG } from '../utils/textureGenerator';

function StudioEnvironmentRig({ envPreset = 'studio', isPcOn = true }) {
  return (
    <>
      <ambientLight intensity={isPcOn ? 0.35 : 0.25} color="#f8fafc" />

      <directionalLight
        position={[6.5, 9.0, 7.5]}
        intensity={isPcOn ? 2.1 : 1.5}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
      />

      <spotLight
        position={[-7.0, 5.5, -5.2]}
        angle={0.65}
        penumbra={0.85}
        intensity={3.6}
        color="#38bdf8"
        distance={20}
      />
      <directionalLight
        position={[-6.0, 3.8, 4.2]}
        intensity={1.2}
        color="#7dd3fc"
      />

      <spotLight
        position={[6.8, -2.5, -5.0]}
        angle={0.7}
        penumbra={0.9}
        intensity={3.2}
        color="#fb923c"
        distance={20}
      />

      <Suspense fallback={null}>
        <Environment preset={envPreset} environmentIntensity={isPcOn ? 1.05 : 0.75} resolution={512}>
          <Lightformer
            form="rect"
            intensity={2.4}
            color="#ffffff"
            scale={[9, 4.5, 1]}
            position={[0, 7.0, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          />

          <Lightformer
            form="rect"
            intensity={2.0}
            color="#bae6fd"
            scale={[6, 7, 1]}
            position={[-7.0, 1.5, -2.5]}
            rotation={[0, Math.PI / 2.2, 0]}
          />

          <Lightformer
            form="rect"
            intensity={1.7}
            color="#fed7aa"
            scale={[6, 7, 1]}
            position={[7.0, 0.8, -2.5]}
            rotation={[0, -Math.PI / 2.2, 0]}
          />

          <Lightformer
            form="rect"
            intensity={1.2}
            color="#f8fafc"
            scale={[4, 6, 1]}
            position={[2.8, 1.8, 6.5]}
            target={[0, 0, 0]}
          />
        </Environment>
      </Suspense>
    </>
  );
}

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
  showGlass = true,
  isPcOn = true,
  rgbConfig = DEFAULT_RGB_CONFIG,
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
        cam.position.set(-0.15, 0.2, 6.2);
        controls.target.set(-0.15, 0.05, 0);
        break;
      case 'gpu':
        cam.position.set(0.35, -0.15, 4.2);
        controls.target.set(-0.1, -0.2, 0.35);
        break;
      case 'cpu':
        cam.position.set(0.25, 0.95, 3.8);
        controls.target.set(-0.45, 0.78, -0.1);
        break;
      case 'front':
        cam.position.set(5.8, 0.3, 3.2);
        controls.target.set(0, 0.05, 0);
        break;
      default:
        cam.position.set(4.3, 1.45, 5.65);
        controls.target.set(0, 0.05, 0);
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
          position: [4.3, 1.45, 5.65],
          fov: 40,
          near: 0.1,
          far: 120,
        }}
      >
        <StudioEnvironmentRig envPreset={envPreset} isPcOn={isPcOn} />

        <CapeModel
          build={build}
          customGlbOverrides={customGlbOverrides}
          showBoundingLabels={showBoundingLabels}
          wireframe={wireframe}
          explodedView={explodedView}
          showGlass={showGlass}
          isPcOn={isPcOn}
          rgbConfig={rgbConfig}
        />

        <EffectComposer disableNormalPass={false} multisampling={4}>
          <N8AO
            aoRadius={0.45}
            distanceFalloff={0.85}
            intensity={2.4}
            color="#030407"
            halfRes={false}
          />
        </EffectComposer>

        <ContactShadows
          position={[0, -2.35, 0]}
          opacity={0.78}
          scale={14.0}
          blur={2.2}
          far={6.5}
          color="#000000"
        />

        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          minDistance={2.2}
          maxDistance={12.0}
          minPolarAngle={Math.PI * 0.1}
          maxPolarAngle={Math.PI * 0.85}
          autoRotate={autoRotate}
          autoRotateSpeed={1.1}
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
