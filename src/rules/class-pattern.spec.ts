import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule class-pattern", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "class-pattern": "error" },
		});
	});

	it("should not report error when class follows pattern", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<p class="foo-bar"></p>');
		expect(report).toBeValid();
	});

	it("should report error when class does not follow pattern", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<p class="foo-bar fooBar spam"></p>');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"class-pattern",
			expect.stringMatching(/Class "fooBar" does not match required pattern ".*"/)
		);
	});

	it("should ignore other attributes", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<p spam="fooBar"></p>');
		expect(report).toBeValid();
	});

	it("smoketest", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateFile("test-files/rules/class-pattern.html");
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(htmlvalidate.getRuleDocumentation("class-pattern")).toMatchSnapshot();
	});
});
