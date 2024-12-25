import { type Transformer } from "./transformer";

/**
 * Describes a mapping between filename pattern (regex) and the configured
 * transformer.
 *
 * Either an imported via name or directly set as a function.
 *
 * @public
 */
export type TransformerEntry =
	| { kind: "import"; pattern: RegExp; name: string }
	| { kind: "function"; pattern: RegExp; function: Transformer };
