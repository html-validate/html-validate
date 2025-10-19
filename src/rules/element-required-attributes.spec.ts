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
		const markup = /* HTML */ ` <img /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <img> is missing required "src" attribute (element-required-attributes) at inline:1:3:
			> 1 |  <img />
			    |   ^^^
			Selector: img"
		`);
	});

	it("should not report error when element has required attribute attribute", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <img src="cat.gif" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when element has empty attribute", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <img src="" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when element is missing meta", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <foo-bar type="text"> </foo-bar> `;
		const report = await htmlvalidate.validateString(markup);
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
			"error: <img> is missing required "src" attribute (element-required-attributes) at test-files/rules/element-required-attributes.html:1:2:
			> 1 | <img>
			    |  ^^^
			  2 | <img src>
			  3 | <img src="">
			  4 | <img src="cat.gif">
			Selector: img:nth-child(1)"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const context = {
			element: "any",
			attribute: "foo",
		};
		/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
		const docs = await htmlvalidate.getRuleDocumentation(
			"element-required-attributes",
			null,
			context,
		);
		expect(docs).toMatchSnapshot();
	});
});
