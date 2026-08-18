import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this project from https://<user>.github.io/App/, so
  // assets need the /App/ prefix in that build. Local dev keeps serving from
  // root so the existing "open localhost:5173" instructions still work.
  base: process.env.GITHUB_PAGES ? '/App/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
