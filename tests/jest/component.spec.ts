/**
 * @jest-environment jsdom
 */

import { HtmlValidate, CLI } from "../../src";
import "../../src/jest";

let htmlvalidate: HtmlValidate;

function stripAnsi(text: string): string {
	/* eslint-disable-next-line no-control-regex */
	return text.replace(/\u001B\[[0-9;]*m/g, "");
}

expect.addSnapshotSerializer({
	serialize(val: string): string {
		return stripAnsi(val);
	},
	test(): boolean {
		return true;
	},
});

beforeAll(() => {
	const cli = new CLI();
	htmlvalidate = cli.getValidator();
});

it("should validate ok", () => {
	expect.assertions(4);
	const markup = /* HTML */ `<div></div>`;
	const report = htmlvalidate.validateString(markup);
	expect(markup).toHTMLValidate();
	expect(report).toBeValid();
	expect(() => expect(report).toHaveError("no-inline-style", "Inline style is not allowed"))
		.toThrowErrorMatchingInlineSnapshot(`
expect(received).toHaveError(expected)

Expected error to equal:
  [ObjectContaining {"message": "Inline style is not allowed", "ruleId": "no-inline-style"}]
Received:
  []

Difference:

- Expected
+ Received

- Array [
-   ObjectContaining {
-     "message": "Inline style is not allowed",
-     "ruleId": "no-inline-style",
-   },
- ]
+ Array []
`);
});

it("should not validate", () => {
	expect.assertions(6);
	const markup = /* HTML */ `<div style="color: hotpink;"></div>`;
	const report = htmlvalidate.validateString(markup);
	expect(markup).not.toHTMLValidate();
	expect(markup).not.toHTMLValidate({
		ruleId: "no-inline-style",
	});
	expect(report).toBeInvalid();
	expect(report).toHaveError("no-inline-style", "Inline style is not allowed");
	expect(() => expect(report).toBeValid()).toThrowErrorMatchingInlineSnapshot(
		`Result should be valid but had error "Inline style is not allowed"`
	);
});

it("should validate jsdom HTMLElement", () => {
	expect.assertions(2);
	/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
	/* @ts-ignore DOM library not available */
	const element = document.createElement("div");
	element.style.color = "hotpink";
	expect(element).not.toHTMLValidate();
	expect(element).not.toHTMLValidate({
		ruleId: "no-inline-style",
	});
});

it("should allow overriding config", () => {
	expect.assertions(1);
	const markup = /* HTML */ `<div style="color: hotpink;"></div>`;
	expect(markup).toHTMLValidate({
		rules: {
			"no-inline-style": "off",
		},
	});
});

it("should read configuration from .htmlvalidate.json", () => {
	/* .htmlvalidate.json configures void with selfclosing */
	expect.assertions(1);
	const markup = /* HTML */ `<br />`;
	expect(markup).toHTMLValidate();
});
