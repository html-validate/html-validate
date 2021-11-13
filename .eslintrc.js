require("@html-validate/eslint-config/patch/modern-module-resolution");

module.exports = {
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
			files: "*.spec.[jt]s",
			excludedFiles: "cypress/**",
			extends: ["@html-validate/jest"],
			rules: {
				"sonarjs/no-identical-functions": "off",
				"@typescript-eslint/no-non-null-assertion": "off",
			},
		},
	],
};
