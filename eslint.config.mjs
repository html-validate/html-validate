/* This file is managed by @html-validate/eslint-config */
/* Changes may be overwritten */

import defaultConfig from "@html-validate/eslint-config";
import jestConfig from "@html-validate/eslint-config-jest";
import typescriptConfig from "@html-validate/eslint-config-typescript";
import typescriptTypeinfoConfig from "@html-validate/eslint-config-typescript-typeinfo";

export default [
	{
		name: "Ignored files",
		ignores: [
			"**/coverage/**",
			"**/dist/**",
			"**/node_modules/**",
			"**/out/**",
			"**/public/assets/**",
			"**/temp/**",
		],
	},

	...defaultConfig,

	{
		name: "@html-validate/eslint-config-typescript",
		files: ["**/*.{ts,cts,mts}"],
		...typescriptConfig,
	},

	{
		name: "@html-validate/eslint-config-typeinfo",
		files: ["src/**/*.{ts,cts,mts}"],
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: import.meta.dirname,
				projectService: true,
			},
		},
		...typescriptTypeinfoConfig,
	},

	{
		name: "@html-validate/eslint-config-jest",
		files: ["**/*.spec.[jt]s"],
		ignores: ["cypress/**", "tests/e2e/**"],
		...jestConfig,
	},

	{
		name: "local",
		rules: {
			"import/extensions": "off",
			"security/detect-unsafe-regex": "off",
			"sonarjs/no-hardcoded-passwords": "off",
			"sonarjs/slow-regex": "off",
		},
	},

	{
		/* build scripts and configurations may log to console */
		name: "local/build",
		files: ["internal/*/*.{js,mjs,cjs}"],
		rules: {
			"no-console": "off",
		},
	},

	{
		name: "local/docs",
		files: ["docs/*.mjs", "docs/dgeni/**/*.js"],
		rules: {
			/* docs scripts are expected to log to console */
			"no-console": "off",
		},
	},

	{
		name: "local/docs/specs",
		files: ["docs/**/*.spec.ts"],
		rules: {
			"dot-notation": "off",
		},
	},

	{
		name: "local/docs/examples",
		files: ["docs/examples/**/*.[jt]s"],
		rules: {
			"@eslint-community/eslint-comments/require-description": "off",
			"@typescript-eslint/no-require-imports": "off",
			"import/no-duplicates": "off",
			"import/no-extraneous-dependencies": "off",
			"import/no-unresolved": "off",
			"n/no-extraneous-import": ["error", { allowModules: ["html-validate"] }],
			"tsdoc/syntax": "off",
			"no-console": "off",
		},
	},

	{
		name: "local/technical-debt",
		rules: {
			"@typescript-eslint/no-explicit-any": "off",
			"unicorn/better-regex": "off",
			"unicorn/consistent-function-scoping": "off",
			"unicorn/error-message": "off",
			"unicorn/no-anonymous-default-export": "off",
			"unicorn/no-hex-escape": "off",
			"unicorn/prefer-structured-clone": "off",
			"unicorn/prefer-query-selector": "off",
			"unicorn/prefer-top-level-await": "off",
		},
	},
];
