import { type Plugin } from "../plugin";
import { type AriaVersion } from "./aria-version";
import { type RuleConfig } from "./rule-config";
import { type TransformMap } from "./transform-map";

/**
 * @public
 */
export interface ConfigData {
	/**
	 * If set to true no new configurations will be searched.
	 */
	root?: boolean;

	/**
	 * ARIA specification version to use.
	 *
	 * One of:
	 *
	 * - `"1.2"` (default)
	 * - `"1.3"`
	 * - `"latest"`
	 */
	aria?: AriaVersion;

	/**
	 * List of configuration presets to extend.
	 *
	 * The following sources are allowed:
	 *
	 * - One of the [predefined presets](https://html-validate.org/rules/presets.html).
	 * - Node module exporting a preset.
	 * - Plugin exporting a named preset.
	 * - Local path to a JSON or js file exporting a preset.
	 */
	extends?: string[];

	/**
	 * List of sources for element metadata.
	 *
	 * The following sources are allowed:
	 *
	 * - "html5" (default) for the builtin metadata.
	 * - node module which export metadata
	 * - local path to JSON or js file exporting metadata.
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
