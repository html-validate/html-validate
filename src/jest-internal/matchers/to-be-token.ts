/* eslint-disable prefer-template -- technical debt, should be refactored*/

import {
	type AsymmetricMatchers,
	type ExpectationResult,
	type MatcherContext,
	type MatcherFunction,
} from "expect";
import { type Token, TokenType } from "../../lexer";
import { type TokenMatcher } from "../token-matcher";

function createMatcher(expect: AsymmetricMatchers): MatcherFunction<[TokenMatcher]> {
	function toBeToken(
		this: MatcherContext,
		actual: unknown,
		expected: TokenMatcher,
	): ExpectationResult {
		const token = (actual as IteratorResult<Token, void>).value as Token;
		const tokenData: Record<string, unknown> = { ...token, type: TokenType[token.type] };
		const expectedData: Record<string, unknown> = { ...expected, type: TokenType[expected.type] };
		const matcher = expect.objectContaining(expectedData);
		const pass = this.equals(tokenData, matcher);
		const diffString = this.utils.diff(matcher, tokenData, { expand: this.expand });
		const message = (): string =>
			this.utils.matcherHint(".toBeToken") +
			"\n\n" +
			"Expected token to equal:\n" +
			`  ${this.utils.printExpected(matcher)}\n` +
			"Received:\n" +
			`  ${this.utils.printReceived(tokenData)}` +
			/* istanbul ignore next */ (diffString ? `\n\nDifference:\n\n${diffString}` : "");

		return { pass, message };
	}
	return toBeToken;
}

export { createMatcher as toBeToken };
