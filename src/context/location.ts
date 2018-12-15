export interface Location {
	/**
	 * The filemane this location refers to.
	 */
	readonly filename: string;

	/**
	 * The string offset (number of characters into the string) this location
	 * refers to.
	 */
	readonly offset: number;

	/**
	 * The line number in the file.
	 */
	readonly line: number;

	/**
	 * The column number in the file. Tabs counts as 1 (not expanded).
	 */
	readonly column: number;

	/**
	 * If set it contains how many characters this location refers to. This
	 * includes any whitespace characters such as newlines.
	 */
	readonly size?: number;
}
