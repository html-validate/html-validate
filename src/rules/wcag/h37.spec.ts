import HtmlValidate from "../../htmlvalidate";
import "../../matchers";

describe("rule h37", () => {
	let htmlvalidate: HtmlValidate;

	describe("with default options", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "wcag/h37": "error" },
			});
		});

		it("should not report when img has alt attribute", () => {
			const report = htmlvalidate.validateString('<img alt="foobar">');
			expect(report).toBeValid();
		});

		it("should not report when img has empty alt attribute", () => {
			const report = htmlvalidate.validateString('<img alt="">');
			expect(report).toBeValid();
		});

		it("should not report when img is hidden from accessibility tree", () => {
			const report = htmlvalidate.validateString(
				'<img aria-hidden="true"><img role="presentation">'
			);
			expect(report).toBeValid();
		});

		it("should report error when img is missing alt attribute", () => {
			const report = htmlvalidate.validateString("<img>");
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"WCAG/H37",
				"<img> is missing required alt attribute"
			);
		});

		it("smoketest", () => {
			const report = htmlvalidate.validateFile(
				"test-files/rules/wcag/h37.html"
			);
			expect(report.results).toMatchSnapshot();
		});
	});

	describe("with allowEmpty false", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "wcag/h37": ["error", { allowEmpty: false }] },
			});
		});

		it("should not report when img has alt attribute", () => {
			const report = htmlvalidate.validateString('<img alt="foobar">');
			expect(report).toBeValid();
		});

		it("should report when img has empty alt attribute", () => {
			const report = htmlvalidate.validateString('<img alt="">');
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"WCAG/H37",
				"<img> is missing required alt attribute"
			);
		});

		it("should report error when img is missing alt attribute", () => {
			const report = htmlvalidate.validateString("<img>");
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"WCAG/H37",
				"<img> is missing required alt attribute"
			);
		});

		it("smoketest", () => {
			const report = htmlvalidate.validateFile(
				"test-files/rules/wcag/h37.html"
			);
			expect(report.results).toMatchSnapshot();
		});
	});

	describe("with alias", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "wcag/h37": ["error", { alias: "translate-attr" }] },
			});
		});

		it("should not report when img has alias attribute set", () => {
			const report = htmlvalidate.validateString('<img translate-attr="...">');
			expect(report).toBeValid();
		});

		it("should report error when img is missing both alt and aliases", () => {
			const report = htmlvalidate.validateString("<img>");
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"WCAG/H37",
				"<img> is missing required alt attribute"
			);
		});

		it("smoketest", () => {
			const report = htmlvalidate.validateFile(
				"test-files/rules/wcag/h37.html"
			);
			expect(report.results).toMatchSnapshot();
		});
	});

	describe("with alias (array)", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "wcag/h37": ["error", { alias: ["translate-attr"] }] },
			});
		});

		it("should not report when img has alias attribute set", () => {
			const report = htmlvalidate.validateString('<img translate-attr="...">');
			expect(report).toBeValid();
		});

		it("smoketest", () => {
			const report = htmlvalidate.validateFile(
				"test-files/rules/wcag/h37.html"
			);
			expect(report.results).toMatchSnapshot();
		});
	});

	it("should contain documentation", () => {
		htmlvalidate = new HtmlValidate({
			rules: { "wcag/h37": "error" },
		});
		expect(htmlvalidate.getRuleDocumentation("wcag/h37")).toMatchSnapshot();
	});
});
