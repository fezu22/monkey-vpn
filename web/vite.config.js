import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `BASE_PATH` lets the GH Pages workflow build under `/monkey-vpn/`.
// Local dev and other deploys keep the default `/`.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
})
