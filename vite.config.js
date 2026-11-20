import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Firebase + Firestore together exceed the default 500 kB warning threshold.
    // Raise the limit so the build exits cleanly; the bundle size is expected.
    chunkSizeWarningLimit: 1000,
  },
})
