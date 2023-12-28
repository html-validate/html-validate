import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { processAttribute } from "../transform/mocks/attribute";

describe("rule id-pattern", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "id-pattern": "error" },
		});
	});

	it("should not report error when id follows pattern", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p id="foo-bar"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when id is interpolated", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p id="{{ interpolated }}"></p> `;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should report error when id does not follow pattern", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <p id="fooBar"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: ID "fooBar" does not match required pattern "/^[a-z0-9-]+$/" (id-pattern) at inline:1:9:
			> 1 |  <p id="fooBar"></p>
			    |         ^^^^^^
			Selector: #fooBar"
		`);
	});

	it("should report error when id is empty string", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <p id=""></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: ID "" does not match required pattern "/^[a-z0-9-]+$/" (id-pattern) at inline:1:5:
			> 1 |  <p id=""></p>
			    |     ^^^^^
			Selector: p"
		`);
	});

	it("should report error when id is omitted", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <p id></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: ID "" does not match required pattern "/^[a-z0-9-]+$/" (id-pattern) at inline:1:5:
			> 1 |  <p id></p>
			    |     ^^
			Selector: p"
		`);
	});

	it("should ignore other attributes", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p spam="fooBar"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile("test-files/rules/id-pattern.html");
		expect(report).toMatchInlineCodeframe(`
			"error: ID "foo_bar" does not match required pattern "/^[a-z0-9-]+$/" (id-pattern) at test-files/rules/id-pattern.html:3:10:
			  1 | <div id="foo-bar"></div>
			  2 |
			> 3 | <div id="foo_bar"></div>
			    |          ^^^^^^^
			  4 |
			  5 | <div id="fooBar"></div>
			  6 |
			Selector: #foo_bar
			error: ID "fooBar" does not match required pattern "/^[a-z0-9-]+$/" (id-pattern) at test-files/rules/id-pattern.html:5:10:
			  3 | <div id="foo_bar"></div>
			  4 |
			> 5 | <div id="fooBar"></div>
			    |          ^^^^^^
			  6 |
			Selector: #fooBar"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("id-pattern");
		expect(docs).toMatchSnapshot();
	});
});
