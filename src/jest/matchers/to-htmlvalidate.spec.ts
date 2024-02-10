/**
 * @jest-environment jsdom
 */

import { stripAnsi } from "../utils";
import "../jest";

jest.mock("../../config/default", () => {
	return {
		extends: ["html-validate:recommended"],
	};
});

describe("toHTMLValidate()", () => {
	it("should pass if markup is valid", () => {
		expect.assertions(1);
		expect("<p></p>").toHTMLValidate();
	});

	it("should pass if markup is invalid but negated", () => {
		expect.assertions(1);
		expect("<p></i>").not.toHTMLValidate();
	});

	it("should fail if markup is invalid", () => {
		expect.assertions(3);
		let error: any;
		try {
			expect("<a><button></i>").toHTMLValidate();
		} catch (e: any) {
			error = e;
		}
		expect(error).toBeDefined();
		expect(stripAnsi(error?.message || "")).toMatchInlineSnapshot(`
			"Expected HTML to be valid but had the following errors:

			  Anchor link must have a text describing its purpose [wcag/h30]
			  <button> is missing recommended "type" attribute [no-implicit-button-type]
			  <button> must have accessible text [text-content]
			  <button> element is not permitted as a descendant of <a> [element-permitted-content]
			  Mismatched close-tag, expected '</button>' but found '</i>'. [close-order]
			  Missing close-tag, expected '</a>' but document ended before it was found. [close-order]"
		`);
	});

	it("should fail if markup is valid but negated", () => {
		expect.assertions(3);
		let error: any;
		try {
			expect("<p></p>").not.toHTMLValidate();
		} catch (e: any) {
			error = e;
		}
		expect(error).toBeDefined();
		expect(stripAnsi(error?.message || "")).toMatchInlineSnapshot(
			`"HTML is valid when an error was expected"`,
		);
	});

	it("should support setting custom filename", () => {
		expect.assertions(1);
		expect("<p></p>").toHTMLValidate("my-custom-filename.html");
	});

	it("should support configuration object", () => {
		expect.assertions(1);
		expect("<p></i>").toHTMLValidate({
			rules: {
				"close-order": "off",
			},
		});
	});

	it("should support configuration object and message", () => {
		expect.assertions(1);
		expect("<p></i>").toHTMLValidate(
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

	it("should support configuration object and filename", () => {
		expect.assertions(1);
		expect("<p></i>").toHTMLValidate(
			/* config */ {
				rules: {
					"close-order": "off",
				},
			},
			"my-custom-filename.html",
		);
	});

	it("should support configuration object, message and filename", () => {
		expect.assertions(1);
		expect("<p></i>").toHTMLValidate(
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

	it("should ignore void-style by default", () => {
		expect.assertions(1);
		expect("<hr><hr/>").toHTMLValidate();
	});

	it("should support jsdom", () => {
		expect.assertions(2);

		/* should pass */
		const doc = document;
		const p = doc.createElement("p");
		expect(p).toHTMLValidate();

		/* should fail (type not set) */
		const button = doc.createElement("button");
		expect(button).not.toHTMLValidate();
	});

	it("should pass if markup has correct error", () => {
		expect.assertions(1);
		expect("<u></i>").not.toHTMLValidate({
			ruleId: "close-order",
			message: expect.stringContaining("Mismatched close-tag"),
		});
	});

	it("should fail if markup has wrong error", () => {
		expect.assertions(3);
		let error: any;
		try {
			expect("<u></i>").not.toHTMLValidate({
				ruleId: "wrong-error",
				message: expect.stringContaining("Some other error"),
			});
		} catch (e: any) {
			error = e;
		}
		expect(error).toBeDefined();
		expect(stripAnsi(error?.message || "")).toMatchInlineSnapshot(`
			"expect(received).not.toHTMLValidate(expected) // expected error

			Expected error to be present:
			{"message": StringContaining "Some other error", "ruleId": "wrong-error"}

			- Expected error
			+ Actual error

			- ArrayContaining [
			-   ObjectContaining {
			-     "message": StringContaining "Some other error",
			-     "ruleId": "wrong-error",
			+ Array [
			+   Object {
			+     "column": 5,
			+     "line": 1,
			+     "message": "Mismatched close-tag, expected '</u>' but found '</i>'.",
			+     "offset": 4,
			+     "ruleId": "close-order",
			+     "ruleUrl": "https://html-validate.org/rules/close-order.html",
			+     "selector": null,
			+     "severity": 2,
			+     "size": 2,
			    },
			  ]"
		`);
	});
});
