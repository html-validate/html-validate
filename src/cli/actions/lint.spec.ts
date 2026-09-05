import fs from "node:fs/promises";
import { beforeEach, expect, it, jest } from "@jest/globals";
import kleur from "kleur";
import { WritableStreamBuffer } from "stream-buffers";
import { type Message, HtmlValidate } from "../..";
import { Severity } from "../../config";
import { type ErrorFixer } from "../../error-fixer";
import { getFormatter } from "../formatter";
import { type LintOptions, MAX_FIX_ITERATIONS, lint } from "./lint";

kleur.enabled = true;

function mockError(ruleId: string, message: string): Message {
	return {
		ruleId,
		message,
		severity: Severity.ERROR,
		offset: 0,
		line: 1,
		column: 1,
		size: 1,
		selector: null,
	};
}

function mockWarning(ruleId: string, message: string): Message {
	return {
		ruleId,
		message,
		severity: Severity.WARN,
		offset: 0,
		line: 1,
		column: 1,
		size: 1,
		selector: null,
	};
}

let htmlvalidate: HtmlValidate;
let stdout: WritableStreamBuffer;
let stderr: WritableStreamBuffer;
const formatter = getFormatter("text");
const defaultOptions: LintOptions = {
	fix: false,
	formatter,
	maxWarnings: -1,
	performance: false,
	stdinFilename: false,
};

beforeEach(() => {
	jest.restoreAllMocks();
	htmlvalidate = new HtmlValidate();
	stdout = new WritableStreamBuffer();
	stderr = new WritableStreamBuffer();
});

it("should return successful if there where no errors", async () => {
	expect.assertions(3);
	jest.spyOn(htmlvalidate, "validateFile").mockResolvedValue({
		valid: true,
		results: [],
		errorCount: 0,
		warningCount: 0,
	});
	const files = ["foo.html", "bar.html"];
	const success = await lint(htmlvalidate, stdout, stderr, files, defaultOptions);
	expect(success).toBeTruthy();
	expect(stdout.getContentsAsString("utf-8")).toMatchInlineSnapshot(`false`);
	expect(stderr.getContentsAsString("utf-8")).toMatchInlineSnapshot(`false`);
});

it("should return success if there where only warnings", async () => {
	expect.assertions(3);
	jest.spyOn(htmlvalidate, "validateFile").mockImplementation((filePath: string) =>
		Promise.resolve({
			valid: true,
			results: [
				{
					messages: [mockWarning("mock-rule", "lorem ipsum")],
					filePath,
					errorCount: 0,
					warningCount: 1,
					fixableErrorCount: 0,
					fixableWarningCount: 0,
					source: null,
				},
			],
			errorCount: 0,
			warningCount: 1,
		}),
	);
	const files = ["foo.html", "bar.html"];
	const success = await lint(htmlvalidate, stdout, stderr, files, defaultOptions);
	expect(success).toBeTruthy();
	expect(stdout.getContentsAsString("utf-8")).toMatchInlineSnapshot(`
		"foo.html:1:1: warning [mock-rule] lorem ipsum
		bar.html:1:1: warning [mock-rule] lorem ipsum
		"
	`);
	expect(stderr.getContentsAsString("utf-8")).toMatchInlineSnapshot(`false`);
});

it("should return failure if there where any errors", async () => {
	expect.assertions(3);
	jest.spyOn(htmlvalidate, "validateFile").mockImplementation((filePath: string) =>
		Promise.resolve({
			valid: false,
			results: [
				{
					messages: [mockError("mock-rule", "lorem ipsum")],
					filePath,
					errorCount: 1,
					warningCount: 0,
					fixableErrorCount: 0,
					fixableWarningCount: 0,
					source: null,
				},
			],
			errorCount: 1,
			warningCount: 0,
		}),
	);
	const files = ["foo.html", "bar.html"];
	const success = await lint(htmlvalidate, stdout, stderr, files, defaultOptions);
	expect(success).toBeFalsy();
	expect(stdout.getContentsAsString("utf-8")).toMatchInlineSnapshot(`
		"foo.html:1:1: error [mock-rule] lorem ipsum
		bar.html:1:1: error [mock-rule] lorem ipsum
		"
	`);
	expect(stderr.getContentsAsString("utf-8")).toMatchInlineSnapshot(`false`);
});

