import HtmlValidate from "../../htmlvalidate";
import "../../jest";

describe("rule h37", () => {
	let htmlvalidate: HtmlValidate;

	describe("with default options", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "wcag/h37": "error" },
			});
		});

		it("should not report when img has alt attribute", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<img alt="foobar">');
			expect(report).toBeValid();
		});

		it("should not report when img has empty alt attribute", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<img alt="">');
			expect(report).toBeValid();
		});

		it("should not report when img is hidden from accessibility tree", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString(
				'<img aria-hidden="true"><img role="presentation">'
			);
			expect(report).toBeValid();
		});

		it("should report error when img is missing alt attribute", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString("<img>");
			expect(report).toBeInvalid();
			expect(report).toHaveError("wcag/h37", '<img> is missing required "alt" attribute');
		});

		it("smoketest", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateFile("test-files/rules/wcag/h37.html");
			expect(report.results).toMatchSnapshot();
		});
	});

	describe("with allowEmpty false", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "wcag/h37": ["error", { allowEmpty: false }] },
			});
		});

		it("should not report when img has alt attribute", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<img alt="foobar">');
			expect(report).toBeValid();
		});

		it("should report when img has empty alt attribute", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<img alt="">');
			expect(report).toBeInvalid();
			expect(report).toHaveError("wcag/h37", '<img> is missing required "alt" attribute');
		});

		it("should report error when img is missing alt attribute", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString("<img>");
			expect(report).toBeInvalid();
			expect(report).toHaveError("wcag/h37", '<img> is missing required "alt" attribute');
		});

		it("smoketest", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateFile("test-files/rules/wcag/h37.html");
			expect(report.results).toMatchSnapshot();
		});
	});

	describe("with alias", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "wcag/h37": ["error", { alias: "translate-attr" }] },
			});
		});

		it("should not report when img has alias attribute set", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<img translate-attr="...">');
			expect(report).toBeValid();
		});

		it("should report error when img is missing both alt and aliases", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString("<img>");
			expect(report).toBeInvalid();
			expect(report).toHaveError("wcag/h37", '<img> is missing required "alt" attribute');
		});

		it("smoketest", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateFile("test-files/rules/wcag/h37.html");
			expect(report.results).toMatchSnapshot();
		});
	});

	describe("with alias (array)", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "wcag/h37": ["error", { alias: ["translate-attr"] }] },
			});
		});

		it("should not report when img has alias attribute set", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<img translate-attr="...">');
			expect(report).toBeValid();
		});

		it("smoketest", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateFile("test-files/rules/wcag/h37.html");
			expect(report.results).toMatchSnapshot();
		});
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "wcag/h37": "error" },
		});
		expect(htmlvalidate.getRuleDocumentation("wcag/h37")).toMatchSnapshot();
	});
});
