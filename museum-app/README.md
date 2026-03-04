# 🎨 Van Gogh Museum — A Spatial Art Experience

An immersive 3D digital museum showcasing Vincent van Gogh's masterpieces with cinematic storytelling, spatial interactions, and premium design.

![Van Gogh Museum](public/paintings/1.jpg)

## ✨ Features

- **Cinematic Onboarding** — Immersive 3D glass sphere with camera dive transition
- **3D Gallery** — Interactive gallery showcasing 56 Van Gogh paintings
- **Biography** — Deep dive into Vincent's life with parallax storytelling
- **Spatial Hub** — Central navigation with reflective 3D typography
- **Premium Aesthetics** — Monochrome palette, glass morphism, film grain overlays

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| [React 19](https://react.dev) | UI Framework |
| [Vite](https://vite.dev) | Build Tool |
| [Three.js](https://threejs.org) | 3D Rendering |
| [React Three Fiber](https://r3f.docs.pmnd.rs) | React ↔ Three.js Bridge |
| [React Three Drei](https://drei.docs.pmnd.rs) | 3D Helpers & Abstractions |
| [Framer Motion](https://motion.dev) | Animations & Page Transitions |
| [React Router](https://reactrouter.com) | Client-Side Routing |

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/artvangogh.git
cd artvangogh/museum-app

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
museum-app/
├── public/
│   └── paintings/          # 56 Van Gogh painting images
├── src/
│   ├── components/
│   │   ├── PageTransition.jsx   # Cinematic page transitions
│   │   └── WaveMaterial.jsx     # Custom shader material
│   ├── data/
│   │   ├── paintingsData.js     # Paintings metadata
│   │   └── van.md               # Biography content
│   ├── pages/
│   │   ├── Onboarding.jsx       # Landing experience
│   │   ├── HeroHub.jsx          # Central navigation hub
│   │   ├── Gallery.jsx          # Painting gallery
│   │   └── Biography.jsx        # Life & legacy
│   ├── App.jsx                  # Route definitions
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── vercel.json                  # Vercel deployment config
├── netlify.toml                 # Netlify deployment config
└── vite.config.js               # Vite build configuration
```

## 🌐 Deployment

**Vercel** (recommended):
```bash
npx vercel
```

**Netlify**:
```bash
npx netlify deploy --prod --dir=dist
```

Both platforms are pre-configured with SPA rewrites, security headers, and asset caching.

## 📄 License

MIT
