import globals from "globals";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config} */
export default {
  plugins: {
    react: pluginReact,
  },
  languageOptions: {
    globals: {
      ...globals.browser,
    },
  },
  rules: {
    // Esimerkkisääntö: Pakottaa Reactin JSX-alueen

    'react/react-in-jsx-scope': 'error',
    // Lisää sääntöjä tähän tarpeen mukaan

  },
};
