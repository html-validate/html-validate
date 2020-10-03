import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule no-deprecated-attr", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "no-deprecated-attr": "error" },
		});
	});

	it("should not report when regular element is used", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<body style="background: red;"></body>');
		expect(report).toBeValid();
	});

	it("should not report when regular element is missing meta", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<any style="background: red;"></any>');
		expect(report).toBeValid();
	});

	it("should not report when regular element has no deprecated attributes", () => {
		expect.assertions(1);
		/* use custom meta as html5 has global deprecations */
		const htmlvalidate = new HtmlValidate({
			elements: [{ abbr: {} }],
			rules: { "no-deprecated-attr": "error" },
		});
		const report = htmlvalidate.validateString('<abbr style="background: red;"></abbr>');
		expect(report).toBeValid();
	});

	it("should report error when deprecated attribute is used", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<body bgcolor="red"></body>');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"no-deprecated-attr",
			'Attribute "bgcolor" is deprecated on <body> element'
		);
	});

	it("should report error when deprecated attribute is used in any case", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<body BGCOLOR="red"></body>');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"no-deprecated-attr",
			'Attribute "BGCOLOR" is deprecated on <body> element'
		);
	});

	it("smoketest", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateFile("test-files/rules/no-deprecated-attr.html");
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(htmlvalidate.getRuleDocumentation("no-deprecated-attr")).toMatchSnapshot();
	});
});
