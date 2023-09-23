import fs from "fs";
import path from "node:path";
import { globSync } from "glob";

const DEFAULT_EXTENSIONS = ["html"];

/**
 * @public
 */
export interface ExpandOptions {
	/**
	 * Working directory. Defaults to `process.cwd()`.
	 */
	cwd?: string;

	/**
	 * List of extensions to search for when expanding directories. Extensions
	 * should be passed without leading dot, e.g. "html" instead of ".html".
	 */
	extensions?: string[];
}

function isDirectory(filename: string): boolean {
	const st = fs.statSync(filename);
	return st.isDirectory();
}

function join(stem: string, filename: string): string {
	if (path.isAbsolute(filename)) {
		return path.normalize(filename);
	} else {
		return path.normalize(path.join(stem, filename));
	}
}

function directoryPattern(extensions: string[]): string {
	switch (extensions.length) {
		case 0:
			return "**/*";
		case 1:
			return `**/*.${extensions[0]}`;
		default:
			return `**/*.{${extensions.join(",")}}`;
	}
}

/**
 * Takes a number of file patterns (globs) and returns array of expanded
 * filenames.
 */
export function expandFiles(patterns: string[], options: ExpandOptions): string[] {
	const cwd = options.cwd ?? process.cwd();
	const extensions = options.extensions ?? DEFAULT_EXTENSIONS;

	const files = patterns.reduce((result: string[], pattern: string) => {
		/* process - as standard input */
		if (pattern === "-") {
			result.push("/dev/stdin");
			return result;
		}

		for (const filename of globSync(pattern, { cwd })) {
			/* if file is a directory recursively expand files from it */
			const fullpath = join(cwd, filename);
			if (isDirectory(fullpath)) {
				const dir = expandFiles([directoryPattern(extensions)], { ...options, cwd: fullpath });
				result = result.concat(dir.map((cur) => join(filename, cur)));
				continue;
			}

			result.push(fullpath);
		}

		return result.sort((a, b) => {
			const pa = a.split("/").length;
			const pb = b.split("/").length;
			if (pa !== pb) {
				return pa - pb;
			} else {
				return a > b ? 1 : -1;
			}
		});
	}, []);

	/* only return unique matches */
	return Array.from(new Set(files));
}
