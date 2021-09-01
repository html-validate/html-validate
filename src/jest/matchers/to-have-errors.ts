/* eslint-disable prefer-template */

import { Report } from "../../reporter";
import { diff, flattenMessages } from "../utils";

export async function toHaveErrors(
	this: jest.MatcherUtils,
	actual: Report | Promise<Report>,
	errors: Array<[string, string] | Record<string, unknown>>
): Promise<jest.CustomMatcherResult> {
	const report = await actual;
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
