import { type ConfigData } from "../config-data";

const config: ConfigData = {
	rules: {
		/* doctype is usually not included when fetching source code from browser */
		"missing-doctype": "off",

		/* some frameworks (such as jQuery) often uses inline style, e.g. for
		 * showing/hiding elements so it is counter-productive to check for inline
		 * style. If anything it should be used on original sorce code only. */
		"no-inline-style": "off",

		/* scripts will often add markup with trailing whitespace */
		"no-trailing-whitespace": "off",

		/* browser normalizes boolean attributes */
		"attribute-boolean-style": "off",
		"attribute-empty-style": "off",

		/* the browser will often do what it wants, out of users control */
		"void-style": "off",
		"no-self-closing": "off",
	},
};

export default config;
