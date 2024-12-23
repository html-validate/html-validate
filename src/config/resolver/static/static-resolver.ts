import { type MetaDataTable } from "../../../meta";
import { type Plugin } from "../../../plugin";
import { type Transformer } from "../../../transform";
import { type ConfigData } from "../../config-data";
import { type Resolver } from "../resolver";

/**
 * Entries for the static resolver.
 *
 * @public
 * @since 8.0.0
 */
export interface StaticResolverMap {
	elements?: Record<string, MetaDataTable>;
	configs?: Record<string, ConfigData>;
	plugins?: Record<string, Plugin>;
	transformers?: Record<string, Transformer>;
}

/**
 * Static resolver.
 *
 * @public
 * @since 8.0.0
 */
export interface StaticResolver extends Required<Resolver> {
	addElements(id: string, elements: MetaDataTable): void;
	addConfig(id: string, config: ConfigData): void;
	addPlugin(id: string, plugin: Plugin): void;
	addTransformer(id: string, transformer: Transformer): void;
}

/**
 * Create a new resolver for static content, i.e. plugins or transformers known
 * at compile time.
 *
 * @public
 * @since 8.0.0
 */
export function staticResolver(map: StaticResolverMap = {}): StaticResolver {
	const { elements = {}, configs = {}, plugins = {}, transformers = {} } = map;
	return {
		name: "static-resolver",
		addElements(id: string, value: MetaDataTable): void {
			elements[id] = value;
		},
		addConfig(id: string, value: ConfigData): void {
			configs[id] = value;
		},
		addPlugin(id: string, value: Plugin): void {
			plugins[id] = value;
		},
		addTransformer(id: string, value: Transformer): void {
			transformers[id] = value;
		},
		resolveElements(id: string): MetaDataTable | null {
			return elements[id] ?? null;
		},
		resolveConfig(id: string): ConfigData | null {
			return configs[id] ?? null;
		},
		resolvePlugin(id: string): Plugin | null {
			return plugins[id] ?? null;
		},
		resolveTransformer(id: string): Transformer | null {
			return transformers[id] ?? null;
		},
	};
}
