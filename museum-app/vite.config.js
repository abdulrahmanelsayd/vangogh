import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
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
        // Smart chunk splitting for caching
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-motion': ['framer-motion'],
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
