import { type MatcherState, type SyncExpectationResult } from "@vitest/expect";
import deepmerge from "deepmerge";
import { type expect } from "vitest";
import { type ConfigData } from "../../config";
import { type Message } from "../../message";
import { type MaybeAsyncCallback, diverge } from "../utils";
import { type ValidateStringFn, createSyncFn, vitestWorkerPath } from "../worker";

type VitestExpect = typeof expect;

function isMessage(arg: Arg1 | undefined): arg is Partial<Message> {
	if (!arg || typeof arg !== "object") {
		return false;
	}
	return [
		"ruleId",
		"severity",
		"message",
		"offset",
		"line",
		"column",
		"size",
		"selector",
		"context",
	].some((key) => Object.hasOwn(arg, key));
}

function isConfig(arg: Arg1 | undefined): arg is ConfigData {
	if (!arg || typeof arg !== "object") {
		return false;
	}
	return ["root", "extends", "elements", "plugin", "transform", "rules"].some((key) =>
		Object.hasOwn(arg, key),
	);
}

function isString(arg: Arg1 | undefined): arg is string {
	return typeof arg === "string";
}

function hasOuterHTML(value: unknown): value is { outerHTML: string } {
	if (!value || typeof value !== "object") {
		return false;
	}
	return "outerHTML" in value && typeof value.outerHTML === "string";
}

function hasInnerHTML(value: unknown): value is { innerHTML: string } {
	if (!value || typeof value !== "object") {
		return false;
	}
	return "innerHTML" in value && typeof value.innerHTML === "string";
}

function hasHTML(value: unknown): value is { html(): unknown } {
	if (!value || typeof value !== "object") {
		return false;
	}
	return "html" in value && typeof value.html === "function";
}

function getMarkup(src: unknown): string {
	if (hasOuterHTML(src)) {
		return src.outerHTML;
	}
	if (hasInnerHTML(src)) {
		return src.innerHTML;
	}
	if (hasHTML(src)) {
		const value = src.html();
		if (typeof value === "string") {
			return value;
		}
	}
	if (typeof src === "string") {
		return src;
	}
	throw new TypeError(`Failed to get markup from "${typeof src}" argument`);
}

type Arg1 = Partial<Message> | ConfigData | string;
type Arg2 = ConfigData | string;
type Arg3 = string;

function createMatcher(expect: VitestExpect): MaybeAsyncCallback<unknown, [Arg1?, Arg2?, Arg3?]> {
	function toHTMLValidate(
		this: MatcherState,
		actual: unknown,
		arg0?: Arg1,
		arg1?: Arg2,
		arg2?: Arg3,
	): SyncExpectationResult {
		const markup = getMarkup(actual);
		const message = isMessage(arg0) ? arg0 : undefined;
		const config = isConfig(arg0) ? arg0 : isConfig(arg1) ? arg1 : undefined; // eslint-disable-line sonarjs/no-nested-conditional -- easier to read than the alternative */
		const filename = isString(arg0) ? arg0 : isString(arg1) ? arg1 : arg2; // eslint-disable-line sonarjs/no-nested-conditional -- easier to read than the alternative */
		return toHTMLValidateImpl.call(this, expect, markup, message, config, filename);
	}
	return diverge(toHTMLValidate);
}

/* eslint-disable-next-line @typescript-eslint/max-params -- technical debt */
function toHTMLValidateImpl(
	this: MatcherState,
	expect: VitestExpect,
	actual: string,
	expectedError?: Partial<Message>,
	userConfig?: ConfigData,
	filename?: string,
): SyncExpectationResult {
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

	const syncFn = createSyncFn<ValidateStringFn>(vitestWorkerPath);
	const report = syncFn(actual, actualFilename, config);
	const pass = report.valid;
	if (pass) {
		return { pass, message: () => "HTML is valid when an error was expected" };
	}

	const result = report.results[0];
	if (expectedError) {
		const actual = result.messages;
		/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- upstream typing */
		const expected = expect.arrayContaining([expect.objectContaining(expectedError)]);
		const errorPass = this.equals(actual, expected);
		const diffString = this.utils.diff(expected, actual, {
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
		/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- upstream typing */
		return { pass: !errorPass, message: expectedErrorMessage, actual, expected };
	}

	const errors = result.messages.map((message) => `  ${message.message} [${message.ruleId}]`);
	return {
		pass,
		message: () =>
			["Expected HTML to be valid but had the following errors:", ""].concat(errors).join("\n"),
	};
}

export { createMatcher as toHTMLValidate };
