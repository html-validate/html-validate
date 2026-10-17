import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

/* esbuild emits the annotation as a line comment, rollup as a block comment */
const annotation =
	/(?:\/\*\s*[@#]__NO_SIDE_EFFECTS__\s*\*\/|\/\/\s*[@#]__NO_SIDE_EFFECTS__[^\n]*\n)\s*(?:export\s+)?$/;

/**
 * Pure helpers (`defineConfig()`, `defineMetadata()`, etc) must be annotated
 * with `@__NO_SIDE_EFFECTS__` in the compiled output so bundlers can drop
 * unused calls. This guards against the annotation being stripped by a
 * change to the build pipeline.
 *
 * @returns {Promise<void>}
 */
export async function validateSideEffectAnnotations() {
	const entrypoint = path.resolve("dist/esm/index.js");
	const exported = await import(pathToFileURL(entrypoint).href);
	const helpers = Object.keys(exported).filter((it) => /^define[A-Z]/.test(it));
	if (helpers.length === 0) {
		throw new Error(`No "define*" helpers found in "${entrypoint}"`);
	}

	for (const format of ["esm", "cjs"]) {
		const files = await Array.fromAsync(fs.glob(`dist/${format}/**/*.{js,mjs,cjs}`));

		/** @type {Map<string, Array<{ filePath: string, annotated: boolean }>>} */
		const declarations = new Map();
		for (const filePath of files) {
			const content = await fs.readFile(filePath, "utf8");
			for (const match of content.matchAll(/function\s+(define[A-Z]\w*)\s*\(/g)) {
				const before = content.slice(0, match.index);
				const list = declarations.get(match[1]) ?? [];
				list.push({ filePath, annotated: annotation.test(before) });
				declarations.set(match[1], list);
			}
		}

		for (const name of helpers) {
			const found = declarations.get(name);
			if (!found) {
				throw new Error(`"${name}()" declaration not found in dist/${format}`);
			}
			for (const { filePath, annotated } of found) {
				if (!annotated) {
					throw new Error(
						`"${name}()" in "${filePath}" is missing @__NO_SIDE_EFFECTS__ annotation`,
					);
				}
			}
		}
	}
}
