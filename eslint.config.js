import eslintConfigPrettier from "eslint-config-prettier";
import json from "@eslint/json";
import astro from "eslint-plugin-astro";
import eslintReact from "@eslint-react/eslint-plugin";
import stylistic from "@stylistic/eslint-plugin";
import * as mdx from "eslint-plugin-mdx";
import prettierPlugin from "eslint-plugin-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

const logicRules = {
  "no-redeclare": "error",
  "no-undef": "error",
  "no-dupe-keys": "error",
  "no-empty-function": "error",
  curly: ["error", "all"],
  "prefer-const": "error",
  "prefer-template": "error",
  "no-var": "error",
  eqeqeq: "error",
  "no-unused-vars": ["error", { varsIgnorePattern: "^_", argsIgnorePattern: "^_" }],
  "no-duplicate-imports": ["error", { allowSeparateTypeImports: true }],
  "prettier/prettier": "error",
};

const tsLogicRuleOverrides = {
  "no-redeclare": "off",
  "@typescript-eslint/no-redeclare": "error",
  "no-empty-function": "off",
  "@typescript-eslint/no-empty-function": "error",
  "no-unused-vars": "off",
  "@typescript-eslint/no-unused-vars": [
    "error",
    { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
  ],
  "@typescript-eslint/no-explicit-any": "off",
  // TypeScript already reports undefined names, and knows about globals like URL and Response
  "no-undef": "off",
};

const reactJsxRules = {
  "@stylistic/jsx-self-closing-comp": "error",
  "@eslint-react/jsx-no-useless-fragment": "error",
};

const srcJs = "src/**/*.js";
const srcTs = "src/**/*.ts";
const srcJsx = "src/**/*.jsx";
const srcTsx = "src/**/*.tsx";
const srcAstro = "src/**/*.astro";
const srcMdx = "src/**/*.mdx";
const srcJson = "src/**/*.json";
const rootConfigs = [
  "*.config.js",
  "*.config.mjs",
  "*.config.ts",
  "astro.config.mjs",
  "eslint.config.js",
  "prettier.config.js",
];

const jsLikeFiles = [srcJs, ...rootConfigs];
const scriptsTs = "scripts/**/*.ts";
const tsLikeFiles = [srcTs, srcTsx, scriptsTs];
const astroClientScripts = ["**/*.astro/*.js", "**/*.astro/*.ts"];

// Code carried over unchanged from the old Gatsby site (also in .prettierignore)
const legacyCode = [
  "src/visuals/**",
  "src/components/ArticleFooter.jsx",
  "src/components/ButtonList.jsx",
  "src/styles/customTheme.js",
  "src/styles/theme.js",
  "src/styles/button.module.css",
  "src/styles/darkStory.css",
];

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: [
      "dist/**",
      ".astro/**",
      "node_modules/**",
      "package-lock.json",
      // Articles' visuals and the old Gatsby components they use, kept as they were written
      ...legacyCode,
    ],
  },

  {
    plugins: {
      prettier: prettierPlugin,
      "@eslint-react": eslintReact,
      "@stylistic": stylistic,
      json,
    },
  },

  ...astro.configs["flat/base"],

  {
    files: jsLikeFiles,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: false,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: logicRules,
  },

  {
    files: [srcJsx],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...logicRules,
      ...reactJsxRules,
    },
  },

  {
    files: tsLikeFiles,
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: false,
        },
      },
    },
    rules: {
      ...logicRules,
      ...tsLogicRuleOverrides,
    },
  },

  {
    files: [scriptsTs],
    languageOptions: {
      globals: globals.node,
    },
  },

  {
    files: [srcTsx],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...logicRules,
      ...tsLogicRuleOverrides,
      ...reactJsxRules,
    },
  },

  {
    files: [srcAstro],
    rules: {
      "no-undef": "off",
      ...logicRules,
    },
  },

  {
    files: astroClientScripts,
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      globals: globals.browser,
    },
    rules: {
      ...logicRules,
      ...tsLogicRuleOverrides,
      // Prettier already formats these scripts as part of the whole .astro file
      "prettier/prettier": "off",
    },
  },

  {
    files: [srcMdx],
    ...mdx.flat,
    processor: mdx.createRemarkProcessor({
      lintCodeBlocks: true,
      languageMapper: {},
    }),
    rules: {
      ...logicRules,
      ...reactJsxRules,
      "mdx/remark": "off",
      "no-unused-expressions": "off",
      // Articles are prose: reflowing it can change how it renders (e.g. a line ending in two
      // spaces is a line break), and older articles' markup is kept as it was written
      "prettier/prettier": "off",
      "@stylistic/jsx-self-closing-comp": "off",
    },
  },

  {
    files: [srcMdx],
    ...mdx.flatCodeBlocks,
    rules: {
      ...logicRules,
      ...mdx.flatCodeBlocks.rules,
      "mdx/remark": "off",
      "no-unused-expressions": "off",
    },
  },

  {
    files: [srcJson],
    language: "json/json",
    rules: {
      "json/no-duplicate-keys": "error",
      "prettier/prettier": "error",
    },
  },

  eslintConfigPrettier,
];
