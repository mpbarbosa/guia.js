import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve, dirname } from 'path';
import { existsSync } from 'fs';

// Plugin: resolve .js imports to .ts when the .ts file exists (gradual migration support)
function resolveJsToTs() {
  return {
    name: 'resolve-js-to-ts',
    resolveId(source, importer) {
      if (!source.startsWith('.') || !source.endsWith('.js') || !importer) return null;
      const base = resolve(dirname(importer), source);
      const tsPath = base.replace(/\.js$/, '.ts');
      if (existsSync(tsPath)) return tsPath;
      return null;
    }
  };
}

export default defineConfig({
  plugins: [resolveJsToTs(), vue()],
  root: 'src',
  base: './',
  envDir: '..', // .env files live in project root, not in src/
  publicDir: '../public', // Copy libs/ and service-worker.js from public/
  
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    minify: 'terser',
    sourcemap: true,
    target: 'es2022', // Support modern browsers with top-level await
    
    terserOptions: {
      compress: {
        drop_console: false, // Keep console logs for debugging
        drop_debugger: true,
      },
    },
    
    rollupOptions: {
      input: {
        main: './src/index.html',
      },
      output: {
        // Let Vite automatically chunk based on dynamic imports
        // This is simpler and more maintainable
        manualChunks(id) {
          // Vendor chunks for external dependencies
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          
          // Speech synthesis modules
          if (id.includes('/speech/')) {
            return 'speech';
          }
          
          // Core modules
          if (id.includes('/core/')) {
            return 'core';
          }
          
          // Services
          if (id.includes('/services/')) {
            return 'services';
          }
          
          // Data processing
          if (id.includes('/data/')) {
            return 'data';
          }
          
          // HTML displayers
          if (id.includes('/html/')) {
            return 'html';
          }
          
          // Coordination
          if (id.includes('/coordination/')) {
            return 'coordination';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    
    // Performance optimizations
    chunkSizeWarningLimit: 500,
  },
  
  // Development server configuration
  server: {
    port: 9000,
    strictPort: false,
    open: false, // Don't auto-open browser
    cors: true,
  },
  
  // Preview server configuration
  preview: {
    port: 9001,
    strictPort: false,
    open: false, // Don't auto-open browser
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['guia.js', 'ibira.js'],
  },
});
