import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  { ignores,
  {
    extends,
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion,
      globals,
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport,
];
