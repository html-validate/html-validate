import { type ResolvedConfig, type Resolver } from "../config";
import { type Source } from "../context";
import { transformSource, transformSourceSync } from "./transform-source";

/**
 * @internal
 */
export interface FSLike {
	readFileSync(this: void, path: string | number, options: { encoding: "utf8" }): Buffer | string;
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
	fs: FSLike,
): Promise<Source[]> {
	const stdin = 0;
	const src = filename !== "/dev/stdin" ? filename : stdin;
	const output = fs.readFileSync(src, { encoding: "utf8" });
	const data = Buffer.isBuffer(output) ? output.toString("utf8") : output;
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
	fs: FSLike,
): Source[] {
	const stdin = 0;
	const src = filename !== "/dev/stdin" ? filename : stdin;
	const output = fs.readFileSync(src, { encoding: "utf8" });
	const data = Buffer.isBuffer(output) ? output.toString("utf8") : output;
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
