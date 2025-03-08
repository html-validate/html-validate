require("@html-validate/eslint-config/patch/modern-module-resolution");

module.exports = {
	root: true,
	extends: ["@html-validate"],

	rules: {
		"import/extensions": "off",
		"security/detect-unsafe-regex": "off",
	},

	overrides: [
		{
			/* ensure cjs and mjs files are linted too */
			files: ["*.cjs", "*.mjs"],
		},

		{
			files: ["docs/*.js"],
			rules: {
				/* docs scripts are expected to log to console */
				"no-console": "off",
			},
		},

		{
			/* build scripts and configurations may log to console */
			files: ["internal/*/*.{js,mjs,cjs}"],
			rules: {
				"no-console": "off",
			},
		},

		{
			files: "*.ts",
			extends: ["@html-validate/typescript"],
			rules: {
				"@typescript-eslint/no-explicit-any": "off",
				"@typescript-eslint/no-unnecessary-condition": "off",
			},
		},
		{
			files: ["docs/examples/**/*.[jt]s"],
			rules: {
				"@typescript-eslint/no-var-requires": "off",
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
			files: ["src/**/*.ts"],
			excludedFiles: ["src/**/*.spec.ts"],
			parserOptions: {
				tsconfigRootDir: __dirname,
				project: ["./tsconfig.json"],
			},
			extends: ["@html-validate/typescript-typeinfo"],
			rules: {
				"@typescript-eslint/no-explicit-any": "off",
			},
		},
		{
			files: "*.spec.[jt]s",
			excludedFiles: ["cypress/**", "tests/e2e/**"],
			extends: ["@html-validate/jest"],
		},
		{
			/* files which should lint even if project isn't build yet */
			files: ["./*.d.ts", "bin/*.js"],
			rules: {
				"import/export": "off",
				"import/extensions": "off",
				"import/no-unresolved": "off",
			},
		},
	],
};
