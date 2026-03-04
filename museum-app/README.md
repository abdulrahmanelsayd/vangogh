# Van Gogh Museum

A spatial digital museum. 56 masterpieces. One immersive experience.

---

## Overview

An interactive web experience that reimagines the Van Gogh Museum as a cinematic, scroll-driven 3D gallery. Built with React, Three.js, and Framer Motion.

## Architecture

```
src/
  pages/
    Onboarding.jsx     — Cinematic entry sequence
    HeroHub.jsx        — Landing hero with video backdrop
    Gallery.jsx        — 3D scrollable gallery with lens distortion
    Biography.jsx      — Parallax life timeline with 3D canvas
  components/
    GlobalNavigation.jsx
    PageTransition.jsx
  data/
    paintingsData.js   — 56 paintings metadata
```

## Stack

| Layer | Technology |
|-------|-----------|
| UI | React 19 |
| 3D Engine | Three.js, React Three Fiber, Drei |
| Animation | Framer Motion |
| Routing | React Router v7 |
| Build | Vite 7, Terser |
| Deploy | Vercel / Netlify |

## Performance

Code-split by route. Three.js loads only on pages that require it. Poster-based LCP optimization with deferred video loading. WebP assets. CSS inlined at build time.

| Page | Strategy |
|------|----------|
| Hub | No 3D dependencies. Video deferred. Poster preloaded. |
| Gallery | Three.js isolated in `vendor-three` chunk. Individual image Suspense boundaries. |
| Biography | Lazy-loaded with full 3D canvas. |

## Getting Started

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
npm run preview
```

Output: `dist/`

## Deploy

**Vercel** — Push to GitHub. Import repo. Framework auto-detected.

**Netlify** — Push to GitHub. Connect repo. Build command: `npm run build`. Publish directory: `dist`.

Both platforms are pre-configured via `vercel.json` and `netlify.toml`.

## License

Private.
