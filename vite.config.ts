import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // `optimizeDeps.include` helps with development server performance.
  // `build.rollupOptions.external` is crucial for production builds on Netlify
  // to correctly handle modules that Rollup might struggle to bundle.
  optimizeDeps: {
    include: ['react-paystack'],
  },
  build: {
    rollupOptions: {
      // Explicitly externalize 'react-paystack' as suggested by Netlify's error.
      // This tells Rollup (Vite's bundler) not to try and bundle this module,
      // assuming it will be available at runtime (e.g., from node_modules).
      external: ['react-paystack'],
    },
  },
  server: {
    host: true, // This makes the server accessible externally (useful for Docker/VMs)
    port: 5173, // Default Vite port
  },
});
