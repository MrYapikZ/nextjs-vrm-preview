# Next.js VRM Viewer

A modern VRM model viewer built with Next.js, Three.js, and shadcn/ui. Features advanced lighting controls and VRMA animation playback support.

![VRM Viewer Screenshot](docs/Screenshot%202026-02-05%20at%2012.23.16%20PM.png)

## ✨ Features

- **VRM Model Loading** - Load and display VRM 0.x and 1.0 models
- **VRMA Animation** - Play VRMA animation files on your VRM models
- **Advanced Lighting Setup** - Full control over key, fill, rim, and ambient lighting
- **Environment Controls** - Adjustable background color and ground plane
- **Modern UI** - Clean interface built with shadcn/ui components
- **Real-time Controls** - Adjust all settings in real-time with immediate visual feedback

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm/yarn

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/nextjs-vrm-preview.git
cd nextjs-vrm-preview
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Run the development server**

```bash
pnpm dev
```

4. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) to see the VRM viewer.

## 📖 Usage

### Loading a VRM Model

1. Click the **"Load VRM"** button in the Animation panel
2. Select a `.vrm` file from your computer
3. The model will be displayed in the 3D viewport

### Playing VRMA Animations

1. First, load a VRM model
2. Click the **"Load Animation"** button in the Animation panel
3. Select a `.vrma` animation file
4. Use the playback controls to play/pause and adjust speed

### Adjusting Lighting

The **Lighting** tab provides comprehensive controls:

- **Key Light** - Main directional light with intensity, color, and position controls
- **Fill Light** - Secondary light to soften shadows
- **Rim Light** - Back light for edge highlighting
- **Ambient Light** - Overall scene illumination

### Environment Settings

The **Environment** tab allows you to:

- Toggle and customize the background color
- Enable/disable the ground plane with adjustable opacity

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **3D Rendering**: [Three.js](https://threejs.org/)
- **VRM Support**: [@pixiv/three-vrm](https://github.com/pixiv/three-vrm)
- **VRM Animation**: [@pixiv/three-vrm-animation](https://github.com/pixiv/three-vrm)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: TypeScript

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/              # shadcn/ui components
│   └── vrm-viewer/      # VRM viewer components
│       ├── animation-panel.tsx
│       ├── environment-panel.tsx
│       ├── lighting-panel.tsx
│       ├── types.ts
│       ├── use-vrm-viewer.ts
│       └── vrm-viewer.tsx
└── lib/
    └── utils.ts
```

## 🙏 Acknowledgments

- [Pixiv](https://github.com/pixiv) for the excellent three-vrm library
- [shadcn](https://ui.shadcn.com/) for the beautiful UI components
- [Vercel](https://vercel.com) for Next.js and hosting
