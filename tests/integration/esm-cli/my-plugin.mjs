import { definePlugin, Rule } from "html-validate";

class CustomRule extends Rule {}

function customTransformer(source) {
	return [source];
}

customTransformer.api = 1;

export default definePlugin({
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
