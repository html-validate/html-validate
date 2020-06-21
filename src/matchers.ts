/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/ban-ts-comment, prefer-template, sonarjs/no-duplicate-string */

import diff from "jest-diff";
import deepmerge from "deepmerge";
import { TokenType } from "./lexer";
import { Message, Report, Result } from "./reporter";
import { ConfigData } from "./config";
import HtmlValidate from "./htmlvalidate";

interface TokenMatcher {
	type: TokenType;
	location?: any;
	data?: any;
}

declare global {
	namespace jest {
		/* eslint-disable-next-line @typescript-eslint/ban-types */
		interface Matchers<R, T = {}> {
			toBeValid(): R;
			toBeInvalid(): R;
			toBeToken(expected: TokenMatcher): R;
			toHaveError(ruleId: string, message: string, context?: any): R;
			toHaveErrors(
				errors: Array<[string, string] | Record<string, unknown>>
			): R;

			/**
			 * Validate string or HTMLElement.
			 *
			 * Test passes if result is valid.
			 *
			 * @param config - Optional HTML-Validate configuration object.
			 */
			toHTMLValidate(config?: ConfigData): R;
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

function toBeValid(
	this: jest.MatcherUtils,
	report: Report
): jest.CustomMatcherResult {
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

function toBeInvalid(
	this: jest.MatcherUtils,
	report: Report
): jest.CustomMatcherResult {
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
	this: jest.MatcherUtils,
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
	this: jest.MatcherUtils,
	report: Report,
	errors: Array<[string, string] | Record<string, unknown>>
): jest.CustomMatcherResult {
	const actual = flattenMessages(report);
	const matcher = errors.map((entry) => {
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

function toHTMLValidate(
	this: jest.MatcherUtils,
	// @ts-ignore DOM library not available
	actual: string | HTMLElement,
	userConfig?: ConfigData,
	filename?: string
): jest.CustomMatcherResult {
	// @ts-ignore DOM library not available
	if (actual instanceof HTMLElement) {
		actual = actual.outerHTML;
	}

	const defaultConfig = {
		rules: {
			/* jsdom normalizes style so disabling rule when using this matcher or it
			 * gets quite noisy when configured with self-closing */
			"void-style": "off",
		},
	};
	const config = deepmerge(defaultConfig, userConfig || {});

	const actualFilename = filename || this.testPath;
	const htmlvalidate = new HtmlValidate();
	const report = htmlvalidate.validateString(actual, actualFilename, config);
	const pass = report.valid;
	if (pass) {
		return { pass, message: () => "HTML is valid when an error was expected" };
	} else {
		const errors = report.results[0].messages.map(
			(message) => `  ${message.message} [${message.ruleId}]`
		);
		return {
			pass,
			message: () =>
				["Expected HTML to be valid but had the following errors:", ""]
					.concat(errors)
					.join("\n"),
		};
	}
}

function toBeToken(
	this: jest.MatcherUtils,
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
	toHTMLValidate,
	toBeToken,
});
