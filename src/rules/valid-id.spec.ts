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

		it("should not report error when id is missing", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when id is valid", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<div id="fooBar123"></div>
				<div id="foo-bar"></div>
				<div id="foo_bar"></div>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when id has valid leading character", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<p id="a"></p>
				<p id="A"></p>
				<p id="ü"></p>
				<p id="я"></p>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when id is empty", async () => {
			expect.assertions(2);
			const markup = /* HTML */ `<div id=""></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: element id must not be empty (valid-id) at inline:1:6:
				> 1 | <div id=""></div>
				    |      ^^^^^
				Selector: div"
			`);
		});

		it("should report error when id has leading whitespace", async () => {
			expect.assertions(2);
			const markup = `<div id=" foobar"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: element id must not contain whitespace (valid-id) at inline:1:10:
				> 1 | <div id=" foobar"></div>
				    |          ^^^^^^^
				Selector: #\\ foobar"
			`);
		});

		it("should report error when id has trailing whitespace", async () => {
			expect.assertions(2);
			const markup = `<div id="foobar "></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: element id must not contain whitespace (valid-id) at inline:1:10:
				> 1 | <div id="foobar "></div>
				    |          ^^^^^^^
				Selector: #foobar\\"
			`);
		});

		it("should report error when id has interleaved whitespace", async () => {
			expect.assertions(2);
			const markup = `<div id="foo bar"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: element id must not contain whitespace (valid-id) at inline:1:10:
				> 1 | <div id="foo bar"></div>
				    |          ^^^^^^^
				Selector: #foo\\ bar"
			`);
		});

		it("should report error when id is numeric only", async () => {
			expect.assertions(2);
			const markup = /* HTML */ `<div id="123"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: element id must begin with a letter (valid-id) at inline:1:10:
				> 1 | <div id="123"></div>
				    |          ^^^
				Selector: [id="123"]"
			`);
		});

		it("should report error when id has leading numeric value", async () => {
			expect.assertions(2);
			const markup = /* HTML */ `<div id="123foo"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: element id must begin with a letter (valid-id) at inline:1:10:
				> 1 | <div id="123foo"></div>
				    |          ^^^^^^
				Selector: [id="123foo"]"
			`);
		});

		it("should report error when id has leading dash", async () => {
			expect.assertions(2);
			const markup = /* HTML */ `<div id="-foo"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: element id must begin with a letter (valid-id) at inline:1:10:
				> 1 | <div id="-foo"></div>
				    |          ^^^^
				Selector: #-foo"
			`);
		});

		it("should report error when id has leading underscore", async () => {
			expect.assertions(2);
			const markup = /* HTML */ `<div id="_foo"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: element id must begin with a letter (valid-id) at inline:1:10:
				> 1 | <div id="_foo"></div>
				    |          ^^^^
				Selector: #_foo"
			`);
		});

		it("should report error when id has disallowed characters", async () => {
			expect.assertions(2);
			const markup = /* HTML */ `<div id="foo!bar"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: element id must only contain letters, digits, dash and underscore characters (valid-id) at inline:1:10:
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
				  - ID must only contain letters, digits, \`-\` and \`_\`",
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

		it("should not report error when id has only numbers", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div id="123"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when id has unusual characters", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div id="#"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when id has whitespace", async () => {
			expect.assertions(2);
			const markup = `<div id="foo bar"></div>`;
			const report = await htmlvalidate.validateString(markup);
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

	it("should not report errors for dynamic attributes", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "valid-id": "error" },
		});
		const markup = /* HTML */ `<input dynamic-id="foo + bar" />`;
		const report = await htmlvalidate.validateString(markup, {
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
