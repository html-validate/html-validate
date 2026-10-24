import { defineConfig } from "html-validate";

export default defineConfig({
	root: true,
	extends: [
		"html-validate:recommended",
		"html-validate:document",
		"html-validate:prettier",
		"my-plugin:recommended",
		"./shared-config.mjs",
	],
	elements: ["html5", "./elements.mjs"],
	plugins: ["./my-plugin.mjs"],
	transform: {
		"\\.html$": "my-plugin",
	},
});
