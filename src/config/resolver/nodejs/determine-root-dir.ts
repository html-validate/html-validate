import fs from "node:fs";
import path from "node:path";

let cachedRootDir: string | null = null;

interface FSLike {
	existsSync(path: string): boolean;
}

/**
 * @internal
 */
export function determineRootDirImpl(intial: string, fs: FSLike): string {
	/* try to locate package.json */
	let current = intial;

	for (;;) {
		const search = path.join(current, "package.json");
		if (fs.existsSync(search)) {
			return current;
		}

		/* get the parent directory */
		const child = current;
		current = path.dirname(current);

		/* stop if this is the root directory */
		if (current === child) {
			break;
		}
	}

	/* default to working directory if no package.json is found */
	return intial;
}

/**
 * Try to determine root directory based on the location of the closest
 * `package.json`. Fallbacks on `process.cwd()` if no package.json was found.
 *
 * @internal
 */
/* istanbul ignore next: cached version of determineRootDirImpl, no need to test */
export function determineRootDir(): string {
	cachedRootDir ??= determineRootDirImpl(process.cwd(), fs);
	return cachedRootDir;
}
