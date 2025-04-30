import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@api": resolve(__dirname, "src", "api"),
      "@pages": resolve(__dirname, "src", "pages"),
      "@components": resolve(__dirname, "src", "components"),
      "@stores": resolve(__dirname, "src", "stores"),
      "@services": resolve(__dirname, "src", "services"),
      "@utils": resolve(__dirname, "src", "utils"),
      "@types": resolve(__dirname, "src", "types"),
    },
  },
  plugins: [react()],
});
