import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Canvas3D from './components/Canvas3D';
import SidebarControls from './components/SidebarControls';
import InspectorModal from './components/InspectorModal';
import {
  SKIN_THEMES,
  generateThemeTextures,
  generateThemeThumbnail,
  createCustomImageTextures,
} from './utils/textureGenerator';

export default function App() {
  const [selectedThemeId, setSelectedThemeId] = useState('copper_oxidized');
  const [customTextureData, setCustomTextureData] = useState(null);
  const [customTextureName, setCustomTextureName] = useState('');

  // Real-time interactive material & physics parameters
  const [windSpeed, setWindSpeed] = useState(2.4);
  const [metalness, setMetalness] = useState(SKIN_THEMES[0].defaultMetalness);
  const [roughness, setRoughness] = useState(SKIN_THEMES[0].defaultRoughness);
  const [lightingMode, setLightingMode] = useState('studio');
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);

  // Camera angle preset trigger
  const [cameraViewTrigger, setCameraViewTrigger] = useState({
    mode: 'iso',
    ts: 0,
  });

  // UI Modals, Mobile Drawer & Notifications
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [screenshotToast, setScreenshotToast] = useState(false);
  const [mobileTab, setMobileTab] = useState('none');

  // Real-Time WebGL Telemetry
  const [stats, setStats] = useState({
    fps: 60,
    triangles: 516,
    calls: 24,
    geometries: 18,
    textures: 2,
  });

  const screenshotHandlerRef = useRef(null);

  // Active theme metadata
  const activeTheme = useMemo(() => {
    return (
      SKIN_THEMES.find((t) => t.id === selectedThemeId) || SKIN_THEMES[0]
    );
  }, [selectedThemeId]);

  // Pre-generate 2D catalog thumbnails once on mount
  const thumbnails = useMemo(() => {
    const map = {};
    SKIN_THEMES.forEach((theme) => {
      map[theme.id] = generateThemeThumbnail(theme.id);
    });
    return map;
  }, []);

  // Generate Three.js CanvasTextures whenever the selected preset changes
  const proceduralTextures = useMemo(() => {
    return generateThemeTextures(selectedThemeId);
  }, [selectedThemeId]);

  // Clean up previous procedural Three.js textures on change
  useEffect(() => {
    return () => {
      proceduralTextures?.map?.dispose?.();
      proceduralTextures?.emissiveMap?.dispose?.();
    };
  }, [proceduralTextures]);

  const activeTextures = customTextureData || proceduralTextures;

  // Select one of the 4 preset skins and apply its curated PBR metalness/roughness
  const handleSelectTheme = useCallback((themeId) => {
    const theme = SKIN_THEMES.find((t) => t.id === themeId);
    setSelectedThemeId(themeId);
    setCustomTextureData(null);
    setCustomTextureName('');
    if (theme) {
      setMetalness(theme.defaultMetalness);
      setRoughness(theme.defaultRoughness);
      if (themeId === 'neon_cyber') {
        setLightingMode('neon');
      }
    }
  }, []);

  // Handle user custom texture file upload (.png / .jpg)
  const handleUploadCustomTexture = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const generated = createCustomImageTextures(img);
        setCustomTextureData(generated);
        setCustomTextureName(file.name);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }, []);

  // Reset material sliders to the active theme defaults
  const handleResetMaterial = useCallback(() => {
    setWindSpeed(2.4);
    setMetalness(activeTheme.defaultMetalness);
    setRoughness(activeTheme.defaultRoughness);
    setWireframe(false);
    setCustomTextureData(null);
    setCustomTextureName('');
  }, [activeTheme]);

  // Trigger HD Transparent PNG Screenshot Download
  const handleCaptureScreenshot = useCallback(() => {
    if (!screenshotHandlerRef.current) return;
    const dataUrl = screenshotHandlerRef.current();
    if (!dataUrl) return;

    const link = document.createElement('a');
    const cleanName = (customTextureName || activeTheme.id)
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-');
    link.download = `voxelvault-3d-${cleanName}-hd.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setScreenshotToast(true);
    setTimeout(() => setScreenshotToast(false), 3200);
  }, [activeTheme, customTextureName]);

  const handleSnapCamera = useCallback((mode) => {
    setCameraViewTrigger({ mode, ts: Date.now() });
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#090A0F] select-none">
      {/* Subtle Cyberpunk Radial Ambient Glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-all duration-700"
        style={{
          background:
            lightingMode === 'neon'
              ? 'radial-gradient(circle at 50% 42%, rgba(6, 182, 212, 0.16) 0%, rgba(236, 72, 153, 0.08) 38%, #090A0F 78%)'
              : lightingMode === 'solar'
              ? 'radial-gradient(circle at 50% 42%, rgba(245, 158, 11, 0.14) 0%, rgba(30, 58, 138, 0.06) 42%, #090A0F 78%)'
              : `radial-gradient(circle at 50% 42%, ${activeTheme.accentHex}22 0%, rgba(15, 23, 42, 0.4) 45%, #090A0F 80%)`,
        }}
      />

      {/* Subtle Cyber Grid Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Central Fullscreen 3D Viewport (100vw x 100vh) */}
      <div className="relative z-10 w-full h-full">
        <Canvas3D
          textures={activeTextures}
          themeData={activeTheme}
          windSpeed={windSpeed}
          metalness={metalness}
          roughness={roughness}
          lightingMode={lightingMode}
          wireframe={wireframe}
          autoRotate={autoRotate}
          cameraViewTrigger={cameraViewTrigger}
          onStatsUpdate={setStats}
          screenshotHandlerRef={screenshotHandlerRef}
        />
      </div>

      {/* Floating Glassmorphism HUD Controls */}
      <SidebarControls
        selectedThemeId={selectedThemeId}
        onSelectTheme={handleSelectTheme}
        activeTheme={activeTheme}
        thumbnails={thumbnails}
        customTextureName={customTextureName}
        onUploadCustomTexture={handleUploadCustomTexture}
        windSpeed={windSpeed}
        setWindSpeed={setWindSpeed}
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
        onSnapCamera={handleSnapCamera}
        onCaptureScreenshot={handleCaptureScreenshot}
        screenshotToast={screenshotToast}
        onOpenInspector={() => setIsInspectorOpen(true)}
        onResetMaterial={handleResetMaterial}
        stats={stats}
        mobileTab={mobileTab}
        setMobileTab={setMobileTab}
      />

      {/* Real-Time Technical Specifications & Code Modal */}
      <InspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        activeTheme={activeTheme}
        customTextureName={customTextureName}
        stats={stats}
        windSpeed={windSpeed}
        metalness={metalness}
        roughness={roughness}
        lightingMode={lightingMode}
        wireframe={wireframe}
        previewUrl={activeTextures?.previewUrl}
      />
    </main>
  );
}
