import { defineConfig } from "html-validate";

/* eslint-disable-next-line unicorn/no-top-level-side-effects -- false positive */
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
