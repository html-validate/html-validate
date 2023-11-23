import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { MetaDataTable } from "../meta";
import { processAttribute } from "../transform/mocks/attribute";

const metadata: MetaDataTable = {
	"mock-element": {
		attributes: {
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

	it("should report error when element has invalid attribute value", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<input type="foobar">');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"attribute-allowed-values",
			'Attribute "type" has invalid value "foobar"',
		);
	});

	it("should report error when element has invalid boolean attribute value", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<input type>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("attribute-allowed-values", 'Attribute "type" is missing value');
	});

	it("should report error when element attribute should be boolean", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<input required="foobar">');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"attribute-allowed-values",
			'Attribute "required" has invalid value "foobar"',
		);
	});

	it("should not report error when element has valid attribute value", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<input type="text">');
		expect(report).toBeValid();
	});

	it("should not report error when element is missing meta", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<foo-bar type="text">');
		expect(report).toBeValid();
	});

	it("should not report error when element has no attribute specification", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<div id="text">');
		expect(report).toBeValid();
	});

	it("should not report error when attribute value is uppercase", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<input type="TEXT">');
		expect(report).toBeValid();
	});

	it("should not report error when attribute is dynamic", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString(
			'<input type="{{ interpolated }}" required="{{ interpolated }}"><input dynamic-type="dynamic" dynamic-required="dynamic">',

			{
				processAttribute,
			},
		);
		expect(report).toBeValid();
	});

	it("should not report error when element allows empty value and attribute is null", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<a download>");
		expect(report).toBeValid();
	});

	it("should not report error when element allows empty value and attribute is empty string", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<a download="">');
		expect(report).toBeValid();
	});

	it("should not report error when element allows empty and other values and attribute is non-empty string", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<a download="foobar">');
		expect(report).toBeValid();
	});

	it("should support case-insensitive comparison", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString(
			[
				'<mock-element case-insensitive="foo"></mock-element>',
				'<mock-element case-insensitive="FOO"></mock-element>',
				'<mock-element case-insensitive="Foo"></mock-element>',
			].join("\n"),
		);
		expect(report).toBeValid();
	});

	it("smoketest", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateFile("test-files/rules/attribute-allowed-values.html");
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

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("attribute-allowed-values");
		expect(docs).toMatchSnapshot();
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
		const docs = await htmlvalidate.getRuleDocumentation("attribute-allowed-values", null, context);
		expect(docs).toMatchSnapshot();
	});
});
