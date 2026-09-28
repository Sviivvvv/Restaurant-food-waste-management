import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// standard Vite config with the React plugin enabled
export default defineConfig({
  plugins: [react()]
});
