import { type FlatConfigObject } from "../../flat-config/flat-config";
import { type ConfigData } from "../config-data";

/** @public */
const config = {
	rules: {
		"attr-quotes": "off",
		"doctype-style": "off",
		"void-style": "off",
	},
} satisfies ConfigData & FlatConfigObject;

export default config;
