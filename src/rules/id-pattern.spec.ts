import { Source } from "../context";
import { DynamicValue } from "../dom";
import HtmlValidate from "../htmlvalidate";
import "../matchers";

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

	it("should not report error when id is dynamic value", () => {
		const processAttribute = jest.fn(attr => {
			attr.value = new DynamicValue(attr.value);
		});
		const source: Source = {
			data: '<p id="{{ interpolated }}"></p>',
			filename: "inline",
			line: 1,
			column: 1,
			hooks: {
				processAttribute,
			},
		};
		const report = htmlvalidate.validateSource(source);
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
