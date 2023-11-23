import semver from "semver";

/**
 * Options for {@link compatibilityCheck}.
 *
 * @public
 */
export interface CompatibilityOptions {
	/** If `true` nothing no output will be generated on console. Default: `false` */
	silent: boolean;

	/**
	 * @internal
	 * Use this version number instead of running version. Default: running version.
	 */
	version: string;

	/** Use custom logging callback. Default: `console.error` */
	logger(this: void, message: string): void;
}

/**
 * @internal
 */
export function compatibilityCheckImpl(
	name: string,
	declared: string,
	options: CompatibilityOptions,
): boolean {
	const { silent, version: current, logger } = options;
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
