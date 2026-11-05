import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// The browser only ever calls /api, so dev and preview need no CORS setup.
const proxy = { '/api': 'http://127.0.0.1:8000' };

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy },
  preview: { proxy },
  // three.js is a large chunk, loaded only when the campus nears the screen.
  build: { chunkSizeWarningLimit: 800 },
});
