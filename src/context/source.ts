/**
 * Source interface.
 *
 * HTML source with file, line and column context.
 */

type ProcessAttributeCallback = ({
	key,
	value,
}: {
	key: string;
	value: string;
}) => void;

export interface Source {
	data: string;
	filename: string;
	line: number;
	column: number;
	originalData?: string;

	/**
	 * Hooks for processing the source as it is being parsed.
	 */
	hooks?: {
		/**
		 * Called for every attribute.
		 */
		processAttribute: ProcessAttributeCallback;
	};
}