it("should return failure if there are too many warnings", async () => {
	expect.assertions(3);
	jest.spyOn(htmlvalidate, "validateFile").mockImplementation((filePath: string) =>
		Promise.resolve({
			valid: true,
			results: [
				{
					messages: [mockWarning("mock-rule", "lorem ipsum")],
					filePath,
					errorCount: 0,
					warningCount: 1,
					fixableErrorCount: 0,
					fixableWarningCount: 0,
					source: null,
				},
			],
			errorCount: 0,
			warningCount: 1,
		}),
	);
	const files = ["foo.html", "bar.html"];
	const success = await lint(htmlvalidate, stdout, stderr, files, {
		...defaultOptions,
		maxWarnings: 1,
	});
	expect(success).toBeFalsy();
	expect(stdout.getContentsAsString("utf-8")).toMatchInlineSnapshot(`
		"foo.html:1:1: warning [mock-rule] lorem ipsum
		bar.html:1:1: warning [mock-rule] lorem ipsum

		html-validate found too many warnings (maximum: 1).
		"
	`);
	expect(stderr.getContentsAsString("utf-8")).toMatchInlineSnapshot(`false`);
});

it("should retain /dev/stdin when stdinFilename is not given", async () => {
	expect.assertions(3);
	jest.spyOn(htmlvalidate, "validateFile").mockImplementation((filePath: string) =>
		Promise.resolve({
			valid: false,
			results: [
				{
					messages: [mockError("mock-rule", "lorem ipsum")],
					filePath,
					errorCount: 1,
					warningCount: 0,
					fixableErrorCount: 0,
					fixableWarningCount: 0,
					source: null,
				},
			],
			errorCount: 1,
			warningCount: 0,
		}),
	);
	const files = ["/dev/stdin"];
	const success = await lint(htmlvalidate, stdout, stderr, files, {
		...defaultOptions,
	});
	expect(success).toBeFalsy();
	expect(stdout.getContentsAsString("utf-8")).toMatchInlineSnapshot(`
		"/dev/stdin:1:1: error [mock-rule] lorem ipsum
		"
	`);
	expect(stderr.getContentsAsString("utf-8")).toMatchInlineSnapshot(`false`);
});

it("should rename stdin if stdinFilename is given", async () => {
	expect.assertions(3);
	jest.spyOn(htmlvalidate, "validateFile").mockImplementation((filePath: string) =>
		Promise.resolve({
			valid: false,
			results: [
				{
					messages: [mockError("mock-rule", "lorem ipsum")],
					filePath,
					errorCount: 1,
					warningCount: 0,
					fixableErrorCount: 0,
					fixableWarningCount: 0,
					source: null,
				},
			],
			errorCount: 1,
			warningCount: 0,
		}),
	);
	const files = ["/dev/stdin"];
	const success = await lint(htmlvalidate, stdout, stderr, files, {
		...defaultOptions,
		stdinFilename: "https://example.net/page.html",
	});
	expect(success).toBeFalsy();
	expect(stdout.getContentsAsString("utf-8")).toMatchInlineSnapshot(`
		"https://example.net/page.html:1:1: error [mock-rule] lorem ipsum
		"
	`);
	expect(stderr.getContentsAsString("utf-8")).toMatchInlineSnapshot(`false`);
});

