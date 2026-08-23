import { Config } from "../config/config";
import { type ConfigData } from "../config/config-data";
import { type Resolver, resolveElements } from "../config/resolver";
import { type TransformMap } from "../config/transform-map";
import { bundledElements } from "../elements";
import { type MetaDataTable } from "../meta";
import { type Plugin } from "../plugin";
import { type Transformer, getTransformerFunction } from "../transform";
import { type FlatConfigObject } from "./flat-config";

async function resolveElementsList(
	resolvers: Resolver[],
	entries: Array<string | Record<string, unknown>> | undefined,
): Promise<MetaDataTable[]> {
	if (!entries) {
		return [];
	}

	const result: MetaDataTable[] = [];
	for (const entry of entries) {
		if (typeof entry !== "string") {
			result.push(entry as MetaDataTable);
			continue;
		}

		const bundled = bundledElements[entry] as MetaDataTable | undefined;
		if (bundled) {
			result.push(bundled);
			continue;
		}

		result.push(await resolveElements(resolvers, entry, { cache: false }));
	}
	return result;
}

async function resolveTransformMap(
	resolvers: Resolver[],
	transform: TransformMap,
	plugins: Plugin[],
): Promise<Record<string, Transformer>> {
	const result: Record<string, Transformer> = {};
	for (const [pattern, value] of Object.entries(transform)) {
		if (typeof value !== "string") {
			result[pattern] = value;
			continue;
		}

		result[pattern] = await getTransformerFunction(resolvers, value, plugins);
	}
	return result;
}

/**
 * Helper to assist migrating a legacy {@link ConfigData} based configuration
 * to the flat configuration format.
 *
 * @example
 *
 * ```ts
 * import { FlatCompat, esmResolver } from "html-validate";
 *
 * const compat = new FlatCompat([esmResolver()]);
 *
 * export default [
 *   await compat.extend("html-validate:recommended"),
 *   await compat.config({
 *     rules: {
 *       "void-style": "error",
 *     },
 *   }),
 * ];
 * ```
 *
 * @public
 * @since 11.6.0
 */
export class FlatCompat {
	private readonly resolvers: Resolver[];

	/**
	 * @public
	 * @since 11.6.0
	 * @param resolvers - Resolvers used to resolve `extends`, `elements`,
	 * `plugins` and `transform` references.
	 */
	public constructor(resolvers: Resolver[]) {
		this.resolvers = resolvers;
	}

	/**
	 * Convert a legacy {@link ConfigData} object into a {@link FlatConfigObject}.
	 *
	 * All references (`extends`, string entries in `elements` and `plugins`
	 * and string values in `transform`) are resolved using the resolvers
	 * passed to the constructor, fully merging any extended presets in the
	 * process.
	 *
	 * Fields that have no equivalent in the flat configuration format
	 * (`root` and `extends`) are silently omitted from the result.
	 *
	 * @public
	 * @since 11.6.0
	 * @param data - Legacy configuration to convert. If omitted an empty
	 * {@link FlatConfigObject} is returned.
	 */
	public async config(data: ConfigData | undefined): Promise<FlatConfigObject> {
		if (!data) {
			return {};
		}

		const { resolvers } = this;
		const config = await Config.fromObject(resolvers, data);
		const merged = config.get();
		const plugins = config.getPlugins();

		const [elements, transform] = await Promise.all([
			resolveElementsList(resolvers, merged.elements),
			/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- is normaliezd inside `Config` so will always be set here */
			resolveTransformMap(resolvers, merged.transform!, plugins),
		]);

		return {
			elements,
			plugins,
			transform,
			rules: merged.rules,
			aria: merged.aria,
		};
	}

	/**
	 * Extend one or more legacy configuration presets and return the
	 * resulting {@link FlatConfigObject}.
	 *
	 * Equivalent to calling {@link FlatCompat.config} with
	 * `{ extends: [...names] }`.
	 *
	 * @public
	 * @since 11.6.0
	 * @param names - One or more preset names to extend from.
	 */
	public async extend(...names: string[]): Promise<FlatConfigObject> {
		return this.config({ extends: names });
	}
}
