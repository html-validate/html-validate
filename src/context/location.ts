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

function sliceSize(size: number, begin: number, end?: number): number {
	if (typeof size !== "number"){
		return size;
	}
	if (typeof end !== "number"){
		return size - begin;
	}
	if (end < 0){
		end = size + end;
	}
	return Math.min(size, end - begin);
}

/**
 * Calculate a new location by offsetting this location.
 *
 * It is assumed there is no newlines anywhere between current location and
 * the new.
 */
export function sliceLocation(location: Location, begin: number, end?: number): Location {
	const size = sliceSize(location.size, begin, end);
	return {
		filename: location.filename,
		offset: location.offset + begin,
		line: location.line,
		column: location.column + begin,
		size,
	};
}
