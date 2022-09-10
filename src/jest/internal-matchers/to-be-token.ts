/* eslint-disable @typescript-eslint/explicit-module-boundary-types, prefer-template */

import { TokenType } from "../../lexer";
import { diff, diverge } from "../utils";

function toBeToken(
	this: jest.MatcherContext,
	actual: any,
	expected: any
): jest.CustomMatcherResult {
	const token = actual.value;

	// istanbul ignore next: TokenMatcher requires "type" property to be set, this is just a failsafe
	if (token.type) {
		token.type = TokenType[token.type];
	}

	// istanbul ignore next: TokenMatcher requires "type" property to be set, this is just a failsafe
	if (expected.type) {
		expected.type = TokenType[expected.type];
	}

	const matcher = expect.objectContaining(expected);
	const pass = this.equals(token, matcher);
	const diffString = diff(matcher, token, { expand: this.expand });
	const message = (): string =>
		this.utils.matcherHint(".toBeToken") +
		"\n\n" +
		"Expected token to equal:\n" +
		`  ${this.utils.printExpected(matcher)}\n` +
		"Received:\n" +
		`  ${this.utils.printReceived(token)}` +
		/* istanbul ignore next */ (diffString ? `\n\nDifference:\n\n${diffString}` : "");

	return { pass, message };
}

export default diverge(toBeToken);
