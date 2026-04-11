interface Location {
	line: number;
	column: number;
}

interface NodeLocation {
	end?: Location;
	start: Location;
}

type MarkerLines = Record<number, true | [number, number] | undefined>;

/**
 * RegExp to test for newlines in terminal.
 */
const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;

/**
 * Extract what lines should be marked and highlighted.
 */
function getMarkerLines(
	loc: NodeLocation,
	source: string[],
): {
	start: number;
	end: number;
	markerLines: MarkerLines;
} {
	const startLoc: Location = {
		...loc.start,
	};
	const endLoc: Location = {
		...startLoc,
		...loc.end,
	};
	const linesAbove = 2;
	const linesBelow = 3;
	const startLine = startLoc.line;
	const startColumn = startLoc.column;
	const endLine = endLoc.line;
	const endColumn = endLoc.column;

	const start = Math.max(startLine - (linesAbove + 1), 0);
	const end = Math.min(source.length, endLine + linesBelow);
	const lineDiff = endLine - startLine;
	const markerLines: MarkerLines = {};

	if (lineDiff) {
		for (let i = 0; i <= lineDiff; i++) {
			const lineNumber = i + startLine;

			if (!startColumn) {
				markerLines[lineNumber] = true;
			} else if (i === 0) {
				const sourceLength = source[lineNumber - 1].length;

				markerLines[lineNumber] = [startColumn, sourceLength - startColumn + 1];
			} else if (i === lineDiff) {
				markerLines[lineNumber] = [0, endColumn];
			} else {
				const sourceLength = source[lineNumber - i].length;

				markerLines[lineNumber] = [0, sourceLength];
			}
		}
	} else {
		if (startColumn === endColumn) {
			if (startColumn) {
				markerLines[startLine] = [startColumn, 0];
			} else {
				markerLines[startLine] = true;
			}
		} else {
			markerLines[startLine] = [startColumn, endColumn - startColumn];
		}
	}

	return { start, end, markerLines };
}

/**
 * @internal
 */
export function codeFrameColumns(rawLines: string, loc: NodeLocation): string {
	const lines = rawLines.split(NEWLINE);
	const { start, end, markerLines } = getMarkerLines(loc, lines);
	const numberMaxWidth = String(end).length;

	return rawLines
		.split(NEWLINE, end)
		.slice(start, end)
		.map((line, index) => {
			const number = start + 1 + index;
			const paddedNumber = ` ${String(number)}`.slice(-numberMaxWidth);
			const gutter = ` ${paddedNumber} |`;
			const hasMarker = markerLines[number];
			if (hasMarker) {
				let markerLine = "";
				if (Array.isArray(hasMarker)) {
					const markerSpacing = line
						.slice(0, Math.max(hasMarker[0] - 1, 0))
						.replaceAll(/[^\t]/g, " ");
					const numberOfMarkers = hasMarker[1] || 1;

					markerLine = [
						"\n ",
						gutter.replaceAll(/\d/g, " "),
						" ",
						markerSpacing,
						"^".repeat(numberOfMarkers),
					].join("");
				}
				return [">", gutter, line.length > 0 ? ` ${line}` : "", markerLine].join("");
			} else {
				return [" ", gutter, line.length > 0 ? ` ${line}` : ""].join("");
			}
		})
		.join("\n");
}
