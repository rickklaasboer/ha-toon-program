import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

export default {
  input: "src/toon-program-card.ts",
  output: {
    file: "../custom_components/toon_program/frontend/toon-program-card.js",
    format: "es",
    inlineDynamicImports: true,
  },
  plugins: [resolve(), typescript({ tsconfig: "./tsconfig.json" }), terser()],
};
