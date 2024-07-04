import { HtmlValidate } from "../htmlvalidate";
import { processAttribute } from "../transform/mocks/attribute";
import "../jest";
import { type RuleContext, MessageID } from "./valid-autocomplete";

describe("rule autocomplete", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "valid-autocomplete": "error" },
		});
	});

	it("should not report error for autocomplete on other elements", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <div autocomplete="invalid shipping name"></div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when autocomplete is on", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<input type="text" autocomplete="on" />`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when autocomplete is off", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<input type="text" autocomplete="off" />`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when autocomplete has autofill field name", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<input type="text" autocomplete="username" />`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when autocomplete has mixed case", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<input type="text" autocomplete="UserName" />`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when autocomplete has section", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<input type="text" autocomplete="section-foobar username" />`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when input hidden has autofill field name", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<input type="hidden" autocomplete="transaction-amount" />`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should handle whitespace around token", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<input type="text" autocomplete="  on  " />
			<input type="text" autocomplete="  off  " />
			<input type="text" autocomplete="  section-foobar  billing   name  " />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should handle when input is missing type", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<input autocomplete="on" />
			<input autocomplete="off" />
			<input autocomplete="name" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when type is invalid but autocomplete is ok or off", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<input type="invalid" autocomplete="on" />
			<input type="invalid" autocomplete="off" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when type is dynamic", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <input dynamic-type="invalid" autocomplete="name" /> `;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should handle when input element", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<input autocomplete="on" />`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should handle autocomplete on input element", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<input autocomplete="on" />`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should handle autocomplete on textarea element", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<textarea autocomplete="on" /></textarea>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should handle autocomplete on select element", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<select autocomplete="on" /></select>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it('should not report when <form> uses "on" or "off" tokens', async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<form autocomplete="on"></form>
			<form autocomplete="off"></form>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error for dynamic autocomplete", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<input dynamic-autocomplete="foo" />`;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should not report error for empty autocomplete", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<input autocomplete="" />`;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should not report error for omitted autocomplete", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<input autocomplete />`;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should handle input[type=search]", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<input type="search" autocomplete="name" />`;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should report error when type=hidden has autocomplete on or off", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<input type="hidden" autocomplete="on" />
			<input type="hidden" autocomplete="off" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "on" cannot be used on <input type="hidden"> (valid-autocomplete) at inline:2:39:
			  1 |
			> 2 | 			<input type="hidden" autocomplete="on" />
			    | 			                                   ^^
			  3 | 			<input type="hidden" autocomplete="off" />
			  4 |
			Selector: input:nth-child(1)
			error: "off" cannot be used on <input type="hidden"> (valid-autocomplete) at inline:3:39:
			  1 |
			  2 | 			<input type="hidden" autocomplete="on" />
			> 3 | 			<input type="hidden" autocomplete="off" />
			    | 			                                   ^^^
			  4 |
			Selector: input:nth-child(2)"
		`);
	});

	it("should report error when attributes has invalid autofill field name", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `<input type="text" autocomplete="foobar" />`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "foobar" is not a valid autocomplete token or field name (valid-autocomplete) at inline:1:34:
			> 1 | <input type="text" autocomplete="foobar" />
			    |                                  ^^^^^^
			Selector: input"
		`);
	});

	describe("should report error when input elements with wrong type uses autocomplete", () => {
		const disallowedTypes = ["button", "reset", "image", "submit", "file", "radio", "checkbox"];
		it.each(disallowedTypes)("%s", async (type) => {
			expect.assertions(2);
			const markup = /* HTML */ ` <input type="${type}" autocomplete="on" /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toHaveError({
				message: `autocomplete attribute cannot be used on <input type="${type}">`,
			});
		});
	});

	it("should report error when form uses tokens other than on or off", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `<form autocomplete="tel"></form>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "tel" cannot be used on <form> (valid-autocomplete) at inline:1:21:
			> 1 | <form autocomplete="tel"></form>
			    |                     ^^^
			Selector: form"
		`);
	});

	it("should report error when combining on or off with field name", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<input type="text" autocomplete="on tel" />
			<input type="text" autocomplete="tel off" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "on" cannot be combined with "tel" (valid-autocomplete) at inline:2:37:
			  1 |
			> 2 | 			<input type="text" autocomplete="on tel" />
			    | 			                                 ^^
			  3 | 			<input type="text" autocomplete="tel off" />
			  4 |
			Selector: input:nth-child(1)
			error: "off" cannot be combined with "tel" (valid-autocomplete) at inline:3:41:
			  1 |
			  2 | 			<input type="text" autocomplete="on tel" />
			> 3 | 			<input type="text" autocomplete="tel off" />
			    | 			                                     ^^^
			  4 |
			Selector: input:nth-child(2)"
		`);
	});

	it("should report error when autocomplete field is used on wrong control group", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `<input type="number" autocomplete="current-password" />`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "current-password" cannot be used on <input type="number"> (valid-autocomplete) at inline:1:36:
			> 1 | <input type="number" autocomplete="current-password" />
			    |                                    ^^^^^^^^^^^^^^^^
			Selector: input"
		`);
	});

	it("should report error when attributes has duplicated field name", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<!-- names from list 1 -->
			<input type="text" autocomplete="username new-password" />
			<!-- names from list 2 -->
			<input type="text" autocomplete="tel email" />
			<!-- names from both list 1 and 2 -->
			<input type="text" autocomplete="username email" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "new-password" cannot be combined with "username" (valid-autocomplete) at inline:3:46:
			  1 |
			  2 | 			<!-- names from list 1 -->
			> 3 | 			<input type="text" autocomplete="username new-password" />
			    | 			                                          ^^^^^^^^^^^^
			  4 | 			<!-- names from list 2 -->
			  5 | 			<input type="text" autocomplete="tel email" />
			  6 | 			<!-- names from both list 1 and 2 -->
			Selector: input:nth-child(1)
			error: "email" cannot be combined with "tel" (valid-autocomplete) at inline:5:41:
			  3 | 			<input type="text" autocomplete="username new-password" />
			  4 | 			<!-- names from list 2 -->
			> 5 | 			<input type="text" autocomplete="tel email" />
			    | 			                                     ^^^^^
			  6 | 			<!-- names from both list 1 and 2 -->
			  7 | 			<input type="text" autocomplete="username email" />
			  8 |
			Selector: input:nth-child(2)
			error: "email" cannot be combined with "username" (valid-autocomplete) at inline:7:46:
			  5 | 			<input type="text" autocomplete="tel email" />
			  6 | 			<!-- names from both list 1 and 2 -->
			> 7 | 			<input type="text" autocomplete="username email" />
			    | 			                                          ^^^^^
			  8 |
			Selector: input:nth-child(3)"
		`);
	});

	it("should report error when autocomplete has section but no field name", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `<input type="text" autocomplete="section-foobar" />`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: autocomplete attribute is missing field name (valid-autocomplete) at inline:1:20:
			> 1 | <input type="text" autocomplete="section-foobar" />
			    |                    ^^^^^^^^^^^^
			Selector: input"
		`);
	});

	it("should report error when autocomplete has section after field name", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `<input type="text" autocomplete="username section-foobar" />`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "section-foobar" must appear before "username" (valid-autocomplete) at inline:1:43:
			> 1 | <input type="text" autocomplete="username section-foobar" />
			    |                                           ^^^^^^^^^^^^^^
			Selector: input"
		`);
	});

	it("should report error when autocomplete has shipping-billing after field name", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `<textarea autocomplete="street-address shipping"></textarea>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "shipping" must appear before "street-address" (valid-autocomplete) at inline:1:40:
			> 1 | <textarea autocomplete="street-address shipping"></textarea>
			    |                                        ^^^^^^^^
			Selector: textarea"
		`);
	});

	it("should report error when autocomplete has webauthn before field name", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `<input type="text" autocomplete="webauthn username" />`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "username" must appear before "webauthn" (valid-autocomplete) at inline:1:43:
			> 1 | <input type="text" autocomplete="webauthn username" />
			    |                                           ^^^^^^^^
			Selector: input"
		`);
	});

	it("should report error when autocomplete has contact after field name", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `<input type="text" autocomplete="tel home" />`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "home" must appear before "tel" (valid-autocomplete) at inline:1:38:
			> 1 | <input type="text" autocomplete="tel home" />
			    |                                      ^^^^
			Selector: input"
		`);
	});

	it("should report error when autocomplete has contact token with field1", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `<input type="text" autocomplete="work username" />`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "work" cannot be combined with "username" (valid-autocomplete) at inline:1:34:
			> 1 | <input type="text" autocomplete="work username" />
			    |                                  ^^^^
			Selector: input"
		`);
	});

	it("should report error when input[type=text] uses multiline token", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `<input type="text" autocomplete="street-address" />`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "street-address" cannot be used on <input type="text"> (valid-autocomplete) at inline:1:34:
			> 1 | <input type="text" autocomplete="street-address" />
			    |                                  ^^^^^^^^^^^^^^
			Selector: input"
		`);
	});

	it("should report error when input[type=search] uses multiline token", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `<input type="search" autocomplete="street-address" />`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "street-address" cannot be used on <input type="search"> (valid-autocomplete) at inline:1:36:
			> 1 | <input type="search" autocomplete="street-address" />
			    |                                    ^^^^^^^^^^^^^^
			Selector: input"
		`);
	});

	describe("should report error when text token cannot be used", () => {
		const disallowed = ["password", "url", "email", "tel", "number", "month", "date"];

		it.each(disallowed)("input[type=%s]", async (type) => {
			expect.assertions(2);
			const markup = /* HTML */ `<input type="${type}" autocomplete="name" />`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toHaveError({
				message: `"name" cannot be used on <input type="${type}">`,
			});
		});
	});

	it("should report error when input has invalid type", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <input type="invalid" autocomplete="name" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "name" cannot be used on <input type="invalid"> (valid-autocomplete) at inline:1:38:
			> 1 |  <input type="invalid" autocomplete="name" />
			    |                                      ^^^^
			Selector: input"
		`);
	});

	describe("should contain documentation", () => {
		it("invalid attribute", async () => {
			expect.assertions(1);
			const context: RuleContext = {
				msg: MessageID.InvalidAttribute,
				what: '<input type="radio">',
			};
			const docs = await htmlvalidate.getContextualDocumentation({
				ruleId: "valid-autocomplete",
				context,
			});
			expect(docs?.description).toMatchInlineSnapshot(`
				"\`autocomplete\` attribute cannot be used on \`<input type="radio">\`

				The following input types cannot use the \`autocomplete\` attribute:

				- \`checkbox\`
				- \`radio\`
				- \`file\`
				- \`submit\`
				- \`image\`
				- \`reset\`
				- \`button\`"
			`);
		});

		it("invalid value (form)", async () => {
			expect.assertions(1);
			const context: RuleContext = {
				msg: MessageID.InvalidValue,
				type: "form",
				value: "current-password",
				what: "<form>",
			};
			const docs = await htmlvalidate.getContextualDocumentation({
				ruleId: "valid-autocomplete",
				context,
			});
			expect(docs?.description).toMatchInlineSnapshot(`
				"\`"current-password"\` cannot be used on \`<form>\`

				The \`<form>\` element can only use the values \`"on"\` and \`"off"\`."
			`);
		});

		it("invalid value (hidden)", async () => {
			expect.assertions(1);
			const context: RuleContext = {
				msg: MessageID.InvalidValue,
				type: "hidden",
				value: "on",
				what: '<input type="hidden">',
			};
			const docs = await htmlvalidate.getContextualDocumentation({
				ruleId: "valid-autocomplete",
				context,
			});
			expect(docs?.description).toMatchInlineSnapshot(`
				"\`"on"\` cannot be used on \`<input type="hidden">\`

				\`<input type="hidden">\` cannot use the values \`"on"\` and \`"off"\`."
			`);
		});

		it("invalid value (other)", async () => {
			expect.assertions(1);
			const context: RuleContext = {
				msg: MessageID.InvalidValue,
				type: "url",
				value: "current-password",
				what: '<input type="url">',
			};
			const docs = await htmlvalidate.getContextualDocumentation({
				ruleId: "valid-autocomplete",
				context,
			});
			expect(docs?.description).toMatchInlineSnapshot(`
				"\`"current-password"\` cannot be used on \`<input type="url">\`

				\`<input type="url">\` allows autocomplete fields from the following group:

				- url

				The field \`"current-password"\` belongs to the group /password/ which cannot be used with this input type."
			`);
		});

		it("invalid order", async () => {
			expect.assertions(1);
			const context: RuleContext = {
				msg: MessageID.InvalidOrder,
				first: "name",
				second: "shipping",
			};
			const docs = await htmlvalidate.getContextualDocumentation({
				ruleId: "valid-autocomplete",
				context,
			});
			expect(docs?.description).toMatchInlineSnapshot(`
				"\`"shipping"\` must appear before \`"name"\`

				The autocomplete tokens must appear in the following order:

				- Optional section name (\`section-\` prefix).
				- Optional \`shipping\` or \`billing\` token.
				- Optional \`home\`, \`work\`, \`mobile\`, \`fax\` or \`pager\` token (for fields supporting it).
				- Field name
				- Optional \`webauthn\` token."
			`);
		});

		it("invalid token", async () => {
			expect.assertions(1);
			const context: RuleContext = {
				msg: MessageID.InvalidToken,
				token: "foobar",
			};
			const docs = await htmlvalidate.getContextualDocumentation({
				ruleId: "valid-autocomplete",
				context,
			});
			expect(docs?.description).toMatchInlineSnapshot(
				`"\`"foobar"\` is not a valid autocomplete token or field name"`,
			);
		});

		it("invalid combination", async () => {
			expect.assertions(1);
			const context: RuleContext = {
				msg: MessageID.InvalidCombination,
				first: "name",
				second: "off",
			};
			const docs = await htmlvalidate.getContextualDocumentation({
				ruleId: "valid-autocomplete",
				context,
			});
			expect(docs?.description).toMatchInlineSnapshot(
				`"\`"off"\` cannot be combined with \`"name"\`"`,
			);
		});

		it("missing field", async () => {
			expect.assertions(1);
			const context: RuleContext = {
				msg: MessageID.MissingField,
			};
			const docs = await htmlvalidate.getContextualDocumentation({
				ruleId: "valid-autocomplete",
				context,
			});
			expect(docs?.description).toMatchInlineSnapshot(
				`"Autocomplete attribute is missing field name"`,
			);
		});
	});
});
