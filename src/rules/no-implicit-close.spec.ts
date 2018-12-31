import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule no-implicit-close", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: {"no-implicit-close": "error"},
		});
	});

	it("should not report when element is explicitly closed", () => {
		const report = htmlvalidate.validateString("<li></li>");
		expect(report).toBeValid();
	});

	it("should report error when element is implicitly closed by parent", () => {
		const report = htmlvalidate.validateString("<ul><li>foo</ul>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("no-implicit-close", "Element <li> is implicitly closed by parent </ul>");
	});

	it("should report error when element is implicitly closed by sibling", () => {
		const report = htmlvalidate.validateString("<li>foo<li>bar");
		expect(report).toBeInvalid();
		expect(report).toHaveError("no-implicit-close", "Element <li> is implicitly closed by sibling");
	});

	it("should report error when element is implicitly closed by adjacent block element", () => {
		const report = htmlvalidate.validateString("<p>foo<div>bar");
		expect(report).toBeInvalid();
		expect(report).toHaveError("no-implicit-close", "Element <p> is implicitly closed by adjacent <div>");
	});

	it("smoketest", () => {
		const report = htmlvalidate.validateFile("test-files/rules/no-implicit-close.html");
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect(htmlvalidate.getRuleDocumentation("no-implicit-close")).toMatchSnapshot();
	});

});
