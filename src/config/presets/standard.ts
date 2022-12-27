import { ConfigData } from "../config-data";

const config: ConfigData = {
	rules: {
		"area-alt": ["error", { accessible: false }],
		"attr-spacing": "error",
		"attribute-allowed-values": "error",
		"attribute-misuse": "error",
		"close-attr": "error",
		"close-order": "error",
		deprecated: "error",
		"deprecated-rule": "warn",
		"doctype-html": "error",
		"element-name": "error",
		"element-permitted-content": "error",
		"element-permitted-occurrences": "error",
		"element-permitted-order": "error",
		"element-permitted-parent": "error",
		"element-required-ancestor": "error",
		"element-required-attributes": "error",
		"element-required-content": "error",
		"map-dup-name": "error",
		"map-id-name": "error",
		"multiple-labeled-controls": "error",
		"no-deprecated-attr": "error",
		"no-dup-attr": "error",
		"no-dup-id": "error",
		"no-multiple-main": "error",
		"no-raw-characters": ["error", { relaxed: true }],
		"script-element": "error",
		"unrecognized-char-ref": "error",
		"valid-id": ["error", { relaxed: true }],
		"void-content": "error",
	},
};

export default config;