it("should not rename other files when stdinFilename is given", async () => {
	expect.assertions(3);
	jest.spyOn(htmlvalidate, "validateFile").mockImplementation((filePath: string) =>
		Promise.resolve({
			valid: false,
			results: [
				{
					messages: [mockError("mock-rule", "lorem ipsum")],
					filePath,
					errorCount: 1,
					warningCount: 0,
					fixableErrorCount: 0,
					fixableWarningCount: 0,
					source: null,
				},
			],
			errorCount: 1,
			warningCount: 0,
		}),
	);
	const files = ["foo.html"];
	const success = await lint(htmlvalidate, stdout, stderr, files, {
		...defaultOptions,
		stdinFilename: "https://example.net/page.html",
	});
	expect(success).toBeFalsy();
	expect(stdout.getContentsAsString("utf-8")).toMatchInlineSnapshot(`
		"foo.html:1:1: error [mock-rule] lorem ipsum
		"
	`);
	expect(stderr.getContentsAsString("utf-8")).toMatchInlineSnapshot(`false`);
});

it("should write current filename to output stream when an exception is cast", async () => {
	expect.assertions(2);
	jest.spyOn(htmlvalidate, "validateFile").mockImplementation(() => {
		throw new Error("mock error");
	});
	const files = ["foo.html"];
	try {
		await lint(htmlvalidate, stdout, stderr, files, defaultOptions);
	} catch {
		/* do nothing */
	}
	expect(stdout.getContentsAsString("utf-8")).toMatchInlineSnapshot(`
		"<red>Validator crashed when parsing "foo.html"</color>
		"
	`);
	expect(stderr.getContentsAsString("utf-8")).toMatchInlineSnapshot(`false`);
});

it("should output performance data when enabled", async () => {
	expect.assertions(4);
	jest.spyOn(htmlvalidate, "startPerformance").mockImplementation(() => void 0);
	jest.spyOn(htmlvalidate, "stopPerformance").mockImplementation(() => ({
		events: [{ event: "tag:start", count: 1, time: 2.5 }],
		rules: [{ rule: "void-style", count: 1, time: 1.5 }],
		configTime: 1,
		transformTime: 3,
		totalTime: 10,
	}));
	jest.spyOn(htmlvalidate, "validateFile").mockResolvedValue({
		valid: true,
		results: [],
		errorCount: 0,
		warningCount: 0,
	});
	const files = ["foo.html"];
	await lint(htmlvalidate, stdout, stderr, files, { ...defaultOptions, performance: true });
	expect(htmlvalidate.startPerformance).toHaveBeenCalledTimes(1);
	expect(htmlvalidate.stopPerformance).toHaveBeenCalledTimes(1);
	expect(stdout.getContentsAsString("utf-8")).toMatchInlineSnapshot(`false`);
	expect(stderr.getContentsAsString("utf-8")).toMatchInlineSnapshot(`
		"Performance

		Events:
		  event        count    time(ms)   time(%)
		  ────────────────────────────────────────
		  tag:start        1      2.50ms     25.0%

		Rules:
		  rule          count    time(ms)   time(%)
		  ─────────────────────────────────────────
		  void-style        1      1.50ms     15.0%

		Total:     10.00ms
		  Config:    1.00ms
		  Transform: 3.00ms
		  Events:    1.00ms
		  Rules:     1.50ms
		"
	`);
});

it("should not call startPerformance/stopPerformance when not enabled", async () => {
	expect.assertions(3);
	jest.spyOn(htmlvalidate, "startPerformance").mockImplementation(() => void 0);
	jest.spyOn(htmlvalidate, "stopPerformance").mockImplementation(() => ({
		events: [],
		rules: [],
		configTime: 0,
		transformTime: 0,
		totalTime: 0,
	}));
	jest.spyOn(htmlvalidate, "validateFile").mockResolvedValue({
		valid: true,
		results: [],
		errorCount: 0,
		warningCount: 0,
	});
	const files = ["foo.html"];
	await lint(htmlvalidate, stdout, stderr, files, defaultOptions);
	expect(htmlvalidate.startPerformance).not.toHaveBeenCalled();
	expect(htmlvalidate.stopPerformance).not.toHaveBeenCalled();
	expect(stderr.getContentsAsString("utf-8")).toMatchInlineSnapshot(`false`);
});

