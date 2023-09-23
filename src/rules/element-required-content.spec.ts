import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule element-required-content", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "element-required-content": "error" },
			elements: [
				"html5",
				{
					"with-category": {
						requiredContent: ["@heading"],
					},
					"with-tagname": {
						requiredContent: ["p"],
					},
				},
			],
		});
	});

	it("should not report error when element has all required content", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString(
			"<html><head><title></title></head><body></body></html>"
		);
		expect(report).toBeValid();
	});

	it("should handle unknown elements", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<missing-meta></missing-meta>");
		expect(report).toBeValid();
	});

	it("should report error when element is missing required content", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<html><body></body></html>");
		expect(report).toBeInvalid();
		expect(report).toHaveErrors([
			["element-required-content", "<html> element must have <head> as content"],
		]);
	});

	it("should report all errors when element is missing multiple content", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<html></html>");
		expect(report).toBeInvalid();
		expect(report).toHaveErrors([
			["element-required-content", "<html> element must have <head> as content"],
			["element-required-content", "<html> element must have <body> as content"],
		]);
	});

	it("should format both tagnames and categories correct", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<with-tagname></with-tagname>
			<with-category></with-category>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toMatchInlineCodeframe(`
			"error: <with-tagname> element must have <p> as content (element-required-content) at inline:2:5:
			  1 |
			> 2 | 			<with-tagname></with-tagname>
			    | 			 ^^^^^^^^^^^^
			  3 | 			<with-category></with-category>
			  4 |
			Selector: with-tagname
			error: <with-category> element must have heading element as content (element-required-content) at inline:3:5:
			  1 |
			  2 | 			<with-tagname></with-tagname>
			> 3 | 			<with-category></with-category>
			    | 			 ^^^^^^^^^^^^^
			  4 |
			Selector: with-category"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "element-required-content": "error" },
		});
		const docs = await htmlvalidate.getRuleDocumentation("element-required-content", null, {
			element: "<my-element>",
			missing: "<my-other-element>",
		});
		expect(docs).toMatchSnapshot();
	});
});
