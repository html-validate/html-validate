import { AttributeData } from "../parser";

/**
 * Source interface.
 *
 * HTML source with file, line and column context.
 */

export type ProcessAttributeCallback = (
	attr: AttributeData
) => Iterable<AttributeData>;

export interface SourceHooks {
	/**
	 * Called for every attribute.
	 */
	processAttribute: ProcessAttributeCallback;
}

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