it("should output performance data with zero total time", async () => {
	expect.assertions(2);
	jest.spyOn(htmlvalidate, "startPerformance").mockImplementation(() => void 0);
	jest.spyOn(htmlvalidate, "stopPerformance").mockImplementation(() => ({
		events: [{ event: "tag:start", count: 1, time: 0 }],
		rules: [{ rule: "void-style", count: 1, time: 0 }],
		configTime: 0,
		transformTime: 0,
		totalTime: 0,
	}));
	jest.spyOn(htmlvalidate, "validateFile").mockResolvedValue({
		valid: true,
		results: [],
		errorCount: 0,
		warningCount: 0,
	});
	const files = ["foo.html"];
	await lint(htmlvalidate, stdout, stderr, files, { ...defaultOptions, performance: true });
	expect(htmlvalidate.stopPerformance).toHaveBeenCalledTimes(1);
	expect(stderr.getContentsAsString("utf-8")).toMatchInlineSnapshot(`
		"Performance

		Events:
		  event        count    time(ms)   time(%)
		  ────────────────────────────────────────
		  tag:start        1      0.00ms      0.0%

		Rules:
		  rule          count    time(ms)   time(%)
		  ─────────────────────────────────────────
		  void-style        1      0.00ms      0.0%

		Total:     0.00ms
		  Config:    0.00ms
		  Transform: 0.00ms
		  Events:    0.00ms
		  Rules:     0.00ms
		"
	`);
});

it("should apply autofix and write the patched file when fix option is enabled", async () => {
	expect.assertions(4);
	const fixableReport = {
		valid: false,
		results: [
			{
				filePath: "foo.html",
				errorCount: 1,
				warningCount: 0,
				fixableErrorCount: 1,
				fixableWarningCount: 0,
				source: null,
				messages: [
					{
						ruleId: "mock",
						severity: Severity.ERROR,
						message: "mock message",
						offset: 5,
						line: 1,
						column: 6,
						size: 3,
						selector: null,
						fix: (fixer: ErrorFixer): void => {
							fixer.replaceText(
								{ filename: "foo.html", offset: 5, line: 1, column: 6, size: 3 },
								"lorem",
							);
						},
					},
				],
			},
		],
		errorCount: 1,
		warningCount: 0,
	};
	const finalReport = {
		valid: true,
		results: [
			{
				filePath: "foo.html",
				errorCount: 0,
				warningCount: 0,
				fixableErrorCount: 0,
				fixableWarningCount: 0,
				source: null,
				messages: [],
			},
		],
		errorCount: 0,
		warningCount: 0,
	};
	jest
		.spyOn(htmlvalidate, "validateFile")
		.mockResolvedValueOnce(fixableReport)
		.mockResolvedValueOnce(finalReport);
	const autofixFile = jest
		.spyOn(htmlvalidate, "autofixFile")
		.mockResolvedValueOnce('<div foo="bar"></div>')
		.mockResolvedValueOnce('<div lorem="bar"></div>');
	const writeFile = jest.spyOn(fs, "writeFile").mockResolvedValue(undefined);
	const files = ["foo.html"];
	const success = await lint(htmlvalidate, stdout, stderr, files, { ...defaultOptions, fix: true });
	expect(success).toBeTruthy();
	expect(autofixFile).toHaveBeenCalledTimes(2);
	expect(writeFile).toHaveBeenCalledWith("foo.html", '<div lorem="bar"></div>', "utf-8");
	expect(stdout.getContentsAsString("utf-8")).toMatchInlineSnapshot(`false`);
});

