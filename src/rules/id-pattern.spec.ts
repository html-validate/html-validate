import HtmlValidate from "../htmlvalidate";
import "../matchers";
import { processAttribute } from "../transform/mocks/attribute";

describe("rule id-pattern", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "id-pattern": "error" },
		});
	});

	it("should not report error when id follows pattern", () => {
		const report = htmlvalidate.validateString('<p id="foo-bar"></p>');
		expect(report).toBeValid();
	});

	it("should not report error when id is interpolated", () => {
		const report = htmlvalidate.validateString(
			'<p id="{{ interpolated }}"></p>',
			null,
			{ processAttribute }
		);
		expect(report).toBeValid();
	});

	it("should report error when id does not follow pattern", () => {
		const report = htmlvalidate.validateString('<p id="fooBar"></p>');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"id-pattern",
			expect.stringMatching(/ID "fooBar" does not match required pattern ".*"/)
		);
	});

	it("should ignore other attributes", () => {
		const report = htmlvalidate.validateString('<p spam="fooBar"></p>');
		expect(report).toBeValid();
	});

	it("smoketest", () => {
		const report = htmlvalidate.validateFile(
			"test-files/rules/id-pattern.html"
		);
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect(htmlvalidate.getRuleDocumentation("id-pattern")).toMatchSnapshot();
	});
});
