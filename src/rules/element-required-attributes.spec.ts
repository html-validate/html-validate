import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule element-required-attributes", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "element-required-attributes": "error" },
			elements: [
				"html5",
				{
					"missing-attr-meta": {
						attributes: undefined,
					},
				},
			],
		});
	});

	it("should report error when required attribute is missing", async () => {
		expect.assertions(2);
		const report = await htmlvalidate.validateString("<input>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"element-required-attributes",
			'<input> is missing required "type" attribute',
		);
	});

	it("should not report error when element has required attribute attribute", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<input type="text">');
		expect(report).toBeValid();
	});

	it("should not report error when element has empty attribute", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<input type="">');
		expect(report).toBeValid();
	});

	it("should not report error when element is missing meta", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<foo-bar type="text">');
		expect(report).toBeValid();
	});

	it("should not report error when element is missing meta attributes", async () => {
		expect.assertions(1);
		const markup = '<missing-attr-meta type="text"></missing-attr-meta>';
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile(
			"test-files/rules/element-required-attributes.html",
		);
		expect(report).toMatchInlineCodeframe(`
			"error: <input> is missing required "type" attribute (element-required-attributes) at test-files/rules/element-required-attributes.html:1:2:
			> 1 | <input>
			    |  ^^^^^
			  2 | <input type>
			  3 | <input type="">
			  4 | <input type="text">
			Selector: input:nth-child(1)"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("element-required-attributes");
		expect(docs).toMatchSnapshot();
	});

	it("should contain contextual documentation", async () => {
		expect.assertions(1);
		const context = {
			element: "any",
			attribute: "foo",
		};
		const docs = await htmlvalidate.getRuleDocumentation(
			"element-required-attributes",
			null,
			context,
		);
		expect(docs).toMatchSnapshot();
	});
});
