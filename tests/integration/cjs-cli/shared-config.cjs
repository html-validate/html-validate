const { defineConfig } = require("html-validate");

module.exports = defineConfig({
	rules: {
		"no-unknown-elements": "error",
	},
});
