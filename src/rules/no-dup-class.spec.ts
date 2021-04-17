import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule no-dup-class", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "no-dup-class": "error" },
		});
	});

	it("should not report when class is missing", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<p></p>");
		expect(report).toBeValid();
	});

	it("should not report when class has no duplicates", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<p class="foo bar"></p>');
		expect(report).toBeValid();
	});

	it("should not report for other attributes", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<p attr="foo bar foo"></p>');
		expect(report).toBeValid();
	});

	it("should report when when class has duplicates", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<p class="foo bar foo"></p>');
		expect(report).toBeInvalid();
		expect(report).toHaveError("no-dup-class", 'Class "foo" duplicated');
	});

	it("smoketest", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateFile("test-files/rules/no-dup-class.html");
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(htmlvalidate.getRuleDocumentation("no-dup-class")).toMatchSnapshot();
	});
});
