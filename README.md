# VoxelVault 3D — Vitrine Interativa de Ativos Digitais & Skins

Aplicação web interativa de Creative Coding / WebGL construída com **React + Vite + Tailwind CSS + Three.js (`@react-three/fiber` e `@react-three/drei`) + Lucide React**.

## ✨ Funcionalidades Principais

- **Manequim Voxel 3D & Capa Articulada Procedural (Zero dependências externas)**:
  - Armadura estilizada Low-Poly/Voxel com capacete, visor emissivo, peitoral, ombreiras e grevas.
  - Capa traseira dividida em **14 segmentos articulados** com física de ondulação senoidal em tempo real via `useFrame`.
- **Gerador Procedural de Texturas (`HTML5 Canvas 2D -> THREE.CanvasTexture`)**:
  - **Copper Oxidized**: Cobre metálico com pátina oxidada verde-água e alto brilho especular.
  - **Master Builder**: Padrão geométrico real dourado e azul profundo com runas emissivas.
  - **Home Comfort**: Madeira entalhada quente, bordas creme costuradas e brasão central.
  - **Neon Cyber**: Chassi preto fosco com circuitos ópticos ciano e magenta de alta emissão (`emissiveMap`).
- **Upload de Textura Customizada**: Carregue qualquer imagem `.png` ou `.jpg` do computador para aplicá-la instantaneamente à capa e armadura 3D.
- **UI Cyberpunk / Glassmorphism & Inspetor Técnico**:
  - Catálogo com badges de raridade, barra de desgaste *Float* animada e gráfico SVG de valorização.
  - Customizador PBR em tempo real (`metalness`, `roughness`, velocidade do vento, modo `Wireframe`, rotação automática e 3 modos de iluminação de estúdio).
  - Exportação de **Screenshot HD com fundo transparente (PNG)** e modal de telemetria WebGL em tempo real (FPS, contagem de triângulos e código do shader).

## 🚀 Como Executar

```bash
npm install
npm run dev
```
