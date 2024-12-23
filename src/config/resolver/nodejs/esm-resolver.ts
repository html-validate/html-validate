import path from "node:path";
import { type MetaDataTable } from "../../../meta";
import { type Plugin } from "../../../plugin";
import { type Transformer } from "../../../transform";
import { type ConfigData } from "../../config-data";
import { ConfigError } from "../../error";
import { type Resolver, type ResolverOptions } from "../resolver";
import { determineRootDir } from "./determine-root-dir";
import { expandRelativePath } from "./expand-relative-path";
import { internalImport } from "./internal-import";

function isTransformer(value: Transformer | Plugin): value is Transformer {
	return typeof value === "function";
}

/**
 * ESM resolver.
 *
 * @public
 * @since 9.0.0
 */
export type ESMResolver = Required<Resolver>;

/**
 * Create a new resolver for NodeJS packages using `import(..)`.
 *
 * If the module name contains `<rootDir>` (e.g. `<rootDir/foo`) it will be
 * expanded relative to the root directory either explicitly set by the
 * `rootDir` parameter or determined automatically by the closest `package.json`
 * file (starting at the current working directory).
 *
 * @public
 * @since 9.0.0
 */
export function esmResolver(options: { rootDir?: string } = {}): ESMResolver {
	const rootDir = options.rootDir ?? determineRootDir();

	return {
		name: "esm-resolver",

		resolveElements(id: string, options: ResolverOptions): Promise<MetaDataTable | null> {
			return internalImport(id, rootDir, options);
		},

		async resolveConfig(id: string, options: ResolverOptions): Promise<ConfigData | null> {
			const configData = await internalImport<ConfigData>(id, rootDir, options);
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

		resolvePlugin(id: string, options: ResolverOptions): Promise<Plugin | null> {
			return internalImport<Plugin>(id, rootDir, options);
		},

		async resolveTransformer(id: string, options: ResolverOptions): Promise<Transformer | null> {
			const mod = await internalImport<Transformer | Plugin>(id, rootDir, options);
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
