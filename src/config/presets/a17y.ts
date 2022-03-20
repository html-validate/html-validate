import { ConfigData } from "../config-data";

const config: ConfigData = {
	rules: {
		"aria-hidden-body": "error",
		"aria-label-misuse": "error",
		"deprecated-rule": "warn",
		"empty-heading": "error",
		"empty-title": "error",
		"meta-refresh": "error",
		"multiple-labeled-controls": "error",
		"no-autoplay": ["error", { include: ["audio", "video"] }],
		"no-dup-id": "error",
		"no-redundant-for": "error",
		"no-redundant-role": "error",
		"prefer-native-element": "error",
		"svg-focusable": "off",
		"text-content": "error",
		"wcag/h30": "error",
		"wcag/h32": "error",
		"wcag/h36": "error",
		"wcag/h37": "error",
		"wcag/h67": "error",
		"wcag/h71": "error",
	},
};

export default config;
