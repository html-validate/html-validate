import path from "node:path";

/**
 * @internal
 */
export function expandRelativePath<T>(value: string | T, { cwd }: { cwd: string }): string | T {
	if (typeof value === "string" && value[0] === ".") {
		return path.normalize(path.join(cwd, value));
	} else {
		return value;
	}
}
