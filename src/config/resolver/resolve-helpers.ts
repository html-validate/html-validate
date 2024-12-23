import { UserError } from "../../error";
import { type MetaDataTable } from "../../meta";
import { type Plugin } from "../../plugin";
import { type Transformer } from "../../transform";
import { isThenable } from "../../utils";
import { type ConfigData } from "../config-data";
import { type Resolver, type ResolverOptions } from "./resolver";

type BoundResolver<K extends keyof Resolver> = Resolver & Required<Pick<Resolver, K>>;

function haveResolver<K extends keyof Resolver>(
	key: K,
	value: Resolver,
): value is BoundResolver<K> {
	return key in value;
}

function haveConfigResolver(value: Resolver): value is BoundResolver<"resolveConfig"> {
	return haveResolver("resolveConfig", value);
}

function haveElementsResolver(value: Resolver): value is BoundResolver<"resolveElements"> {
	return haveResolver("resolveElements", value);
}

function havePluginResolver(value: Resolver): value is BoundResolver<"resolvePlugin"> {
	return haveResolver("resolvePlugin", value);
}

function haveTransformerResolver(value: Resolver): value is BoundResolver<"resolveTransformer"> {
	return haveResolver("resolveTransformer", value);
}

/**
 * @internal
 */
export function resolveConfig(
	resolvers: Resolver[],
	id: string,
	options: ResolverOptions,
): ConfigData | Promise<ConfigData> {
	for (const resolver of resolvers.filter(haveConfigResolver)) {
		const config = resolver.resolveConfig(id, options);
		if (isThenable(config)) {
			return resolveConfigAsync(resolvers, id, options);
		}
		if (config) {
			return config;
		}
	}
	throw new UserError(`Failed to load configuration from "${id}"`);
}

/**
 * @internal
 */
export async function resolveConfigAsync(
	resolvers: Resolver[],
	id: string,
	options: ResolverOptions,
): Promise<ConfigData> {
	for (const resolver of resolvers.filter(haveConfigResolver)) {
		const config = await resolver.resolveConfig(id, options);
		if (config) {
			return config;
		}
	}
	throw new UserError(`Failed to load configuration from "${id}"`);
}

/**
 * @internal
 */
export function resolveElements(
	resolvers: Resolver[],
	id: string,
	options: ResolverOptions,
): MetaDataTable | Promise<MetaDataTable> {
	for (const resolver of resolvers.filter(haveElementsResolver)) {
		const elements = resolver.resolveElements(id, options);
		if (isThenable(elements)) {
			return resolveElementsAsync(resolvers, id, options);
		}
		if (elements) {
			return elements;
		}
	}
	throw new UserError(`Failed to load elements from "${id}"`);
}

/**
 * @internal
 */
export async function resolveElementsAsync(
	resolvers: Resolver[],
	id: string,
	options: ResolverOptions,
): Promise<MetaDataTable> {
	for (const resolver of resolvers.filter(haveElementsResolver)) {
		const elements = await resolver.resolveElements(id, options);
		if (elements) {
			return elements;
		}
	}
	throw new UserError(`Failed to load elements from "${id}"`);
}

/**
 * @internal
 */
export function resolvePlugin(
	resolvers: Resolver[],
	id: string,
	options: ResolverOptions,
): Plugin | Promise<Plugin> {
	for (const resolver of resolvers.filter(havePluginResolver)) {
		const plugin = resolver.resolvePlugin(id, options);
		if (isThenable(plugin)) {
			return resolvePluginAsync(resolvers, id, options);
		}
		if (plugin) {
			return plugin;
		}
	}
	throw new UserError(`Failed to load plugin from "${id}"`);
}

/**
 * @internal
 */
export async function resolvePluginAsync(
	resolvers: Resolver[],
	id: string,
	options: ResolverOptions,
): Promise<Plugin> {
	for (const resolver of resolvers.filter(havePluginResolver)) {
		const plugin = await resolver.resolvePlugin(id, options);
		if (plugin) {
			return plugin;
		}
	}
	throw new UserError(`Failed to load plugin from "${id}"`);
}

/**
 * @internal
 */
export function resolveTransformer(
	resolvers: Resolver[],
	id: string,
	options: ResolverOptions,
): Transformer | Promise<Transformer> {
	for (const resolver of resolvers.filter(haveTransformerResolver)) {
		const transformer = resolver.resolveTransformer(id, options);
		if (isThenable(transformer)) {
			return resolveTransformerAsync(resolvers, id, options);
		}
		if (transformer) {
			return transformer;
		}
	}
	throw new UserError(`Failed to load transformer from "${id}"`);
}

/**
 * @internal
 */
export async function resolveTransformerAsync(
	resolvers: Resolver[],
	id: string,
	options: ResolverOptions,
): Promise<Transformer> {
	for (const resolver of resolvers.filter(haveTransformerResolver)) {
		const transformer = await resolver.resolveTransformer(id, options);
		if (transformer) {
			return transformer;
		}
	}
	throw new UserError(`Failed to load transformer from "${id}"`);
}
