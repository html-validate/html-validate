const { Rule, definePlugin } = require("html-validate");

class CustomRule extends Rule {}

function customTransformer(source) {
	return [source];
}

customTransformer.api = 1;

module.exports = definePlugin({
	name: "my-plugin",
	configs: {
		recommended: {
			rules: {
				"my-plugin/custom-rule": "error",
			},
		},
	},
	rules: {
		"my-plugin/custom-rule": CustomRule,
	},
	transformer: {
		default: customTransformer,
	},
});
