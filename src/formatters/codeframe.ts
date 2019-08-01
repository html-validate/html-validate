import { codeFrameColumns } from "@babel/code-frame";
import chalk from "chalk";
import path from "path";
import { FormatterModule } from ".";
import { Message, Result } from "../reporter";

interface SourcePoint {
	line: number;
	column: number;
}

/**
 * Codeframe formatter based on ESLint codeframe.
 */

declare const module: FormatterModule;

/**
 * Given a word and a count, append an s if count is not one.
 * @param   {string} word  A word in its singular form.
 * @param   {number} count A number controlling whether word should be pluralized.
 * @returns {string}       The original word with an s on the end if count is not one.
 */
function pluralize(word: string, count: number): string {
	return count === 1 ? word : `${word}s`;
}

/**
 * Gets a formatted relative file path from an absolute path and a line/column in the file.
 * @param   {string} filePath The absolute file path to format.
 * @param   {number} line     The line from the file to use for formatting.
 * @param   {number} column   The column from the file to use for formatting.
 * @returns {string}          The formatted file path.
 */
function formatFilePath(
	filePath: string,
	line: number,
	column: number
): string {
	let relPath = path.relative(process.cwd(), filePath);

	/* istanbul ignore next: safety check from original implementation */
	if (line && column) {
		relPath += `:${line}:${column}`;
	}

	return chalk.green(relPath);
}

function getStartLocation(message: Message): SourcePoint {
	return {
		line: message.line,
		column: message.column,
	};
}

function getEndLocation(message: Message, source: string): SourcePoint {
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
 * @param   {Object} message      The object that represents this message.
 * @param   {Object} parentResult The result object that this message belongs to.
 * @returns {string}              The formatted output.
 */
function formatMessage(message: Message, parentResult: Result): string {
	const type =
		message.severity === 2 ? chalk.red("error") : chalk.yellow("warning");
	const msg = `${chalk.bold(message.message.replace(/([^ ])\.$/, "$1"))}`;
	const ruleId = chalk.dim(`(${message.ruleId})`);
	const filePath = formatFilePath(
		parentResult.filePath,
		message.line,
		message.column
	);
	const sourceCode = parentResult.source;

	/* istanbul ignore next: safety check from original implementation */
	const firstLine = [
		`${type}:`,
		`${msg}`,
		ruleId ? `${ruleId}` : "",
		sourceCode ? `at ${filePath}:` : `at ${filePath}`,
	]
		.filter(String)
		.join(" ");

	const result = [firstLine];

	/* istanbul ignore next: safety check from original implementation */
	if (sourceCode) {
		result.push(
			codeFrameColumns(
				sourceCode,
				{
					start: getStartLocation(message),
					end: getEndLocation(message, sourceCode),
				},
				{ highlightCode: false }
			)
		);
	}

	return result.join("\n");
}

/**
 * Gets the formatted output summary for a given number of errors and warnings.
 * @param   {number} errors   The number of errors.
 * @param   {number} warnings The number of warnings.
 * @returns {string}          The formatted output summary.
 */
function formatSummary(errors: number, warnings: number): string {
	const summaryColor = errors > 0 ? "red" : "yellow";
	const summary = [];

	if (errors > 0) {
		summary.push(`${errors} ${pluralize("error", errors)}`);
	}

	if (warnings > 0) {
		summary.push(`${warnings} ${pluralize("warning", warnings)}`);
	}

	return chalk[summaryColor].bold(`${summary.join(" and ")} found.`);
}

export default function codeframe(results: Result[]): string {
	let errors = 0;
	let warnings = 0;

	const resultsWithMessages = results.filter(
		result => result.messages.length > 0
	);

	let output = resultsWithMessages
		.reduce((resultsOutput, result) => {
			const messages = result.messages.map(
				message => `${formatMessage(message, result)}\n\n`
			);

			errors += result.errorCount;
			warnings += result.warningCount;

			return resultsOutput.concat(messages);
		}, [])
		.join("\n");

	output += "\n";
	output += formatSummary(errors, warnings);
	output += "\n";

	return errors + warnings > 0 ? output : "";
}

module.exports = codeframe;
