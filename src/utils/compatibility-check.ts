import semver from "semver";
import kleur from "kleur";
import { version } from "../../package.json";

export interface CompatibilityOptions {
	/** If `true` nothing no output will be generated on console. Default: `false` */
	silent: boolean;

	/** Use this version number instead of running version. Default: running version */
	version: string;

	/** Use custom logging callback. Default: `console.error` */
	logger(message: string): void;
}

const defaults: CompatibilityOptions = {
	silent: false,
	version,
	logger(text: string): void {
		/* eslint-disable-next-line no-console */
		console.error(kleur.red(text));
	},
};

/**
 * Tests if plugin is compatible with html-validate library. Unless the `silent`
 * option is used a warning is displayed on the console.
 *
 * @param name - Name of plugin
 * @param declared - What library versions the plugin support (e.g. declared peerDependencies)
 * @returns - `true` if version is compatible
 */
export function compatibilityCheck(
	name: string,
	declared: string,
	options?: Partial<CompatibilityOptions>
): boolean {
	const { silent, version: current, logger } = { ...defaults, ...options };
	const valid = semver.satisfies(current, declared);
	if (valid || silent) {
		return valid;
	}

	const text = [
		"-----------------------------------------------------------------------------------------------------",
		`${name} requires html-validate version "${declared}" but current installed version is ${current}`,
		"This is not a supported configuration. Please install a supported version before reporting bugs.",
		"-----------------------------------------------------------------------------------------------------",
	].join("\n");

	logger(text);

	return false;
}
