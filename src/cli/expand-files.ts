import glob from "glob";

/**
 * Takes a number of file patterns (globs) and returns array of expanded
 * filenames.
 */
export function expandFiles(patterns: string[]): string[] {
	const files = patterns.reduce((files: string[], pattern: string) => {
		/* process - as standard input */
		if (pattern === "-") {
			pattern = "/dev/stdin";
		}
		return files.concat(glob.sync(pattern));
	}, []);

	/* only return unique matches */
	return Array.from(new Set(files));
}
