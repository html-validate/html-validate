/* This file is managed by @html-validate/eslint-config */
/* Changes may be overwritten */

import defaultConfig from "@html-validate/eslint-config";
import jestConfig from "@html-validate/eslint-config-jest";
import typescriptConfig from "@html-validate/eslint-config-typescript";
import typeinfoConfig from "@html-validate/eslint-config-typescript-typeinfo";
import vitestConfig from "@html-validate/eslint-config-vitest";

export default [
	...defaultConfig({
		type: "commonjs",
	}),

	typescriptConfig(),
	typeinfoConfig(import.meta.dirname),
	jestConfig(),
	vitestConfig({
		files: ["**/*.vitest.[jt]s"],
	}),

	{
		name: "local",
		rules: {
			"import-x/extensions": "off",
			"import-x/no-unresolved": ["error", { ignore: ["\\?"] }],
			"security/detect-unsafe-regex": "off",
			"sonarjs/no-hardcoded-passwords": "off",
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

			/* some examples show raw assertions outside of test-cases */
			"sonarjs/assertions-in-test-cases": "off",

			"unicorn/no-top-level-side-effects": "off",
		},
	},

	{
		name: "local/vite-worker-imports",
		files: ["src/jest/worker/index.ts", "src/vitest/worker/index.ts"],
		rules: {
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
