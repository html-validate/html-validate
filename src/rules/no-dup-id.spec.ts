import { HtmlValidate } from "../htmlvalidate";
import { processAttribute } from "../transform/mocks/attribute";
import "../jest";

describe("rule no-dup-id", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "no-dup-id": "error" },
		});
	});

	it("should not report when no id is duplicated", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<p id="foo"></p><p id="bar"></p>');
		expect(report).toBeValid();
	});

	it("should not report when id is missing value", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<hr id><hr id>");
		expect(report).toBeValid();
	});

	it("should not report error for interpolated attributes", () => {
		expect.assertions(1);
		const markup = '<p id="{{ interpolated }}"></p><p id="{{ interpolated }}"></p>';
		const report = htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should not report error for dynamic attributes", () => {
		expect.assertions(1);
		const markup = '<p dynamic-id="myVariable"></p><p dynamic-id="myVariable"></p>';
		const report = htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should report when id is duplicated", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<p id="foo"></p><p id="foo"></p>');
		expect(report).toBeInvalid();
		expect(report).toHaveError("no-dup-id", 'Duplicate ID "foo"');
	});

	it("smoketest", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateFile("test-files/rules/no-dup-id.html");
		expect(report).toMatchInlineCodeframe(`
			"error: Duplicate ID "foo" (no-dup-id) at test-files/rules/no-dup-id.html:3:10:
			  1 | <div id="foo"></div>
			  2 | <div id="bar"></div>
			> 3 | <div id="foo"></div>
			    |          ^^^
			  4 |
			Selector: div:nth-child(3)"
		`);
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(htmlvalidate.getRuleDocumentation("no-dup-id")).toMatchSnapshot();
	});
});
