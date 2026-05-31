/* istanbul ignore file */

import { type FlatConfig } from "./flat-config";

/**
 * Helper function to assist IDE with completion and type-checking.
 *
 * @example
 *
 * ```ts
 * import { defineFlatConfig } from "html-validate";
 *
 * export default defineFlatConfig([
 *   {
 *     files: ["*.html"],
 *     rules: { "void-style": "error" },
 *   }
 * ]);
 * ```
 *
 * @public
 * @since %version%
 */
export function defineFlatConfig(config: FlatConfig): FlatConfig {
	return config;
}
