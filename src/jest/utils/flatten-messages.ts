import { type Message } from "../../message";
import { type Report, type Result } from "../../reporter";

/**
 * Takes all messages from all files and flattens to a single array.
 */
export function flattenMessages(report: Report): Message[] {
	return report.results.reduce((aggregated: Message[], result: Result) => {
		return aggregated.concat(result.messages);
	}, []);
}
