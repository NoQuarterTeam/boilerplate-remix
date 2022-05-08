const OFF = "off"
const ERROR = "error"
// const WARN = "warn"

/**
 * @type {import('@types/eslint').Linter.BaseConfig}
 */
module.exports = {
  root: true,
  // ignorePatterns: ["./api/**"],

  parser: "@typescript-eslint/parser",

  plugins: ["@typescript-eslint"],

  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "@remix-run/eslint-config",
    "@remix-run/eslint-config/node",
    "@remix-run/eslint-config/jest-testing-library",
    "prettier",
  ],
  rules: {
    "@typescript-eslint/ban-types": OFF,
    "@typescript-eslint/array-type": OFF,
    "@typescript-eslint/ban-ts-ignore": OFF,
    "@typescript-eslint/consistent-type-imports": OFF,
    "@typescript-eslint/explicit-function-return-type": OFF,
    "@typescript-eslint/explicit-member-accessibility": OFF,
    "@typescript-eslint/explicit-module-boundary-types": OFF,
    "@typescript-eslint/no-angle-bracket-type-assertion": OFF,
    "@typescript-eslint/no-empty-interface": OFF,
    "@typescript-eslint/no-explicit-any": OFF,
    "@typescript-eslint/no-unused-vars": [
      ERROR,
      { args: "none", argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/no-use-before-define": OFF,
    "@typescript-eslint/no-var-requires": OFF,
    "@typescript-eslint/prefer-interface": OFF,
    "jsx-a11y/anchor-is-valid": OFF,
    "no-extend-native": OFF,
    "prefer-const": OFF,
    "react-hooks/exhaustive-deps": OFF,
    "react/display-name": OFF,
    "react/no-unescaped-entities": OFF,
    "react/prop-types": OFF,
  },
  settings: {
    react: {
      version: "detect",
    },
  },
}
