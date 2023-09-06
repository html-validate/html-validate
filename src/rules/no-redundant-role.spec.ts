import "../jest";
import { HtmlValidate } from "../htmlvalidate";
import { processAttribute } from "../transform/mocks/attribute";
import { RuleContext } from "./no-redundant-role";

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
		const markup = /* HTML */ ` <span role="main"></span> `;
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

	it("should report error when element has redundant role", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			rules: { "no-redundant-role": "error" },
		});
		const markup = /* HTML */ ` <li role="listitem"></li> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Redundant role "listitem" on <li> (no-redundant-role) at inline:1:12:
			> 1 |  <li role="listitem"></li>
			    |            ^^^^^^^^
			Selector: li"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			rules: { "no-redundant-role": "error" },
		});
		const context: RuleContext = {
			role: "checkbox",
			tagname: "input",
		};
		const docs = await htmlvalidate.getContextualDocumentation({
			ruleId: "no-redundant-role",
			context,
		});
		expect(docs).toMatchSnapshot();
	});
});
