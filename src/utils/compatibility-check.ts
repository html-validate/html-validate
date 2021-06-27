import satisfies from "semver/functions/satisfies";
import kleur from "kleur";
import { version } from "../package";

export interface CompatibilityOptions {
	/** If `true` nothing no output will be generated on console. Default: `false` */
	silent: boolean;

	/** Use this version number instead of running version. Default: running version */
	version: string;
}

const defaults: CompatibilityOptions = {
	silent: false,
	version,
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
	const { silent, version: current } = { ...defaults, ...options };
	const valid = satisfies(current, declared);
	if (valid || silent) {
		return valid;
	}

	const text = [
		"-----------------------------------------------------------------------------------------------------",
		`${name} requires html-validate version "${declared}" but current installed version is ${current}`,
		"This is not a supported configuration. Please install a supported version before reporting bugs.",
		"-----------------------------------------------------------------------------------------------------",
	].join("\n");

	/* eslint-disable-next-line no-console */
	console.error(kleur.red(text));

	return false;
}
