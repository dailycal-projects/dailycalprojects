/**
 * Configuration for ESLint linter.
 */
import tsPlugin from "@typescript-eslint/eslint-plugin";
import prettierConfig from "eslint-config-prettier"; // just disables conflicting ESLint rules
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";

export default [
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs}"], // All JS/TS files in project
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        NodeJS: true,
      },
    },
    plugins: {
      react: reactPlugin,
      "@typescript-eslint": tsPlugin,
      import: importPlugin,
    },
    rules: {
      // Allow jsx in all js/ts files
      "react/jsx-filename-extension": [
        "off",
        { extensions: [".js", ".jsx", ".ts", ".tsx"] },
      ],

      // Alphabetize imports
      "import/order": [
        "warn",
        { alphabetize: { order: "asc", caseInsensitive: true } },
      ],

      // Don't allow unused imports
      "no-unused-vars": [
        "error",
        {
          "vars": "all",
          "args": "after-used",
          "ignoreRestSiblings": true
        }
      ]
    },
    settings: {
      react: { version: "detect" },
    },
  },

  // Merge in eslint-config-prettier to turn off any ESLint rules that conflict with Prettier
  ...(prettierConfig.flatConfig ?? []),
];
