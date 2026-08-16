import { ConfigError } from "../config/error";
import { type Plugin } from "../plugin";
import { getTransformerFromPlugins } from "../transform/get-transformer-from-plugins";
import { type Transformer } from "../transform/transformer";

/**
 * Resolve a `transform` entry from a flat configuration.
 *
 * @internal
 * @param entry - Entry from configuration.
 * @param plugins - List of plugins present in the (merged) configuration.
 */
export function resolveFlatConfigTransformer(
	entry: string | Transformer,
	plugins: Plugin[],
): Transformer {
	if (typeof entry === "function") {
		return entry;
	}

	const transformer = getTransformerFromPlugins(entry, plugins);
	if (!transformer) {
		throw new ConfigError(`No plugin named "${entry}" has been loaded`);
	}
	return transformer;
}
