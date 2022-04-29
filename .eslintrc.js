const path = require("path");

require("@html-validate/eslint-config/patch/modern-module-resolution");

module.exports = {
	root: true,
	extends: ["@html-validate"],

	rules: {
		"security/detect-non-literal-require": "off",
		"security/detect-object-injection": "off",
		"security/detect-unsafe-regex": "off",
	},

	overrides: [
		{
			files: "*.ts",
			extends: ["@html-validate/typescript"],
			rules: {
				"@typescript-eslint/no-explicit-any": "off",
				"@typescript-eslint/no-var-requires": "off",
			},
		},
		{
			files: ["src/**/*.ts"],
			excludedFiles: ["src/**/*.spec.ts"],
			parserOptions: {
				tsconfigRootDir: path.join(__dirname, "src"),
				project: ["./tsconfig.json"],
			},
			extends: ["@html-validate/typescript-typeinfo"],
			rules: {
				"@typescript-eslint/consistent-type-exports": "off",
				"@typescript-eslint/consistent-type-imports": "off",
				"@typescript-eslint/no-unnecessary-type-assertion": "off",
				"@typescript-eslint/no-unsafe-assignment": "off",
			},
		},
		{
			files: "*.spec.[jt]s",
			excludedFiles: ["cypress/**", "tests/e2e/**"],
			extends: ["@html-validate/jest"],
			rules: {
				"sonarjs/no-identical-functions": "off",
				"@typescript-eslint/no-non-null-assertion": "off",
			},
		},
	],
};
