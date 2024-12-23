import { UserError } from "../../../error";
import { type MetaDataTable } from "../../../meta";
import { type Plugin } from "../../../plugin";
import { type Transformer } from "../../../transform";
import { type ConfigData } from "../../config-data";
import { type Resolver } from "../resolver";
import { importFunction } from "./import-function";

export async function internalImport<T = unknown>(id: string): Promise<T | null> {
	const { default: defaultImport } = (await importFunction(id)) as { default?: T };
	if (!defaultImport) {
		throw new UserError(`"${id}" does not have a default export`);
	}
	return defaultImport;
}

/**
 * ESM resolver.
 *
 * @public
 * @since 9.0.0
 */
export type ESMResolver = Required<Resolver>;

/**
 * Create a new resolver for  using `import(..)`.
 *
 * @public
 * @since 9.0.0
 */
export function esmResolver(): ESMResolver {
	return {
		name: "esm-resolver",

		resolveElements(id: string): Promise<MetaDataTable | null> {
			return internalImport(id);
		},

		resolveConfig(id: string): Promise<ConfigData | null> {
			return internalImport(id);
		},

		resolvePlugin(id: string): Promise<Plugin | null> {
			return internalImport<Plugin>(id);
		},

		async resolveTransformer(id: string): Promise<Transformer | null> {
			return internalImport(id);
		},
	};
}
