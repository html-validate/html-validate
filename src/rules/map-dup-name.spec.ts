import HtmlValidate from "../htmlvalidate";
import { processAttribute } from "../transform/mocks/attribute";
import "../jest";

describe("rule map-dup-name", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "map-dup-name": "error" },
		});
	});

	it("should not report error when name is missing or empty", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<map></map>
			<map name></map>
			<map name=""></map>
			<map name="foo"></map>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when name is not a duplicate", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<map name="foo"></map>
			<map name="bar"></map>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when name is dynamic", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<map name="foo"></map>
			<map dynamic-name="foo"></map>
		`;
		const report = htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should report error when name is duplicate", () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<map name="foo"></map>
			<map name="foo"></map>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <map> name must be unique (map-dup-name) at inline:3:9:
			  1 |
			  2 | 			<map name="foo"></map>
			> 3 | 			<map name="foo"></map>
			    | 			     ^^^^
			  4 |
			Selector: map:nth-child(2)"
		`);
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "map-dup-name": "error" },
		});
		const docs = htmlvalidate.getRuleDocumentation("map-dup-name");
		expect(docs).toMatchInlineSnapshot(`
			{
			  "description": "\`<map>\` must have a unique name, it cannot be the same name as another \`<map>\` element",
			  "url": "https://html-validate.org/rules/map-dup-name.html",
			}
		`);
	});
});
