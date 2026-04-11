import { type Message } from "../../message";
import { type Result } from "../../reporter";
import { codeFrameColumns } from "../../utils/code-frame-columns";

interface Location {
	line: number;
	column: number;
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
function formatMessage(message: Message, parentResult: Result): string {
	const type = message.severity === 2 ? "error" : "warning";
	const msg = message.message.replace(/([^ ])\.$/, "$1");
	const ruleId = `(${message.ruleId})`;
	const sourceCode = parentResult.source;
	const firstLine = [`${type}:`, msg, ruleId].join(" ");
	const result = [firstLine];

	/* istanbul ignore next: safety check from original implementation */
	if (sourceCode) {
		const output = codeFrameColumns(sourceCode, {
			start: getStartLocation(message),
			end: getEndLocation(message, sourceCode),
		});
		result.push(output);
	}

	result.push(`Selector: ${message.selector ?? "-"}`);

	return result.join("\n");
}

/**
 * Codeframe formatter based on ESLint codeframe.
 *
 * @internal
 */
export function codeframe(results: Result[]): string {
	let errors = 0;
	let warnings = 0;

	const resultsWithMessages = results.filter((result) => result.messages.length > 0);

	const output = resultsWithMessages
		.reduce<string[]>((resultsOutput, result) => {
			const messages = result.messages.map((message) => {
				return `${formatMessage(message, result)}\n\n`;
			});

			errors += result.errorCount;
			warnings += result.warningCount;

			return resultsOutput.concat(messages);
		}, [])
		.join("\n");

	return errors + warnings > 0 ? output : "";
}
