import { HtmlValidate } from "../../htmlvalidate";
import "../../jest";

describe("wcag/h32", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			elements: [
				"html5",
				{
					"my-form": {
						form: true,
					},
				},
			],
			rules: { "wcag/h32": "error" },
		});
	});

	it("should not report when form has nested submit button (button)", async () => {
		expect.assertions(1);
		const markup = '<form><button type="submit"></button></form>';
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when form has nested submit button (input)", async () => {
		expect.assertions(1);
		const markup = '<form><input type="submit"></form>';
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when form has nested submit button (image)", async () => {
		expect.assertions(1);
		const markup = '<form><input type="image"></form>';
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when form has associated submit button", async () => {
		expect.assertions(1);
		const markup = '<form id="foo"></form><button form="foo" type="submit"></button>';
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when form has both nested and associated submit button", async () => {
		expect.assertions(1);
		const markup = '<form id="foo"><button form="foo" type="submit"></button></form>';
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when form is missing submit button", async () => {
		expect.assertions(2);
		const markup = "<form></form>";
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <form> element must have a submit button (wcag/h32) at inline:1:2:
			> 1 | <form></form>
			    |  ^^^^
			Selector: form"
		`);
	});

	it("should report error when form only has regular button", async () => {
		expect.assertions(2);
		const markup = '<form><button type="button"></button></form>';
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <form> element must have a submit button (wcag/h32) at inline:1:2:
			> 1 | <form><button type="button"></button></form>
			    |  ^^^^
			Selector: form"
		`);
	});

	it("should report error when form is associated with regular button", async () => {
		expect.assertions(2);
		const markup = '<form id="foo"></form><button form="foo" type="button"></button>';
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <form> element must have a submit button (wcag/h32) at inline:1:2:
			> 1 | <form id="foo"></form><button form="foo" type="button"></button>
			    |  ^^^^
			Selector: #foo"
		`);
	});

	it("should report error when form nested button is associated with another form", async () => {
		expect.assertions(2);
		const markup = '<form id="foo"><button form="bar" type="submit"></button></form>';
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <form> element must have a submit button (wcag/h32) at inline:1:2:
			> 1 | <form id="foo"><button form="bar" type="submit"></button></form>
			    |  ^^^^
			Selector: #foo"
		`);
	});

	it("should support custom elements", async () => {
		expect.assertions(2);
		const markup = "<my-form></my-form>";
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <my-form> element must have a submit button (wcag/h32) at inline:1:2:
			> 1 | <my-form></my-form>
			    |  ^^^^^^^
			Selector: my-form"
		`);
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile("test-files/rules/wcag/h32.html");
		expect(report).toMatchInlineCodeframe(`
			"error: <form> element must have a submit button (wcag/h32) at test-files/rules/wcag/h32.html:9:2:
			   7 | </form>
			   8 |
			>  9 | <form>
			     |  ^^^^
			  10 | 	<input type="text">
			  11 | 	<button>Foo</button>
			  12 | 	<button type="button">Bar</button>
			Selector: form:nth-child(3)"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "wcag/h32": "error" },
		});
		const docs = await htmlvalidate.getRuleDocumentation("wcag/h32");
		expect(docs).toMatchSnapshot();
	});
});
