import stripAnsi = require("strip-ansi");
import { Severity } from "./config";
import { Token, TokenType } from "./lexer";
import "./matchers";
import { Report, Reporter } from "./reporter";

let reportOk: Report;
let reportError: Report;
let reportMultipleErrors: Report;

beforeEach(() => {
	const reporter = new Reporter();
	reportOk = reporter.save();

	/* generate first report with a single error */
	reporter.addManual("inline", {
		ruleId: "my-rule",
		severity: Severity.ERROR,
		message: "mock message",
		line: 2,
		column: 15,
		offset: 43,
		size: 12,
		selector: null,
		context: {
			foo: "bar",
		},
	});
	reportError = reporter.save();

	/* add another to the report with multiple errors */
	reporter.addManual("inline", {
		ruleId: "another-rule",
		severity: Severity.ERROR,
		message: "another message",
		line: 2,
		column: 15,
		offset: 43,
		size: 12,
		selector: null,
	});
	reportMultipleErrors = reporter.save();
});

describe("toBeValid()", () => {
	it("should pass if report is valid", async () => {
		expect.assertions(1);
		await expect(reportOk).toBeValid();
	});

	it("should fail if report is invalid", async () => {
		expect.assertions(3);
		let error: Error;
		try {
			await expect(reportError).toBeValid();
		} catch (e) {
			error = e;
		}
		expect(error).toBeDefined();
		expect(error.message).toMatchSnapshot();
	});
});

describe("toBeInvalid()", () => {
	it("should pass if report is invalid", async () => {
		expect.assertions(1);
		await expect(reportError).toBeInvalid();
	});

	it("should fail if report is valid", async () => {
		expect.assertions(3);
		let error: Error;
		try {
			await expect(reportOk).toBeInvalid();
		} catch (e) {
			error = e;
		}
		expect(error).toBeDefined();
		expect(error.message).toMatchSnapshot();
	});
});

describe("toHaveError()", () => {
	it("should pass if error is preset", async () => {
		expect.assertions(1);
		await expect(reportError).toHaveError("my-rule", "mock message");
	});

	it("should pass if error have matching context", async () => {
		expect.assertions(1);
		await expect(reportError).toHaveError("my-rule", "mock message", {
			foo: "bar",
		});
	});

	it("should fail if error is missing", async () => {
		expect.assertions(3);
		let error: Error;
		try {
			await expect(reportError).toHaveError("asdf", "asdf");
		} catch (e) {
			error = e;
		}
		expect(error).toBeDefined();
		expect(stripAnsi(error.message)).toMatchSnapshot();
	});

	it("should fail if error has mismatched context", async () => {
		expect.assertions(3);
		let error: Error;
		try {
			await expect(reportError).toHaveError("my-rule", "mock message", {
				foo: "spam",
			});
		} catch (e) {
			error = e;
		}
		expect(error).toBeDefined();
		expect(stripAnsi(error.message)).toMatchSnapshot();
	});
});

describe("toHaveErrors()", () => {
	it("should pass if error is preset", async () => {
		expect.assertions(1);
		await expect(reportError).toHaveErrors([["my-rule", "mock message"]]);
	});

	it("should pass if error have matching context", async () => {
		expect.assertions(1);
		await expect(reportError).toHaveErrors([
			{ ruleId: "my-rule", message: "mock message", context: { foo: "bar" } },
		]);
	});

	it("should pass if all errors are preset", async () => {
		expect.assertions(1);
		await expect(reportMultipleErrors).toHaveErrors([
			["my-rule", "mock message"],
			["another-rule", "another message"],
		]);
	});

	it("should fail if error any missing", async () => {
		expect.assertions(3);
		let error: Error;
		try {
			await expect(reportMultipleErrors).toHaveErrors([
				["my-rule", "mock message"],
				["spam", "spam"],
			]);
		} catch (e) {
			error = e;
		}
		expect(error).toBeDefined();
		expect(stripAnsi(error.message)).toMatchSnapshot();
	});
});

describe("toBeToken()", () => {
	const token: Token = {
		type: TokenType.TAG_OPEN,
		data: ["<foo", "", "foo"],
		location: {
			filename: "inline",
			line: 1,
			column: 2,
			offset: 1,
			size: 1,
		},
	};

	it("should pass if token matches", async () => {
		expect.assertions(1);
		await expect({ value: token }).toBeToken({
			type: TokenType.TAG_OPEN,
		});
	});

	it("should fail if token doesn't match", async () => {
		expect.assertions(3);
		let error: Error;
		try {
			await expect({ value: token }).toBeToken({
				type: TokenType.TAG_CLOSE,
			});
		} catch (e) {
			error = e;
		}
		expect(error).toBeDefined();
		expect(stripAnsi(error.message)).toMatchSnapshot();
	});
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

	it("should fail if markup is invalid", async () => {
		expect.assertions(3);
		let error: Error;
		try {
			await expect("<a><button></i>").toHTMLValidate();
		} catch (e) {
			error = e;
		}
		expect(error).toBeDefined();
		expect(stripAnsi(error.message)).toMatchInlineSnapshot(`
			"Expected HTML to be valid but had the following errors:

			  Anchor link must have a text describing its purpose [wcag/h30]
			  <button> is missing required \\"type\\" attribute [element-required-attributes]
			  Element <button> is not permitted as descendant of <a> [element-permitted-content]
			  Mismatched close-tag, expected '</button>' but found '</i>'. [close-order]
			  Missing close-tag, expected '</a>' but document ended before it was found. [close-order]"
		`);
	});

	it("should fail if markup is valid but negated", async () => {
		expect.assertions(3);
		let error: Error;
		try {
			await expect("<p></p>").not.toHTMLValidate();
		} catch (e) {
			error = e;
		}
		expect(error).toBeDefined();
		expect(stripAnsi(error.message)).toMatchInlineSnapshot(
			`"HTML is valid when an error was expected"`
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
			}
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
			"my-custom-filename.html"
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
			"my-custom-filename.html"
		);
	});

	it("should ignore void-style by default", () => {
		expect.assertions(1);
		expect("<hr><hr/>").toHTMLValidate();
	});

	it("should support jsdom", () => {
		expect.assertions(2);

		/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
		// @ts-ignore DOM library not available
		const doc = document;

		/* should pass */
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

	it("should fail if markup has wrong error", async () => {
		expect.assertions(3);
		let error: Error;
		try {
			await expect("<u></i>").not.toHTMLValidate({
				ruleId: "wrong-error",
				message: expect.stringContaining("Some other error"),
			});
		} catch (e) {
			error = e;
		}
		expect(error).toBeDefined();
		expect(stripAnsi(error.message)).toMatchInlineSnapshot(`
		"expect(received).not.toHTMLValidate(expected) // expected error

		Expected error to be present:
		{\\"message\\": StringContaining \\"Some other error\\", \\"ruleId\\": \\"wrong-error\\"}

		- Expected error
		+ Actual error

		- ArrayContaining [
		-   ObjectContaining {
		-     \\"message\\": StringContaining \\"Some other error\\",
		-     \\"ruleId\\": \\"wrong-error\\",
		+ Array [
		+   Object {
		+     \\"column\\": 5,
		+     \\"context\\": undefined,
		+     \\"line\\": 1,
		+     \\"message\\": \\"Mismatched close-tag, expected '</u>' but found '</i>'.\\",
		+     \\"offset\\": 4,
		+     \\"ruleId\\": \\"close-order\\",
		+     \\"selector\\": null,
		+     \\"severity\\": 2,
		+     \\"size\\": 2,
		    },
		  ]"
	`);
	});
});
