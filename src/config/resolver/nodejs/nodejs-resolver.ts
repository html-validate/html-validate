import path from "node:path";
import { type MetaDataTable } from "../../../meta";
import { type Plugin } from "../../../plugin";
import { legacyRequire } from "../../../resolve";
import { type Transformer } from "../../../transform";
import { requireUncached } from "../../../utils";
import { type ConfigData } from "../../config-data";
import { ConfigError } from "../../error";
import { type Resolver, type ResolverOptions } from "../resolver";
import { determineRootDir } from "./determine-root-dir";
import { expandRelativePath } from "./expand-relative-path";

/**
 * @internal
 */
export interface RequireError extends Error {
	code: string;
}

function isRequireError(error: unknown): error is RequireError {
	return Boolean(error && typeof error === "object" && "code" in error);
}

function isTransformer(value: Transformer | Plugin): value is Transformer {
	return typeof value === "function";
}

/**
 * NodeJS resolver.
 *
 * @public
 * @since 8.0.0
 */
export type NodeJSResolver = Required<Resolver>;

/**
 * Create a new resolver for NodeJS packages using `require(..)`.
 *
 * If the module name contains `<rootDir>` (e.g. `<rootDir/foo`) it will be
 * expanded relative to the root directory either explicitly set by the
 * `rootDir` parameter or determined automatically by the closest `package.json`
 * file (starting at the current working directory).
 *
 * @public
 * @since 8.0.0
 */
export function nodejsResolver(options: { rootDir?: string } = {}): NodeJSResolver {
	const rootDir = options.rootDir ?? determineRootDir();

	function internalRequire<T = unknown>(id: string, { cache }: ResolverOptions): T | null {
		const moduleName = id.replace("<rootDir>", rootDir);
		try {
			/* istanbul ignore else: the tests only runs the cached versions to get
			 * unmodified access to `require`, the implementation of `requireUncached`
			 * is assumed to be tested elsewhere */
			if (cache) {
				return legacyRequire(moduleName) as T;
			} else {
				return requireUncached(legacyRequire, moduleName) as T;
			}
		} catch (err: unknown) {
			if (isRequireError(err) && err.code === "MODULE_NOT_FOUND") {
				return null;
			}
			throw err;
		}
	}

	return {
		name: "nodejs-resolver",

		resolveElements(id: string, options: ResolverOptions): MetaDataTable | null {
			return internalRequire(id, options);
		},

		resolveConfig(id: string, options: ResolverOptions): ConfigData | null {
			const configData = internalRequire<ConfigData>(id, options);
			if (!configData) {
				return null;
			}

			/* expand any relative paths */
			const cwd = path.dirname(id);
			const expand = <T>(value: string | T): string | T => expandRelativePath(value, { cwd });

			if (Array.isArray(configData.elements)) {
				configData.elements = configData.elements.map(expand);
			}

			if (Array.isArray(configData.extends)) {
				configData.extends = configData.extends.map(expand);
			}

			if (Array.isArray(configData.plugins)) {
				configData.plugins = configData.plugins.map(expand);
			}

			return configData;
		},

		resolvePlugin(id: string, options: ResolverOptions): Plugin | null {
			return internalRequire<Plugin>(id, options);
		},

		resolveTransformer(id: string, options: ResolverOptions): Transformer | null {
			const mod = internalRequire<Transformer | Plugin>(id, options);
			if (!mod) {
				return null;
			}

			if (isTransformer(mod)) {
				return mod;
			}

			/* this is not a proper transformer, is it a plugin exposing a transformer? */
			if (mod.transformer) {
				throw new ConfigError(
					`Module "${id}" is not a valid transformer. This looks like a plugin, did you forget to load the plugin first?`,
				);
			}

			throw new ConfigError(`Module "${id}" is not a valid transformer.`);
		},
	};
}
