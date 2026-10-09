import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/kosh': {
        changeOrigin: true,
        target: 'https://api-dev.kosh.maatli.com',
      },
    },
  },
})
