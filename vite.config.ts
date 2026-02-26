import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true })
  ],
  base: '/', // Asegura que las rutas de assets sean relativas a la raíz
  build: {
    outDir: 'dist',
  }
});
