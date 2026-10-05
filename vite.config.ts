import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// `--mode artifact` builds a single-file version: fonts become data URIs and there is one JS and one CSS file to inline.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === "artifact" ? "./" : "/",
  build:
    mode === "artifact"
      ? { outDir: "dist-artifact", assetsInlineLimit: 1_000_000, cssCodeSplit: false, modulePreload: false }
      : {},
}))
