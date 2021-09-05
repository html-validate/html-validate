import HtmlValidate from "../htmlvalidate";
import "../jest";

describe("rule unrecognized-char-ref", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "unrecognized-char-ref": "error" },
		});
	});

	describe("text content", () => {
		it("should not report error for valid character reference", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<p>&amp;</p>");
			expect(report).toBeValid();
		});

		it("should not report error for raw ampersand", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<p>&</p>");
			expect(report).toBeValid();
		});

		it("should report error when for invalid character reference", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString(`<p>&spam;</p>`);
			expect(report).toBeInvalid();
			expect(report).toHaveErrors([
				["unrecognized-char-ref", 'Unrecognized character reference "&spam;"'],
			]);
		});

		it("should handle nested elements", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<div><p>&amp;</p></div>");
			expect(report).toBeValid();
		});
	});

	describe("attribute", () => {
		it("should not report error for valid character reference", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<p id="&amp;&#123;"></p>');
			expect(report).toBeValid();
		});

		it("should not report error for raw ampersand", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<a href="?foo&bar"></p>');
			expect(report).toBeValid();
		});

		it("should report error when for invalid character reference", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<p id="&spam;"></p>');
			expect(report).toBeInvalid();
			expect(report).toHaveErrors([
				["unrecognized-char-ref", 'Unrecognized character reference "&spam;"'],
			]);
		});

		it("should handle boolean attributes", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<p id></p>");
			expect(report).toBeValid();
		});
	});

	it("should contain documentation", () => {
		expect.assertions(2);
		htmlvalidate = new HtmlValidate({
			rules: { "unrecognized-char-ref": "error" },
		});
		expect(htmlvalidate.getRuleDocumentation("unrecognized-char-ref")).toMatchSnapshot();
		expect(
			htmlvalidate.getRuleDocumentation("unrecognized-char-ref", null, "&spam;")
		).toMatchSnapshot();
	});
});
