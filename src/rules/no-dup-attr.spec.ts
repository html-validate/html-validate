import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { processAttribute } from "../transform/mocks/attribute";

describe("rule no-dup-attr", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "no-dup-attr": "error" },
		});
	});

	it("should not report when no attribute is duplicated", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<p foo="bar"></p>');
		expect(report).toBeValid();
	});

	it("should not report error when attribute is dynamic", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<input class="foo" dynamic-class="bar">', {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should report when attribute is duplicated", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<p foo="bar" foo="baz"></p></p>');
		expect(report).toBeInvalid();
		expect(report).toHaveError("no-dup-attr", 'Attribute "foo" duplicated');
	});

	it("should report when attribute is duplicated case insensitive", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<p foo="bar" FOO="baz"></p></p>');
		expect(report).toBeInvalid();
		expect(report).toHaveError("no-dup-attr", 'Attribute "foo" duplicated');
	});

	it("should report error when dynamic element is used multiple times", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<input dynamic-class="foo" dynamic-class="bar">', {
			processAttribute,
		});
		expect(report).toBeInvalid();
		expect(report).toHaveError("no-dup-attr", 'Attribute "dynamic-class" duplicated');
	});

	it("smoketest", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateFile("test-files/rules/no-dup-attr.html");
		expect(report).toMatchInlineCodeframe(`
			"error: Attribute "id" duplicated (no-dup-attr) at test-files/rules/no-dup-attr.html:2:26:
			  1 | <div>
			> 2 | 	<p id="foo" class="bar" id="baz"></p>
			    | 	                        ^^
			  3 | </div>
			  4 |
			Selector: #foo"
		`);
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(htmlvalidate.getRuleDocumentation("no-dup-attr")).toMatchSnapshot();
	});
});
