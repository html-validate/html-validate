import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule no-dup-id", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "no-dup-id": "error" },
		});
	});

	it("should not report when no id is duplicated", () => {
		const report = htmlvalidate.validateString(
			'<p id="foo"></p><p id="bar"></p>'
		);
		expect(report).toBeValid();
	});

	it("should report when id is duplicated", () => {
		const report = htmlvalidate.validateString(
			'<p id="foo"></p><p id="foo"></p>'
		);
		expect(report).toBeInvalid();
		expect(report).toHaveError("no-dup-id", 'Duplicate ID "foo"');
	});

	it("smoketest", () => {
		const report = htmlvalidate.validateFile("test-files/rules/no-dup-id.html");
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect(htmlvalidate.getRuleDocumentation("no-dup-id")).toMatchSnapshot();
	});
});
