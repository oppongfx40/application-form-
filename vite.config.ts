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
      // This list now includes react-paystack and all Shadcn UI components
      // that have caused "Rollup failed to resolve import" errors.
      external: [
        'react-paystack', 
        '@/components/ui/toaster', 
        '@/components/ui/sonner', 
        '@/components/ui/tooltip',
        '@/components/ui/button',
        '@/components/ui/card',
        '@/components/ui/input',
        '@/components/ui/label', // NEW: Add label component
        '@/components/ui/textarea', // Also commonly used, adding proactively
        '@/components/ui/checkbox', // Also commonly used, adding proactively
        '@/components/ui/separator', // Also commonly used, adding proactively
        '@/components/ui/badge', // Also commonly used, adding proactively
      ],
    },
  },
  server: {
    host: true, // This makes the server accessible externally (useful for Docker/VMs)
    port: 5173, // Default Vite port
  },
});
