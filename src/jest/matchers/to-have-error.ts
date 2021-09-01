/* eslint-disable prefer-template */

import { Report } from "../../reporter";
import { diff } from "../utils/diff";
import { flattenMessages } from "../utils/flatten-messages";

export async function toHaveError(
	this: jest.MatcherUtils,
	actual: Report | Promise<Report>,
	ruleId: string,
	message: string,
	context?: any // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
): Promise<jest.CustomMatcherResult> {
	const report = await actual;
	const flattened = flattenMessages(report);
	const expected: any = { ruleId, message };
	if (context) {
		expected.context = context;
	}

	const matcher = [expect.objectContaining(expected)];
	const pass = this.equals(flattened, matcher);
	const diffString = diff(matcher, flattened, { expand: this.expand });
	const resultMessage = (): string =>
		this.utils.matcherHint(".toHaveError") +
		"\n\n" +
		"Expected error to equal:\n" +
		`  ${this.utils.printExpected(matcher)}\n` +
		"Received:\n" +
		`  ${this.utils.printReceived(flattened)}` +
		/* istanbul ignore next */ (diffString ? `\n\nDifference:\n\n${diffString}` : "");

	return { pass, message: resultMessage };
}