it("should not write the file when fix option is enabled but no fix is available", async () => {
	expect.assertions(3);
	const report = {
		valid: false,
		results: [
			{
				filePath: "foo.html",
				errorCount: 1,
				warningCount: 0,
				fixableErrorCount: 0,
				fixableWarningCount: 0,
				source: null,
				messages: [mockError("mock-rule", "lorem ipsum")],
			},
		],
		errorCount: 1,
		warningCount: 0,
	};
	jest.spyOn(htmlvalidate, "validateFile").mockResolvedValue(report);
	const autofixFile = jest.spyOn(htmlvalidate, "autofixFile");
	const writeFile = jest.spyOn(fs, "writeFile").mockResolvedValue(undefined);
	const files = ["foo.html"];
	const success = await lint(htmlvalidate, stdout, stderr, files, { ...defaultOptions, fix: true });
	expect(success).toBeFalsy();
	expect(autofixFile).not.toHaveBeenCalled();
	expect(writeFile).not.toHaveBeenCalled();
});

it("should not write the file when a fix produces no change to the source", async () => {
	expect.assertions(2);
	const report = {
		valid: false,
		results: [
			{
				filePath: "foo.html",
				errorCount: 1,
				warningCount: 0,
				fixableErrorCount: 1,
				fixableWarningCount: 0,
				source: null,
				messages: [
					{
						ruleId: "mock",
						severity: Severity.ERROR,
						message: "mock message",
						offset: 0,
						line: 1,
						column: 1,
						size: 1,
						selector: null,
						fix: (fixer: ErrorFixer): void => {
							fixer.replaceText(
								{ filename: "foo.html", offset: 0, line: 1, column: 1, size: 1 },
								"a",
							);
						},
					},
				],
			},
		],
		errorCount: 1,
		warningCount: 0,
	};
	jest.spyOn(htmlvalidate, "validateFile").mockResolvedValue(report);
	/* both the baseline read and the applied fix resolve to the same
	 * content, simulating a fix that makes no actual change */
	jest.spyOn(htmlvalidate, "autofixFile").mockResolvedValue("abc");
	const writeFile = jest.spyOn(fs, "writeFile").mockResolvedValue(undefined);
	const files = ["foo.html"];
	const success = await lint(htmlvalidate, stdout, stderr, files, { ...defaultOptions, fix: true });
	expect(success).toBeFalsy();
	expect(writeFile).not.toHaveBeenCalled();
});

it("should stop fixing once the iteration limit is reached", async () => {
	expect.assertions(2);
	let counter = 0;
	const alwaysFixableReport = {
		valid: false,
		results: [
			{
				filePath: "foo.html",
				errorCount: 1,
				warningCount: 0,
				fixableErrorCount: 1,
				fixableWarningCount: 0,
				source: null,
				messages: [
					{
						ruleId: "mock",
						severity: Severity.ERROR,
						message: "mock message",
						offset: 0,
						line: 1,
						column: 1,
						size: 0,
						selector: null,
						fix: (): void => {
							/* not used since autofixFile() is mocked */
						},
					},
				],
			},
		],
		errorCount: 1,
		warningCount: 0,
	};
	const validateFile = jest
		.spyOn(htmlvalidate, "validateFile")
		.mockResolvedValue(alwaysFixableReport);
	/* every call (the initial baseline read as well as each time a fix is
	 * applied) resolves to a unique value so the fix loop always makes
	 * "progress" and only stops once the iteration limit is reached */
	jest.spyOn(htmlvalidate, "autofixFile").mockImplementation(() => {
		counter++;
		return Promise.resolve(`patched-${String(counter)}`);
	});
	jest.spyOn(fs, "writeFile").mockResolvedValue(undefined);
	const files = ["foo.html"];
	await lint(htmlvalidate, stdout, stderr, files, { ...defaultOptions, fix: true });
	/* 1 initial validate + N re-validations (one per applied fix) */
	expect(validateFile).toHaveBeenCalledTimes(MAX_FIX_ITERATIONS + 1);
	/* 1 baseline read + N applied fixes */
	expect(counter).toBe(MAX_FIX_ITERATIONS + 1);
});
