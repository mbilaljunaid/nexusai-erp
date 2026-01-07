import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../../shared"),
    },
  },
  root: __dirname,
  build: {
    outDir: "../../dist/apps/web",
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      '/api/platform': {
        target: 'http://localhost:5002',
        changeOrigin: true,
      },
      '/api/erp': {
        target: 'http://localhost:5004',
        changeOrigin: true,
      },
      '/api/advanced': {
        target: 'http://localhost:5005',
        changeOrigin: true,
      },
      '/api/manufacturing': {
        target: 'http://localhost:5006',
        changeOrigin: true,
      },
      '/api/ai': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      }
    },
  },
});
