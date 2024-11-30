import { type Resolver } from "../config";
import { ConfigError } from "../config/error";
import { ensureError } from "../error";
import { type Plugin } from "../plugin";
import { getNamedTransformerFromPlugin } from "./get-named-transformer-from-plugin";
import { getTransformerFromModule } from "./get-transformer-from-module";
import { getUnnamedTransformerFromPlugin } from "./get-unnamed-transformer-from-plugin";
import { type Transformer } from "./transformer";
import { TRANSFORMER_API } from "./transformer-api";

function validateTransformer(transformer: Transformer): void {
	/* istanbul ignore next */
	const version = transformer.api ?? 0;

	/* check if transformer version is supported */
	if (version !== TRANSFORMER_API.VERSION) {
		throw new ConfigError(
			`Transformer uses API version ${String(version)} but only version ${String(TRANSFORMER_API.VERSION)} is supported`,
		);
	}
}

function loadTransformerFunction(
	resolvers: Resolver[],
	name: string,
	plugins: Plugin[],
): Transformer {
	/* try to match a named transformer from plugin */
	const match = name.match(/(.*):(.*)/);
	if (match) {
		const [, pluginName, key] = match;
		const transformer = getNamedTransformerFromPlugin(name, plugins, pluginName, key);
		validateTransformer(transformer);
		return transformer;
	}

	/* try to match an unnamed transformer from plugin */
	const plugin = plugins.find((cur) => cur.name === name);
	if (plugin) {
		const transformer = getUnnamedTransformerFromPlugin(name, plugin);
		validateTransformer(transformer);
		return transformer;
	}

	/* assume transformer refers to a regular module */
	const transformer = getTransformerFromModule(resolvers, name);
	validateTransformer(transformer);
	return transformer;
}

/**
 * Get transformation function requested by configuration.
 *
 * Searches:
 *
 * - Named transformers from plugins.
 * - Unnamed transformer from plugin.
 * - Standalone modules (local or node_modules)
 *
 * @internal
 * @param name - Key from configuration
 */
export function getTransformerFunction(
	resolvers: Resolver[],
	name: string,
	plugins: Plugin[],
): Transformer {
	try {
		const transformer = loadTransformerFunction(resolvers, name, plugins);
		validateTransformer(transformer);
		return transformer;
	} catch (err: unknown) {
		if (err instanceof ConfigError) {
			throw new ConfigError(`Failed to load transformer "${name}": ${err.message}`, err);
		} else {
			throw new ConfigError(`Failed to load transformer "${name}"`, ensureError(err));
		}
	}
}

/**
 * Cached version of [[getTransformerFunction]].
 *
 * @internal
 */
export function getCachedTransformerFunction(
	cache: Map<string, Transformer>,
	resolvers: Resolver[],
	name: string,
	plugins: Plugin[],
): Transformer {
	const cached = cache.get(name);
	if (cached) {
		return cached;
	} else {
		const transformer = getTransformerFunction(resolvers, name, plugins);
		cache.set(name, transformer);
		return transformer;
	}
}
