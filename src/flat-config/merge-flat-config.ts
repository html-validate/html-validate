import { type FlatConfigObject } from "./flat-config";

/**
 * The merged result of {@link mergeFlatConfig}.
 *
 * @internal
 */
export type MergedFlatConfig = Required<
	Pick<FlatConfigObject, "elements" | "plugins" | "transform" | "rules">
>;

/**
 * Merge an array of {@link FlatConfigObject} objects into a single object.
 *
 * - `elements` and `plugins` arrays are concatenated (in order).
 * - `transform` and `rules` objects are shallow-merged (later block wins on
 *   key conflict).
 *
 * @internal
 */
export function mergeFlatConfig(blocks: FlatConfigObject[]): MergedFlatConfig {
	const merged: MergedFlatConfig = {
		elements: [],
		plugins: [],
		transform: {},
		rules: {},
	};

	for (const block of blocks) {
		if (block.elements) {
			merged.elements = [...merged.elements, ...block.elements];
		}
		if (block.plugins) {
			merged.plugins = [...merged.plugins, ...block.plugins];
		}
		if (block.transform) {
			merged.transform = { ...merged.transform, ...block.transform };
		}
		if (block.rules) {
			merged.rules = { ...merged.rules, ...block.rules };
		}
	}

	return merged;
}
