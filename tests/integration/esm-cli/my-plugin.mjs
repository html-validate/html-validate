import { Rule, definePlugin } from "html-validate";

class CustomRule extends Rule {}

function customTransformer(source) {
	return [source];
}

customTransformer.api = 1;

/* eslint-disable-next-line unicorn/no-top-level-side-effects -- false positive */
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
