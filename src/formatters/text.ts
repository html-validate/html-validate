import { type Result } from "../reporter";
import { type Formatter } from "./formatter";

function textFormatter(results: Result[]): string {
	let output = "";
	let total = 0;

	results.forEach((result) => {
		const messages = result.messages;

		if (messages.length === 0) {
			return;
		}

		total += messages.length;

		output += messages
			.map((message) => {
				let messageType;

				if (message.severity === 2) {
					messageType = "error";
				} else {
					messageType = "warning";
				}

				const line = String(message.line);
				const column = String(message.column);
				const location = `${result.filePath}:${line}:${column}`;
				return `${location}: ${messageType} [${message.ruleId}] ${message.message}\n`;
			})
			.join("");
	});

	return total > 0 ? output : "";
}

const formatter: Formatter = textFormatter;
export default formatter;
