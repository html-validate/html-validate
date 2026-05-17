/* eslint-disable prefer-template -- technical debt, should be refactored */

import { type MatcherState, type SyncExpectationResult } from "@vitest/expect";
import { type expect } from "vitest";
import { type Report } from "../../reporter";
import { type MaybeAsyncCallback, diverge } from "../utils";

type VitestExpect = typeof expect;

function createMatcher(
	expect: VitestExpect,
): MaybeAsyncCallback<Report, [Array<[string, string] | Record<string, unknown>>]> {
	function toHaveErrors(
		this: MatcherState,
		report: Report,
		errors: Array<[string, string] | Record<string, unknown>>,
	): SyncExpectationResult {
		const flattened = report.results.flatMap((result) => result.messages);
		const matcher = errors.map((entry) => {
			if (Array.isArray(entry)) {
				const [ruleId, message] = entry;
				/* eslint-disable-next-line @typescript-eslint/no-unsafe-return -- upstream typing */
				return expect.objectContaining({ ruleId, message });
			} else {
				/* eslint-disable-next-line @typescript-eslint/no-unsafe-return -- upstream typing */
				return expect.objectContaining(entry);
			}
		});
		const pass = this.equals(flattened, matcher);
		const diffString = this.utils.diff(matcher, flattened);
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
