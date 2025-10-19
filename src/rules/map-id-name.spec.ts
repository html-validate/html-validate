import { HtmlValidate } from "../htmlvalidate";
import { processAttribute } from "../transform/mocks/attribute";
import "../jest";

describe("rule map-id-name", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "map-id-name": "error" },
		});
	});

	it("should not report error when id and name is the same", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <map name="foo" id="foo"></map> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for other elements", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <a name="foo" id="bar"></a> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when id is unset", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <map name="foo"></map> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when both name and id is unset", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<map name id></map>
			<map name="" id=""></map>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when name is dynamic", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <map dynamic-name="expr" id="foo"></map> `;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should not report when id is dynamic", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <map name="foo" dynamic-id="expr"></map> `;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should report error when id is different from name", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <map name="foo" id="bar"></map> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "id" and "name" attribute must be the same on <map> elements (map-id-name) at inline:1:22:
			> 1 |  <map name="foo" id="bar"></map>
			    |                      ^^^
			Selector: #bar"
		`);
	});

	it("should report error when name is empty", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<map name id="foo"></map>
			<map name="" id="bar"></map>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "id" and "name" attribute must be the same on <map> elements (map-id-name) at inline:2:18:
			  1 |
			> 2 | 			<map name id="foo"></map>
			    | 			              ^^^
			  3 | 			<map name="" id="bar"></map>
			  4 |
			Selector: #foo
			error: "id" and "name" attribute must be the same on <map> elements (map-id-name) at inline:3:21:
			  1 |
			  2 | 			<map name id="foo"></map>
			> 3 | 			<map name="" id="bar"></map>
			    | 			                 ^^^
			  4 |
			Selector: #bar"
		`);
	});

	it("should report error when id is empty", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<map name="foo" id></map>
			<map name="bar" id=""></map>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "id" and "name" attribute must be the same on <map> elements (map-id-name) at inline:2:15:
			  1 |
			> 2 | 			<map name="foo" id></map>
			    | 			           ^^^
			  3 | 			<map name="bar" id=""></map>
			  4 |
			Selector: map:nth-child(1)
			error: "id" and "name" attribute must be the same on <map> elements (map-id-name) at inline:3:15:
			  1 |
			  2 | 			<map name="foo" id></map>
			> 3 | 			<map name="bar" id=""></map>
			    | 			           ^^^
			  4 |
			Selector: map:nth-child(2)"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "map-id-name": "error" },
		});
		/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
		const docs = await htmlvalidate.getRuleDocumentation("map-id-name");
		expect(docs).toMatchInlineSnapshot(`
			{
			  "description": "When the \`id\` attribute is present on a \`<map>\` element it must be equal to the \`name\` attribute.",
			  "url": "https://html-validate.org/rules/map-id-name.html",
			}
		`);
	});
});
