import { HtmlValidate } from "../htmlvalidate";
import { processAttribute } from "../transform/mocks/attribute";
import "../jest";

describe("rule attr-case", () => {
	let htmlvalidate: HtmlValidate;

	describe('configured with "lowercase"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "attr-case": ["error", { style: "lowercase" }] },
			});
		});

		it("should not report error when attributes is lowercase", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div foo="bar"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when attribute has special characters", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div foo-bar-9="bar"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when attributes is uppercase", async () => {
			expect.assertions(2);
			const markup = /* HTML */ `<div FOO="bar"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Attribute "FOO" should be lowercase (attr-case) at inline:1:6:
				> 1 | <div FOO="bar"></div>
				    |      ^^^
				Selector: div"
			`);
		});

		it("should report error when attributes is mixed", async () => {
			expect.assertions(2);
			const markup = `<div clAss="bar"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Attribute "clAss" should be lowercase (attr-case) at inline:1:6:
				> 1 | <div clAss="bar"></div>
				    |      ^^^^^
				Selector: div"
			`);
		});

		it("smoketest", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateFile("test-files/rules/attr-case.html");
			expect(report).toMatchInlineCodeframe(`
				"error: Attribute "ID" should be lowercase (attr-case) at test-files/rules/attr-case.html:2:4:
				  1 | <p id="foo">foo</p>
				> 2 | <p ID="bar">bar</p>
				    |    ^^
				  3 | <p clAss="baz">baz</p>
				  4 |
				Selector: #bar
				error: Attribute "clAss" should be lowercase (attr-case) at test-files/rules/attr-case.html:3:4:
				  1 | <p id="foo">foo</p>
				  2 | <p ID="bar">bar</p>
				> 3 | <p clAss="baz">baz</p>
				    |    ^^^^^
				  4 |
				Selector: p:nth-child(3)"
			`);
		});
	});

	describe('configured with "uppercase"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "attr-case": ["error", { style: "uppercase" }] },
			});
		});

		it("should report error when attributes is lowercase", async () => {
			expect.assertions(2);
			const markup = /* HTML */ `<div foo="bar"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Attribute "foo" should be uppercase (attr-case) at inline:1:6:
				> 1 | <div foo="bar"></div>
				    |      ^^^
				Selector: div"
			`);
		});

		it("should not report error when attribute has special characters", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div FOO-BAR-9="bar"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when attributes is uppercase", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div FOO="bar"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when attributes is mixed", async () => {
			expect.assertions(2);
			const markup = `<div clAss="bar"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Attribute "clAss" should be uppercase (attr-case) at inline:1:6:
				> 1 | <div clAss="bar"></div>
				    |      ^^^^^
				Selector: div"
			`);
		});

		it("smoketest", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateFile("test-files/rules/attr-case.html");
			expect(report).toMatchInlineCodeframe(`
				"error: Attribute "id" should be uppercase (attr-case) at test-files/rules/attr-case.html:1:4:
				> 1 | <p id="foo">foo</p>
				    |    ^^
				  2 | <p ID="bar">bar</p>
				  3 | <p clAss="baz">baz</p>
				  4 |
				Selector: #foo
				error: Attribute "clAss" should be uppercase (attr-case) at test-files/rules/attr-case.html:3:4:
				  1 | <p id="foo">foo</p>
				  2 | <p ID="bar">bar</p>
				> 3 | <p clAss="baz">baz</p>
				    |    ^^^^^
				  4 |
				Selector: p:nth-child(3)"
			`);
		});
	});

	describe('configured with "pascalcase"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "attr-case": ["error", { style: "pascalcase" }] },
			});
		});

		it("should not report error when attributes is PascalCase", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div FooBar="baz"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when attributes is UPPERCASE", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div FOOBAR="baz"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when attributes is lowercase", async () => {
			expect.assertions(2);
			const markup = /* HTML */ `<div foobar="baz"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Attribute "foobar" should be PascalCase (attr-case) at inline:1:6:
				> 1 | <div foobar="baz"></div>
				    |      ^^^^^^
				Selector: div"
			`);
		});

		it("should report error when attributes is camelCase", async () => {
			expect.assertions(2);
			const markup = /* HTML */ `<div fooBar="baz"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Attribute "fooBar" should be PascalCase (attr-case) at inline:1:6:
				> 1 | <div fooBar="baz"></div>
				    |      ^^^^^^
				Selector: div"
			`);
		});

		it("smoketest", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateFile("test-files/rules/attr-case.html");
			expect(report).toMatchInlineCodeframe(`
				"error: Attribute "id" should be PascalCase (attr-case) at test-files/rules/attr-case.html:1:4:
				> 1 | <p id="foo">foo</p>
				    |    ^^
				  2 | <p ID="bar">bar</p>
				  3 | <p clAss="baz">baz</p>
				  4 |
				Selector: #foo
				error: Attribute "clAss" should be PascalCase (attr-case) at test-files/rules/attr-case.html:3:4:
				  1 | <p id="foo">foo</p>
				  2 | <p ID="bar">bar</p>
				> 3 | <p clAss="baz">baz</p>
				    |    ^^^^^
				  4 |
				Selector: p:nth-child(3)"
			`);
		});
	});

	describe('configured with "camelcase"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "attr-case": ["error", { style: "camelcase" }] },
			});
		});

		it("should not report error when attributes is camelCase", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div fooBar="baz"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when attributes is lowercase", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div foobar="baz"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when attributes is UPPERCASE", async () => {
			expect.assertions(2);
			const markup = /* HTML */ `<div FOOBAR="baz"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Attribute "FOOBAR" should be camelCase (attr-case) at inline:1:6:
				> 1 | <div FOOBAR="baz"></div>
				    |      ^^^^^^
				Selector: div"
			`);
		});

		it("should report error when attributes is PascalCase", async () => {
			expect.assertions(2);
			const markup = /* HTML */ `<div FooBar="baz"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Attribute "FooBar" should be camelCase (attr-case) at inline:1:6:
				> 1 | <div FooBar="baz"></div>
				    |      ^^^^^^
				Selector: div"
			`);
		});

		it("smoketest", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateFile("test-files/rules/attr-case.html");
			expect(report).toMatchInlineCodeframe(`
				"error: Attribute "ID" should be camelCase (attr-case) at test-files/rules/attr-case.html:2:4:
				  1 | <p id="foo">foo</p>
				> 2 | <p ID="bar">bar</p>
				    |    ^^
				  3 | <p clAss="baz">baz</p>
				  4 |
				Selector: #bar"
			`);
		});
	});

	describe('configured with "ignoreForeign" true', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "attr-case": ["error", { ignoreForeign: true }] },
			});
		});

		it("should not report error on foreign elements", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `<svg viewBox="" />`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	describe('configured with "ignoreForeign" false', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "attr-case": ["error", { ignoreForeign: false }] },
			});
		});

		it("should report error on foreign elements", async () => {
			expect.assertions(2);
			const markup = /* HTML */ `<svg viewBox="" />`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Attribute "viewBox" should be lowercase (attr-case) at inline:1:6:
				> 1 | <svg viewBox="" />
				    |      ^^^^^^^
				Selector: svg"
			`);
		});
	});

	it("should handle multiple styles", async () => {
		expect.assertions(3);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"attr-case": ["error", { style: ["lowercase", "camelcase"] }],
			},
		});
		expect(htmlvalidate.validateString("<div foo-bar></div>")).toBeValid();
		expect(htmlvalidate.validateString("<div fooBar></div>")).toBeValid();
		expect(htmlvalidate.validateString("<div FooBar></div>")).toMatchInlineCodeframe(`
			"error: Attribute "FooBar" should be lowercase or camelCase (attr-case) at inline:1:6:
			> 1 | <div FooBar></div>
			    |      ^^^^^^
			Selector: div"
		`);
	});

	it("should not report duplicate errors for dynamic attributes", async () => {
		expect.assertions(2);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "attr-case": "error" },
		});
		const markup = /* HTML */ `<input dynamic-fooBar="foo" />`;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeInvalid();
		expect(report).toHaveErrors([
			{
				ruleId: "attr-case",
				message: 'Attribute "dynamic-fooBar" should be lowercase',
			},
		]);
	});

	it("should throw error if configured with invalid value", async () => {
		expect.assertions(1);
		expect(() => {
			return new HtmlValidate({
				root: true,
				rules: { "attr-case": ["error", { style: "foobar" }] },
			});
		}).toThrowErrorMatchingInlineSnapshot(
			`"Rule configuration error: /rules/attr-case/1/style must be equal to one of the allowed values: lowercase, uppercase, pascalcase, camelcase"`,
		);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "attr-case": "error" },
		});
		const docs = await htmlvalidate.getRuleDocumentation("attr-case");
		expect(docs).toMatchInlineSnapshot(`
			{
			  "description": "Attribute name must be in lowercase.",
			  "url": "https://html-validate.org/rules/attr-case.html",
			}
		`);
	});

	it("should contain documentation with multiple styles", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "attr-case": ["error", { style: ["lowercase", "camelcase"] }] },
		});
		const docs = await htmlvalidate.getRuleDocumentation("attr-case");
		expect(docs).toMatchInlineSnapshot(`
			{
			  "description": "Attribute name must be in one of:

			- lowercase
			- camelcase",
			  "url": "https://html-validate.org/rules/attr-case.html",
			}
		`);
	});
});
