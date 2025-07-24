import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'; 
import path from 'path'; // Import 'path' module for path resolution

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Explicitly define path aliases for Vite's resolver
  resolve: {
    alias: {
      // Map '@' to the 'src' directory. This tells Vite how to resolve
      // imports like "@/components/ui/button" to "./src/components/ui/button".
      '@': path.resolve(__dirname, './src'), 
    },
  },
  // `optimizeDeps.include` helps with development server performance.
  optimizeDeps: {
    // Keep react-paystack here for optimization during development,
    // but it will now be bundled in production.
    include: ['react-paystack'],
  },
  build: {
    rollupOptions: {
      // The 'external' array should now be empty or contain only truly external libraries
      // that are not meant to be bundled (e.g., if you were loading React from a CDN).
      // For react-paystack, we want it bundled into your app.
      external: [], // NEW: Empty the external array
    },
  },
  server: {
    host: true, // This makes the server accessible externally (useful for Docker/VMs)
    port: 5173, // Default Vite port
  },
});
