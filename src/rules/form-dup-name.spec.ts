import { HtmlValidate } from "../htmlvalidate";
import { processAttribute } from "../transform/mocks/attribute";
import "../jest";
import { RuleContext } from "./form-dup-name";

describe("rule form-dup-name", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "form-dup-name": "error" },
		});
	});

	it("should not report when name isn't duplicated", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<form>
				<input name="foo" />
				<input name="bar" />
			</form>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when different forms have same name", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<form>
				<input name="foo" />
			</form>
			<form>
				<input name="foo" />
			</form>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when global scope and form have same name", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<input name="foo" />
			<form>
				<input name="foo" />
			</form>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it('should not report when <input type="radio"> have same name', async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<form>
				<input type="radio" value="yes" name="foo" />
				<input type="radio" value="nah" name="foo" />
			</form>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it('should not report when <button type="submit"> have same name', async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<form>
				<button type="submit" name="foo"></button>
				<button type="submit" name="foo"></button>
			</form>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it('should not report when <button type="button"> have same name', async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<form>
				<button type="button" name="foo"></button>
				<button type="button" name="foo"></button>
			</form>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it('should not report when <button type="reset"> have same name', async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<form>
				<button type="reset" name="foo"></button>
				<button type="reset" name="foo"></button>
			</form>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when name is missing or empty", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<form>
				<input />
				<input />
				<input name />
				<input name />
				<input name="" />
				<input name="" />
				<input type="radio" />
				<input type="checkbox" />
			</form>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error for interpolated attributes", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<form>
				<input name="{{ expr }}" />
				<input name="{{ expr }}" />
			</form>
		`;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should not report error for dynamic attributes", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<form>
				<input dynamic-name="foo" />
				<input dynamic-name="foo" />
			</form>
		`;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should report when form has duplicate name", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<form>
				<input name="foo" />
				<input name="foo" />
			</form>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toMatchInlineCodeframe(`
			"error: Duplicate form control name "foo" (form-dup-name) at inline:4:18:
			  2 | 			<form>
			  3 | 				<input name="foo" />
			> 4 | 				<input name="foo" />
			    | 				             ^^^
			  5 | 			</form>
			  6 |
			Selector: form > input:nth-child(2)"
		`);
	});

	it("should report when global scope has duplicate name", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<input name="foo" />
			<input name="foo" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toMatchInlineCodeframe(`
			"error: Duplicate form control name "foo" (form-dup-name) at inline:3:17:
			  1 |
			  2 | 			<input name="foo" />
			> 3 | 			<input name="foo" />
			    | 			             ^^^
			  4 |
			Selector: input:nth-child(2)"
		`);
	});

	it("should report when radiobutton has same name as other control", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<form>
				<input name="foo" />
				<input name="foo" type="checkbox" />
			</form>
			<input name="bar" />
			<input name="bar" type="checkbox" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toMatchInlineCodeframe(`
			"error: Duplicate form control name "foo" (form-dup-name) at inline:4:18:
			  2 | 			<form>
			  3 | 				<input name="foo" />
			> 4 | 				<input name="foo" type="checkbox" />
			    | 				             ^^^
			  5 | 			</form>
			  6 | 			<input name="bar" />
			  7 | 			<input name="bar" type="checkbox" />
			Selector: form > input:nth-child(2)
			error: Duplicate form control name "bar" (form-dup-name) at inline:7:17:
			  5 | 			</form>
			  6 | 			<input name="bar" />
			> 7 | 			<input name="bar" type="checkbox" />
			    | 			             ^^^
			  8 |
			Selector: input:nth-child(3)"
		`);
	});

	describe("should report for", () => {
		const elements = ["button", "fieldset", "input", "object", "output", "select", "textarea"];

		it.each(elements)("%s", async (tagName) => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<form>
					<${tagName} name="foo" />
					<${tagName} name="foo" />
				</form>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toHaveError({
				ruleId: "form-dup-name",
				message: 'Duplicate form control name "foo"',
			});
		});
	});

	describe("allowArrayBrackets", () => {
		it("by default it should not report when two controls use []", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<form>
					<input name="foo[]" />
					<input name="foo[]" />
				</form>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("when enabled it should not report when multiple controls use []", async () => {
			expect.assertions(1);
			const htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "form-dup-name": ["error", { allowArrayBrackets: true }] },
			});
			const markup = /* HTML */ `
				<form>
					<input name="foo[]" />
					<input name="foo[]" />
					<input name="foo[]" />
					<input name="foo[]" />
				</form>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("when disabled it should generate error when when multiple controls use []", async () => {
			expect.assertions(1);
			const htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "form-dup-name": ["error", { allowArrayBrackets: false }] },
			});
			const markup = /* HTML */ `
				<form>
					<input name="foo[]" />
					<input name="foo[]" />
				</form>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toMatchInlineCodeframe(`
				"error: Duplicate form control name "foo[]" (form-dup-name) at inline:4:19:
				  2 | 				<form>
				  3 | 					<input name="foo[]" />
				> 4 | 					<input name="foo[]" />
				    | 					             ^^^^^
				  5 | 				</form>
				  6 |
				Selector: form > input:nth-child(2)"
			`);
		});

		it("should generate error when mixing brackets with non-brackets", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<form>
					<input name="foo[]" />
					<input name="foo" />
				</form>
				<form>
					<input name="bar" />
					<input name="bar[]" />
				</form>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toMatchInlineCodeframe(`
				"error: Cannot mix "foo[]" and "foo" (form-dup-name) at inline:4:19:
				  2 | 				<form>
				  3 | 					<input name="foo[]" />
				> 4 | 					<input name="foo" />
				    | 					             ^^^
				  5 | 				</form>
				  6 | 				<form>
				  7 | 					<input name="bar" />
				Selector: form:nth-child(1) > input:nth-child(2)
				error: Cannot mix "bar[]" and "bar" (form-dup-name) at inline:8:19:
				   6 | 				<form>
				   7 | 					<input name="bar" />
				>  8 | 					<input name="bar[]" />
				     | 					             ^^^^^
				   9 | 				</form>
				  10 |
				Selector: form:nth-child(2) > input:nth-child(2)"
			`);
		});
	});

	describe("shared", () => {
		it("should report error for controls by default", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<form>
					<input name="foo" type="text" />
					<input name="foo" type="text" />
				</form>
				<input name="bar" type="checkbox" />
				<input name="bar" type="checkbox" />
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toMatchInlineCodeframe(`
				"error: Duplicate form control name "foo" (form-dup-name) at inline:4:19:
				  2 | 				<form>
				  3 | 					<input name="foo" type="text" />
				> 4 | 					<input name="foo" type="text" />
				    | 					             ^^^
				  5 | 				</form>
				  6 | 				<input name="bar" type="checkbox" />
				  7 | 				<input name="bar" type="checkbox" />
				Selector: form > input:nth-child(2)
				error: Duplicate form control name "bar" (form-dup-name) at inline:7:18:
				  5 | 				</form>
				  6 | 				<input name="bar" type="checkbox" />
				> 7 | 				<input name="bar" type="checkbox" />
				    | 				             ^^^
				  8 |
				Selector: input:nth-child(3)"
			`);
		});

		it("should allow adding additional control types as shared", async () => {
			expect.assertions(1);
			const htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "form-dup-name": ["error", { shared: ["checkbox"] }] },
			});
			const markup = /* HTML */ `
				<form>
					<input name="foo" type="checkbox" />
					<input name="foo" type="checkbox" />
				</form>
				<input name="bar" type="checkbox" />
				<input name="bar" type="checkbox" />
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report when different types of control share the same name", async () => {
			expect.assertions(1);
			const htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "form-dup-name": ["error", { shared: ["radio", "checkbox"] }] },
			});
			const markup = /* HTML */ `
				<form>
					<input name="foo" type="checkbox" />
					<input name="foo" type="radio" />
				</form>
				<input name="bar" type="checkbox" />
				<input name="bar" type="radio" />
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toMatchInlineCodeframe(`
				"error: Duplicate form control name "foo" (form-dup-name) at inline:4:19:
				  2 | 				<form>
				  3 | 					<input name="foo" type="checkbox" />
				> 4 | 					<input name="foo" type="radio" />
				    | 					             ^^^
				  5 | 				</form>
				  6 | 				<input name="bar" type="checkbox" />
				  7 | 				<input name="bar" type="radio" />
				Selector: form > input:nth-child(2)
				error: Duplicate form control name "bar" (form-dup-name) at inline:7:18:
				  5 | 				</form>
				  6 | 				<input name="bar" type="checkbox" />
				> 7 | 				<input name="bar" type="radio" />
				    | 				             ^^^
				  8 |
				Selector: input:nth-child(3)"
			`);
		});
	});

	describe("should contain documentation", () => {
		it("for duplicate name", async () => {
			expect.assertions(2);
			const context: RuleContext = {
				name: "foo",
				kind: "duplicate",
			};
			const docs = await htmlvalidate.getContextualDocumentation({
				ruleId: "form-dup-name",
				context,
			});
			expect(docs?.url).toMatchInlineSnapshot(
				`"https://html-validate.org/rules/form-dup-name.html"`
			);
			expect(docs?.description).toMatchInlineSnapshot(`
				"Duplicate form control name "foo"
				Each form control must have a unique name."
			`);
		});

		it("for mixing name and name[]", async () => {
			expect.assertions(2);
			const context: RuleContext = {
				name: "foo",
				kind: "mix",
			};
			const docs = await htmlvalidate.getContextualDocumentation({
				ruleId: "form-dup-name",
				context,
			});
			expect(docs?.url).toMatchInlineSnapshot(
				`"https://html-validate.org/rules/form-dup-name.html"`
			);
			expect(docs?.description).toMatchInlineSnapshot(`
				"Form control name cannot mix regular name "{{ name }}" with array brackets "{{ name }}[]"
				Each form control must have a unique name."
			`);
		});
	});
});
