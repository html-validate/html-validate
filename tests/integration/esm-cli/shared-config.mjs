import { defineConfig } from "html-validate";

/* eslint-disable-next-line unicorn/no-top-level-side-effects -- false positive */
export default defineConfig({
	rules: {
		"no-unknown-elements": "error",
	},
});
