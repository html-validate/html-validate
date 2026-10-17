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
 * @since 11.5.0
 */
/* @__NO_SIDE_EFFECTS__ */
export function defineFlatConfig(config: FlatConfig): FlatConfig {
	return config;
}
