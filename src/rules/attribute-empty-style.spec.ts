import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { processAttribute } from "../transform/mocks/attribute";

describe("rule attribute-empty-style", () => {
	let htmlvalidate: HtmlValidate;

	it("should not report unknown elements", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "attribute-empty-style": ["error", { style: "omit" }] },
		});
		const markup = /* HTML */ ` <custom-element foobar=""></custom-element> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report unknown attributes", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "attribute-empty-style": ["error", { style: "omit" }] },
		});
		const markup = /* HTML */ ` <a foobar=""></a> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	describe('configured with "omit"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "attribute-empty-style": ["error", { style: "omit" }] },
			});
		});

		it("should report error when value is empty string", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <a download=""></a> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toHaveError("attribute-empty-style", 'Attribute "download" should omit value');
		});

		it("should not report error when value is omitted", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <a download></a> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error for non-empty attributes", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <a download="file.txt"></a> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error for boolean attributes", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <input required="" /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when attribute is interpolated", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <a download="{{ dynamic }}"> </a> `;
			const report = await htmlvalidate.validateString(markup, {
				processAttribute,
			});
			expect(report).toBeValid();
		});

		it("should not report error when attribute is dynamic", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <input dynamic-required="dynamic" /> `;
			const report = await htmlvalidate.validateString(markup, {
				processAttribute,
			});
			expect(report).toBeValid();
		});
	});

	describe('configured with "empty"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "attribute-empty-style": ["error", { style: "empty" }] },
			});
		});

		it("should report error when value is omitted", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <a download></a> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"attribute-empty-style",
				'Attribute "download" value should be empty string',
			);
		});

		it("should not report error when value is empty string", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <a download=""></a> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error for non-empty attributes", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <a download="file.txt"></a> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error for boolean attributes", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <input required="" /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when attribute is interpolated", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <a download="{{ dynamic }}"> </a> `;
			const report = await htmlvalidate.validateString(markup, {
				processAttribute,
			});
			expect(report).toBeValid();
		});

		it("should not report error when attribute is dynamic", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <input dynamic-required="dynamic" /> `;
			const report = await htmlvalidate.validateString(markup, {
				processAttribute,
			});
			expect(report).toBeValid();
		});
	});

	it("should throw error if configured with invalid value", async () => {
		expect.assertions(1);
		expect(() => {
			return new HtmlValidate({
				rules: { "attribute-empty-style": ["error", { style: "foobar" }] },
			});
		}).toThrowErrorMatchingInlineSnapshot(
			`"Rule configuration error: /rules/attribute-empty-style/1/style must be equal to one of the allowed values: empty, omit"`,
		);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "attribute-empty-style": "error" },
		});
		const docs = await htmlvalidate.getRuleDocumentation("attribute-empty-style");
		expect(docs).toMatchSnapshot();
	});
});
