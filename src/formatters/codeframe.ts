import kleur from "kleur";
import { type Message } from "../message";
import { type Result } from "../reporter";

interface Location {
	line: number;
	column: number;
}

interface NodeLocation {
	end?: Location;
	start: Location;
}

export interface CodeframeOptions {
	showLink: boolean;
	showSummary: boolean;
	showSelector: boolean;
}

const defaults: CodeframeOptions = {
	showLink: true,
	showSummary: true,
	showSelector: false,
};

/**
 * RegExp to test for newlines in terminal.
 */

const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;

/**
 * Extract what lines should be marked and highlighted.
 */

type MarkerLines = Record<number, true | [number, number] | undefined>;

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
					const markerSpacing = line.slice(0, Math.max(hasMarker[0] - 1, 0)).replace(/[^\t]/g, " ");
					const numberOfMarkers = hasMarker[1] || 1;

					markerLine = [
						"\n ",
						gutter.replace(/\d/g, " "),
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

/**
 * Codeframe formatter based on ESLint codeframe.
 */

/**
 * Given a word and a count, append an s if count is not one.
 * @param word - A word in its singular form.
 * @param count - A number controlling whether word should be pluralized.
 * @returns The original word with an s on the end if count is not one.
 */
function pluralize(word: string, count: number): string {
	return count === 1 ? word : `${word}s`;
}

/**
 * Gets a formatted relative file path from an absolute path and a line/column in the file.
 * @param filePath - The absolute file path to format.
 * @param line - The line from the file to use for formatting.
 * @param column -The column from the file to use for formatting.
 * @returns The formatted file path.
 */
function formatFilePath(filePath: string, line: number, column: number): string {
	/* istanbul ignore next: safety check from original implementation */
	if (line && column) {
		filePath += `:${String(line)}:${String(column)}`;
	}

	return kleur.green(filePath);
}

function getStartLocation(message: Message): Location {
	return {
		line: message.line,
		column: message.column,
	};
}

function getEndLocation(message: Message, source: string): Location {
	let line = message.line;
	let column = message.column;
	for (let i = 0; i < message.size; i++) {
		if (source.charAt(message.offset + i) === "\n") {
			line++;
			column = 0;
		} else {
			column++;
		}
	}
	return { line, column };
}

/**
 * Gets the formatted output for a given message.
 * @param message - The object that represents this message.
 * @param parentResult - The result object that this message belongs to.
 * @returns The formatted output.
 */
function formatMessage(message: Message, parentResult: Result, options: CodeframeOptions): string {
	const type = message.severity === 2 ? kleur.red("error") : kleur.yellow("warning");
	const msg = kleur.bold(message.message.replace(/([^ ])\.$/, "$1"));
	const ruleId = kleur.dim(`(${message.ruleId})`);
	const filePath = formatFilePath(parentResult.filePath, message.line, message.column);
	const sourceCode = parentResult.source;

	/* istanbul ignore next: safety check from original implementation */
	const firstLine = [
		`${type}:`,
		msg,
		ruleId ? ruleId : "",
		sourceCode ? `at ${filePath}:` : `at ${filePath}`,
	]
		.filter(String)
		.join(" ");

	const result = [firstLine];

	/* istanbul ignore next: safety check from original implementation */
	if (sourceCode) {
		const output = codeFrameColumns(sourceCode, {
			start: getStartLocation(message),
			end: getEndLocation(message, sourceCode),
		});
		result.push(output);
	}

	if (options.showSelector) {
		result.push(`${kleur.bold("Selector:")} ${message.selector ?? "-"}`);
	}

	if (options.showLink && message.ruleUrl) {
		result.push(`${kleur.bold("Details:")} ${message.ruleUrl}`);
	}

	return result.join("\n");
}

/**
 * Gets the formatted output summary for a given number of errors and warnings.
 * @param errors - The number of errors.
 * @param warnings - The number of warnings.
 * @returns The formatted output summary.
 */
function formatSummary(errors: number, warnings: number): string {
	const summaryColor = errors > 0 ? "red" : "yellow";
	const summary = [];

	if (errors > 0) {
		summary.push(`${String(errors)} ${pluralize("error", errors)}`);
	}

	if (warnings > 0) {
		summary.push(`${String(warnings)} ${pluralize("warning", warnings)}`);
	}

	return kleur[summaryColor]().bold(`${summary.join(" and ")} found.`);
}

export function codeframe(results: Result[], options?: Partial<CodeframeOptions>): string {
	const merged: CodeframeOptions = { ...defaults, ...options };

	let errors = 0;
	let warnings = 0;

	const resultsWithMessages = results.filter((result) => result.messages.length > 0);

	let output = resultsWithMessages
		.reduce<string[]>((resultsOutput, result) => {
			const messages = result.messages.map((message) => {
				return `${formatMessage(message, result, merged)}\n\n`;
			});

			errors += result.errorCount;
			warnings += result.warningCount;

			return resultsOutput.concat(messages);
		}, [])
		.join("\n");

	if (merged.showSummary) {
		output += "\n";
		output += formatSummary(errors, warnings);
		output += "\n";
	}

	return errors + warnings > 0 ? output : "";
}
