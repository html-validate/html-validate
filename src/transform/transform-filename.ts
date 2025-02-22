import { type ResolvedConfig, type Resolver } from "../config";
import { type Source } from "../context";
import { transformSource, transformSourceSync } from "./transform-source";

/**
 * File system API required by transform functions.
 *
 * Compatible with:
 *
 * - `node:fs`
 * - `memfs`
 * - and probably more.
 *
 * @public
 * @since %version%
 */
export interface TransformFS {
	/** read file from filesystem */
	readFileSync(
		this: void,
		path: string | number,
		options: { encoding: "utf8" },
	): { toString(encoding: "utf8"): string } | string;
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
export function transformFilename(
	resolvers: Resolver[],
	config: ResolvedConfig,
	filename: string,
	fs: TransformFS,
): Promise<Source[]> {
	const stdin = 0;
	const src = filename !== "/dev/stdin" ? filename : stdin;
	const output = fs.readFileSync(src, { encoding: "utf8" });
	/* istanbul ignore next -- not testing with buffer */
	const data = typeof output === "string" ? output : output.toString("utf8");
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
	fs: TransformFS,
): Source[] {
	const stdin = 0;
	const src = filename !== "/dev/stdin" ? filename : stdin;
	const output = fs.readFileSync(src, { encoding: "utf8" });
	/* istanbul ignore next -- not testing with buffer */
	const data = typeof output === "string" ? output : output.toString("utf8");
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
