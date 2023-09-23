import { HtmlElement } from "../dom";
import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { RuleContext } from "./attribute-misuse";

describe("rule attribute-misuse", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			elements: [
				{
					any: {
						void: true,
						attributes: {
							"need-other": {
								allowed(node: HtmlElement) {
									if (!node.hasAttribute("other")) {
										return "reason";
									}
								},
							},
						},
					},
				},
			],
			rules: { "attribute-misuse": ["error", { style: "lowercase" }] },
		});
	});

	it("should not report error when attribute is allowed", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <any need-other other /> `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when attributes is not allowed", () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <any need-other /> `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "need-other" attribute cannot be used in this context: reason (attribute-misuse) at inline:1:7:
			> 1 |  <any need-other />
			    |       ^^^^^^^^^^
			Selector: any"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "attribute-misuse": "error" },
		});
		const context: RuleContext = {
			attr: "foo",
			details: "lorem ipsum",
		};
		const docs = await htmlvalidate.getRuleDocumentation("attribute-misuse", null, context);
		expect(docs?.description).toMatchInlineSnapshot(
			`"The "foo" attribute cannot be used in this context: lorem ipsum"`
		);
	});
});
