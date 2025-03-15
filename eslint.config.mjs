/* This file is managed by @html-validate/eslint-config */
/* Changes may be overwritten */

import path from "node:path";
import { fileURLToPath } from "node:url";
import defaultConfig from "@html-validate/eslint-config";
import typescriptConfig from "@html-validate/eslint-config-typescript";
import typescriptTypeinfoConfig from "@html-validate/eslint-config-typescript-typeinfo";
import jestConfig from "@html-validate/eslint-config-jest";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default [
	{
		name: "Ignored files",
		ignores: [
			"**/coverage/**",
			"**/dist/**",
			"**/node_modules/**",
			"**/public/assets/**",
			"**/temp/**",
		],
	},
	...defaultConfig,
	{
		name: "@html-validate/eslint-config-typescript",
		files: ["**/*.ts"],
		...typescriptConfig,
	},
	{
		name: "@html-validate/eslint-config-typeinfo",
		files: ["src/**/*.ts"],
		ignores: ["src/**/*.spec.ts"],
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: rootDir,
				project: ["./tsconfig.json"],
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
		/* files which should lint even if project isn't build yet */
		files: ["./*.d.ts", "./bin/*.mjs"],
		rules: {
			"import/export": "off",
			"import/extensions": "off",
			"import/no-unresolved": "off",
		},
	},

	{
		name: "local",
		rules: {
			"import/extensions": "off",
			"security/detect-unsafe-regex": "off",
			"sonarjs/function-return-type": "off",
			"sonarjs/slow-regex": "off",
			"sonarjs/todo-tag": "off",
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

	{
		name: "local/tests/integration",
		files: ["./tests/integration/**/*.{js,cjs,mjs,ts,mts,cts}"],
		rules: {
			"import/named": "off",
			"import/no-unresolved": "off",
		},
	},

	{
		name: "local/tests/vitest",
		files: ["./tests/vitest/**/*.{js,cjs,mjs,ts,mts,cts}"],
		rules: {
			"import/no-extraneous-dependencies": "off",
			"import/no-unresolved": "off",
		},
	},
];
