import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule deprecated", () => {

	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { deprecated: "error" },
			elements: [
				"html5",
				{
					"custom-deprecated": {
						deprecated: "lorem ipsum",
					},
				},
			],
		});
	});

	it("should not report when regular element is used", () => {
		const report = htmlvalidate.validateString("<p></p>");
		expect(report).toBeValid();
	});

	it("should report error when deprecated element is used", () => {
		const report = htmlvalidate.validateString("<marquee>foobar</marquee>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("deprecated", "<marquee> is deprecated");
	});

	it("should report error when element with deprecation message is used", () => {
		const report = htmlvalidate.validateString("<custom-deprecated>foobar</custom-deprecated>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("deprecated", "<custom-deprecated> is deprecated: lorem ipsum");
	});

	it("smoketest", () => {
		const report = htmlvalidate.validateFile("test-files/rules/deprecated.html");
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect(htmlvalidate.getRuleDocumentation("deprecated")).toMatchSnapshot();
	});

});
