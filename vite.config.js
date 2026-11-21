import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Same key and value shape as the deploy's GitHub Environment variable (nginx.conf does the same mapping).
// Override in .env.local, e.g. NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/kosh for a local Kosh API.
export default defineConfig(({ mode }) => {
  const apiBaseURL = new URL(
    loadEnv(mode, process.cwd(), '').NEXT_PUBLIC_API_BASE_URL || 'https://api-dev.kosh.maatli.com/kosh',
  )
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/kosh': {
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/kosh/, apiBaseURL.pathname.replace(/\/$/, '')),
          target: apiBaseURL.origin,
        },
      },
    },
  }
})
