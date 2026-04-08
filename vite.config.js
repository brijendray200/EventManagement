import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes(`${'node_modules'}\\react`) || id.includes('/react/')) {
            return 'react-vendor'
          }
          if (id.includes('framer-motion')) {
            return 'motion-vendor'
          }
          if (id.includes('lucide-react')) {
            return 'icons-vendor'
          }
        },
      },
    },
  },
})
