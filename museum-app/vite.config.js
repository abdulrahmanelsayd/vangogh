import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Disable module preloading so heavy chunks (like Three.js) don't block the initial render on lightweight pages
    modulePreload: false,
    // Inline small CSS to eliminate render-blocking requests
    cssCodeSplit: false,
    assetsInlineLimit: 4096,
    // No sourcemaps in production for security (hides source code)
    sourcemap: false,
    // Increase chunk warning limit for 3D assets
    chunkSizeWarningLimit: 1600,
    // Optimize output
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,   // Strip all console.log in production
        drop_debugger: true,  // Strip debugger statements
        pure_funcs: ['console.info', 'console.debug', 'console.warn'],
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Three.js and 3D libs in their own chunk - ONLY loaded on Gallery/Biography
          if (id.includes('three') || id.includes('@react-three') || id.includes('postprocessing') || id.includes('maath')) {
            return 'vendor-three';
          }
          // Framer Motion in its own chunk
          if (id.includes('framer-motion') || id.includes('motion')) {
            return 'vendor-motion';
          }
          // React core - tiny, always needed
          if (id.includes('react-dom') || id.includes('react-router') || id.includes('/react/')) {
            return 'vendor-react';
          }
        },
      },
    },
  },
  // Security: prevent exposing .env files beyond VITE_ prefix
  envPrefix: 'VITE_',
  server: {
    // Strict port for dev
    strictPort: true,
  },
})
