import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use the automatic JSX runtime everywhere (incl. Vitest), so components
  // don't need an explicit `import React`.
  esbuild: {
    jsx: 'automatic'
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
