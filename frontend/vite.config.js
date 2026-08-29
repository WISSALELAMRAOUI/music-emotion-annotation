import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // or vue, svelte, etc.

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all network interfaces inside the container
    port: 5173,
    allowedHosts: [
      'wissal.ghaiati.com',
      '.ghaiati.com' // Allows any subdomain under your domain
    ]
  }
})