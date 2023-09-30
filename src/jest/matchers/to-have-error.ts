import { type Message, type Report } from "../../reporter";
import {
	type MatcherContext,
	type MatcherExpect,
	type MatcherResult,
	type MaybeAsyncCallback,
	diff,
	diverge,
} from "../utils";
import { flattenMessages } from "../utils/flatten-messages";

function toHaveErrorImpl(
	context: MatcherContext,
	expect: MatcherExpect,
	actual: Report,
	expected: Partial<Message>
): MatcherResult {
	const flattened = flattenMessages(actual);
	const matcher = [expect.objectContaining(expected)];
	const pass = context.equals(flattened, matcher);
	const diffString = diff(matcher, flattened, { expand: context.expand });
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
	expect: MatcherExpect
):
	| MaybeAsyncCallback<Report, [Partial<Message>]>
	| MaybeAsyncCallback<Report, [string, string, any?]> {
	function toHaveError(
		this: MatcherContext,
		actual: Report,
		error: Partial<Message>
	): MatcherResult;
	function toHaveError(
		this: MatcherContext,
		actual: Report,
		ruleId: string,
		message: string,
		context?: any
	): MatcherResult;
	function toHaveError(
		this: MatcherContext,
		actual: Report,
		arg1: string | Partial<Message>,
		arg2?: string,
		arg3?: any
	): MatcherResult {
		if (typeof arg1 === "string") {
			const expected: Partial<Message> = {
				ruleId: arg1,
				message: arg2,
			};
			if (arg3) {
				/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- this is supposed to accept anything */
				expected.context = arg3;
			}
			return toHaveErrorImpl(this, expect, actual, expected);
		} else {
			return toHaveErrorImpl(this, expect, actual, arg1);
		}
	}
	return diverge(toHaveError);
}

export { createMatcher as toHaveError };
