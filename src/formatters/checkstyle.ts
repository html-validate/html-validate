import { type Message } from "../message";
import { type Result } from "../reporter";
import { type Formatter } from "./formatter";

const entities: Record<string, string> = {
	">": "&gt;",
	"<": "&lt;",
	"'": "&apos;",
	'"': "&quot;",
	"&": "&amp;",
};

function xmlescape(src: string | number): string {
	return src.toString().replace(/[><'"&]/g, (match: string) => {
		return entities[match];
	});
}

function getMessageType(message: Message): "error" | "warning" {
	switch (message.severity) {
		case 2:
			return "error";
		case 1:
			return "warning";
		default:
			return "error";
	}
}

function checkstyleFormatter(results: Result[]): string {
	let output = "";

	output += `<?xml version="1.0" encoding="utf-8"?>\n`;
	output += `<checkstyle version="4.3">\n`;

	results.forEach((result) => {
		const messages = result.messages;

		output += `  <file name="${xmlescape(result.filePath)}">\n`;

		messages.forEach((message) => {
			const ruleId = xmlescape(`htmlvalidate.rules.${message.ruleId}`);
			output += "    ";
			output += [
				`<error line="${xmlescape(message.line)}"`,
				`column="${xmlescape(message.column)}"`,
				`severity="${xmlescape(getMessageType(message))}"`,
				`message="${xmlescape(message.message)} (${message.ruleId})"`,
				`source="${ruleId}" />`,
			].join(" ");
			output += "\n";
		});

		output += "  </file>\n";
	});

	output += "</checkstyle>\n";

	return output;
}

const formatter: Formatter = checkstyleFormatter;
export default formatter;
