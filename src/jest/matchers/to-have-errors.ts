/* eslint-disable prefer-template -- technical debt, should be refactored */

import { type Report } from "../../reporter";
import { type MatcherContext, type MatcherResult, diff, diverge, flattenMessages } from "../utils";

function toHaveErrors(
	this: MatcherContext,
	report: Report,
	errors: Array<[string, string] | Record<string, unknown>>
): MatcherResult {
	const flattened = flattenMessages(report);
	const matcher = errors.map((entry) => {
		if (Array.isArray(entry)) {
			const [ruleId, message] = entry;
			/* eslint-disable-next-line @typescript-eslint/no-unsafe-return -- jest type is declared like this */
			return expect.objectContaining({ ruleId, message });
		} else {
			/* eslint-disable-next-line @typescript-eslint/no-unsafe-return -- jest type is declared like this  */
			return expect.objectContaining(entry);
		}
	});
	const pass = this.equals(flattened, matcher);
	const diffString = diff(matcher, flattened, { expand: this.expand });
	const resultMessage = (): string =>
		this.utils.matcherHint(".toHaveErrors") +
		"\n\n" +
		"Expected error to equal:\n" +
		`  ${this.utils.printExpected(matcher)}\n` +
		"Received:\n" +
		`  ${this.utils.printReceived(flattened)}` +
		/* istanbul ignore next */ (diffString ? `\n\nDifference:\n\n${diffString}` : "");

	return { pass, message: resultMessage };
}

export default diverge(toHaveErrors);
