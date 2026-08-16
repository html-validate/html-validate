import { type Plugin } from "../plugin";
import { getNamedTransformerFromPlugin } from "./get-named-transformer-from-plugin";
import { getUnnamedTransformerFromPlugin } from "./get-unnamed-transformer-from-plugin";
import { type Transformer } from "./transformer";

/**
 * Resolve a transformer referenced by name from a list of plugins.
 *
 * Supports:
 *
 * - Unnamed transformers, e.g. `"my-plugin"`.
 * - Named transformers, e.g. `"my-plugin:key"`.
 *
 * @internal
 * @param name - Name from configuration.
 * @param plugins - List of loaded plugins to search.
 * @returns The resolved transformer, or `null` if `name` does not use the
 * `plugin:key` syntax and does not match the name of any loaded plugin. If
 * `name` uses the `plugin:key` syntax but no matching plugin (or named
 * transformer) is found this throws a `ConfigError` rather than returning
 * `null`.
 */
export function getTransformerFromPlugins(name: string, plugins: Plugin[]): Transformer | null {
	/* try to match a named transformer from plugin, e.g. "plugin-name:key" */
	const match = /(.*):(.*)/.exec(name);
	if (match) {
		const [, pluginName, key] = match;
		return getNamedTransformerFromPlugin(name, plugins, pluginName, key);
	}

	/* try to match an unnamed transformer from plugin */
	const plugin = plugins.find((cur) => cur.name === name);
	if (plugin) {
		return getUnnamedTransformerFromPlugin(name, plugin);
	}

	return null;
}
