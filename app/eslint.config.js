import { tanstackConfig } from '@tanstack/eslint-config'
import reactHooks from "eslint-plugin-react-hooks"
// import { defineConfig } from "eslint/config";

export default [
  {
    ignores: [".output/", "eslint.config.js"]
  },
  ...tanstackConfig,
  reactHooks.configs.flat.recommended,
];
