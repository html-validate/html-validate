import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { type FlatConfig } from "./flat-config";

export async function loadFlatConfigFile(filePath: string): Promise<FlatConfig> {
	const url = pathToFileURL(filePath);
	const stat = await fs.stat(url);
	url.searchParams.append("mtime", String(stat.mtime.getTime()));
	const module = (await import(url.href)) as { default?: unknown };
	const value = module.default;

	if (!Array.isArray(value)) {
		throw new TypeError(
			`Flat config file "${filePath}" must have a default export that is an array`,
		);
	}

	return value as FlatConfig;
}
