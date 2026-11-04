import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import Canvas3D from './components/Canvas3D';
import SidebarControls from './components/SidebarControls';
import InspectorModal from './components/InspectorModal';
import { DEFAULT_BUILD, HARDWARE_CATALOG } from './utils/textureGenerator';
import {
  preloadAllHardwareCategories,
  clearHardwareDatasetCache,
} from './utils/hardwareCatalogAdapter';

export default function App() {

  const [build, setBuild] = useState(DEFAULT_BUILD);

  const [catalogByCategory, setCatalogByCategory] = useState(HARDWARE_CATALOG);
  const [datasetStatus, setDatasetStatus] = useState({
    loading: true,
    source: 'github-cdn',
    loadedCategories: 0,
    totalCategories: 8,
    totalNormalizedCount: Object.values(HARDWARE_CATALOG).reduce(
      (acc, list) => acc + list.length,
      0
    ),
    totalRawRecords: 0,
  });

  const [customGlbOverrides, setCustomGlbOverrides] = useState({});

  const [envPreset, setEnvPreset] = useState('studio');
  const [showBoundingLabels, setShowBoundingLabels] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [explodedView, setExplodedView] = useState(false);

  const [cameraViewTrigger, setCameraViewTrigger] = useState({
    mode: 'iso',
    ts: 0,
  });

  const [modalState, setModalState] = useState({
    mode: 'closed',
    category: 'cpu',
    item: null,
  });

  const [screenshotToast, setScreenshotToast] = useState(false);

  const [stats, setStats] = useState({
    fps: 60,
    triangles: 0,
    calls: 0,
  });

  const screenshotHandlerRef = useRef(null);

  const handleRefreshDataset = useCallback(async () => {
    setDatasetStatus((prev) => ({ ...prev, loading: true }));
    await clearHardwareDatasetCache();

    const result = await preloadAllHardwareCategories({
      forceRefresh: true,
      onProgress: ({ loadedCount, totalCategories, source }) => {
        setDatasetStatus((prev) => ({
          ...prev,
          loadedCategories: loadedCount,
          totalCategories,
          source,
        }));
      },
    });

    setCatalogByCategory(result.catalogByCat);
    setDatasetStatus({
      loading: false,
      source: result.source || 'github-cdn',
      loadedCategories: 8,
      totalCategories: 8,
      totalNormalizedCount: result.totalNormalizedCount,
      totalRawRecords: result.totalRawRecords,
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    preloadAllHardwareCategories({
      forceRefresh: false,
      onProgress: ({ loadedCount, totalCategories, source }) => {
        if (!isMounted) return;
        setDatasetStatus((prev) => ({
          ...prev,
          loadedCategories: loadedCount,
          totalCategories,
          source,
        }));
      },
    }).then((result) => {
      if (!isMounted) return;
      setCatalogByCategory(result.catalogByCat);
      setDatasetStatus({
        loading: false,
        source: result.source || 'github-cdn',
        loadedCategories: 8,
        totalCategories: 8,
        totalNormalizedCount: result.totalNormalizedCount,
        totalRawRecords: result.totalRawRecords,
      });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalPrice = useMemo(() => {
    return Object.values(build).reduce(
      (acc, item) => acc + (item?.price || 0),
      0
    );
  }, [build]);

  const handleSelectPart = useCallback((category, part) => {
    setBuild((prev) => ({
      ...prev,
      [category]: part,
    }));
  }, []);

  const handleUploadCustomGlb = useCallback((category, file) => {
    const objectUrl = URL.createObjectURL(file);
    setCustomGlbOverrides((prev) => ({
      ...prev,
      [category]: objectUrl,
    }));
  }, []);

  const handleResetBuild = useCallback(() => {
    setBuild(DEFAULT_BUILD);
    setCustomGlbOverrides({});
    setWireframe(false);
    setExplodedView(false);
    setShowBoundingLabels(false);
  }, []);

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
        catalogByCategory={catalogByCategory}
        datasetStatus={datasetStatus}
        onRefreshDataset={handleRefreshDataset}
        onSelectPart={handleSelectPart}
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
        catalogByCategory={catalogByCategory}
        datasetStatus={datasetStatus}
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
