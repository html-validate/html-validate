import HtmlValidate from "../htmlvalidate";
import "../matchers";
import { processAttribute } from "../transform/mocks/attribute";

describe("rule no-inline-style", () => {
	let htmlvalidate: HtmlValidate;

	describe("default configuration", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "no-inline-style": "error" },
			});
		});

		it("should report when style attribute is used", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<p style=""></p>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-inline-style", "Inline style is not allowed");
		});

		it("should report when dynamic style attribute is used", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<p dynamic-style=""></p>', {
				processAttribute,
			});
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-inline-style", "Inline style is not allowed");
		});
	});

	describe("configured with include", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "no-inline-style": ["error", { include: ["style"] }] },
			});
		});

		it("should report when style attribute is used", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<p style=""></p>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-inline-style", "Inline style is not allowed");
		});

		it("should not report when dynamic style attribute is used", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<p dynamic-style=""></p>', {
				processAttribute,
			});
			expect(report).toBeValid();
		});
	});

	describe("configured with exclude", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "no-inline-style": ["error", { exclude: ["style"] }] },
			});
		});

		it("should not report when style attribute is used", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<p style=""></p>');
			expect(report).toBeValid();
		});

		it("should report when dynamic style attribute is used", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<p dynamic-style=""></p>', {
				processAttribute,
			});
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-inline-style", "Inline style is not allowed");
		});
	});

	it("smoketest", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "no-inline-style": "error" },
		});
		const report = htmlvalidate.validateFile("test-files/rules/no-inline-style.html");
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "no-inline-style": "error" },
		});
		expect(htmlvalidate.getRuleDocumentation("no-inline-style")).toMatchSnapshot();
	});
});
