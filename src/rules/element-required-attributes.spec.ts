import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { type MetaDataTable } from "../meta";
import { type RuleContext } from "./element-required-attributes";

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

	it("should handle required property callback", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "element-required-attributes": "error" },
			elements: [
				{
					foo: {
						attributes: {
							a: {
								required(node) {
									return !node.hasAttribute("condition");
								},
							},
							b: {
								required(node) {
									if (node.hasAttribute("condition")) {
										return false;
									}
									return '{{ tagName }} requires either "b" or "condition" attribute';
								},
							},
							true: {
								required() {
									return true;
								},
							},
							undefined: {
								required() {
									return undefined;
								},
							},
							null: {
								required() {
									return null;
								},
							},
							false: {
								required() {
									return false;
								},
							},
							empty: {
								required() {
									return "";
								},
							},
							condition: {},
						},
					},
				} satisfies MetaDataTable,
			],
		});
		const markup = /* HTML */ `
			<!-- should yield error -->
			<foo></foo>

			<!-- should not yield error -->
			<foo a b true></foo>
			<foo true condition></foo>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <foo> is missing required "a" attribute (element-required-attributes) at inline:3:5:
			  1 |
			  2 | 			<!-- should yield error -->
			> 3 | 			<foo></foo>
			    | 			 ^^^
			  4 |
			  5 | 			<!-- should not yield error -->
			  6 | 			<foo a b true></foo>
			Selector: foo:nth-child(1)
			error: <foo> requires either "b" or "condition" attribute (element-required-attributes) at inline:3:5:
			  1 |
			  2 | 			<!-- should yield error -->
			> 3 | 			<foo></foo>
			    | 			 ^^^
			  4 |
			  5 | 			<!-- should not yield error -->
			  6 | 			<foo a b true></foo>
			Selector: foo:nth-child(1)
			error: <foo> is missing required "true" attribute (element-required-attributes) at inline:3:5:
			  1 |
			  2 | 			<!-- should yield error -->
			> 3 | 			<foo></foo>
			    | 			 ^^^
			  4 |
			  5 | 			<!-- should not yield error -->
			  6 | 			<foo a b true></foo>
			Selector: foo:nth-child(1)"
		`);
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
		const context: RuleContext = {
			tagName: "<any>",
			attr: "foo",
		};
		const docs = await htmlvalidate.getContextualDocumentation({
			ruleId: "element-required-attributes",
			context,
		});
		expect(docs).toMatchSnapshot();
	});
});
