import deepmerge from "deepmerge";
import { type ConfigData } from "../../config";
import { FileSystemConfigLoader } from "../../config/loaders/file-system";
import { HtmlValidate } from "../../htmlvalidate";
import { type Message } from "../../reporter";
import { type MatcherResult, diff, diverge } from "../utils";

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
			arg.context
	);
}

function isConfig(arg: any): arg is ConfigData {
	if (!arg) {
		return false;
	}
	return Boolean(
		arg.root || arg.extends || arg.elements || arg.plugin || arg.transform || arg.rules
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

function toHTMLValidate(
	this: jest.MatcherContext,
	actual: unknown,
	arg0?: Partial<Message> | ConfigData | string,
	arg1?: ConfigData | string,
	arg2?: string
): MatcherResult {
	const markup = getMarkup(actual);
	const message = isMessage(arg0) ? arg0 : undefined;
	const config = isConfig(arg0) ? arg0 : isConfig(arg1) ? arg1 : undefined;
	const filename = isString(arg0) ? arg0 : isString(arg1) ? arg1 : arg2;
	return toHTMLValidateImpl.call(this, markup, message, config, filename);
}

function toHTMLValidateImpl(
	this: jest.MatcherContext,
	actual: string,
	expectedError?: Partial<Message>,
	userConfig?: ConfigData,
	filename?: string
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
	if (pass) {
		return { pass, message: () => "HTML is valid when an error was expected" };
	} else {
		if (expectedError) {
			/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- outside our control, this is what jest gives us back and it gladly accepts it back */
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

export default diverge(toHTMLValidate);
