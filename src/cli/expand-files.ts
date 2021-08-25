import fs from "fs";
import path from "path";
import glob from "glob";

const DEFAULT_EXTENSIONS = ["html"];

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

function getFullPath(cwd: string, filename: string): string {
	if (path.isAbsolute(filename)) {
		return filename;
	} else {
		return path.join(cwd, filename);
	}
}

function directoryPattern(extensions: string[]): string {
	switch (extensions.length) {
		case 0:
			return "**";
		case 1:
			return path.join("**", `*.${extensions[0]}`);
		default:
			return path.join("**", `*.{${extensions.join(",")}}`);
	}
}

/**
 * Takes a number of file patterns (globs) and returns array of expanded
 * filenames.
 */
export function expandFiles(patterns: string[], options: ExpandOptions): string[] {
	const cwd = options.cwd || process.cwd();
	const extensions = options.extensions || DEFAULT_EXTENSIONS;

	const files = patterns.reduce((result: string[], pattern: string) => {
		/* process - as standard input */
		if (pattern === "-") {
			result.push("/dev/stdin");
			return result;
		}

		for (const filename of glob.sync(pattern, { cwd })) {
			/* if file is a directory recursively expand files from it */
			const fullpath = getFullPath(cwd, filename);
			if (isDirectory(fullpath)) {
				const dir = expandFiles([directoryPattern(extensions)], { ...options, cwd: fullpath });
				result = result.concat(dir.map((cur) => path.join(filename, cur)));
				continue;
			}

			result.push(filename);
		}

		return result;
	}, []);

	/* only return unique matches */
	return Array.from(new Set(files));
}
