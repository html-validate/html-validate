import { beforeEach, expect, it, jest } from "@jest/globals";
import kleur from "kleur";
import { WritableStreamBuffer } from "stream-buffers";
import { type Message, HtmlValidate } from "../..";
import { Severity } from "../../config";
import { getFormatter } from "../formatter";
import { type LintOptions, lint } from "./lint";

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
	formatter,
	maxWarnings: -1,
	performance: false,
	stdinFilename: false,
};

beforeEach(() => {
	htmlvalidate = new HtmlValidate();
	stdout = new WritableStreamBuffer();
	stderr = new WritableStreamBuffer();
});

it("should return successful if there where no errors", async () => {
	expect.assertions(3);
	jest.spyOn(htmlvalidate, "validateFile").mockImplementation(() =>
		Promise.resolve({
			valid: true,
			results: [],
			errorCount: 0,
			warningCount: 0,
		}),
	);
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
	jest.spyOn(htmlvalidate, "validateFile").mockImplementation(() =>
		Promise.resolve({
			valid: true,
			results: [],
			errorCount: 0,
			warningCount: 0,
		}),
	);
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
	jest.spyOn(htmlvalidate, "validateFile").mockImplementation(() =>
		Promise.resolve({
			valid: true,
			results: [],
			errorCount: 0,
			warningCount: 0,
		}),
	);
	const files = ["foo.html"];
	await lint(htmlvalidate, stdout, stderr, files, defaultOptions);
	expect(htmlvalidate.startPerformance).not.toHaveBeenCalled();
	expect(htmlvalidate.stopPerformance).not.toHaveBeenCalled();
	expect(stderr.getContentsAsString("utf-8")).toMatchInlineSnapshot(`false`);
});
