import { defineConfig } from 'vite';
// Corrected import: Use the SWC version of the React plugin
import react from '@vitejs/plugin-react-swc'; 

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
      // Explicitly externalize modules that Rollup struggles to bundle.
      // We now include 'react-paystack', 'toaster', 'sonner', 'tooltip', and 'button' components.
      external: [
        'react-paystack', 
        '@/components/ui/toaster', 
        '@/components/ui/sonner', 
        '@/components/ui/tooltip',
        '@/components/ui/button' // NEW: Add button component
      ],
    },
  },
  server: {
    host: true, // This makes the server accessible externally (useful for Docker/VMs)
    port: 5173, // Default Vite port
  },
});
