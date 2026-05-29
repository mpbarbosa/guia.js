import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
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

// Plugin: resolve the paraty_geoservices CDN URL to the local sibling repo source
// when the repo is present (Docker build, local dev with sibling repo cloned).
// This bundles the provider inline and eliminates the runtime CDN fetch, which
// prevents network-dependent failures in E2E tests and improves build hermeticity.
function resolveParatyGeoservicesCDN(paratySrc, paratyChangeDetectionSrc) {
  // All CDN entry-point URLs for paraty_geoservices that should be resolved to
  // the local sibling repo source. This includes both the CJS and ESM index
  // paths so that provider re-exports (BrowserGeolocationProvider, etc.) are
  // bundled inline and do not require a live CDN fetch at runtime.
  const CDN_URLS = [
    'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geoservices@v1.6.5/dist/index.js',
    'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geoservices@v1.6.5/dist/esm/index.js',
  ];
  const CHANGE_DETECTION_CDN_URL = 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geoservices@v1.6.5/dist/esm/application/services/ChangeDetectionCoordinator.js';
  return {
    name: 'resolve-paraty-geoservices-cdn',
    enforce: 'pre',
    resolveId(source) {
      if (CDN_URLS.includes(source)) return paratySrc;
      if (source === CHANGE_DETECTION_CDN_URL) return paratyChangeDetectionSrc;
      return null;
    },
  };
}


export default defineConfig(({ mode }) => {
  const envVars = loadEnv(mode, process.cwd(), '');

  // When VITE_AWS_LBS_BASE_URL is empty the browser uses relative /api/* URLs,
  // which this proxy forwards to AWS server-side — no CORS preflight needed.
  const awsProxyTarget =
    envVars.VITE_AWS_LBS_BASE_URL ||
    'https://b2inkriw8k.execute-api.us-east-1.amazonaws.com';

  const paratySrc = resolve(dirname(new URL(import.meta.url).pathname), '../paraty_geoservices/src/index.ts');
  const paratyChangeDetectionSrc = resolve(
    dirname(new URL(import.meta.url).pathname),
    '../paraty_geoservices/src/application/services/ChangeDetectionCoordinator.ts'
  );

  return {
    plugins: [
      tailwindcss(),
      resolveJsToTs(),
      ...(existsSync(paratySrc) && existsSync(paratyChangeDetectionSrc)
        ? [resolveParatyGeoservicesCDN(paratySrc, paratyChangeDetectionSrc)]
        : []),
      vue(),
    ],
    resolve: {
      alias: (() => {
        // Map importmap alias to the local bessa_patterns.ts package for Vite/Rollup.
        // Fall back to src/index.ts (e.g. in Docker where dist/ hasn't been built yet).
        const bessaDist = resolve(dirname(new URL(import.meta.url).pathname), '../bessa_patterns.ts/dist/index.mjs');
        const bessaSrc  = resolve(dirname(new URL(import.meta.url).pathname), '../bessa_patterns.ts/src/index.ts');
        return { 'bessa_patterns.ts': existsSync(bessaDist) ? bessaDist : bessaSrc };
      })(),
    },
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
            // MapLibre GL JS gets its own chunk (large, ~900KB)
            if (id.includes('maplibre-gl')) {
              return 'map';
            }

            // Bootstrap Icons gets its own chunk
            if (id.includes('bootstrap-icons')) {
              return 'ui';
            }

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
      proxy: {
        '/api': {
          target: awsProxyTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },
    
    // Preview server configuration
    preview: {
      port: 9001,
      strictPort: false,
      open: false, // Don't auto-open browser
    },
    
    // Optimize dependencies
    optimizeDeps: {
      include: ['ibira.js'],
    },
  };
});
