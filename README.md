<div align="center">

![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=threedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

<br />

# ToxelVault 3D

Simulador e configurador interativo de hardware em 3D com verificacao de compatibilidade, calculo de consumo e visualizacao das pecas em tempo real no navegador.

---

</div>

## Sobre

**ToxelVault 3D** e uma aplicacao web para montagem e visualizacao de computadores em 3D. Desenvolvida com React, Three.js (`@react-three/fiber` e `@react-three/drei`) e Tailwind CSS, permite escolher componentes reais, conferir o encaixe nos slots da placa-mae e do gabinete e inspecionar o setup sob qualquer angulo.

Pensada para entusiastas de hardware, gamers e estudantes que precisam de uma ferramenta visual, direta e funcional para planejar e testar configuracoes de PC.

---

## Como Usar

```bash
git clone https://github.com/thierrissc/toxelvault-3d.git
cd toxelvault-3d
npm install
npm run dev
```

---

## Estrutura

```text
toxelvault-3d/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── components/
│   │   ├── Canvas3D.jsx
│   │   ├── CapeModel.jsx
│   │   ├── SidebarControls.jsx
│   │   └── InspectorModal.jsx
│   ├── data/
│   │   └── partsCatalog.json
│   └── utils/
│       ├── hardwareCatalogAdapter.js
│       └── textureGenerator.js
└── README.md
```

---

## Funcionalidades

- Visualizacao 3D interativa com rotacao orbital, zoom e angulos de camera pre-definidos
- Sistema de encaixe por sockets para gabinete, placa-mae, processador, cooler, GPU, memoria RAM, SSD M.2 e fonte
- Catalogo integrado ao dataset publico de hardware via GitHub CDN com cache local
- Verificacao automatica de compatibilidade de socket (AM5, AM4, LGA1700, LGA1851) e comprimento da placa de video
- Calculo em tempo real de preco total do setup e estimativa de consumo em Watts (TDP)
- Suporte para carregar modelos `.glb` e `.gltf` locais diretamente em qualquer slot
- Modos de inspecao com vista explodida, malha wireframe, iluminacao de estudio HDRI e exportacao de screenshot em PNG

---

<div align="center">

Feito para quem gosta de montar e explorar cada detalhe do seu PC.

</div>
