import { HtmlValidate } from "../htmlvalidate";
import { processAttribute } from "../transform/mocks/attribute";
import { RuleContext } from "./valid-id";
import "../jest";

describe("rule valid-id", () => {
	let htmlvalidate: HtmlValidate;

	describe('configured without "relaxed"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "valid-id": ["error", { relaxed: false }] },
			});
		});

		it("should not report error when id is missing", () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div></div>`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when id is valid", () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div id="fooBar123"></div>`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when id is empty", () => {
			expect.assertions(2);
			const markup = /* HTML */ `<div id=""></div>`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: element id must not be empty (valid-id) at inline:1:6:
				> 1 | <div id=""></div>
				    |      ^^^^^
				Selector: div"
			`);
		});

		it("should report error when id has leading whitespace", () => {
			expect.assertions(2);
			const markup = `<div id=" foobar"></div>`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: element id must not contain whitespace (valid-id) at inline:1:10:
				> 1 | <div id=" foobar"></div>
				    |          ^^^^^^^
				Selector: #\\ foobar"
			`);
		});

		it("should report error when id has trailing whitespace", () => {
			expect.assertions(2);
			const markup = `<div id="foobar "></div>`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: element id must not contain whitespace (valid-id) at inline:1:10:
				> 1 | <div id="foobar "></div>
				    |          ^^^^^^^
				Selector: #foobar\\"
			`);
		});

		it("should report error when id has interleaved whitespace", () => {
			expect.assertions(2);
			const markup = `<div id="foo bar"></div>`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: element id must not contain whitespace (valid-id) at inline:1:10:
				> 1 | <div id="foo bar"></div>
				    |          ^^^^^^^
				Selector: #foo\\ bar"
			`);
		});

		it("should report error when id is numeric only", () => {
			expect.assertions(2);
			const markup = /* HTML */ `<div id="123"></div>`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: element id must begin with a letter (valid-id) at inline:1:10:
				> 1 | <div id="123"></div>
				    |          ^^^
				Selector: [id="123"]"
			`);
		});

		it("should report error when id has leading numeric value", () => {
			expect.assertions(2);
			const markup = /* HTML */ `<div id="123foo"></div>`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: element id must begin with a letter (valid-id) at inline:1:10:
				> 1 | <div id="123foo"></div>
				    |          ^^^^^^
				Selector: [id="123foo"]"
			`);
		});

		it("should report error when id has leading dash", () => {
			expect.assertions(2);
			const markup = /* HTML */ `<div id="-foo"></div>`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: element id must begin with a letter (valid-id) at inline:1:10:
				> 1 | <div id="-foo"></div>
				    |          ^^^^
				Selector: #-foo"
			`);
		});

		it("should report error when id has leading underscore", () => {
			expect.assertions(2);
			const markup = /* HTML */ `<div id="_foo"></div>`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: element id must begin with a letter (valid-id) at inline:1:10:
				> 1 | <div id="_foo"></div>
				    |          ^^^^
				Selector: #_foo"
			`);
		});

		it("should report error when id has disallowed characters", () => {
			expect.assertions(2);
			const markup = /* HTML */ `<div id="foo!bar"></div>`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: element id must only contain alphanumerical, dash and underscore characters (valid-id) at inline:1:10:
				> 1 | <div id="foo!bar"></div>
				    |          ^^^^^^^
				Selector: #foo\\!bar"
			`);
		});

		it("should contain documentation", async () => {
			expect.assertions(1);
			const context = RuleContext.LEADING_CHARACTER;
			const docs = await htmlvalidate.getContextualDocumentation({
				ruleId: "valid-id",
				context,
			});
			expect(docs).toMatchInlineSnapshot(`
				{
				  "description": "Element ID must begin with a letter.

				Under the current configuration the following rules are applied:

				  - ID must not be empty
				  - ID must not contain any whitespace characters
				  - ID must begin with a letter
				  - ID must only contain alphanumerical characters, \`-\` and \`_\`",
				  "url": "https://html-validate.org/rules/valid-id.html",
				}
			`);
		});
	});

	describe('configured with "relaxed"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "valid-id": ["error", { relaxed: true }] },
			});
		});

		it("should not report error when id has only numbers", () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div id="123"></div>`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when id has unusual characters", () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div id="#"></div>`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when id has whitespace", () => {
			expect.assertions(2);
			const markup = `<div id="foo bar"></div>`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: element id must not contain whitespace (valid-id) at inline:1:10:
				> 1 | <div id="foo bar"></div>
				    |          ^^^^^^^
				Selector: #foo\\ bar"
			`);
		});

		it("should contain documentation", async () => {
			expect.assertions(1);
			const context = RuleContext.EMPTY;
			const docs = await htmlvalidate.getContextualDocumentation({
				ruleId: "valid-id",
				context,
			});
			expect(docs).toMatchInlineSnapshot(`
				{
				  "description": "Element ID must not be empty.

				Under the current configuration the following rules are applied:

				  - ID must not be empty
				  - ID must not contain any whitespace characters",
				  "url": "https://html-validate.org/rules/valid-id.html",
				}
			`);
		});
	});

	it("should not report errors for dynamic attributes", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "valid-id": "error" },
		});
		const markup = /* HTML */ `<input dynamic-id="foo + bar" />`;
		const report = htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should throw error if configured with invalid value", () => {
		expect.assertions(1);
		expect(() => {
			return new HtmlValidate({
				root: true,
				rules: { "valid-id": ["error", { relaxed: "foobar" }] },
			});
		}).toThrowErrorMatchingInlineSnapshot(
			`"Rule configuration error: /rules/valid-id/1/relaxed: type must be boolean"`,
		);
	});
});
