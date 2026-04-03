import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["cjs"],
  outExtension() {
    return {
      js: ".cjs"
    };
  },
  target: "node20",
  sourcemap: true,
  clean: true,
  external: ["@prisma/client", /^@prisma\//],
  noExternal: [/^@colonels-academy\//]
});
