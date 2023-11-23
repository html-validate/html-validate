import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { type RuleContext } from "./element-required-ancestor";

describe("rule element-required-ancestor", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "element-required-ancestor": "error" },
		});
	});

	it("should report error for missing required ancestor (tagname)", () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			elements: [
				"html5",
				{
					"custom-element": {
						flow: true,
						requiredAncestors: ["main"],
					},
				},
			],
			rules: { "element-required-ancestor": "error" },
		});
		const markup = /* HTML */ `
			<div>
				<custom-element></custom-element>
			</div>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <custom-element> element requires a <main> ancestor (element-required-ancestor) at inline:3:6:
			  1 |
			  2 | 			<div>
			> 3 | 				<custom-element></custom-element>
			    | 				 ^^^^^^^^^^^^^^
			  4 | 			</div>
			  5 |
			Selector: div > custom-element"
		`);
	});

	it("should report error for missing required ancestor (selector)", () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			elements: [
				"html5",
				{
					"custom-element": {
						flow: true,
						requiredAncestors: ["main > div"],
					},
				},
			],
			rules: { "element-required-ancestor": "error" },
		});
		const markup = /* HTML */ `
			<div>
				<custom-element></custom-element>
			</div>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <custom-element> element requires a "main > div" ancestor (element-required-ancestor) at inline:3:6:
			  1 |
			  2 | 			<div>
			> 3 | 				<custom-element></custom-element>
			    | 				 ^^^^^^^^^^^^^^
			  4 | 			</div>
			  5 |
			Selector: div > custom-element"
		`);
	});

	it("should join multiple selectors together", () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			elements: [
				"html5",
				{
					"custom-element": {
						flow: true,
						requiredAncestors: ["main", "main > div"],
					},
				},
			],
			rules: { "element-required-ancestor": "error" },
		});
		const markup = /* HTML */ `
			<div>
				<custom-element></custom-element>
			</div>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <custom-element> element requires a <main> or "main > div" ancestor (element-required-ancestor) at inline:3:6:
			  1 |
			  2 | 			<div>
			> 3 | 				<custom-element></custom-element>
			    | 				 ^^^^^^^^^^^^^^
			  4 | 			</div>
			  5 |
			Selector: div > custom-element"
		`);
	});

	it("should not report error for proper required ancestor", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<dl>
				<div><dt>foo</dt></div>
			</dl>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const context: RuleContext = {
			child: "<li>",
			ancestor: ["<ul>", "<ol>", "<menu>"],
		};
		const docs = await htmlvalidate.getRuleDocumentation(
			"element-required-ancestor",
			null,
			context,
		);
		expect(docs).toMatchSnapshot();
	});
});
