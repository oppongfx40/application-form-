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
    include: ['react-paystack'],
  },
  build: {
    rollupOptions: {
      // Explicitly externalize ONLY 'react-paystack'.
      // All Shadcn UI components (e.g., @/components/ui/toaster) should now
      // be correctly bundled by Vite due to the 'resolve.alias' configuration.
      external: [
        'react-paystack' 
      ],
    },
  },
  server: {
    host: true, // This makes the server accessible externally (useful for Docker/VMs)
    port: 5173, // Default Vite port
  },
});
