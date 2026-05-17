/* eslint-disable prefer-template -- technical debt, should be refactored */

import { type Report } from "../../reporter";
import {
	type MatcherContext,
	type MatcherExpect,
	type MatcherResult,
	type MaybeAsyncCallback,
	diverge,
} from "../utils";

function createMatcher(
	expect: MatcherExpect,
): MaybeAsyncCallback<Report, [Array<[string, string] | Record<string, unknown>>]> {
	function toHaveErrors(
		this: MatcherContext,
		report: Report,
		errors: Array<[string, string] | Record<string, unknown>>,
	): MatcherResult {
		const flattened = report.results.flatMap((result) => result.messages);
		const matcher = errors.map((entry) => {
			if (Array.isArray(entry)) {
				const [ruleId, message] = entry;
				return expect.objectContaining({ ruleId, message });
			} else {
				return expect.objectContaining(entry);
			}
		});
		const pass = this.equals(flattened, matcher);
		const diffString = this.utils.diff(matcher, flattened, { expand: this.expand });
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
	return diverge(toHaveErrors);
}

export { createMatcher as toHaveErrors };
