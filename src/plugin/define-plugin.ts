import { type Plugin } from "./plugin";

/**
 * Helper function to assist IDE with completion and type-checking.
 *
 * @public
 */
export function definePlugin(plugin: Plugin): Plugin {
	return plugin;
}
