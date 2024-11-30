import { ConfigError } from "../config/error";
import { type Plugin } from "../plugin";
import { type Transformer } from "./transformer";

/**
 * @internal
 * @param name - Original name from configuration
 * @param plugin - Plugin instance
 */
export function getUnnamedTransformerFromPlugin(name: string, plugin: Plugin): Transformer {
	if (!plugin.transformer) {
		throw new ConfigError(`Plugin does not expose any transformer`);
	}

	if (typeof plugin.transformer !== "function") {
		if (plugin.transformer.default) {
			return plugin.transformer.default;
		}
		throw new ConfigError(
			`Transformer "${name}" refers to unnamed transformer but plugin exposes only named.`,
		);
	}

	return plugin.transformer;
}
