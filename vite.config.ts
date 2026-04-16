import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    // Auto-compress PNG/JPG/SVG at build time (in-place in the bundle).
    // Heavy 10MB PNGs become ~500KB-1MB without visible quality loss.
    // Dev is untouched so HMR stays fast.
    ViteImageOptimizer({
      png: { quality: 75 },
      jpeg: { quality: 78 },
      jpg: { quality: 78 },
      webp: { quality: 75 },
      avif: { quality: 60 },
      svg: {
        multipass: true,
        plugins: [
          { name: 'preset-default', params: { overrides: { removeViewBox: false } } },
        ],
      },
    }),
  ],
  server: {
    host: true,
  },
})
