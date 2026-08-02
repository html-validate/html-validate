import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { type FlatConfig } from "./flat-config";

/**
 * @internal
 */
export async function loadFlatConfigFile(
	filePath: string,
	importFn: (m: string) => Promise<unknown>,
): Promise<FlatConfig> {
	const url = pathToFileURL(filePath);
	const stat = await fs.stat(url);
	url.searchParams.append("mtime", String(stat.mtime.getTime()));
	const module = (await importFn(url.href)) as { default?: unknown };
	const value = module.default;

	if (!Array.isArray(value)) {
		throw new TypeError(
			`Flat config file "${filePath}" must have a default export that is an array of configuration objects`,
		);
	}

	const filtered = value.filter((entry) => entry !== null && entry !== undefined);
	for (const entry of filtered) {
		if (typeof entry !== "object" || Array.isArray(entry)) {
			throw new TypeError(
				`Flat config file "${filePath}" must have a default export that is an array of configuration objects`,
			);
		}
	}

	return filtered as FlatConfig;
}
