import HtmlValidate from "../htmlvalidate";
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

	it("should not report error for other elements", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<div type="text" step="5"></div>');
		expect(report).toBeValid();
	});

	it("should not report error when attribute is correct", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<input type="number" step="5">');
		expect(report).toBeValid();
	});

	it("should report error when incorrect attribute is used", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<input type="text" step="5">');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"input-attributes",
			'Attribute "step" is not allowed on <input type="text">'
		);
	});

	it("should handle when type is missing", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<input step="5">');
		expect(report).toBeValid();
	});

	it("should handle when type is incomplete", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<input type step="5">');
		expect(report).toBeValid();
	});

	it("should handle when type is dynamic", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<input dynamic-type="type" step="5">', {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "input-attributes": "error" },
		});
		expect(htmlvalidate.getRuleDocumentation("input-attributes")).toMatchSnapshot();
	});

	it("should contain contextual documentation", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "input-attributes": "error" },
		});
		const context = {
			attribute: "alt",
			type: "text",
		};
		expect(htmlvalidate.getRuleDocumentation("input-attributes", null, context)).toMatchSnapshot();
	});

	it("should contain contextual documentation (invalid)", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "input-attributes": "error" },
		});
		const context = {
			attribute: "missing",
			type: "text",
		};
		expect(htmlvalidate.getRuleDocumentation("input-attributes", null, context)).toMatchSnapshot();
	});
});
