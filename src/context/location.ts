/**
 * @public
 */
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
	 * The number of characters this location refers to. This includes any
	 * whitespace characters such as newlines.
	 */
	readonly size: number;
}

interface LocationRW {
	filename: string;
	offset: number;
	line: number;
	column: number;
	size: number;
}

function sliceSize(size: number, begin: number, end?: number): number {
	if (typeof size !== "number") {
		return size;
	}
	if (typeof end !== "number") {
		return size - begin;
	}
	if (end < 0) {
		end = size + end;
	}
	return Math.min(size, end - begin);
}

/**
 * Calculate a new location by offsetting this location.
 *
 * If the references text with newlines the wrap parameter must be set to
 * properly calculate line and column information. If not given the text is
 * assumed to contain no newlines.
 *
 * @public
 * @param location - Source location
 * @param begin - Start location. Default is 0.
 * @param end - End location. Default is size of location. Negative values are
 * counted from end, e.g. `-2` means `size - 2`.
 * @param wrap - If given, line/column is wrapped for each newline occuring
 * before location end.
 */
export function sliceLocation(
	location: Location,
	begin: number,
	end?: number,
	wrap?: string,
): Location;

/**
 * @public
 */
export function sliceLocation(
	location: Location | null | undefined,
	begin: number,
	end?: number,
	wrap?: string,
): Location | null;

export function sliceLocation(
	location: Location | null | undefined,
	begin: number,
	end?: number,
	wrap?: string,
): Location | null {
	if (!location) return null;
	const size = sliceSize(location.size, begin, end);
	const sliced: LocationRW = {
		filename: location.filename,
		offset: location.offset + begin,
		line: location.line,
		column: location.column + begin,
		size,
	};

	/* if text content is provided try to find all newlines and modify line/column accordingly */
	if (wrap) {
		let index = -1;
		const col = sliced.column;
		for (;;) {
			index = wrap.indexOf("\n", index + 1);
			if (index >= 0 && index < begin) {
				sliced.column = col - (index + 1);
				sliced.line++;
			} else {
				break;
			}
		}
	}

	return sliced;
}
