import { tanstackConfig } from "@tanstack/eslint-config";
import reactHooks, { rules } from "eslint-plugin-react-hooks";
// import { defineConfig } from "eslint/config";

export default [
  {
    ignores: [".output/", "eslint.config.js"],
  },
  ...tanstackConfig,
  reactHooks.configs.flat.recommended,
];
