import kleur from "kleur";
import { WritableStreamBuffer } from "stream-buffers";
import { getFormatter } from "../formatter";
import { HtmlValidate, type Message } from "../..";
import { Severity } from "../../config";
import { lint, type LintOptions } from "./lint";

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
const formatter = getFormatter("text");
const defaultOptions: LintOptions = {
	formatter,
	maxWarnings: -1,
	stdinFilename: false,
};

beforeEach(() => {
	htmlvalidate = new HtmlValidate();
	stdout = new WritableStreamBuffer();
});

it("should return successful if there where no errors", async () => {
	expect.assertions(2);
	jest.spyOn(htmlvalidate, "validateFile").mockImplementation(() =>
		Promise.resolve({
			valid: true,
			results: [],
			errorCount: 0,
			warningCount: 0,
		}),
	);
	const files = ["foo.html", "bar.html"];
	const success = await lint(htmlvalidate, stdout, files, defaultOptions);
	expect(success).toBeTruthy();
	expect(stdout.getContentsAsString("utf-8")).toMatchInlineSnapshot(`false`);
});

it("should return success if there where only warnings", async () => {
	expect.assertions(2);
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
	const success = await lint(htmlvalidate, stdout, files, defaultOptions);
	expect(success).toBeTruthy();
	expect(stdout.getContentsAsString("utf-8")).toMatchInlineSnapshot(`
		"foo.html:1:1: warning [mock-rule] lorem ipsum
		bar.html:1:1: warning [mock-rule] lorem ipsum
		"
	`);
});

it("should return failure if there where any errors", async () => {
	expect.assertions(2);
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
	const success = await lint(htmlvalidate, stdout, files, defaultOptions);
	expect(success).toBeFalsy();
	expect(stdout.getContentsAsString("utf-8")).toMatchInlineSnapshot(`
		"foo.html:1:1: error [mock-rule] lorem ipsum
		bar.html:1:1: error [mock-rule] lorem ipsum
		"
	`);
});

it("should return failure if there are too many warnings", async () => {
	expect.assertions(2);
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
	const success = await lint(htmlvalidate, stdout, files, {
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
});

it("should retain /dev/stdin when stdinFilename is not given", async () => {
	expect.assertions(2);
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
	const success = await lint(htmlvalidate, stdout, files, {
		...defaultOptions,
	});
	expect(success).toBeFalsy();
	expect(stdout.getContentsAsString("utf-8")).toMatchInlineSnapshot(`
		"/dev/stdin:1:1: error [mock-rule] lorem ipsum
		"
	`);
});

it("should rename stdin if stdinFilename is given", async () => {
	expect.assertions(2);
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
	const success = await lint(htmlvalidate, stdout, files, {
		...defaultOptions,
		stdinFilename: "https://example.net/page.html",
	});
	expect(success).toBeFalsy();
	expect(stdout.getContentsAsString("utf-8")).toMatchInlineSnapshot(`
		"https://example.net/page.html:1:1: error [mock-rule] lorem ipsum
		"
	`);
});

it("should write current filename to output stream when an exception is cast", async () => {
	expect.assertions(1);
	jest.spyOn(htmlvalidate, "validateFile").mockImplementation(() => {
		throw new Error("mock error");
	});
	const files = ["foo.html"];
	try {
		await lint(htmlvalidate, stdout, files, defaultOptions);
	} catch (err) {
		/* do nothing */
	}
	expect(stdout.getContentsAsString("utf-8")).toMatchInlineSnapshot(`
		"<red>Validator crashed when parsing "foo.html"</color>
		"
	`);
});
