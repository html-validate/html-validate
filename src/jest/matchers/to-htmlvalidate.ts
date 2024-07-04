import deepmerge from "deepmerge";
import { type ConfigData } from "../../config";
import { FileSystemConfigLoader } from "../../config/loaders/file-system";
import { HtmlValidate } from "../../htmlvalidate";
import { type Message } from "../../message";
import {
	type DiffFunction,
	type MatcherContext,
	type MatcherExpect,
	type MatcherResult,
	type MaybeAsyncCallback,
	diverge,
} from "../utils";

function isMessage(arg: any): arg is Partial<Message> {
	if (!arg) {
		return false;
	}
	return Boolean(
		arg.ruleId ||
			arg.severity ||
			arg.message ||
			arg.offset ||
			arg.line ||
			arg.column ||
			arg.size ||
			arg.selector ||
			arg.context,
	);
}

function isConfig(arg: any): arg is ConfigData {
	if (!arg) {
		return false;
	}
	return Boolean(
		arg.root || arg.extends || arg.elements || arg.plugin || arg.transform || arg.rules,
	);
}

function isString(arg: any): arg is string {
	return typeof arg === "string";
}

function getMarkup(src: unknown): string {
	if (typeof HTMLElement !== "undefined" && src instanceof HTMLElement) {
		return (src as { outerHTML: string }).outerHTML;
	}
	/* istanbul ignore else: prototype only allows string or HTMLElement */
	if (typeof src === "string") {
		return src;
	} else {
		throw new Error(`Failed to get markup from "${typeof src}" argument`);
	}
}

type Arg1 = Partial<Message> | ConfigData | string;
type Arg2 = ConfigData | string;
type Arg3 = string;

function createMatcher(
	expect: MatcherExpect,
	diff: DiffFunction | undefined,
): MaybeAsyncCallback<unknown, [Arg1?, Arg2?, Arg3?]> {
	function toHTMLValidate(
		this: MatcherContext,
		actual: unknown,
		arg0?: Arg1,
		arg1?: Arg2,
		arg2?: Arg3,
	): MatcherResult {
		const markup = getMarkup(actual);
		const message = isMessage(arg0) ? arg0 : undefined;
		const config = isConfig(arg0) ? arg0 : isConfig(arg1) ? arg1 : undefined;
		const filename = isString(arg0) ? arg0 : isString(arg1) ? arg1 : arg2;
		return toHTMLValidateImpl.call(this, expect, diff, markup, message, config, filename);
	}
	return diverge(toHTMLValidate);
}

function toHTMLValidateImpl(
	this: MatcherContext,
	expect: MatcherExpect,
	diff: DiffFunction | undefined,
	actual: string,
	expectedError?: Partial<Message>,
	userConfig?: ConfigData,
	filename?: string,
): MatcherResult {
	const defaultConfig = {
		rules: {
			/* jsdom normalizes style so disabling rule when using this matcher or it
			 * gets quite noisy when configured with self-closing */
			"void-style": "off",
		},
	};
	const config = deepmerge(defaultConfig, userConfig ?? {});
	/* istanbul ignore next: cant figure out when this would be unset */
	const actualFilename = filename ?? this.testPath ?? "inline";
	const loader = new FileSystemConfigLoader({
		extends: ["html-validate:recommended"],
	});
	const htmlvalidate = new HtmlValidate(loader);
	const report = htmlvalidate.validateStringSync(actual, actualFilename, config);
	const pass = report.valid;
	const result = report.results[0];
	if (pass) {
		return { pass, message: () => "HTML is valid when an error was expected" };
	} else {
		if (expectedError) {
			const actual = result.messages;
			const expected = expect.arrayContaining([expect.objectContaining(expectedError)]);
			const errorPass = this.equals(actual, expected);
			const diffString = diff
				? diff(expected, actual, {
						expand: this.expand,
						aAnnotation: "Expected error",
						bAnnotation: "Actual error",
					})
				: /* istanbul ignore next */ undefined;
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
			return { pass: !errorPass, message: expectedErrorMessage, actual, expected };
		}

		const errors = result.messages.map((message) => `  ${message.message} [${message.ruleId}]`);
		return {
			pass,
			message: () =>
				["Expected HTML to be valid but had the following errors:", ""].concat(errors).join("\n"),
		};
	}
}

export { createMatcher as toHTMLValidate };
