import { type Plugin } from "../plugin";

/**
 * @public
 */
export type RuleSeverity = "off" | "warn" | "error" | 0 | 1 | 2;

/**
 * @public
 */
export type RuleOptions = string | number | Record<string, any>;

/**
 * @public
 */
export type RuleConfig = Record<
	string,
	RuleSeverity | [RuleSeverity] | [RuleSeverity, RuleOptions]
>;

/**
 * @public
 */
export type TransformMap = Record<string, string>;

/**
 * @public
 */
export interface ConfigData {
	/**
	 * If set to true no new configurations will be searched.
	 */
	root?: boolean;

	/**
	 * List of configuration presets to extend.
	 *
	 * The following sources are allowed:
	 *
	 * - One of the [predefined presets](http://html-validate.org/rules/presets.html).
	 * - Node module exporting a preset.
	 * - Plugin exporting a named preset.
	 * - Local path to a json or js file exporting a preset.
	 */
	extends?: string[];

	/**
	 * List of sources for element metadata.
	 *
	 * The following sources are allowed:
	 *
	 * - "html5" (default) for the builtin metadata.
	 * - node module which export metadata
	 * - local path to json or js file exporting metadata.
	 * - object with inline metadata
	 *
	 * If elements isn't specified it defaults to `["html5"]`
	 */
	elements?: Array<string | Record<string, unknown>>;

	/**
	 * List of plugins.
	 *
	 * Each plugin must be resolvable be require and export the plugin interface.
	 */
	plugins?: Array<string | Plugin>;

	/**
	 * List of source file transformations. A transformer takes a filename and
	 * returns Source instances with extracted HTML-templates.
	 *
	 * Example:
	 *
	 * ```js
	 * "transform": {
	 *   "^.*\\.foo$": "my-transform"
	 * }
	 * ```
	 *
	 * To run the "my-transform" module on all .foo files.
	 */
	transform?: TransformMap;

	rules?: RuleConfig;
}
