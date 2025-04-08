import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  // Set base path only for build, use root for serve (dev)
  const base = command === 'build' ? '/cadence/' : '/'

  return {
    base: base,
    plugins: [react()],
    // Optional: Explicitly configure server root if needed,
    // but usually not required if 'base' is correct for build.
    // server: {
    //   base: '/', // Ensure dev server uses root
    // }
  }
})