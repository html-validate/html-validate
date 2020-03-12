import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule element-permitted-occurrences", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "element-permitted-occurrences": "error" },
		});
	});

	it("should report error when child has too many occurrences", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString(
			"<table><caption>1</caption><caption>2</caption></table>"
		);
		expect(report).toBeInvalid();
		expect(report).toHaveErrors([
			[
				"element-permitted-occurrences",
				"Element <caption> can only appear once under <table>",
			],
		]);
	});

	it("should not report error when child has right number of occurrences", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString(
			"<table><caption></caption></table>"
		);
		expect(report).toBeValid();
	});

	it("should not report error when child has unrestricted number of occurrences", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString(
			"<div><p>1</p><p>2</p><p>3</p></div>"
		);
		expect(report).toBeValid();
	});

	it("smoketest", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateFile(
			"test-files/rules/element-permitted-occurrences.html"
		);
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(
			htmlvalidate.getRuleDocumentation("element-permitted-occurrences")
		).toMatchSnapshot();
	});
});
