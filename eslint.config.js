const { ESLint } = require("eslint");

module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
    },
    plugins: [
        "@typescript-eslint",
    ],
    rules: {
        "import/no-unresolved": "off",
        "import/no-named-as-default": "off",
        "import/no-duplicates": "off",
        "import/named": "off",
        "import/namespace": "off",
        "import/default": "off",
        "import/no-named-as-default-member": "off",
        "no-console": "warn",
        "sort-keys": ["error", "asc", { "caseSensitive": true, "natural": false, "minKeys": 2 }],
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
    },
    ignores: ["node_modules/", "dist/", "build/"],
};
