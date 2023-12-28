import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { processAttribute } from "../transform/mocks/attribute";
import { types } from "./prefer-button";

describe("rule prefer-button", () => {
	describe("default config", () => {
		let htmlvalidate: HtmlValidate;

		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "prefer-button": "error" },
			});
		});

		it("should not report error when type attribute is missing type attribute", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString("<input>");
			expect(report).toBeValid();
		});

		it("should not report error when type attribute is missing value", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString("<input type>");
			expect(report).toBeValid();
		});

		it("should not report error for dynamic attributes", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString('<input dynamic-type="inputType">', {
				processAttribute,
			});
			expect(report).toBeValid();
		});

		it("should not report error when using regular input fields", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString('<input type="text">');
			expect(report).toBeValid();
		});

		it("should report error when using type button", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString('<input type="button">');
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"prefer-button",
				'Prefer to use <button> instead of <input type="button"> when adding buttons',
			);
		});

		it("should report error when using type submit", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString('<input type="submit">');
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"prefer-button",
				'Prefer to use <button> instead of <input type="submit"> when adding buttons',
			);
		});

		it("should report error when using type reset", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString('<input type="reset">');
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"prefer-button",
				'Prefer to use <button> instead of <input type="reset"> when adding buttons',
			);
		});

		it("should report error when using type image", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString('<input type="image">');
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"prefer-button",
				'Prefer to use <button> instead of <input type="image"> when adding buttons',
			);
		});

		it("should report error when using type submit in uppercase", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString('<INPUT TYPE="SUBMIT">');
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"prefer-button",
				'Prefer to use <button> instead of <input type="submit"> when adding buttons',
			);
		});

		it("should not report error when using submit keyword in other attributes", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString(
				'<input type="hidden" name="action" value="submit">',
			);
			expect(report).toBeValid();
		});

		it("smoketest", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateFile("test-files/rules/prefer-button.html");
			expect(report).toMatchInlineCodeframe(`
				"error: Prefer to use <button> instead of <input type="button"> when adding buttons (prefer-button) at test-files/rules/prefer-button.html:5:14:
				  3 | <input type="hidden">
				  4 |
				> 5 | <input type="button">
				    |              ^^^^^^
				  6 | <button type="button"></button>
				  7 |
				  8 | <input type="submit">
				Selector: input:nth-child(4)
				error: Prefer to use <button> instead of <input type="submit"> when adding buttons (prefer-button) at test-files/rules/prefer-button.html:8:14:
				   6 | <button type="button"></button>
				   7 |
				>  8 | <input type="submit">
				     |              ^^^^^^
				   9 | <button type="submit"></button>
				  10 |
				  11 | <input type="reset">
				Selector: input:nth-child(6)
				error: Prefer to use <button> instead of <input type="reset"> when adding buttons (prefer-button) at test-files/rules/prefer-button.html:11:14:
				   9 | <button type="submit"></button>
				  10 |
				> 11 | <input type="reset">
				     |              ^^^^^
				  12 | <button type="reset"></button>
				  13 |
				  14 | <input type="image">
				Selector: input:nth-child(8)
				error: Prefer to use <button> instead of <input type="image"> when adding buttons (prefer-button) at test-files/rules/prefer-button.html:14:14:
				  12 | <button type="reset"></button>
				  13 |
				> 14 | <input type="image">
				     |              ^^^^^
				  15 | <button type="submit"></button>
				  16 |
				Selector: input:nth-child(10)"
			`);
		});
	});

	it("should not report error when type is excluded", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "prefer-button": ["error", { exclude: ["submit"] }] },
		});
		const valid = await htmlvalidate.validateString('<input type="submit">');
		const invalid = await htmlvalidate.validateString('<input type="reset">');
		expect(valid).toBeValid();
		expect(invalid).toBeInvalid();
	});

	it("should report error only for included types", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "prefer-button": ["error", { include: ["submit"] }] },
		});
		const valid = await htmlvalidate.validateString('<input type="reset">');
		const invalid = await htmlvalidate.validateString('<input type="submit">');
		expect(valid).toBeValid();
		expect(invalid).toBeInvalid();
	});

	describe("should contain documentation", () => {
		it.each([...types, "unknown"])('for type "%s"', async (type) => {
			expect.assertions(1);
			const htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "prefer-button": "error" },
			});
			const docs = await htmlvalidate.getContextualDocumentation({
				ruleId: "prefer-button",
				context: { type },
			});
			expect(docs).toMatchSnapshot();
		});
	});
});
