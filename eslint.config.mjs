/* This file is managed by @html-validate/eslint-config */
/* Changes may be overwritten */

import defaultConfig from "@html-validate/eslint-config";
import jestConfig from "@html-validate/eslint-config-jest";
import typescriptConfig from "@html-validate/eslint-config-typescript";
import typescriptTypeinfoConfig from "@html-validate/eslint-config-typescript-typeinfo";
import vitestConfig from "@html-validate/eslint-config-vitest";

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
		name: "@html-validate/eslint-config-vitest",
		files: ["**/*.vitest.[jt]s"],
		...vitestConfig,
	},

	{
		name: "local",
		rules: {
			"import-x/extensions": "off",
			"import-x/no-unresolved": ["error", { ignore: ["\\?"] }],
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
		files: ["docs/*.mjs", "docs/dgeni/**/*.mjs"],
		rules: {
			/* docs scripts are expected to log to console */
			"no-console": "off",
		},
	},

	{
		name: "local/docs/specs",
		files: ["docs/**/__tests__/*.spec.ts"],
		rules: {
			"dot-notation": "off",
			"unicorn/prefer-https": "off",
		},
	},

	{
		name: "local/docs/examples",
		files: ["docs/examples/**/*.[jt]s"],
		rules: {
			"@eslint-community/eslint-comments/require-description": "off",
			"@typescript-eslint/no-require-imports": "off",
			"import-x/no-duplicates": "off",
			"import-x/no-extraneous-dependencies": "off",
			"import-x/no-unresolved": "off",
			"n/no-extraneous-import": ["error", { allowModules: ["html-validate"] }],
			"tsdoc/syntax": "off",
			"no-console": "off",
			"unicorn/no-top-level-side-effects": "off",
		},
	},

	{
		name: "local/vite-worker-imports",
		files: ["src/jest/worker/index.ts", "src/vitest/worker/index.ts"],
		rules: {
			/* eslint-disable-next-line unicorn/comment-content -- false positive */
			/* import-x cannot resolve Vite ?worker&url query strings */
			"import-x/no-unresolved": "off",
		},
	},

	{
		name: "local/technical-debt",
		rules: {
			"jest/no-conditional-in-test": "off",
			"unicorn/prefer-minimal-ternary": "off",
		},
	},
];
