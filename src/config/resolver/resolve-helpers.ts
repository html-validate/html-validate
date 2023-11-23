import { UserError } from "../../error";
import { type Plugin } from "../../plugin";
import { type Transformer } from "../../transform";
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
): ConfigData {
	for (const resolver of resolvers.filter(haveConfigResolver)) {
		const config = resolver.resolveConfig(id, options);
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
): unknown {
	for (const resolver of resolvers.filter(haveElementsResolver)) {
		const elements = resolver.resolveElements(id, options);
		if (elements) {
			return elements;
		}
	}
	throw new UserError(`Failed to load elements from "${id}"`);
}

/**
 * @internal
 */
export function resolvePlugin(resolvers: Resolver[], id: string, options: ResolverOptions): Plugin {
	for (const resolver of resolvers.filter(havePluginResolver)) {
		const plugin = resolver.resolvePlugin(id, options);
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
): Transformer {
	for (const resolver of resolvers.filter(haveTransformerResolver)) {
		const transformer = resolver.resolveTransformer(id, options);
		if (transformer) {
			return transformer;
		}
	}
	throw new UserError(`Failed to load transformer from "${id}"`);
}
