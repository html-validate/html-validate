import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule multiple-labeled-controls", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "multiple-labeled-controls": "error" },
		});
	});

	it("should not report when <label> has no controls", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString("<label></label>");
		expect(report).toBeValid();
	});

	it("should not report when <label> has one wrapped control", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString("<labe><input></label>");
		expect(report).toBeValid();
	});

	it("should not report when <label> has one referenced control", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<label for="foo"></label><input id="foo">');
		expect(report).toBeValid();
	});

	it("should not report when <label> both references and wraps a single control", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<label for="foo"><input id="foo"></label>');
		expect(report).toBeValid();
	});

	it("should not report error for other elements", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString(
			'<custom-element for="bar"><input id="foo"></custom-element><input id="bar">',
		);
		expect(report).toBeValid();
	});

	it("should report error when <label> have multiple wrapped controls", async () => {
		expect.assertions(2);
		const report = await htmlvalidate.validateString("<label><input><input></label>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"multiple-labeled-controls",
			"<label> is associated with multiple controls",
		);
	});

	it("should report error when <label> have both for attribute and another wrapped control", async () => {
		expect.assertions(2);
		const report = await htmlvalidate.validateString(
			'<label for="bar"><input id="foo"></label><input id="bar">',
		);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"multiple-labeled-controls",
			"<label> is associated with multiple controls",
		);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("multiple-labeled-controls");
		expect(docs).toMatchSnapshot();
	});
});
