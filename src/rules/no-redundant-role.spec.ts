import "../jest";
import { HtmlValidate } from "../htmlvalidate";
import { processAttribute } from "../transform/mocks/attribute";
import { type RuleContext } from "./no-redundant-role";

describe("rule no-redundant-role", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "no-redundant-role": "error" },
		});
	});

	it("should not report error when element has non-redundant role", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <li role="presentation"></li> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error element has no known roles", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <abbr role="main"></abbr> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when role is boolean", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <div role></div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error for dynamic attributes", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <input dynamic-role="main" /> `;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should not report error for <a> without href attribute", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <a role="link"></a> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when element has redundant role", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			rules: { "no-redundant-role": "error" },
		});
		const markup = /* HTML */ `
			<ul>
				<li role="listitem"></li>
			</ul>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Redundant role "listitem" on <li> (no-redundant-role) at inline:3:15:
			  1 |
			  2 | 			<ul>
			> 3 | 				<li role="listitem"></li>
			    | 				          ^^^^^^^^
			  4 | 			</ul>
			  5 |
			Selector: ul > li"
		`);
	});

	it("should report error for <a> with href attribute", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <a href role="link"></a> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Redundant role "link" on <a> (no-redundant-role) at inline:1:16:
			> 1 |  <a href role="link"></a>
			    |                ^^^^
			Selector: a"
		`);
	});

	it("should handle missing metadata", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <custom-element role="presentation"></custom-element> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			rules: { "no-redundant-role": "error" },
		});
		const context: RuleContext = {
			role: "checkbox",
			tagName: "input",
		};
		const docs = await htmlvalidate.getContextualDocumentation({
			ruleId: "no-redundant-role",
			context,
		});
		expect(docs).toMatchSnapshot();
	});
});
