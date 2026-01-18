import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { processAttribute } from "../transform/mocks/attribute";

describe("rule valid-for", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "valid-for": "error" },
		});
	});

	it("should not report when <label> references a labelable form control", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<input type="text" id="foo" />
			<label for="foo">Label</label>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when <label> references various form controls", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<input type="text" id="foo" />
			<label for="foo"></label>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when <label> has no for attribute", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<label>
				<input type="text" />
			</label>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when for attribute has omitted value", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <label for></label> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when for attribute has empty value", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <label for=""></label> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when for attribute is dynamic", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <label dynamic-for="id"></label> `;
		const report = await htmlvalidate.validateString(markup, { processAttribute });
		expect(report).toBeValid();
	});

	it("should not report when referenced element is missing (handled by no-missing-references)", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <label for="missing"></label> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error for element without metadata", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<custom-element id="custom"></custom-element>
			<label for="custom">Label</label>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	describe("custom elements", () => {
		describe("should not report error", () => {
			it("when labelable is true", async () => {
				expect.assertions(1);
				const htmlvalidate = new HtmlValidate({
					elements: [
						{
							"custom-element": {
								labelable: true,
							},
						},
					],
					rules: { "valid-for": "error" },
				});
				const markup = /* HTML */ `
					<custom-element id="custom"></custom-element>
					<label for="custom">Label</label>
				`;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeValid();
			});

			it("when labelable callback returns true", async () => {
				expect.assertions(1);
				const htmlvalidate = new HtmlValidate({
					elements: [
						{
							"custom-element": {
								labelable() {
									return true;
								},
							},
						},
					],
					rules: { "valid-for": "error" },
				});
				const markup = /* HTML */ `
					<custom-element id="custom"></custom-element>
					<label for="custom">Label</label>
				`;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeValid();
			});
		});

		describe("should report error", () => {
			it("when labelable property is not set", async () => {
				expect.assertions(2);
				const htmlvalidate = new HtmlValidate({
					elements: [
						{
							"custom-element": {},
						},
					],
					rules: { "valid-for": "error" },
				});
				const markup = /* HTML */ `
					<custom-element id="custom"></custom-element>
					<label for="custom">Label</label>
				`;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeInvalid();
				expect(report).toMatchInlineCodeframe(`
					"error: <label> "for" attribute must reference a labelable form control (valid-for) at inline:3:18:
					  1 |
					  2 | 					<custom-element id="custom"></custom-element>
					> 3 | 					<label for="custom">Label</label>
					    | 					            ^^^^^^
					  4 |
					Selector: label"
				`);
			});

			it("when labelable is false", async () => {
				expect.assertions(2);
				const htmlvalidate = new HtmlValidate({
					elements: [
						{
							"custom-element": {
								labelable: false,
							},
						},
					],
					rules: { "valid-for": "error" },
				});
				const markup = /* HTML */ `
					<custom-element id="custom"></custom-element>
					<label for="custom">Label</label>
				`;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeInvalid();
				expect(report).toMatchInlineCodeframe(`
					"error: <label> "for" attribute must reference a labelable form control (valid-for) at inline:3:18:
					  1 |
					  2 | 					<custom-element id="custom"></custom-element>
					> 3 | 					<label for="custom">Label</label>
					    | 					            ^^^^^^
					  4 |
					Selector: label"
				`);
			});

			it("when labelable callback returns false", async () => {
				expect.assertions(2);
				const htmlvalidate = new HtmlValidate({
					elements: [
						{
							"custom-element": {
								labelable() {
									return false;
								},
							},
						},
					],
					rules: { "valid-for": "error" },
				});
				const markup = /* HTML */ `
					<custom-element id="custom"></custom-element>
					<label for="custom">Label</label>
				`;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeInvalid();
				expect(report).toMatchInlineCodeframe(`
					"error: <label> "for" attribute must reference a labelable form control (valid-for) at inline:3:18:
					  1 |
					  2 | 					<custom-element id="custom"></custom-element>
					> 3 | 					<label for="custom">Label</label>
					    | 					            ^^^^^^
					  4 |
					Selector: label"
				`);
			});
		});
	});

	it("should report error when label references itself", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <label for="self" id="self">Label</label> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <label> "for" attribute must reference a labelable form control (valid-for) at inline:1:14:
			> 1 |  <label for="self" id="self">Label</label>
			    |              ^^^^
			Selector: #self"
		`);
	});

	it("should report error when label references a non-form element", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<p id="paragraph">Text</p>
			<label for="paragraph">Label</label>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <label> "for" attribute must reference a labelable form control (valid-for) at inline:3:16:
			  1 |
			  2 | 			<p id="paragraph">Text</p>
			> 3 | 			<label for="paragraph">Label</label>
			    | 			            ^^^^^^^^^
			  4 |
			Selector: label"
		`);
	});

	it("should report error when label references a hidden input", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<input type="hidden" id="hidden-field" />
			<label for="hidden-field">Label</label>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <label> "for" attribute must reference a labelable form control (valid-for) at inline:3:16:
			  1 |
			  2 | 			<input type="hidden" id="hidden-field" />
			> 3 | 			<label for="hidden-field">Label</label>
			    | 			            ^^^^^^^^^^^^
			  4 |
			Selector: label"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const context = { id: "foo", tagName: "div" };
		const docs = await htmlvalidate.getContextualDocumentation({
			ruleId: "valid-for",
			context,
		});
		expect(docs).toMatchInlineSnapshot(`
			{
			  "description": "The \`<label>\` \`for\` attribute must reference a labelable form control.",
			  "url": "https://html-validate.org/rules/valid-for.html",
			}
		`);
	});
});
