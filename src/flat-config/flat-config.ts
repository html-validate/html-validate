import { type RuleConfig } from "../config";
import { type MetaDataTable } from "../meta";
import { type Plugin } from "../plugin";
import { type Transformer } from "../transform";

/**
 * A single object in a flat configuration file.
 *
 * @public
 * @since %version%
 */
export interface FlatConfigObject {
	/**
	 * Optional name of this configuration object.
	 *
	 * Used for troubleshooting and error messages.
	 */
	name?: string;

	/**
	 * An array of glob patterns indicating the files that the configuration
	 * object should apply to.
	 *
	 * If not specified, the configuration object applies to all files matched by
	 * any other configuration object.
	 */
	files?: string[];

	/**
	 * An array of glob patterns indicating the files that the configuration object should not apply to.
	 *
	 * If not specified, the configuration object applies to all files matches by `files`.
	 *
	 * If `ignores` is used without any other keys in the configuration object,
	 * then the patterns act as a global ignores and gets applied to every
	 * configuration object.
	 */
	ignores?: string[];

	/**
	 * Element metadata sources.
	 */
	elements?: MetaDataTable[];

	/**
	 * Plugins
	 */
	plugins?: Plugin[];

	/**
	 * Source file transformations.
	 *
	 * Maps a regular-expression pattern (matched against the filename) to a
	 * transformer function.
	 */
	transform?: Record<string, Transformer>;

	/**
	 * Rule configuration.
	 */
	rules?: RuleConfig;
}

/**
 * @public
 * @since %version%
 */
export type FlatConfig = FlatConfigObject[];
