/* eslint-disable prefer-template */

import { Report } from "../../reporter";
import { diff, diverge, flattenMessages } from "../utils";

function toHaveErrors(
	this: jest.MatcherUtils,
	report: Report,
	errors: Array<[string, string] | Record<string, unknown>>
): jest.CustomMatcherResult {
	const flattened = flattenMessages(report);
	const matcher = errors.map((entry) => {
		if (Array.isArray(entry)) {
			const [ruleId, message] = entry;
			return expect.objectContaining({ ruleId, message });
		} else {
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
