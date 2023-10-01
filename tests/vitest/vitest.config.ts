import { defineConfig } from "vite";

export default defineConfig({
	resolve: {
		alias: {
			"html-validate/vitest": "../../dist/es/vitest.js",
			"html-validate": "../../dist/es/index.js",
		},
	},
});
