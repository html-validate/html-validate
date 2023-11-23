import kleur from "kleur";
import { version } from "../generated/package";
import { type CompatibilityOptions, compatibilityCheckImpl } from "./compatibility-check";

const defaults: CompatibilityOptions = {
	silent: false,
	version,
	logger(text: string): void {
		/* eslint-disable-next-line no-console -- expected to log */
		console.error(kleur.red(text));
	},
};

/**
 * Tests if plugin is compatible with html-validate library. Unless the `silent`
 * option is used a warning is displayed on the console.
 *
 * @public
 * @since v5.0.0
 * @param name - Name of plugin
 * @param declared - What library versions the plugin support (e.g. declared peerDependencies)
 * @returns - `true` if version is compatible
 */
export function compatibilityCheck(
	name: string,
	declared: string,
	options?: Partial<CompatibilityOptions>,
): boolean {
	return compatibilityCheckImpl(name, declared, {
		...defaults,
		...options,
	});
}
