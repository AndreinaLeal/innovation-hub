import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  css: {
    preprocessorOptions: {
      scss: {
        // Bootstrap 5 usa @import; se silencian avisos de deprecación de Sass que no afectan el resultado.
        quietDeps: true,
        silenceDeprecations: ["import", "global-builtin", "color-functions", "mixed-decls"],
      },
    },
  },
});
