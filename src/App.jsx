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
  // Complete 8-component PC Hardware Build State
  const [build, setBuild] = useState(DEFAULT_BUILD);
  const [activeCategory, setActiveCategory] = useState('gpu');
  const [rgbPreset, setRgbPreset] = useState(RGB_PRESETS[0]);

  // Real-time interactive 3D case & shader controls
  const [fanRpmFactor, setFanRpmFactor] = useState(2.4);
  const [metalness, setMetalness] = useState(0.75);
  const [roughness, setRoughness] = useState(0.24);
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

  // UI Modals & Mobile Tabs
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [screenshotToast, setScreenshotToast] = useState(false);
  const [mobileTab, setMobileTab] = useState('none');

  // Real-Time WebGL Telemetry
  const [stats, setStats] = useState({
    fps: 60,
    triangles: 3420,
    calls: 68,
    geometries: 42,
    textures: 4,
  });

  const screenshotHandlerRef = useRef(null);

  // Calculate Total Build Price & Wattage
  const { totalPrice, totalWattage, cpuTemp, gpuTemp } = useMemo(() => {
    const items = Object.values(build);
    const price = items.reduce((acc, item) => acc + (item.price || 0), 0);
    const watts = items.reduce((acc, item) => acc + (item.wattage || 0), 0);

    // Calculate realistic CPU & GPU temps based on cooler capacity & fan RPM
    const coolingBonus = Math.round(fanRpmFactor * 2.2) + (build.cooler.type === 'aio_360' ? 8 : 3);
    const cTemp = Math.max(31, Math.round(44 + build.cpu.wattage * 0.08 - coolingBonus));
    const gTemp = Math.max(35, Math.round(46 + build.gpu.wattage * 0.045 - coolingBonus * 0.8));

    return {
      totalPrice: price,
      totalWattage: watts,
      cpuTemp: cTemp,
      gpuTemp: gTemp,
    };
  }, [build, fanRpmFactor]);

  // Generate Live AIO LCD & PSU OLED CanvasTexture whenever telemetry or RGB changes
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

  // Select a part in a category & smoothly focus camera if helpful
  const handleSelectPart = useCallback((category, part) => {
    setBuild((prev) => ({
      ...prev,
      [category]: part,
    }));
  }, []);

  // Upload custom image (.png / .jpg) for GPU Backplate & AIO Pump LCD Screen
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

  // Reset build & visual settings to default flagship rig
  const handleResetBuild = useCallback(() => {
    setBuild(DEFAULT_BUILD);
    setRgbPreset(RGB_PRESETS[0]);
    setFanRpmFactor(2.4);
    setMetalness(0.75);
    setRoughness(0.24);
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
    link.download = `voxelvault-pc-build-3d-hd.png`;
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
    <main className="relative w-screen h-screen overflow-hidden bg-[#090A0F] select-none">
      {/* Dynamic Ambient Radial Background Glow synchronized with PC ARGB */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${rgbPreset.primary}22 0%, ${rgbPreset.secondary}12 38%, #090A0F 80%)`,
        }}
      />

      {/* Subtle Cyber Engineering Grid */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Central Fullscreen 3D PC Viewport (100vw x 100vh) */}
      <div className="relative z-10 w-full h-full">
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
          focusedCategory={activeCategory}
          cameraViewTrigger={cameraViewTrigger}
          onStatsUpdate={setStats}
          screenshotHandlerRef={screenshotHandlerRef}
        />
      </div>

      {/* Floating Glassmorphism PC Part Picker & Case Customizer HUD */}
      <SidebarControls
        build={build}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        onSelectPart={handleSelectPart}
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
        onOpenInspector={() => setIsInspectorOpen(true)}
        onResetBuild={handleResetBuild}
        stats={stats}
        totalPrice={totalPrice}
        totalWattage={totalWattage}
        cpuTemp={cpuTemp}
        gpuTemp={gpuTemp}
        mobileTab={mobileTab}
        setMobileTab={setMobileTab}
      />

      {/* Full PC Build Manifest & WebGL Telemetry Modal */}
      <InspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        build={build}
        stats={stats}
        totalPrice={totalPrice}
        totalWattage={totalWattage}
        cpuTemp={cpuTemp}
        gpuTemp={gpuTemp}
        rgbPreset={rgbPreset}
      />
    </main>
  );
}
