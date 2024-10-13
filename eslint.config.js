// eslint.config.js
const { FlatCompat } = require("@eslint/eslintrc");
const compat = new FlatCompat();

/** @type {import("eslint").Linter.FlatConfig[]} */
const config = [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        browser: true,
        es2021: true,
        node: true,
      },
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
    },
    rules: {
      // Add your custom rules here
    },
  },
  ...compat.extends("eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"),
];

module.exports = config;