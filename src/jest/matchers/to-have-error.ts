import { type Message } from "../../message";
import { type Report } from "../../reporter";
import {
	type MatcherContext,
	type MatcherExpect,
	type MatcherResult,
	type MaybeAsyncCallback,
	diverge,
} from "../utils";

function toHaveErrorImpl(
	context: MatcherContext,
	expect: MatcherExpect,
	actual: Report,
	expected: Partial<Message>,
): MatcherResult {
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
	return { pass, message: resultMessage, actual: flattened, expected: matcher };
}

function createMatcher(
	expect: MatcherExpect,
):
	| MaybeAsyncCallback<Report, [Partial<Message>]>
	| MaybeAsyncCallback<Report, [string, string, unknown?]> {
	function toHaveError(
		this: MatcherContext,
		actual: Report,
		error: Partial<Message>,
	): MatcherResult;
	function toHaveError(
		this: MatcherContext,
		actual: Report,
		ruleId: string,
		message: string,
		context?: unknown,
	): MatcherResult;
	function toHaveError(
		this: MatcherContext,
		actual: Report,
		arg1: string | Partial<Message>,
		arg2?: string,
		arg3?: unknown,
	): MatcherResult {
		if (typeof arg1 === "string") {
			const expected: Partial<Message> = {
				ruleId: arg1,
				message: arg2,
			};
			if (arg3 !== undefined) {
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
