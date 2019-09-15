import glob from "glob";

interface ExpandOptions {
	cwd?: string;
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

	const files = patterns.reduce((files: string[], pattern: string) => {
		/* process - as standard input */
		if (pattern === "-") {
			pattern = "/dev/stdin";
		}
		return files.concat(glob.sync(pattern, { cwd }));
	}, []);

	/* only return unique matches */
	return Array.from(new Set(files));
}
