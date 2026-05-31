import fs from "node:fs";
import path from "node:path";

const FLAT_CONFIG_FILES = [
	"html-validate.config.mjs",
	"html-validate.config.cjs",
	"html-validate.config.js",
	"html-validate.config.mts",
	"html-validate.config.cts",
	"html-validate.config.ts",
];

/**
 * Traverse upward from `startDir` looking for a flat config file.
 *
 * Returns the absolute path to the first match, or `null` if none is found.
 *
 * @internal
 */
export function findFlatConfigFile(startDir: string): string | null {
	let current = path.resolve(startDir);
	const root = path.parse(current).root;

	for (;;) {
		for (const filename of FLAT_CONFIG_FILES) {
			const candidate = path.join(current, filename);
			if (fs.existsSync(candidate)) {
				return candidate;
			}
		}

		const parent = path.dirname(current);
		if (current === root || parent === current) {
			return null;
		}
		current = parent;
	}
}
