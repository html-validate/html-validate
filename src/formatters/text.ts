import { Result } from '../reporter';

function textFormatter(results: Array<Result>){
	let output = "";
	let total = 0;

	results.forEach(result => {
		const messages = result.messages;

		if (messages.length === 0) {
			return;
		}

		total += messages.length;

		output += messages.map(message => {
			let messageType;

			if (message.severity === 2) {
				messageType = "error";
			} else {
				messageType = "warning";
			}

			return `${result.filePath}:${message.line}:${message.column}: ${messageType} [${message.ruleId}] ${message.message}\n`;
		}).join('');
	});

	return total > 0 ? output : "";
}

module.exports = textFormatter;
