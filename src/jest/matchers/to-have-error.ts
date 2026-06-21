import { type expect } from "@jest/globals";
import { type MatcherContext, type SyncExpectationResult } from "expect";
import { type Message } from "../../message";
import { type Report } from "../../reporter";
import { type MaybeAsyncCallback, diverge } from "../utils";

type JestExpect = typeof expect;

function toHaveErrorImpl(
	context: MatcherContext,
	expect: JestExpect,
	actual: Report,
	expected: Partial<Message>,
): SyncExpectationResult {
	const flattened = actual.results.flatMap((result) => result.messages);
	const matcher = [expect.objectContaining(expected)];
	const pass = context.equals(flattened, matcher);
	const diffString = context.utils.diff(matcher, flattened, { expand: context.expand });
	const hint = context.utils.matcherHint(".toHaveError");
	const prettyExpected = context.utils.printExpected(matcher);
	const prettyReceived = context.utils.printReceived(flattened);
	const resultMessage = (): string => {
		return [
			hint,
			"",
			"Expected error to equal:",
			`  ${prettyExpected}`,
			"Received:",
			`  ${prettyReceived}`,
			/* istanbul ignore next */ diffString ? `\nDifference:\n\n${diffString}` : "",
		].join("\n");
	};
	return { pass, message: resultMessage };
}

function createMatcher(
	expect: JestExpect,
):
	| MaybeAsyncCallback<Report, [Partial<Message>]>
	| MaybeAsyncCallback<Report, [string, string, unknown?]> {
	function toHaveError(
		this: MatcherContext,
		actual: Report,
		error: Partial<Message>,
	): SyncExpectationResult;
	function toHaveError(
		this: MatcherContext,
		actual: Report,
		ruleId: string,
		message: string,
		context?: unknown,
	): SyncExpectationResult;
	function toHaveError(
		this: MatcherContext,
		actual: Report,
		arg1: string | Partial<Message>,
		arg2?: string,
		arg3?: unknown,
	): SyncExpectationResult {
		if (typeof arg1 === "string") {
			const expected: Partial<Message> = {
				ruleId: arg1,
				message: arg2,
			};
			if (arg3 !== undefined) {
				expected.context = arg3;
			}
			return toHaveErrorImpl(this, expect, actual, expected);
		}
		return toHaveErrorImpl(this, expect, actual, arg1);
	}
	return diverge(toHaveError);
}

export { createMatcher as toHaveError };
