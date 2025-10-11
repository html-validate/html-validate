import { HtmlValidate } from "../htmlvalidate";
import { processAttribute } from "../transform/mocks/attribute";
import "../jest";
import { type RuleContext } from "./form-dup-name";

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

	it("should not report when other input fields are disabled", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<form>
				<input name="foo" disabled />
				<input name="foo" hidden />
				<input name="foo" inert />
				<input name="foo" />
			</form>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when other input fields are disabled by fieldset", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<form>
				<fieldset disabled><input name="foo" /></fieldset>
				<fieldset hidden><input name="foo" /></fieldset>
				<fieldset inert><input name="foo" /></fieldset>
				<input name="foo" />
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

	it("should not report when form control inside <template> have save name", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<form>
				<input name="foo" />
				<template>
					<input name="foo" />
				</template>
			</form>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when form controls inside <template> have save name as another <template>", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<form>
				<template>
					<input name="foo" />
				</template>
				<template>
					<input name="foo" />
				</template>
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

	it("should report when form has duplicate name inside same <template>", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<template>
				<input name="foo" />
				<input name="foo" />
			</template>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toMatchInlineCodeframe(`
			"error: Duplicate form control name "foo" (form-dup-name) at inline:4:18:
			  2 | 			<template>
			  3 | 				<input name="foo" />
			> 4 | 				<input name="foo" />
			    | 				             ^^^
			  5 | 			</template>
			  6 |
			Selector: template > input:nth-child(2)"
		`);
	});

	it("should report when radiobutton has same name as other control", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<form>
				<input name="foo" />
				<input name="foo" type="checkbox" />
			</form>
			<template>
				<input name="bar" />
				<input name="bar" type="checkbox" />
			</template>
			<input name="baz" />
			<input name="baz" type="checkbox" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toMatchInlineCodeframe(`
			"error: Duplicate form control name "foo" (form-dup-name) at inline:4:18:
			  2 | 			<form>
			  3 | 				<input name="foo" />
			> 4 | 				<input name="foo" type="checkbox" />
			    | 				             ^^^
			  5 | 			</form>
			  6 | 			<template>
			  7 | 				<input name="bar" />
			Selector: form > input:nth-child(2)
			error: Duplicate form control name "bar" (form-dup-name) at inline:8:18:
			   6 | 			<template>
			   7 | 				<input name="bar" />
			>  8 | 				<input name="bar" type="checkbox" />
			     | 				             ^^^
			   9 | 			</template>
			  10 | 			<input name="baz" />
			  11 | 			<input name="baz" type="checkbox" />
			Selector: template > input:nth-child(2)
			error: Duplicate form control name "baz" (form-dup-name) at inline:11:17:
			   9 | 			</template>
			  10 | 			<input name="baz" />
			> 11 | 			<input name="baz" type="checkbox" />
			     | 			             ^^^
			  12 |
			Selector: input:nth-child(4)"
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
				<template>
					<input name="baz" />
					<input name="baz[]" />
				</template>
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
				  10 | 				<template>
				  11 | 					<input name="baz" />
				Selector: form:nth-child(2) > input:nth-child(2)
				error: Cannot mix "baz[]" and "baz" (form-dup-name) at inline:12:19:
				  10 | 				<template>
				  11 | 					<input name="baz" />
				> 12 | 					<input name="baz[]" />
				     | 					             ^^^^^
				  13 | 				</template>
				  14 |
				Selector: template > input:nth-child(2)"
			`);
		});
	});

	describe("allowCheckboxDefault", () => {
		describe("when enabled", () => {
			const htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "form-dup-name": ["error", { allowCheckboxDefault: true }] },
			});

			it("should not report error when checkbox and hidden share name", async () => {
				expect.assertions(1);
				const markup = /* HTML */ `
					<form>
						<input name="foo" type="hidden" value="0" />
						<input name="foo" type="checkbox" value="1" />
					</form>
				`;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeValid();
			});

			it("should report error when multiple checkboxes or hidden share name", async () => {
				expect.assertions(2);
				const markup = /* HTML */ `
					<form id="dup-hidden">
						<input name="foo" type="hidden" value="0" />
						<input name="foo" type="hidden" value="1" />
						<input name="foo" type="checkbox" value="2" />
					</form>
					<form id="dup-checkbox">
						<input name="foo" type="hidden" value="0" />
						<input name="foo" type="checkbox" value="1" />
						<input name="foo" type="checkbox" value="2" />
					</form>
				`;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeInvalid();
				expect(report).toMatchInlineCodeframe(`
					"error: Duplicate form control name "foo" (form-dup-name) at inline:4:20:
					  2 | 					<form id="dup-hidden">
					  3 | 						<input name="foo" type="hidden" value="0" />
					> 4 | 						<input name="foo" type="hidden" value="1" />
					    | 						             ^^^
					  5 | 						<input name="foo" type="checkbox" value="2" />
					  6 | 					</form>
					  7 | 					<form id="dup-checkbox">
					Selector: #dup-hidden > input:nth-child(2)
					error: Duplicate form control name "foo" (form-dup-name) at inline:10:20:
					   8 | 						<input name="foo" type="hidden" value="0" />
					   9 | 						<input name="foo" type="checkbox" value="1" />
					> 10 | 						<input name="foo" type="checkbox" value="2" />
					     | 						             ^^^
					  11 | 					</form>
					  12 |
					Selector: #dup-checkbox > input:nth-child(3)"
				`);
			});

			it("should report error when hidden share name with other controls", async () => {
				expect.assertions(2);
				const markup = /* HTML */ `
					<form>
						<input name="foo" type="hidden" value="0" />
						<input name="foo" type="text" value="1" />
					</form>
				`;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeInvalid();
				expect(report).toMatchInlineCodeframe(`
					"error: Duplicate form control name "foo" (form-dup-name) at inline:4:20:
					  2 | 					<form>
					  3 | 						<input name="foo" type="hidden" value="0" />
					> 4 | 						<input name="foo" type="text" value="1" />
					    | 						             ^^^
					  5 | 					</form>
					  6 |
					Selector: form > input:nth-child(2)"
				`);
			});
		});

		describe("when disabled", () => {
			const htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "form-dup-name": ["error", { allowCheckboxDefault: false }] },
			});

			it("should report error when checkbox and hidden share name", async () => {
				expect.assertions(2);
				const markup = /* HTML */ `
					<form>
						<input name="foo" type="hidden" value="0" />
						<input name="foo" type="checkbox" value="1" />
					</form>
				`;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeInvalid();
				expect(report).toMatchInlineCodeframe(`
					"error: Duplicate form control name "foo" (form-dup-name) at inline:4:20:
					  2 | 					<form>
					  3 | 						<input name="foo" type="hidden" value="0" />
					> 4 | 						<input name="foo" type="checkbox" value="1" />
					    | 						             ^^^
					  5 | 					</form>
					  6 |
					Selector: form > input:nth-child(2)"
				`);
			});
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
				<template>
					<input name="bar" type="text" />
					<input name="bar" type="text" />
				</template>
				<input name="baz" type="checkbox" />
				<input name="baz" type="checkbox" />
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toMatchInlineCodeframe(`
				"error: Duplicate form control name "foo" (form-dup-name) at inline:4:19:
				  2 | 				<form>
				  3 | 					<input name="foo" type="text" />
				> 4 | 					<input name="foo" type="text" />
				    | 					             ^^^
				  5 | 				</form>
				  6 | 				<template>
				  7 | 					<input name="bar" type="text" />
				Selector: form > input:nth-child(2)
				error: Duplicate form control name "bar" (form-dup-name) at inline:8:19:
				   6 | 				<template>
				   7 | 					<input name="bar" type="text" />
				>  8 | 					<input name="bar" type="text" />
				     | 					             ^^^
				   9 | 				</template>
				  10 | 				<input name="baz" type="checkbox" />
				  11 | 				<input name="baz" type="checkbox" />
				Selector: template > input:nth-child(2)
				error: Duplicate form control name "baz" (form-dup-name) at inline:11:18:
				   9 | 				</template>
				  10 | 				<input name="baz" type="checkbox" />
				> 11 | 				<input name="baz" type="checkbox" />
				     | 				             ^^^
				  12 |
				Selector: input:nth-child(4)"
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
				<template>
					<input name="foo" type="checkbox" />
					<input name="foo" type="checkbox" />
				</template>
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
				<template>
					<input name="bar" type="checkbox" />
					<input name="bar" type="radio" />
				</template>
				<input name="baz" type="checkbox" />
				<input name="baz" type="radio" />
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toMatchInlineCodeframe(`
				"error: Duplicate form control name "foo" (form-dup-name) at inline:4:19:
				  2 | 				<form>
				  3 | 					<input name="foo" type="checkbox" />
				> 4 | 					<input name="foo" type="radio" />
				    | 					             ^^^
				  5 | 				</form>
				  6 | 				<template>
				  7 | 					<input name="bar" type="checkbox" />
				Selector: form > input:nth-child(2)
				error: Duplicate form control name "bar" (form-dup-name) at inline:8:19:
				   6 | 				<template>
				   7 | 					<input name="bar" type="checkbox" />
				>  8 | 					<input name="bar" type="radio" />
				     | 					             ^^^
				   9 | 				</template>
				  10 | 				<input name="baz" type="checkbox" />
				  11 | 				<input name="baz" type="radio" />
				Selector: template > input:nth-child(2)
				error: Duplicate form control name "baz" (form-dup-name) at inline:11:18:
				   9 | 				</template>
				  10 | 				<input name="baz" type="checkbox" />
				> 11 | 				<input name="baz" type="radio" />
				     | 				             ^^^
				  12 |
				Selector: input:nth-child(4)"
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
				`"https://html-validate.org/rules/form-dup-name.html"`,
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
				`"https://html-validate.org/rules/form-dup-name.html"`,
			);
			expect(docs?.description).toMatchInlineSnapshot(`
				"Form control name cannot mix regular name "{{ name }}" with array brackets "{{ name }}[]"
				Each form control must have a unique name."
			`);
		});
	});
});
