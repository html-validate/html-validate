/**
 * @vitest-environment jsdom
 */

import { describe, expect, it, vi } from "vitest";
import { stripAnsi } from "../../strip-ansi";
import { toHTMLValidate } from "./to-htmlvalidate";

expect.extend({
	toHTMLValidate: toHTMLValidate(expect),
});

vi.mock(import("../../config/default"), () => {
	return {
		default: {
			extends: ["html-validate:recommended"],
		},
	};
});

describe("toHTMLValidate()", () => {
	it("should pass if markup is valid", async () => {
		expect.assertions(1);
		await expect("<p></p>").toHTMLValidate();
	});

	it("should pass if markup is invalid but negated", async () => {
		expect.assertions(1);
		await expect("<p></i>").not.toHTMLValidate();
	});

	it("should fail if markup is invalid", async () => {
		expect.assertions(3);
		let error: Error | undefined;
		const markup = `<a href=""><button>`;
		try {
			await expect(markup).toHTMLValidate();
		} catch (e: unknown) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(stripAnsi(error?.message ?? "")).toMatchInlineSnapshot(`
			"Expected HTML to be valid but had the following errors:

			  Unclosed element '<a>' [close-order]
			  Anchor link must have a text describing its purpose [wcag/h30]
			  Unclosed element '<button>' [close-order]
			  <button> is missing recommended "type" attribute [no-implicit-button-type]
			  <button> must have accessible text [text-content]
			  <button> element is not permitted as a descendant of <a> [element-permitted-content]"
		`);
	});

	it("should fail if markup is valid but negated", async () => {
		expect.assertions(3);
		let error: Error | undefined;
		try {
			await expect("<p></p>").not.toHTMLValidate();
		} catch (e: unknown) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(stripAnsi(error?.message ?? "")).toMatchInlineSnapshot(
			`"HTML is valid when an error was expected"`,
		);
	});

	it("should support setting custom filename", async () => {
		expect.assertions(1);
		await expect("<p></p>").toHTMLValidate("my-custom-filename.html");
	});

	it("should support configuration object", async () => {
		expect.assertions(1);
		await expect("<div>").toHTMLValidate({
			rules: {
				"close-order": "off",
			},
		});
	});

	it("should support configuration object and message", async () => {
		expect.assertions(1);
		await expect("<div>").toHTMLValidate(
			/* message */ {
				ruleId: "close-order",
			},
			/* config */ {
				rules: {
					"close-order": "off",
				},
			},
		);
	});

	it("should support configuration object and filename", async () => {
		expect.assertions(1);
		await expect("<div>").toHTMLValidate(
			/* config */ {
				rules: {
					"close-order": "off",
				},
			},
			"my-custom-filename.html",
		);
	});

	it("should support configuration object, message and filename", async () => {
		expect.assertions(1);
		await expect("<div>").toHTMLValidate(
			/* message */ {
				ruleId: "close-order",
			},
			/* config */ {
				rules: {
					"close-order": "off",
				},
			},
			"my-custom-filename.html",
		);
	});

	it("should ignore void-style by default", async () => {
		expect.assertions(1);
		await expect("<hr><hr/>").toHTMLValidate();
	});

	it("should support jsdom", async () => {
		expect.assertions(2);

		/* should pass */
		const doc = document;
		const p = doc.createElement("p");
		await expect(p).toHTMLValidate();

		/* should fail (type not set) */
		const button = doc.createElement("button");
		await expect(button).not.toHTMLValidate();
	});

	it("should throw error when passing invalid object", () => {
		expect.hasAssertions();
		expect(() => {
			void expect({}).toHTMLValidate();
		}).toThrowErrorMatchingInlineSnapshot(
			`[TypeError: Failed to get markup from "object" argument]`,
		);
	});

	it("should pass if markup has correct error", async () => {
		expect.assertions(1);
		await expect("<div>").not.toHTMLValidate({
			ruleId: "close-order",
			message: "Unclosed element '<div>'",
		});
	});

	it("should fail if markup has wrong error", async () => {
		expect.assertions(3);
		let error: Error | undefined;
		try {
			await expect("<div>").not.toHTMLValidate({
				ruleId: "wrong-error",
				message: expect.stringContaining("Some other error"),
			});
		} catch (e: unknown) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(stripAnsi(error?.message ?? "")).toMatchInlineSnapshot(`
			"expect(received).not.toHTMLValidate(expected) // expected error

			Expected error to be present:
			Object {
			  "message": StringContaining "Some other error",
			  "ruleId": "wrong-error",
			}

			- Expected error
			+ Actual error

			- ArrayContaining [
			-   ObjectContaining {
			-     "message": StringContaining "Some other error",
			-     "ruleId": "wrong-error",
			+ [
			+   {
			+     "column": 2,
			+     "line": 1,
			+     "message": "Unclosed element '<div>'",
			+     "offset": 1,
			+     "ruleId": "close-order",
			+     "ruleUrl": "https://html-validate.org/rule-mock-url.html",
			+     "selector": "div",
			+     "severity": 2,
			+     "size": 3,
			    },
			  ]"
		`);
	});
});
