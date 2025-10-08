import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { UserError } from "../../../error";
import { importResolve } from "../../../resolve";
import { type ResolverOptions } from "../resolver";
import { importFunction } from "./import-function";

/**
 * @internal
 */
export interface ImportError extends Error {
	code: string;
	requireStack?: string[];
}

async function getModuleName(
	id: string,
	{ cache, rootDir }: { cache: boolean; rootDir: string },
): Promise<URL> {
	const moduleName = id.replace("<rootDir>", rootDir);
	const url = existsSync(id) ? pathToFileURL(id) : importResolve(moduleName);

	if (url.protocol !== "file:") {
		return url;
	}

	/* istanbul ignore else: the tests only runs the cached versions */
	if (cache) {
		return url;
	} else {
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
		return url;
	}
}

function isImportError(error: unknown): error is ImportError {
	return Boolean(error && typeof error === "object" && "code" in error);
}

/**
 * @internal
 */
export async function internalImport<T = unknown>(
	id: string,
	rootDir: string,
	{ cache }: ResolverOptions,
): Promise<T | null> {
	/* this is a workaround for rollup which mangles import attributes so we
	 * cannot use `import(.., { with: { type: "json" } })` to import a json
	 * file. */
	/* istanbul ignore if: workaround, not tested, should be removed if the compiler bug is fixed */
	if (id.endsWith(".json")) {
		const content = await fs.readFile(id, "utf-8");
		return JSON.parse(content) as T;
	}

	try {
		const url = await getModuleName(id, { cache, rootDir });
		if (url.protocol !== "file:") {
			return null;
		}
		const moduleName = url.toString();
		const { default: defaultImport } = (await importFunction(moduleName)) as { default: T };
		if (!defaultImport) {
			throw new UserError(`"${id}" does not have a default export`);
		}
		return defaultImport;
	} catch (err: unknown) {
		if (isImportError(err) && err.code === "MODULE_NOT_FOUND" && !err.requireStack) {
			return null;
		}
		throw err;
	}
}
