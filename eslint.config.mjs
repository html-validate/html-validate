/* This file is managed by @html-validate/eslint-config */
/* Changes may be overwritten */

import path from "node:path";
import { fileURLToPath } from "node:url";
import defaultConfig from "@html-validate/eslint-config";
import jestConfig from "@html-validate/eslint-config-jest";
import typescriptConfig from "@html-validate/eslint-config-typescript";
import typescriptTypeinfoConfig from "@html-validate/eslint-config-typescript-typeinfo";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

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
		files: ["src/**/*.ts"],
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: rootDir,
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
		rules: {
			...jestConfig.rules,
			/* until upstream config disables this rule */
			"@typescript-eslint/unbound-method": "off",

			/* technical debt: untyped mocks */
			"@typescript-eslint/no-unsafe-assignment": "off",
		},
	},

	{
		name: "local",
		rules: {
			"import/extensions": "off",
			"security/detect-unsafe-regex": "off",
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
		files: ["docs/*.js", "docs/dgeni/**/*.js"],
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
			"@typescript-eslint/no-require-imports": "off",
			"eslint-comments/require-description": "off",
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
		files: ["**/*.ts"],
		rules: {
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-unnecessary-condition": "off",
		},
	},
];
