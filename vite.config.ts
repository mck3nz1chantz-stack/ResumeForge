import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // 0.0.0.0 so phone on same Wi‑Fi can open http://<your-lan-ip>:5181/
    host: true,
    port: 5181,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 5181,
    strictPort: true,
  },
})
