import React, { useState, useMemo, useRef, useCallback } from 'react';
import Canvas3D from './components/Canvas3D';
import SidebarControls from './components/SidebarControls';
import InspectorModal from './components/InspectorModal';
import { DEFAULT_BUILD } from './utils/textureGenerator';

export default function App() {
  // Active PC Hardware Build populated from partsCatalog.json
  const [build, setBuild] = useState(DEFAULT_BUILD);

  // Optional local .GLB ObjectURL overrides uploaded directly in browser per category
  const [customGlbOverrides, setCustomGlbOverrides] = useState({});

  // 3D Viewport & HDRI Environment Controls (GLB Path Labels OFF by default, Neutral Studio HDRI default)
  const [envPreset, setEnvPreset] = useState('studio');
  const [showBoundingLabels, setShowBoundingLabels] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [explodedView, setExplodedView] = useState(false);

  // Camera angle preset trigger
  const [cameraViewTrigger, setCameraViewTrigger] = useState({
    mode: 'iso',
    ts: 0,
  });

  // Modal State ('closed' | 'picker' | 'details' | 'manifest')
  const [modalState, setModalState] = useState({
    mode: 'closed',
    category: 'cpu',
    item: null,
  });

  const [screenshotToast, setScreenshotToast] = useState(false);

  // Real-Time WebGL Telemetry
  const [stats, setStats] = useState({
    fps: 60,
    triangles: 0,
    calls: 0,
  });

  const screenshotHandlerRef = useRef(null);

  // Total Build Price
  const totalPrice = useMemo(() => {
    return Object.values(build).reduce(
      (acc, item) => acc + (item?.price || 0),
      0
    );
  }, [build]);

  // Select a part from partsCatalog.json and snap its .glb to the corresponding socket
  const handleSelectPart = useCallback((category, part) => {
    setBuild((prev) => ({
      ...prev,
      [category]: part,
    }));
  }, []);

  // Upload a local .glb/.gltf file from the user's computer to test a socket immediately
  const handleUploadCustomGlb = useCallback((category, file) => {
    const objectUrl = URL.createObjectURL(file);
    setCustomGlbOverrides((prev) => ({
      ...prev,
      [category]: objectUrl,
    }));
  }, []);

  // Reset build & settings to default
  const handleResetBuild = useCallback(() => {
    setBuild(DEFAULT_BUILD);
    setCustomGlbOverrides({});
    setWireframe(false);
    setExplodedView(false);
    setShowBoundingLabels(false);
  }, []);

  // Export HD Transparent PNG Screenshot
  const handleCaptureScreenshot = useCallback(() => {
    if (!screenshotHandlerRef.current) return;
    const dataUrl = screenshotHandlerRef.current();
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = `voxelcores-gltf-build.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setScreenshotToast(true);
    setTimeout(() => setScreenshotToast(false), 3200);
  }, []);

  const handleSnapCamera = useCallback((mode) => {
    setCameraViewTrigger({ mode, ts: Date.now() });
  }, []);

  return (
    <>
      <SidebarControls
        build={build}
        customGlbOverrides={customGlbOverrides}
        onUploadCustomGlb={handleUploadCustomGlb}
        onOpenPartPicker={(category) =>
          setModalState({ mode: 'picker', category, item: null })
        }
        onOpenPartDetails={(category, item) =>
          setModalState({ mode: 'details', category, item })
        }
        envPreset={envPreset}
        setEnvPreset={setEnvPreset}
        showBoundingLabels={showBoundingLabels}
        setShowBoundingLabels={setShowBoundingLabels}
        wireframe={wireframe}
        setWireframe={setWireframe}
        autoRotate={autoRotate}
        setAutoRotate={setAutoRotate}
        explodedView={explodedView}
        setExplodedView={setExplodedView}
        onSnapCamera={handleSnapCamera}
        onCaptureScreenshot={handleCaptureScreenshot}
        screenshotToast={screenshotToast}
        onOpenInspector={() =>
          setModalState({ mode: 'manifest', category: 'cpu', item: null })
        }
        onResetBuild={handleResetBuild}
        stats={stats}
        totalPrice={totalPrice}
      >
        <Canvas3D
          build={build}
          customGlbOverrides={customGlbOverrides}
          showBoundingLabels={showBoundingLabels}
          envPreset={envPreset}
          wireframe={wireframe}
          autoRotate={autoRotate}
          explodedView={explodedView}
          cameraViewTrigger={cameraViewTrigger}
          onStatsUpdate={setStats}
          screenshotHandlerRef={screenshotHandlerRef}
        />
      </SidebarControls>

      <InspectorModal
        modalState={modalState}
        onClose={() =>
          setModalState((prev) => ({ ...prev, mode: 'closed' }))
        }
        onSelectPartForBuild={handleSelectPart}
        onOpenPartDetails={(category, item) =>
          setModalState({ mode: 'details', category, item })
        }
        onBackToPicker={(category) =>
          setModalState({ mode: 'picker', category, item: null })
        }
        build={build}
        totalPrice={totalPrice}
        stats={stats}
      />
    </>
  );
}
