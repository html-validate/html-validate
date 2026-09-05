import kleur from "kleur";
import { type Message } from "../message";
import { type Result } from "../reporter";
import { codeFrameColumns } from "../utils/code-frame-columns";
import { getEndLocation, getStartLocation } from "../utils/message-location";

export interface CodeframeOptions {
	showLink: boolean;
	showFilePath: boolean;
	showSummary: boolean;
	showSelector: boolean;
}

const defaults: CodeframeOptions = {
	showLink: true,
	showFilePath: true,
	showSummary: true,
	showSelector: false,
};

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
	const filePathPart = options.showFilePath ? `at ${filePath}:` : null;

	/* istanbul ignore next: safety check from original implementation */
	const firstLine = [`${type}:`, msg, ruleId ? ruleId : "", filePathPart].filter(Boolean).join(" ");

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
function formatSummary(options: {
	errors: number;
	warnings: number;
	fixableErrors: number;
	fixableWarnings: number;
}): string {
	const { errors, warnings, fixableErrors, fixableWarnings } = options;
	const color = errors > 0 ? "red" : "yellow";
	const summary = [];
	const fixable = [];

	if (errors > 0) {
		summary.push(`${String(errors)} ${pluralize("error", errors)}`);
	}

	if (warnings > 0) {
		summary.push(`${String(warnings)} ${pluralize("warning", warnings)}`);
	}

	if (fixableErrors > 0) {
		fixable.push(`${String(fixableErrors)} ${pluralize("error", fixableErrors)}`);
	}

	if (fixableWarnings > 0) {
		fixable.push(`${String(fixableWarnings)} ${pluralize("warning", fixableWarnings)}`);
	}

	const summaryText = kleur[color]().bold(`${summary.join(" and ")} found.`);
	const fixableText =
		fixable.length > 0
			? kleur[color]().bold(
					`${fixable.join(" and ")} potentially fixable with the \`--fix\` option.`,
				)
			: null;

	if (fixableText) {
		return ["\n", summaryText, "\n", fixableText, "\n"].join("");
	}

	return ["\n", summaryText, "\n"].join("");
}

export function codeframe(results: Result[], options?: Partial<CodeframeOptions>): string {
	const merged: CodeframeOptions = { ...defaults, ...options };

	let errors = 0;
	let warnings = 0;
	let fixableErrors = 0;
	let fixableWarnings = 0;

	const resultsWithMessages = results.filter((result) => result.messages.length > 0);

	let output = resultsWithMessages
		.reduce<string[]>((resultsOutput, result) => {
			const messages = result.messages.map((message) => {
				return `${formatMessage(message, result, merged)}\n\n`;
			});

			errors += result.errorCount;
			warnings += result.warningCount;
			fixableErrors += result.fixableErrorCount;
			fixableWarnings += result.fixableWarningCount;

			return resultsOutput.concat(messages);
		}, [])
		.join("\n");

	if (merged.showSummary) {
		output += formatSummary({ errors, warnings, fixableErrors, fixableWarnings });
	}

	return errors + warnings > 0 ? output : "";
}
