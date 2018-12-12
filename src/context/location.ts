export interface Location {
	/**
	 * The filemane this location refers to.
	 */
	filename: string;

	/**
	 * The string offset (number of characters into the string) this location
	 * refers to.
	 */
	offset: number;

	/**
	 * The line number in the file.
	 */
	line: number;

	/**
	 * The column number in the file. Tabs counts as 1 (not expanded).
	 */
	column: number;

	/**
	 * If set it contains how many characters this location refers to. This
	 * includes any whitespace characters such as newlines.
	 */
	size?: number;
}
