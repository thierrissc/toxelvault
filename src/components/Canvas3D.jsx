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

function StudioEnvironmentRig({ envPreset = 'studio' }) {
  return (
    <>
      <ambientLight intensity={0.12} color="#e2e8f0" />

      <directionalLight
        position={[6.5, 11.0, 7.5]}
        intensity={1.15}
        color="#f8fafc"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.02}
      />

      <directionalLight
        position={[-6.0, 5.8, 4.2]}
        intensity={0.35}
        color="#cbd5e1"
      />

      <spotLight
        position={[-7.0, 7.5, -5.2]}
        angle={0.6}
        penumbra={0.9}
        intensity={1.2}
        color="#94a3b8"
        distance={22}
      />

      <Suspense fallback={null}>
        <Environment
          preset={envPreset}
          environmentIntensity={0.45}
          resolution={256}
        >
          <Lightformer
            form="rect"
            intensity={0.9}
            color="#e5e7eb"
            scale={[10, 5, 1]}
            position={[0, 9.0, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          />
          <Lightformer
            form="rect"
            intensity={0.6}
            color="#cbd5e1"
            scale={[6, 7, 1]}
            position={[-7.0, 3.5, -2.5]}
            rotation={[0, Math.PI / 2.2, 0]}
          />
          <Lightformer
            form="rect"
            intensity={0.45}
            color="#94a3b8"
            scale={[6, 7, 1]}
            position={[7.0, 2.8, -2.5]}
            rotation={[0, -Math.PI / 2.2, 0]}
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
  showAirflow = false,
  showDisplays = true,
  showCaseFans = true,
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
          toneMappingExposure: 0.85,
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

        <StudioEnvironmentRig envPreset={envPreset} />

        <CapeModel
          build={build}
          customGlbOverrides={customGlbOverrides}
          showBoundingLabels={showBoundingLabels}
          wireframe={wireframe}
          explodedView={explodedView}
          showGlass={showGlass}
          isPcOn={isPcOn}
          showAirflow={showAirflow}
          showDisplays={showDisplays}
          showCaseFans={showCaseFans}
          rgbConfig={rgbConfig}
        />

        <BuildCoresDarkGridFloor />

        <EffectComposer disableNormalPass={false} multisampling={4}>
          <N8AO
            aoRadius={0.35}
            distanceFalloff={0.6}
            intensity={4.0}
            aoSamples={16}
            denoiseSamples={8}
            color="#000000"
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
