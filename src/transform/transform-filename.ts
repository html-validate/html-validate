import fs from "node:fs";
import { type ResolvedConfig, type Resolver } from "../config";
import { type Source } from "../context";
import { transformSource, transformSourceSync } from "./transform-source";

/**
 * Wrapper around [[transformSource]] which reads a file before passing it as-is
 * to transformSource.
 *
 * @internal
 * @param filename - Filename to transform (according to configured
 * transformations)
 * @returns A list of transformed sources ready for validation.
 */
export function transformFilename(
	resolvers: Resolver[],
	config: ResolvedConfig,
	filename: string,
): Promise<Source[]> {
	const stdin = 0;
	const src = filename !== "/dev/stdin" ? filename : stdin;
	const data = fs.readFileSync(src, { encoding: "utf8" });
	const source: Source = {
		data,
		filename,
		line: 1,
		column: 1,
		offset: 0,
		originalData: data,
	};
	return transformSource(resolvers, config, source, filename);
}

/**
 * Wrapper around [[transformSource]] which reads a file before passing it as-is
 * to transformSource.
 *
 * @internal
 * @param filename - Filename to transform (according to configured
 * transformations)
 * @returns A list of transformed sources ready for validation.
 */
export function transformFilenameSync(
	resolvers: Resolver[],
	config: ResolvedConfig,
	filename: string,
): Source[] {
	const stdin = 0;
	const src = filename !== "/dev/stdin" ? filename : stdin;
	const data = fs.readFileSync(src, { encoding: "utf8" });
	const source: Source = {
		data,
		filename,
		line: 1,
		column: 1,
		offset: 0,
		originalData: data,
	};
	return transformSourceSync(resolvers, config, source, filename);
}
