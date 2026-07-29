import eslint from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/coverage/**",
      "**/.turbo/**",
      "**/node_modules/**",
      "**/vitest.config.ts",
      "examples/expo-app/.expo/**",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ["packages/*/**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: [
          "./packages/core/tsconfig.eslint.json",
          "./packages/react/tsconfig.eslint.json",
          "./packages/redux/tsconfig.eslint.json",
          "./packages/zustand/tsconfig.eslint.json",
          "./packages/tanstack-query/tsconfig.eslint.json",
          "./packages/rxjs/tsconfig.eslint.json",
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["examples/expo-app/**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: "./examples/expo-app/tsconfig.eslint.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["packages/core/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "react", message: "core must not depend on React" },
            { name: "react-dom", message: "core must not depend on react-dom" },
            { name: "react-native", message: "core must not depend on react-native" },
            { name: "zustand", message: "core must not depend on adapter libraries" },
            { name: "redux", message: "core must not depend on adapter libraries" },
            { name: "rxjs", message: "core must not depend on adapter libraries" },
          ],
          patterns: [
            {
              group: ["@tanstack/*"],
              message: "core must not depend on adapter libraries",
            },
            {
              group: ["@reduxjs/*"],
              message: "core must not depend on adapter libraries",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["packages/react/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react-dom",
              message: "Use react only; react-dom is for apps, not the adapter runtime",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/restrict-template-expressions": "off",
    },
  },
  {
    files: ["packages/*/src/index.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExportDefaultDeclaration",
          message: "Package public APIs must use named exports",
        },
      ],
    },
  },
  {
    files: ["apps/**/*.{ts,tsx}", "examples/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
);
