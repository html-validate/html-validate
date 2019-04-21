import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule no-raw-characters", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "no-raw-characters": "error" },
		});
	});

	describe("text content", () => {
		it("should not report error when text has no special characters", () => {
			const report = htmlvalidate.validateString("<p>lorem ipsum</p>");
			expect(report).toBeValid();
		});

		it("should not report error when text has htmlentities", () => {
			const report = htmlvalidate.validateString("<p>lorem &amp; ipsum</p>");
			expect(report).toBeValid();
		});

		it("should not report error when CDATA has raw special characters", () => {
			const report = htmlvalidate.validateString("<p><![CDATA[&]]></p>");
			expect(report).toBeValid();
		});

		it("should report error when raw special characters are present", () => {
			const report = htmlvalidate.validateString(`<p> < & > </p>`);
			expect(report).toBeInvalid();
			expect(report).toHaveErrors([
				["no-raw-characters", 'Raw "<" must be encoded as "&lt;"'],
				["no-raw-characters", 'Raw "&" must be encoded as "&amp;"'],
				["no-raw-characters", 'Raw ">" must be encoded as "&gt;"'],
			]);
		});

		it("should report error once when children has raw special characters", () => {
			const report = htmlvalidate.validateString("<p><i>&</i></p> ");
			expect(report).toBeInvalid();
			expect(report).toHaveErrors([
				["no-raw-characters", 'Raw "&" must be encoded as "&amp;"'],
			]);
		});
	});

	describe("unquoted attributes", () => {
		it("should not report error when attribute has no special characters", () => {
			const report = htmlvalidate.validateString("<p class=foo></p>");
			expect(report).toBeValid();
		});

		it("should not report error when attribute has htmlentities", () => {
			const report = htmlvalidate.validateString("<p class=foo&apos;s></p>");
			expect(report).toBeValid();
		});

		it("should not report error for boolean attributes", () => {
			const report = htmlvalidate.validateString("<input disabled>");
			expect(report).toBeValid();
		});

		it("should report error when raw special characters are present", () => {
			const report = htmlvalidate.validateString("<p class=foo's></p>");
			expect(report).toBeInvalid();
			expect(report).toHaveErrors([
				["no-raw-characters", `Raw "'" must be encoded as "&apos;"`],
			]);
		});
	});

	it("smoketest", () => {
		const report = htmlvalidate.validateFile(
			"test-files/rules/no-raw-characters.html"
		);
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		htmlvalidate = new HtmlValidate({
			rules: { "no-raw-characters": "error" },
		});
		expect(
			htmlvalidate.getRuleDocumentation("no-raw-characters")
		).toMatchSnapshot();
	});
});
