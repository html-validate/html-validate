/**
 * Source interface.
 *
 * HTML source with file, line and column context.
 */

export interface Source {
	data: string;
	filename: string;
	line: number;
	column: number;
}
