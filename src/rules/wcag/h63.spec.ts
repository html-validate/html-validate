import HtmlValidate from "../../htmlvalidate";
import "../../jest";

describe("wcag/h63", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "wcag/h63": "error" },
		});
	});

	it("should not report when th has scope attribute", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<th scope="col"></th>');
		expect(report).toBeValid();
	});

	it("should report error when th does not have scope", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<th></th>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"wcag/h63",
			"<th> element must have a valid scope attribute: row, col, rowgroup, colgroup"
		);
	});

	it("should report error when th has empty scope", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<th scope=""></th>');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"wcag/h63",
			"<th> element must have a valid scope attribute: row, col, rowgroup, colgroup"
		);
	});

	it("should report error when auto is used as keyword for th scope", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<th scope="auto"></th>');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"wcag/h63",
			"<th> element must have a valid scope attribute: row, col, rowgroup, colgroup"
		);
	});

	it("should report error when th has invalid scope", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<th scope="foobar"></th>');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"wcag/h63",
			"<th> element must have a valid scope attribute: row, col, rowgroup, colgroup"
		);
	});

	it("smoketest", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateFile("test-files/rules/wcag/h63.html");
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "wcag/h63": "error" },
		});
		expect(htmlvalidate.getRuleDocumentation("wcag/h63")).toMatchSnapshot();
	});
});
