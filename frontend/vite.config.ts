import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./src/shared"),
    },
  },

  // ⭐ 讓前端開在 http://localhost:4000
  server: {
    port: 4000,
    host: true, // 若需要手機連線可加
  },
});
