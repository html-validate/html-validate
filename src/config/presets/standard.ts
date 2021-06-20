import { ConfigData } from "../config-data";

const config: ConfigData = {
	rules: {
		"attr-spacing": "error",
		"attribute-allowed-values": "error",
		"close-attr": "error",
		"close-order": "error",
		deprecated: "error",
		"deprecated-rule": "warn",
		"doctype-html": "error",
		"element-name": "error",
		"element-permitted-content": "error",
		"element-permitted-occurrences": "error",
		"element-permitted-order": "error",
		"element-required-attributes": "error",
		"element-required-content": "error",
		"multiple-labeled-controls": "error",
		"no-deprecated-attr": "error",
		"no-dup-attr": "error",
		"no-dup-id": "error",
		"no-multiple-main": "error",
		"no-raw-characters": ["error", { relaxed: true }],
		"script-element": "error",
		"unrecognized-char-ref": "error",
		"void-content": "error",
	},
};

export default config;
