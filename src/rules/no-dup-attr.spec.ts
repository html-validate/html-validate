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

	it("should not report when no attribute is duplicated", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p foo="bar"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when attribute is dynamic", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <input class="foo" dynamic-class="bar" /> `;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should report when attribute is duplicated", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <p foo="bar" foo="baz"></p></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError("no-dup-attr", 'Attribute "foo" duplicated');
	});

	it("should report when attribute is duplicated case insensitive", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <p foo="bar" FOO="baz"></p></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError("no-dup-attr", 'Attribute "foo" duplicated');
	});

	it("should report error when dynamic element is used multiple times", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <input dynamic-class="foo" dynamic-class="bar" /> `;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeInvalid();
		expect(report).toHaveError("no-dup-attr", 'Attribute "dynamic-class" duplicated');
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile("test-files/rules/no-dup-attr.html");
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

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("no-dup-attr");
		expect(docs).toMatchSnapshot();
	});
});
