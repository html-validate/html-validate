import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { processAttribute } from "../transform/mocks/attribute";

describe("rule input-attributes", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "input-attributes": ["error", { style: "lowercase" }] },
		});
	});

	it("should not report error for other elements", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<div type="text" step="5"></div>');
		expect(report).toBeValid();
	});

	it("should not report error when attribute is correct", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<input type="number" step="5">');
		expect(report).toBeValid();
	});

	it("should report error when incorrect attribute is used", async () => {
		expect.assertions(2);
		const report = await htmlvalidate.validateString('<input type="text" step="5">');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"input-attributes",
			'Attribute "step" is not allowed on <input type="text">',
		);
	});

	it("should handle when type is missing", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<input step="5">');
		expect(report).toBeValid();
	});

	it("should handle when type is incomplete", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<input type step="5">');
		expect(report).toBeValid();
	});

	it("should handle when type is dynamic", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<input dynamic-type="type" step="5">', {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "input-attributes": "error" },
		});
		const context = {
			attribute: "alt",
			type: "text",
		};
		const docs = await htmlvalidate.getRuleDocumentation("input-attributes", null, context);
		expect(docs).toMatchSnapshot();
	});

	it("should contain documentation (invalid)", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "input-attributes": "error" },
		});
		const context = {
			attribute: "missing",
			type: "text",
		};
		const docs = await htmlvalidate.getRuleDocumentation("input-attributes", null, context);
		expect(docs).toMatchSnapshot();
	});
});
