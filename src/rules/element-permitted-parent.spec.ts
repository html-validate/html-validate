import HtmlValidate from "../htmlvalidate";
import "../jest";
import { type RuleContext } from "./element-permitted-parent";

describe("rule element-permitted-parent", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "element-permitted-parent": "error" },
		});
	});

	it("should not report error when elements are used correctly", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<head>
				<base />
			</head>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error for root element", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <base /> `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when nesting itself", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<body>
				<body></body>
			</body>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when parent is not permitted", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div>
				<base />
			</div>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toMatchInlineCodeframe(`
			"error: <div> element is not permitted as parent of <base> (element-permitted-parent) at inline:2:5:
			  1 |
			> 2 | 			<div>
			    | 			 ^^^
			  3 | 				<base />
			  4 | 			</div>
			  5 |
			Selector: div"
		`);
	});

	it("should report error when parent is not permitted (referenced by tagname without meta)", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			elements: [
				"html5",
				{
					"custom-element": {
						permittedParent: [{ exclude: "custom-parent" }],
					},
				},
			],
			rules: { "element-permitted-parent": "error" },
		});
		const markup = /* HTML */ `
			<custom-parent>
				<custom-element></custom-element>
			</custom-parent>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toMatchInlineCodeframe(`
			"error: <custom-parent> element is not permitted as parent of <custom-element> (element-permitted-parent) at inline:2:5:
			  1 |
			> 2 | 			<custom-parent>
			    | 			 ^^^^^^^^^^^^^
			  3 | 				<custom-element></custom-element>
			  4 | 			</custom-parent>
			  5 |
			Selector: custom-parent"
		`);
	});

	it("should handle missing meta entry (child)", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p><foo>foo</foo></p> `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should handle missing meta entry (parent)", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <foo><p>foo</p></foo> `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(htmlvalidate.getRuleDocumentation("element-permitted-parent")).toMatchSnapshot();
	});

	it("should contain contextual documentation", () => {
		expect.assertions(1);
		const context: RuleContext = {
			child: "<div>",
			parent: "<span>",
		};
		const doc = htmlvalidate.getRuleDocumentation("element-permitted-parent", null, context);
		expect(doc).toMatchSnapshot();
	});
});
