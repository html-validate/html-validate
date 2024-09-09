const { defineConfig } = require("html-validate");

module.exports = defineConfig({
	root: true,
	extends: [
		"html-validate:recommended",
		"html-validate:document",
		"html-validate:prettier",
		"my-plugin:recommended",
		"./shared-config.cjs",
	],
	elements: ["html5", "./elements.cjs"],
	plugins: ["./my-plugin.cjs"],
	transform: {
		"\\.html$": "my-plugin",
	},
});
