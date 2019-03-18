import { AttributeData } from "../parser";

export type ProcessAttributeCallback = (
	attr: AttributeData
) => Iterable<AttributeData>;

export interface SourceHooks {
	/**
	 * Called for every attribute.
	 *
	 * The original attribute must be yielded as well or no attribute will be
	 * added.
	 *
	 * @generator
	 * @yields {AttributeData} Attribute data for an attribute to be added to the
	 * element.
	 */
	processAttribute: ProcessAttributeCallback;
}

/**
 * Source interface.
 *
 * HTML source with file, line and column context.
 *
 * Optional hooks can be attached. This is usually added by transformers to
 * postprocess.
 */
export interface Source {
	data: string;
	filename: string;
	line: number;
	column: number;
	originalData?: string;

	/**
	 * Hooks for processing the source as it is being parsed.
	 */
	hooks?: SourceHooks;
}
