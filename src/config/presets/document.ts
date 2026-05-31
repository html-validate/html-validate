import { type FlatConfigObject } from "../../flat-config/flat-config";
import { type ConfigData } from "../config-data";

/** @public */
const config = {
	rules: {
		"input-missing-label": "error",
		"heading-level": "error",
		"missing-doctype": "error",
		"no-missing-references": "error",
		"require-sri": "error",
	},
} satisfies ConfigData & FlatConfigObject;

export default config;
