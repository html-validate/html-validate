/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/ban-ts-comment, prefer-template, sonarjs/no-duplicate-string */

import jestDiffDefault, * as jestDiff from "jest-diff";
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

/* ignore typing for compatibility so it will seem "impossible" but different version will yield different source */
const diffCandidates: Array<typeof jestDiff.diff> = [
	// @ts-ignore
	jestDiffDefault?.diff,
	// @ts-ignore
	jestDiffDefault,
	// @ts-ignore
	jestDiff?.diff,
	// @ts-ignore
	jestDiff,
];

const isFunction = (fn: unknown): boolean => typeof fn === "function";

/* istanbul ignore next: covered by compatibility tests but not a single pass */
/* @ts-ignore assume one of the candidate matches, there will be a reasonable error later on if not */
const diff: typeof jestDiff.diff = diffCandidates.find(isFunction);

declare global {
	namespace jest {
		/* eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-unused-vars */
		interface Matchers<R, T = {}> {
			toBeValid(): R;
			toBeInvalid(): R;
			toBeToken(expected: TokenMatcher): R;
			toHaveError(ruleId: string, message: string, context?: any): R;
			toHaveErrors(errors: Array<[string, string] | Record<string, unknown>>): R;

			/**
			 * Validate string or HTMLElement.
			 *
			 * Test passes if result is valid.
			 *
			 * @param config - Optional HTML-Validate configuration object.
			 * @param filename - Optional filename used when matching transformer and
			 * loading configuration.
			 */
			toHTMLValidate(): R;
			toHTMLValidate(filename: string): R;
			toHTMLValidate(config: ConfigData): R;
			toHTMLValidate(config: ConfigData, filename: string): R;
			toHTMLValidate(error: Partial<Message>): R;
			toHTMLValidate(error: Partial<Message>, filename: string): R;
			toHTMLValidate(error: Partial<Message>, config: ConfigData): R;
			toHTMLValidate(error: Partial<Message>, config: ConfigData, filename: string): R;
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

async function toBeValid(
	this: jest.MatcherUtils,
	actual: Report | Promise<Report>
): Promise<jest.CustomMatcherResult> {
	const report = await actual;
	if (report.valid) {
		return {
			pass: true,
			message: /* istanbul ignore next */ () => "Result should not contain error",
		};
	} else {
		const firstError = report.results[0].messages[0];
		return {
			pass: false,
			message: () => `Result should be valid but had error "${firstError.message}"`,
		};
	}
}

async function toBeInvalid(
	this: jest.MatcherUtils,
	actual: Report | Promise<Report>
): Promise<jest.CustomMatcherResult> {
	const report = await actual;
	if (report.valid) {
		return {
			pass: false,
			message: () => "Result should be invalid but had no errors",
		};
	} else {
		return {
			pass: true,
			message: /* istanbul ignore next */ () => "Result should not contain error",
		};
	}
}

async function toHaveError(
	this: jest.MatcherUtils,
	actual: Report | Promise<Report>,
	ruleId: any,
	message: any,
	context?: any
): Promise<jest.CustomMatcherResult> {
	const report = await actual;
	const flattened = flattenMessages(report);
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

async function toHaveErrors(
	this: jest.MatcherUtils,
	actual: Report | Promise<Report>,
	errors: Array<[string, string] | Record<string, unknown>>
): Promise<jest.CustomMatcherResult> {
	const report = await actual;
	const flattened = flattenMessages(report);
	const matcher = errors.map((entry) => {
		if (Array.isArray(entry)) {
			const [ruleId, message] = entry;
			return expect.objectContaining({ ruleId, message });
		} else {
			return expect.objectContaining(entry);
		}
	});
	const pass = this.equals(flattened, matcher);
	const diffString = diff(matcher, flattened, { expand: this.expand });
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

function isMessage(arg: any): arg is Partial<Message> {
	return (
		arg &&
		(arg.ruleId ||
			arg.severity ||
			arg.message ||
			arg.offset ||
			arg.line ||
			arg.column ||
			arg.size ||
			arg.selector ||
			arg.context)
	);
}

function isConfig(arg: any): arg is ConfigData {
	return (
		arg && (arg.root || arg.extends || arg.elements || arg.plugin || arg.transform || arg.rules)
	);
}

function isString(arg: any): arg is string {
	return typeof arg === "string";
}

function toHTMLValidate(
	this: jest.MatcherUtils,
	// @ts-ignore DOM library not available
	actual: string | HTMLElement,
	arg0?: Partial<Message> | ConfigData | string,
	arg1?: ConfigData | string,
	arg2?: string
): jest.CustomMatcherResult {
	// @ts-ignore DOM library not available
	if (typeof HTMLElement !== "undefined" && actual instanceof HTMLElement) {
		actual = actual.outerHTML;
	}

	const message = isMessage(arg0) ? arg0 : undefined;
	const config = isConfig(arg0) ? arg0 : isConfig(arg1) ? arg1 : undefined;
	const filename = isString(arg0) ? arg0 : isString(arg1) ? arg1 : arg2;

	return toHTMLValidateImpl.call(this, actual, message, config, filename);
}

function toHTMLValidateImpl(
	this: jest.MatcherUtils,
	actual: string,
	expectedError?: Partial<Message>,
	userConfig?: ConfigData,
	filename?: string
): jest.CustomMatcherResult {
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
		if (expectedError) {
			const matcher = expect.arrayContaining([expect.objectContaining(expectedError)]);
			const errorPass = this.equals(report.results[0].messages, matcher);
			const diffString = diff(matcher, report.results[0].messages, {
				expand: this.expand,
				aAnnotation: "Expected error",
				bAnnotation: "Actual error",
			});
			const hint = this.utils.matcherHint(".not.toHTMLValidate", undefined, undefined, {
				comment: "expected error",
			});
			const expectedErrorMessage = (): string =>
				[
					hint,
					"",
					"Expected error to be present:",
					this.utils.printExpected(expectedError),
					/* istanbul ignore next */ diffString ? `\n${diffString}` : "",
				].join("\n");
			return { pass: !errorPass, message: expectedErrorMessage };
		}

		const errors = report.results[0].messages.map(
			(message) => `  ${message.message} [${message.ruleId}]`
		);
		return {
			pass,
			message: () =>
				["Expected HTML to be valid but had the following errors:", ""].concat(errors).join("\n"),
		};
	}
}

function toBeToken(this: jest.MatcherUtils, actual: any, expected: any): jest.CustomMatcherResult {
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

expect.extend({
	toBeValid,
	toBeInvalid,
	toHaveError,
	toHaveErrors,
	toHTMLValidate,
	toBeToken,
});
