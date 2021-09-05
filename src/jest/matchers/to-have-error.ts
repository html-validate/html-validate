/* eslint-disable prefer-template */

import { Report } from "../../reporter";
import { diff, diverge } from "../utils";
import { flattenMessages } from "../utils/flatten-messages";

function toHaveError(
	this: jest.MatcherUtils,
	actual: Report,
	ruleId: string,
	message: string,
	context?: any // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
): jest.CustomMatcherResult {
	const flattened = flattenMessages(actual);
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

export default diverge(toHaveError);
