import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { importResolve } from "../../../resolve";
import { UserError } from "../../../error";
import { type ResolverOptions } from "../resolver";

interface RequireError extends Error {
	code: string;
}

async function getModuleName(
	id: string,
	{ cache, rootDir }: { cache: boolean; rootDir: string },
): Promise<string> {
	const moduleName = id.replace("<rootDir>", rootDir);

	const url = new URL(importResolve(moduleName));

	/* istanbul ignore next: the tests only runs the cached versions */
	if (cache) {
		return fileURLToPath(url);
	}

	/* Cachebusting in ESM is tricky, we cannot flush the cache of the old import
	 * but a common workaround is to append ?something to the path. It only works
	 * with absolute paths though so we must first use `import.meta.resolve(..)`
	 * which doesn't play nice with CJS. Then we will leak memory each time a
	 * fresh copy is loaded and there doesn't seem to be a way to deal with this
	 * yet. We use the file mtime to at least try to retain the copy as long as
	 * possible but this will fail for transitive imports but at least with
	 * directly loaded configurations it would reload property. */
	const stat = await fs.stat(url);
	url.searchParams.append("mtime", String(stat.mtime.getTime()));
	return fileURLToPath(url);
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

	try {
		const moduleName = await getModuleName(id, { cache, rootDir });
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
