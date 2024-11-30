import { ConfigError } from "../config/error";
import { type Plugin } from "../plugin";
import { type Transformer } from "./transformer";

/**
 * @internal
 * @param name - Original name from configuration
 * @param pluginName - Name of plugin
 * @param key - Name of transform (from plugin)
 */
export function getNamedTransformerFromPlugin(
	name: string,
	plugins: Plugin[],
	pluginName: string,
	key: string,
): Transformer {
	const plugin = plugins.find((cur) => cur.name === pluginName);
	if (!plugin) {
		throw new ConfigError(`No plugin named "${pluginName}" has been loaded`);
	}

	if (!plugin.transformer) {
		throw new ConfigError(`Plugin does not expose any transformer`);
	}

	if (typeof plugin.transformer === "function") {
		throw new ConfigError(
			`Transformer "${name}" refers to named transformer but plugin exposes only unnamed, use "${pluginName}" instead.`,
		);
	}

	const transformer = plugin.transformer[key];
	if (!transformer) {
		throw new ConfigError(`Plugin "${pluginName}" does not expose a transformer named "${key}".`);
	}

	return transformer;
}
