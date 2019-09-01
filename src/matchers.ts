/* eslint-disable @typescript-eslint/no-namespace, prefer-template, sonarjs/no-duplicate-string */

import diff from "jest-diff";
import { TokenType } from "./lexer";
import { Message, Report, Result } from "./reporter";

interface TokenMatcher {
	type: TokenType;
	location?: any;
	data?: any;
}

declare global {
	namespace jest {
		interface Matchers<R> {
			toBeValid(): R;
			toBeInvalid(): R;
			toBeToken(expected: TokenMatcher): R;
			toHaveError(ruleId: string, message: string, context?: any): R;
			toHaveErrors(errors: Array<[string, string] | {}>): R;
		}
	}
}

/**
 * Takes all messages from all files and flattens to a single array.
 */
function flattenMessages(report: Report): Message[] {
	return report.results.reduce((aggregated: Message[], result: Result) => {
		return aggregated.concat(result.messages);
	}, []);
}

function toBeValid(report: Report): jest.CustomMatcherResult {
	if (report.valid) {
		return {
			pass: true,
			message: /* istanbul ignore next */ () =>
				"Result should not contain error",
		};
	} else {
		const firstError = report.results[0].messages[0];
		return {
			pass: false,
			message: () =>
				`Result should be successful but had error "${firstError.message}"`,
		};
	}
}

function toBeInvalid(report: Report): jest.CustomMatcherResult {
	if (report.valid) {
		return {
			pass: false,
			message: () => "Result should be invalid but had no errors",
		};
	} else {
		return {
			pass: true,
			message: /* istanbul ignore next */ () =>
				"Result should not contain error",
		};
	}
}

function toHaveError(
	report: Report,
	ruleId: any,
	message: any,
	context?: any
): jest.CustomMatcherResult {
	const actual = flattenMessages(report);
	const expected: any = { ruleId, message };
	if (context) {
		expected.context = context;
	}

	const matcher = [expect.objectContaining(expected)];
	const pass = this.equals(actual, matcher);
	const diffString = diff(matcher, actual, { expand: this.expand });
	const resultMessage = (): string =>
		this.utils.matcherHint(".toHaveError") +
		"\n\n" +
		"Expected token to equal:\n" +
		`  ${this.utils.printExpected(matcher)}\n` +
		"Received:\n" +
		`  ${this.utils.printReceived(actual)}` +
		/* istanbul ignore next */ (diffString
			? `\n\nDifference:\n\n${diffString}`
			: "");

	return { pass, message: resultMessage };
}

function toHaveErrors(
	report: Report,
	errors: Array<[string, string] | {}>
): jest.CustomMatcherResult {
	const actual = flattenMessages(report);
	const matcher = errors.map(entry => {
		if (Array.isArray(entry)) {
			const [ruleId, message] = entry;
			return expect.objectContaining({ ruleId, message });
		} else {
			return expect.objectContaining(entry);
		}
	});
	const pass = this.equals(actual, matcher);
	const diffString = diff(matcher, actual, { expand: this.expand });
	const resultMessage = (): string =>
		this.utils.matcherHint(".toHaveErrors") +
		"\n\n" +
		"Expected token to equal:\n" +
		`  ${this.utils.printExpected(matcher)}\n` +
		"Received:\n" +
		`  ${this.utils.printReceived(actual)}` +
		/* istanbul ignore next */ (diffString
			? `\n\nDifference:\n\n${diffString}`
			: "");

	return { pass, message: resultMessage };
}

function toBeToken(actual: any, expected: any): jest.CustomMatcherResult {
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
		/* istanbul ignore next */ (diffString
			? `\n\nDifference:\n\n${diffString}`
			: "");

	return { pass, message };
}

expect.extend({
	toBeValid,
	toBeInvalid,
	toHaveError,
	toHaveErrors,
	toBeToken,
});
