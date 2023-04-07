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

		it("should not report error when type attribute is missing type attribute", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<input>");
			expect(report).toBeValid();
		});

		it("should not report error when type attribute is missing value", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<input type>");
			expect(report).toBeValid();
		});

		it("should not report error for dynamic attributes", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<input dynamic-type="inputType">', {
				processAttribute,
			});
			expect(report).toBeValid();
		});

		it("should not report error when using regular input fields", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<input type="text">');
			expect(report).toBeValid();
		});

		it("should report error when using type button", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<input type="button">');
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"prefer-button",
				'Prefer to use <button> instead of <input type="button"> when adding buttons'
			);
		});

		it("should report error when using type submit", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<input type="submit">');
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"prefer-button",
				'Prefer to use <button> instead of <input type="submit"> when adding buttons'
			);
		});

		it("should report error when using type reset", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<input type="reset">');
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"prefer-button",
				'Prefer to use <button> instead of <input type="reset"> when adding buttons'
			);
		});

		it("should report error when using type image", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<input type="image">');
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"prefer-button",
				'Prefer to use <button> instead of <input type="image"> when adding buttons'
			);
		});

		it("should report error when using type submit in uppercase", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<INPUT TYPE="SUBMIT">');
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"prefer-button",
				'Prefer to use <button> instead of <input type="submit"> when adding buttons'
			);
		});

		it("should not report error when using submit keyword in other attributes", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString(
				'<input type="hidden" name="action" value="submit">'
			);
			expect(report).toBeValid();
		});

		it("smoketest", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateFile("test-files/rules/prefer-button.html");
			expect(report.results).toMatchSnapshot();
		});
	});

	it("should not report error when type is excluded", () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "prefer-button": ["error", { exclude: ["submit"] }] },
		});
		const valid = htmlvalidate.validateString('<input type="submit">');
		const invalid = htmlvalidate.validateString('<input type="reset">');
		expect(valid).toBeValid();
		expect(invalid).toBeInvalid();
	});

	it("should report error only for included types", () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "prefer-button": ["error", { include: ["submit"] }] },
		});
		const valid = htmlvalidate.validateString('<input type="reset">');
		const invalid = htmlvalidate.validateString('<input type="submit">');
		expect(valid).toBeValid();
		expect(invalid).toBeInvalid();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "prefer-button": "error" },
		});
		expect(htmlvalidate.getRuleDocumentation("prefer-button")).toMatchSnapshot();
	});

	describe("should contain contextual documentation", () => {
		it.each([...types, "unknown"])('for type "%s"', (type) => {
			expect.assertions(1);
			const htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "prefer-button": "error" },
			});
			expect(htmlvalidate.getRuleDocumentation("prefer-button", null, { type })).toMatchSnapshot();
		});
	});
});
