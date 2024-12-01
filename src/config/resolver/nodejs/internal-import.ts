import fs from "node:fs/promises";
import { UserError } from "../../../error";
import { type ResolverOptions } from "../resolver";

interface RequireError extends Error {
	code: string;
}

let cachebuster = 1;

function getModuleName(
	id: string,
	{ cache, rootDir }: { cache: boolean; rootDir: string },
): string {
	const moduleName = id.replace("<rootDir>", rootDir);

	/* istanbul ignore next: the tests only runs the cached versions */
	if (cache) {
		return `${moduleName}?cachebuster=${String(cachebuster++)}`;
	} else {
		return moduleName;
	}
}

function isRequireError(error: unknown): error is RequireError {
	return Boolean(error && typeof error === "object" && "code" in error);
}

export async function internalImport<T = unknown>(
	id: string,
	rootDir: string,
	{ cache }: ResolverOptions,
): Promise<T | null> {
	/* this is a workaround for rollup which mangles import attributes so we
	 * cannot use `import(.., { with: { type: "json" } })` to import a json
	 * file. */
	if (id.endsWith(".json")) {
		const content = await fs.readFile(id, "utf-8");
		return JSON.parse(content) as T;
	}

	const moduleName = getModuleName(id, { cache, rootDir });

	try {
		const { default: defaultImport } = (await import(moduleName)) as { default: T };
		if (!defaultImport) {
			throw new UserError(`"${id}" does not have a default export`);
		}
		return defaultImport;
	} catch (err: unknown) {
		if (isRequireError(err) && err.code === "MODULE_NOT_FOUND") {
			return null;
		}
		throw err;
	}
}
