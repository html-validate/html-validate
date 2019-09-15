import fs from "fs";
import glob from "glob";
import path from "path";

interface ExpandOptions {
	cwd?: string;
}

function isDirectory(filename: string): boolean {
	const st = fs.statSync(filename);
	return st.isDirectory();
}

/**
 * Takes a number of file patterns (globs) and returns array of expanded
 * filenames.
 */
export function expandFiles(
	patterns: string[],
	options: ExpandOptions = {}
): string[] {
	const cwd = options.cwd || process.cwd();

	const files = patterns.reduce((result: string[], pattern: string) => {
		/* process - as standard input */
		if (pattern === "-") {
			pattern = "/dev/stdin";
		}

		for (const filename of glob.sync(pattern, { cwd })) {
			/* if file is a directory recursively expand files from it */
			const fullpath = path.join(cwd, filename);
			if (isDirectory(fullpath)) {
				const dir = expandFiles(
					["**"],
					Object.assign({}, options, { cwd: fullpath })
				);
				result = result.concat(dir.map(cur => path.join(filename, cur)));
				continue;
			}

			result.push(filename);
		}

		return result;
	}, []);

	/* only return unique matches */
	return Array.from(new Set(files));
}
