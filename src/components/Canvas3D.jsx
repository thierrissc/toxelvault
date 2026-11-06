import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  ContactShadows,
  Environment,
  Lightformer,
  Grid,
} from '@react-three/drei';
import { EffectComposer, N8AO } from '@react-three/postprocessing';
import * as THREE from 'three';
import CapeModel from './CapeModel';
import { DEFAULT_RGB_CONFIG } from '../utils/textureGenerator';

function StudioEnvironmentRig({ envPreset = 'studio', isPcOn = true }) {
  return (
    <>
      <ambientLight intensity={isPcOn ? 0.38 : 0.26} color="#f8fafc" />

      <directionalLight
        position={[6.5, 11.0, 7.5]}
        intensity={isPcOn ? 2.2 : 1.5}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
      />

      <spotLight
        position={[-7.0, 7.5, -5.2]}
        angle={0.65}
        penumbra={0.85}
        intensity={3.2}
        color="#cbd5e1"
        distance={22}
      />
      <directionalLight
        position={[-6.0, 5.8, 4.2]}
        intensity={1.1}
        color="#e2e8f0"
      />

      <spotLight
        position={[6.8, 1.5, -5.0]}
        angle={0.7}
        penumbra={0.9}
        intensity={2.6}
        color="#94a3b8"
        distance={22}
      />

      <Suspense fallback={null}>
        <Environment
          preset={envPreset}
          environmentIntensity={isPcOn ? 1.05 : 0.75}
          resolution={512}
        >
          <Lightformer
            form="rect"
            intensity={2.5}
            color="#ffffff"
            scale={[10, 5, 1]}
            position={[0, 9.0, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          />

          <Lightformer
            form="rect"
            intensity={1.9}
            color="#e2e8f0"
            scale={[6, 7, 1]}
            position={[-7.0, 3.5, -2.5]}
            rotation={[0, Math.PI / 2.2, 0]}
          />

          <Lightformer
            form="rect"
            intensity={1.6}
            color="#cbd5e1"
            scale={[6, 7, 1]}
            position={[7.0, 2.8, -2.5]}
            rotation={[0, -Math.PI / 2.2, 0]}
          />

          <Lightformer
            form="rect"
            intensity={1.3}
            color="#f8fafc"
            scale={[4, 6, 1]}
            position={[2.8, 3.8, 6.5]}
            target={[0, 2.1, 0]}
          />
        </Environment>
      </Suspense>
    </>
  );
}

function BuildCoresDarkGridFloor() {
  return (
    <group position={[0, 0, 0]}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial
          color="#090b0f"
          roughness={0.88}
          metalness={0.12}
        />
      </mesh>

      <Grid
        position={[0, 0.002, 0]}
        args={[40, 40]}
        cellSize={0.5}
        cellThickness={0.65}
        cellColor="#161a24"
        sectionSize={2.0}
        sectionThickness={1.15}
        sectionColor="#232938"
        fadeDistance={24}
        fadeStrength={1.35}
        infiniteGrid
      />

      <ContactShadows
        position={[0, 0.006, 0]}
        opacity={0.82}
        scale={13.5}
        blur={2.1}
        far={5.5}
        color="#000000"
      />
    </group>
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

      scene.background = new THREE.Color('#090b0f');
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
        cam.position.set(-0.15, 2.35, 6.2);
        controls.target.set(-0.15, 2.15, 0);
        break;
      case 'gpu':
        cam.position.set(0.35, 1.95, 4.2);
        controls.target.set(-0.1, 1.85, 0.35);
        break;
      case 'cpu':
        cam.position.set(0.25, 3.05, 3.8);
        controls.target.set(-0.45, 2.85, -0.1);
        break;
      case 'front':
        cam.position.set(5.8, 2.4, 3.2);
        controls.target.set(0, 2.15, 0);
        break;
      default:
        cam.position.set(4.5, 3.55, 5.75);
        controls.target.set(0, 2.1, 0);
        break;
    }
    controls.update();
  }, [cameraViewTrigger]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#090b0f]">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          preserveDrawingBuffer: true,
          alpha: false,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.16,
          powerPreference: 'high-performance',
        }}
        camera={{
          position: [4.5, 3.55, 5.75],
          fov: 40,
          near: 0.1,
          far: 120,
        }}
      >
        <color attach="background" args={['#090b0f']} />
        <fog attach="fog" args={['#090b0f', 14, 32]} />

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

        <BuildCoresDarkGridFloor />

        <EffectComposer disableNormalPass={false} multisampling={4}>
          <N8AO
            aoRadius={0.45}
            distanceFalloff={0.85}
            intensity={2.2}
            color="#030407"
            halfRes={false}
          />
        </EffectComposer>

        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          minDistance={2.2}
          maxDistance={13.0}
          minPolarAngle={Math.PI * 0.08}
          maxPolarAngle={Math.PI * 0.49}
          autoRotate={autoRotate}
          autoRotateSpeed={1.1}
          target={[0, 2.1, 0]}
        />

        <SceneBridge
          onStatsUpdate={onStatsUpdate}
          screenshotHandlerRef={screenshotHandlerRef}
        />
      </Canvas>
    </div>
  );
}
