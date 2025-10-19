import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { type MetaDataTable } from "../meta";
import { processAttribute } from "../transform/mocks/attribute";

const metadata: MetaDataTable = {
	"mock-element": {
		attributes: {
			"non-empty": {
				enum: ["/.+/"],
			},
			"case-insensitive": {
				enum: ["/foo/i"],
			},
		},
	},
};

describe("rule attribute-allowed-values", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			elements: ["html5", metadata],
			rules: { "attribute-allowed-values": "error" },
		});
	});

	it("should report error when element has invalid attribute value", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <input type="foobar" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Attribute "type" has invalid value "foobar" (attribute-allowed-values) at inline:1:15:
			> 1 |  <input type="foobar" />
			    |               ^^^^^^
			Selector: input"
		`);
	});

	it("should report error when element has invalid boolean attribute value", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <input type /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Attribute "type" is missing value (attribute-allowed-values) at inline:1:9:
			> 1 |  <input type />
			    |         ^^^^
			Selector: input"
		`);
	});

	it("should report error when element attribute should be boolean", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <input required="foobar" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Attribute "required" has invalid value "foobar" (attribute-allowed-values) at inline:1:19:
			> 1 |  <input required="foobar" />
			    |                   ^^^^^^
			Selector: input"
		`);
	});

	it("should report error when non-empty attribute is empty", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <mock-element non-empty=""></mock-element> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Attribute "non-empty" has invalid value "" (attribute-allowed-values) at inline:1:16:
			> 1 |  <mock-element non-empty=""></mock-element>
			    |                ^^^^^^^^^
			Selector: mock-element"
		`);
	});

	it("should not report error when element has valid attribute value", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <input type="text" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when element is missing meta", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <foo-bar type="text"> </foo-bar> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when element has no attribute specification", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <div id="text"></div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when attribute value is uppercase", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <input type="TEXT" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when attribute is dynamic", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<input type="{{ interpolated }}" required="{{ interpolated }}" />
			<input dynamic-type="dynamic" dynamic-required="dynamic" />
		`;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should not report error when element allows empty value and attribute is null", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <a download> </a> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when element allows empty value and attribute is empty string", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <a download=""> </a> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when element allows empty and other values and attribute is non-empty string", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <a download="foobar"> </a> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should support case-insensitive comparison", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<mock-element case-insensitive="foo"></mock-element>
			<mock-element case-insensitive="FOO"></mock-element>
			<mock-element case-insensitive="Foo"></mock-element>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile(
			"test-files/rules/attribute-allowed-values.html",
		);
		expect(report).toMatchInlineCodeframe(`
			"error: Attribute "type" has invalid value "foobar" (attribute-allowed-values) at test-files/rules/attribute-allowed-values.html:3:14:
			  1 | <input>
			  2 | <input type="text">
			> 3 | <input type="foobar">
			    |              ^^^^^^
			  4 |
			  5 | <!-- rule should normalize boolean attributes -->
			  6 | <input required>
			Selector: input:nth-child(3)"
		`);
	});

	it("should contain contextual documentation", async () => {
		expect.assertions(1);
		const context = {
			element: "any",
			attribute: "foo",
			value: "bar",
			allowed: {
				enum: ["spam", "ham", /\d+/],
			},
		};
		/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
		const docs = await htmlvalidate.getRuleDocumentation("attribute-allowed-values", null, context);
		expect(docs).toMatchSnapshot();
	});

	it("should contain contextual documentation when attribute should be boolean", async () => {
		expect.assertions(1);
		const context = {
			element: "any",
			attribute: "foo",
			value: "bar",
			allowed: {
				boolean: true,
			},
		};
		/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
		const docs = await htmlvalidate.getRuleDocumentation("attribute-allowed-values", null, context);
		expect(docs).toMatchSnapshot();
	});

	it("contain contextual documentation when attribute is omitted", async () => {
		expect.assertions(1);
		const context = {
			element: "any",
			attribute: "foo",
			value: "bar",
			allowed: {
				omit: true,
			},
		};
		/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
		const docs = await htmlvalidate.getRuleDocumentation("attribute-allowed-values", null, context);
		expect(docs).toMatchSnapshot();
	});
});
