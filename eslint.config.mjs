import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  { ignores: ["dist/**", "node_modules/**", "eslint.config.mjs", "vitest.config.js"] },
  js.configs.recommended,

  // IMPORTANT: nécessite un tsconfig accessible au lint
  ...tseslint.configs.recommendedTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        // Indique à ESLint où trouver les tsconfig(s)
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    rules: {
      "no-undef": "off",
    },
  },
];
