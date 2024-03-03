import { HtmlValidate } from "../htmlvalidate";
import { processAttribute } from "../transform/mocks/attribute";
import "../jest";

const htmlvalidate = new HtmlValidate({
	root: true,
	rules: { "no-abstract-role": "error" },
});

describe("rule no-abstract-role", () => {
	it("should not report error for other attributes", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<div foo="command"></div>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when role isn't abstract", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<div role="grid"></div>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when using multiple roles", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<div role="invalid something grid"></div>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error for dynamic attributes", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<div dynamic-role="widget"></div>`;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should report error when role is abstract", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `<div role="input"></div>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
				"error: Role "input" is abstract and must not be used (no-abstract-role) at inline:1:12:
				> 1 | <div role="input"></div>
				    |            ^^^^^
				Selector: div"
			`);
	});

	it("should report error for each abstract role", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `<div role="window none widget"></div>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Role "window" is abstract and must not be used (no-abstract-role) at inline:1:12:
			> 1 | <div role="window none widget"></div>
			    |            ^^^^^^
			Selector: div
			error: Role "widget" is abstract and must not be used (no-abstract-role) at inline:1:24:
			> 1 | <div role="window none widget"></div>
			    |                        ^^^^^^
			Selector: div"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(2);
		const docs = await htmlvalidate.getContextualDocumentation({
			ruleId: "no-abstract-role",
			context: { role: "landmark" },
		});
		expect(docs?.description).toMatchInlineSnapshot(`
			"Role \`"landmark"\` is abstract and must not be used.

			WAI-ARIA defines a list of [abstract roles](https://www.w3.org/TR/wai-aria-1.2/#abstract_roles) which cannot be used by authors:

			- \`"command"\`
			- \`"composite"\`
			- \`"input"\`
			- \`"landmark"\`
			- \`"range"\`
			- \`"roletype"\`
			- \`"section"\`
			- \`"sectionhead"\`
			- \`"select"\`
			- \`"structure"\`
			- \`"widget"\`
			- \`"window"\`

			Use one of the defined subclass roles for \`"landmark"\` instead."
		`);
		expect(docs?.url).toMatchInlineSnapshot(
			`"https://html-validate.org/rules/no-abstract-role.html"`,
		);
	});
});
