// vite.config.ts
import { defineConfig } from "vite";
import typescript from "@rollup/plugin-typescript";
import path from "path";

export default defineConfig({
  plugins: [
    typescript({
      declaration: true,
      declarationDir: "dist/types", // Types still go here
      rootDir: "src",
      // Ensure your tsconfig.json has "outDir": "dist" (or similar)
      // and "declaration": true, "declarationMap": true (for sourcemaps of .d.ts)
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@lib": path.resolve(__dirname, "src/lib"),
    },
  },
  //cors durring dev
  server: {
    cors: {
      origin: ["https://fs-self-service.webflow.io"],
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    },
    allowedHosts: ["fs-search-sandbox.webflow.io", "local5173-70.localcan.dev"],
  },
  build: {
    // The overall output directory is 'dist' (default)
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      name: "fsSelfService", // Global variable for IIFE
      formats: ["es", "iife"], // Specify the formats you want

      // Customize fileName based on format
      fileName: (format, entryName) => {
        // entryName is derived from your entry file, usually 'main' or the filename without extension
        // For fsSelfService.iife.js, we want it in the root
        if (format === "iife") {
          // You could name it fsSelfService.js or fsSelfService.iife.js
          return `fsSelfService.js`; // No .iife extension, directly in dist
        }
        // For finsweet-cmsearch.es.js, we want it in an 'es' subfolder
        if (format === "es") {
          // You could name it index.js or fsSelfService.es.js inside the 'es' folder
          return `es/index.js`; // Or es/fsSelfService.es.js
        }
        // Fallback for any other formats you might add
        return `other/${entryName}.${format}.js`;
      },
    },
    rollupOptions: {
      // Externalize peer dependencies if any (unlikely for this lib)
      // external: [],
      output: {
        // This ensures the worker (and other non-entry chunks)
        // still go into the 'assets' folder with a hash.
        // This is often the default, but explicitly stating it can be good.
        chunkFileNames: "assets/[name]-[hash].js",

        // If you had CSS or other assets emitted by Rollup directly
        // assetFileNames: 'assets/[name]-[hash][extname]',

        // Define globals for externalized deps if using UMD/IIFE (unlikely here)
        // globals: {},
      },
    },
  },
});
