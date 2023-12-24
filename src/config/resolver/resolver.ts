import { type MetaDataTable } from "../../meta";
import { type Plugin } from "../../plugin";
import { type Transformer } from "../../transform";
import { type ConfigData } from "../config-data";

/**
 * @public
 * @since 8.0.0
 */
export interface ResolverOptions {
	cache: boolean;
}

/**
 * @public
 * @since 8.0.0
 */
export interface Resolver {
	/** Name of resolver, mostly for ease of debugging */
	name: string;

	/**
	 * Resolve table of element metadata.
	 */
	resolveElements?(id: string, options: ResolverOptions): MetaDataTable | null;

	/**
	 * Resolve a configuration to extend.
	 */
	resolveConfig?(id: string, options: ResolverOptions): ConfigData | null;

	/**
	 * Resolve a plugin.
	 */
	resolvePlugin?(id: string, options: ResolverOptions): Plugin | null;

	/**
	 * Resolve a transformer.
	 */
	resolveTransformer?(id: string, options: ResolverOptions): Transformer | null;
}
