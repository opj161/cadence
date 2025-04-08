// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Updated base path for the 'cadence' repository
  base: '/cadence/',
  plugins: [react()],
})