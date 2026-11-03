import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import * as THREE from 'three';
import Canvas3D from './components/Canvas3D';
import SidebarControls from './components/SidebarControls';
import InspectorModal from './components/InspectorModal';
import {
  DEFAULT_BUILD,
  RGB_PRESETS,
  createLcdTelemetryTexture,
} from './utils/textureGenerator';

export default function App() {
  // Complete 9-component Real PC Hardware Build State
  const [build, setBuild] = useState(DEFAULT_BUILD);
  const [rgbPreset, setRgbPreset] = useState(RGB_PRESETS[0]); // Clean Studio White LEDs by default

  // Real-time interactive 3D case & shader controls
  const [fanRpmFactor, setFanRpmFactor] = useState(2.2);
  const [metalness, setMetalness] = useState(0.68);
  const [roughness, setRoughness] = useState(0.32);
  const [lightingMode, setLightingMode] = useState('studio');
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [explodedView, setExplodedView] = useState(false);
  const [glassOpen, setGlassOpen] = useState(false);

  // Optional custom image for AIO LCD & GPU Backplate
  const [customLogoImg, setCustomLogoImg] = useState(null);
  const [customBackplateTex, setCustomBackplateTex] = useState(null);
  const [customLogoName, setCustomLogoName] = useState('');

  // Camera angle preset trigger
  const [cameraViewTrigger, setCameraViewTrigger] = useState({
    mode: 'iso',
    ts: 0,
  });

  // BuildCores-Style Modal State ('closed' | 'picker' | 'details' | 'manifest')
  const [modalState, setModalState] = useState({
    mode: 'closed',
    category: 'cpu',
    item: null,
  });

  const [screenshotToast, setScreenshotToast] = useState(false);

  // Real-Time WebGL Telemetry
  const [stats, setStats] = useState({
    fps: 60,
    triangles: 3840,
    calls: 74,
  });

  const screenshotHandlerRef = useRef(null);

  // Calculate Total Build Price, Wattage & Realistic CPU/GPU Temps
  const { totalPrice, totalWattage, cpuTemp, gpuTemp } = useMemo(() => {
    const items = Object.values(build);
    const price = items.reduce((acc, item) => acc + (item.price || 0), 0);
    const watts = items.reduce((acc, item) => acc + (item.wattage || 0), 0);

    const coolingBonus =
      Math.round(fanRpmFactor * 2.0) +
      (build.cooler.type === 'aio_360' ? 9 : 4);
    const cTemp = Math.max(
      32,
      Math.round(45 + build.cpu.wattage * 0.075 - coolingBonus)
    );
    const gTemp = Math.max(
      36,
      Math.round(47 + build.gpu.wattage * 0.035 - coolingBonus * 0.8)
    );

    return {
      totalPrice: price,
      totalWattage: watts,
      cpuTemp: cTemp,
      gpuTemp: gTemp,
    };
  }, [build, fanRpmFactor]);

  // Generate Live NZXT/LianLi AIO LCD & PSU OLED CanvasTexture
  const lcdTexture = useMemo(() => {
    return createLcdTelemetryTexture({
      cpuTemp,
      gpuTemp,
      wattage: totalWattage,
      primaryColor: rgbPreset.primary,
      secondaryColor: rgbPreset.secondary,
      customLogoImg,
    });
  }, [cpuTemp, gpuTemp, totalWattage, rgbPreset, customLogoImg]);

  useEffect(() => {
    return () => {
      lcdTexture?.dispose?.();
    };
  }, [lcdTexture]);

  // Select a part and update the 3D rig immediately
  const handleSelectPart = useCallback((category, part) => {
    setBuild((prev) => ({
      ...prev,
      [category]: part,
    }));
  }, []);

  // Upload custom image (.png / .jpg) for GPU Backplate & AIO LCD Screen
  const handleUploadCustomTexture = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const tex = new THREE.Texture(img);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        setCustomLogoImg(img);
        setCustomBackplateTex(tex);
        setCustomLogoName(file.name);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }, []);

  // Reset build & settings to default
  const handleResetBuild = useCallback(() => {
    setBuild(DEFAULT_BUILD);
    setRgbPreset(RGB_PRESETS[0]);
    setFanRpmFactor(2.2);
    setMetalness(0.68);
    setRoughness(0.32);
    setWireframe(false);
    setExplodedView(false);
    setGlassOpen(false);
    setCustomLogoImg(null);
    setCustomBackplateTex(null);
    setCustomLogoName('');
  }, []);

  // Export HD Transparent PNG Screenshot of the 3D PC Rig
  const handleCaptureScreenshot = useCallback(() => {
    if (!screenshotHandlerRef.current) return;
    const dataUrl = screenshotHandlerRef.current();
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = `voxelcores-3d-pc-build.png`;
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
        onOpenPartPicker={(category) =>
          setModalState({ mode: 'picker', category, item: null })
        }
        onOpenPartDetails={(category, item) =>
          setModalState({ mode: 'details', category, item })
        }
        rgbPreset={rgbPreset}
        setRgbPreset={setRgbPreset}
        fanRpmFactor={fanRpmFactor}
        setFanRpmFactor={setFanRpmFactor}
        metalness={metalness}
        setMetalness={setMetalness}
        roughness={roughness}
        setRoughness={setRoughness}
        lightingMode={lightingMode}
        setLightingMode={setLightingMode}
        wireframe={wireframe}
        setWireframe={setWireframe}
        autoRotate={autoRotate}
        setAutoRotate={setAutoRotate}
        explodedView={explodedView}
        setExplodedView={setExplodedView}
        glassOpen={glassOpen}
        setGlassOpen={setGlassOpen}
        customLogoName={customLogoName}
        onUploadCustomTexture={handleUploadCustomTexture}
        onSnapCamera={handleSnapCamera}
        onCaptureScreenshot={handleCaptureScreenshot}
        screenshotToast={screenshotToast}
        onOpenInspector={() =>
          setModalState({ mode: 'manifest', category: 'cpu', item: null })
        }
        onResetBuild={handleResetBuild}
        stats={stats}
        totalPrice={totalPrice}
        totalWattage={totalWattage}
        cpuTemp={cpuTemp}
        gpuTemp={gpuTemp}
      >
        <Canvas3D
          build={build}
          lcdTexture={lcdTexture}
          customBackplateTex={customBackplateTex}
          rgbPreset={rgbPreset}
          fanRpmFactor={fanRpmFactor}
          metalness={metalness}
          roughness={roughness}
          lightingMode={lightingMode}
          wireframe={wireframe}
          autoRotate={autoRotate}
          explodedView={explodedView}
          glassOpen={glassOpen}
          focusedCategory={modalState.category}
          cameraViewTrigger={cameraViewTrigger}
          onStatsUpdate={setStats}
          screenshotHandlerRef={screenshotHandlerRef}
        />
      </SidebarControls>

      {/* BuildCores Part Picker Modal, Part Details Modal & Export Modal */}
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
        totalWattage={totalWattage}
        stats={stats}
      />
    </>
  );
}
