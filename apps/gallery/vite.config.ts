import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// SINGLE_FILE=1 inlines everything into one HTML file, for sharing as a static page.
export default defineConfig({
  plugins: [react(), tailwindcss(), ...(process.env["SINGLE_FILE"] ? [viteSingleFile()] : [])],
});
