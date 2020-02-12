import { Result } from "../reporter";
import { FormatterModule } from ".";

export default function textFormatter(results: Result[]): string {
	let output = "";
	let total = 0;

	results.forEach(result => {
		const messages = result.messages;

		if (messages.length === 0) {
			return;
		}

		total += messages.length;

		output += messages
			.map(message => {
				let messageType;

				if (message.severity === 2) {
					messageType = "error";
				} else {
					messageType = "warning";
				}

				const location = `${result.filePath}:${message.line}:${message.column}`;
				return `${location}: ${messageType} [${message.ruleId}] ${message.message}\n`;
			})
			.join("");
	});

	return total > 0 ? output : "";
}

declare const module: FormatterModule;
module.exports = textFormatter;
