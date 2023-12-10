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
	resolveElements?(
		id: string,
		options: ResolverOptions,
	): MetaDataTable | Promise<MetaDataTable | null> | null;

	/**
	 * Resolve a configuration to extend.
	 */
	resolveConfig?(
		id: string,
		options: ResolverOptions,
	): ConfigData | Promise<ConfigData | null> | null;

	/**
	 * Resolve a plugin.
	 */
	resolvePlugin?(id: string, options: ResolverOptions): Plugin | Promise<Plugin | null> | null;

	/**
	 * Resolve a transformer.
	 */
	resolveTransformer?(
		id: string,
		options: ResolverOptions,
	): Transformer | Promise<Transformer | null> | null;
}
