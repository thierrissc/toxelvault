# VoxelVault 3D — PC Builder & Montador Interativo de Hardware 3D

Aplicação web interativa de **Montagem de Computadores em 3D (PC Builder Studio)** construída com **React (Vite) + Tailwind CSS + Three.js (`@react-three/fiber` e `@react-three/drei`) + Lucide React**.

## 🖥️ Funcionalidades Principais

- **Modelagem 3D Completa de Todas as Peças de Hardware (Zero dependências externas quebradas)**:
  - **Gabinete (Case)**: Opções panorâmicas estilo aquário dual-chamber (Preto ou Snow White) e Mid-Tower Mesh Stealth, com tampa de vidro temperado interativa (abre/fecha) e 4 ventoinhas ARGB de gabinete.
  - **Placa-Mãe (Motherboard)**: PCB com trilhas de circuito geradas via `CanvasTexture`, dissipadores VRM em alumínio, blindagem I/O traseira, slots PCIe 5.0 reforçados e conector ATX 24 pinos.
  - **Processador (CPU)**: Soquete AM5/LGA com heatspreader (IHS) metálico (Ryzen 9 9950X3D, Core Ultra 9 285K, Ryzen 7 9800X3D).
  - **Resfriamento (CPU Cooler)**: Alterne em tempo real entre **Watercooler AIO 360mm** (com radiador triplo no topo, tubos trançados em curva `CatmullRomCurve3` e **tela LCD circular exibindo a temperatura real da CPU/GPU**) ou **Air Cooler Dual-Tower** com heatpipes de cobre e 2 ventoinhas PWM.
  - **Placa de Vídeo (GPU)**: Modelos Triple-Fan (RTX 5090 ROG Astral, RX 8900 XTX Sapphire Nitro+, RTX 5080 Aero White) com barra ARGB, cabo 12VHPWR, 3 ventoinhas giratórias e **Backplate customizável com upload de imagem `.png` / `.jpg`**.
  - **Memória RAM DDR5**: Kits de 2x (Dual-Channel) ou 4x pentes preenchendo os slots DIMM com difusores luminosos ARGB.
  - **Armazenamento (SSD NVMe M.2)**: Drives PCIe 5.0/4.0 instalados nos slots M.2 com dissipadores térmicos.
  - **Fonte de Alimentação (PSU)**: Fontes ATX 3.1 no compartimento inferior com display OLED exibindo o consumo em Watts em tempo real.
- **Vista Explodida & Inspeção 360°**:
  - Ative a **Vista Explodida** para afastar suavemente cada componente no espaço 3D e inspecionar os encaixes internos.
  - Abra a porta de **Vidro Lateral**, controle a velocidade de rotação das ventoinhas (RPM), altere o tema ARGB sincronizado, visualize a malha em `Wireframe` e exporte um **Screenshot HD em PNG transparente**.
