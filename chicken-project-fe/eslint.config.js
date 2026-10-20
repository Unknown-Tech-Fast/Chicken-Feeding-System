import js from "@eslint/js"
import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import tseslint from "typescript-eslint"
import { defineConfig, globalIgnores } from "eslint/config"

export default defineConfig([
  globalIgnores(["dist", "node_modules"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        // Wajib: kunci root tsconfig ke folder project ini.
        // Tanpa ini, parser menebak dari workspace dan gagal saat menemukan
        // lebih dari satu kandidat tsconfig.
        tsconfigRootDir: import.meta.dirname,
        projectService: true,
      },
    },
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
])
