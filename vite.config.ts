import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This helps Vite pre-bundle 'react-paystack' correctly,
  // resolving the import issue during Netlify build.
  optimizeDeps: {
    include: ['react-paystack'],
  },
  build: {
    // Optional: If 'optimizeDeps' doesn't fully resolve it,
    // you might need to explicitly externalize it, but try `optimizeDeps` first.
    // rollupOptions: {
    //   external: ['react-paystack'],
    // },
  },
  server: {
    host: true, // This makes the server accessible externally (useful for Docker/VMs)
    port: 5173, // Default Vite port
  },
});
