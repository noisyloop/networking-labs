import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Recharts (only used by STATS and the exam score report) is lazy-loaded
    // into its own chunk via dynamic import, so it stays out of the initial
    // bundle. It is a large vendor library by itself; allow its async chunk.
    chunkSizeWarningLimit: 600,
  },
})
