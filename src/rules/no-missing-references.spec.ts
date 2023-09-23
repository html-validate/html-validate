import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule no-missing-references", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "no-missing-references": "error" },
		});
	});

	it('should not report error when <label for=".."> is referencing existing element', () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString(
			'<label for="existing"></label><input id="existing">'
		);
		expect(report).toBeValid();
	});

	it('should not report error when <input list=".."> is referencing existing element', () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString(
			'<input list="existing"><datalist id="existing"></datalist>'
		);
		expect(report).toBeValid();
	});

	it('should not report error when <ANY aria-labelledby=".."> is referencing existing element', () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString(
			'<div aria-labelledby="existing"></div><span id="existing"></span>'
		);
		expect(report).toBeValid();
	});

	it('should not report error when <ANY aria-describedby=".."> is referencing existing element', () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString(
			'<div aria-describedby="existing"></div><span id="existing"></span>'
		);
		expect(report).toBeValid();
	});

	it('should not report error when <ANY aria-controls=".."> is referencing existing element', () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString(
			'<div aria-controls="existing"></div><span id="existing"></span>'
		);
		expect(report).toBeValid();
	});

	it("should not report error when reference is omitted", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<label for></label>");
		expect(report).toBeValid();
	});

	it("should not report error when reference is empty string", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<label for=""></label>');
		expect(report).toBeValid();
	});

	it("should not report error when reference is <title> element in <svg>", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div aria-labelledby="existing"></div>
			<svg>
				<title id="existing">lorem ipsum</title>
			</svg>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when reference is <desc> element in <svg>", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div aria-labelledby="existing"></div>
			<svg>
				<desc id="existing">lorem ipsum</desc>
			</svg>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it('should report error when <label for=".."> is referencing missing element', () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<label for="missing"></label>');
		expect(report).toBeInvalid();
		expect(report).toHaveError("no-missing-references", 'Element references missing id "missing"');
	});

	it('should report error when <input list=".."> is referencing missing element', () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<input list="missing">');
		expect(report).toBeInvalid();
		expect(report).toHaveError("no-missing-references", 'Element references missing id "missing"');
	});

	it('should report error when <ANY aria-activedescendant=".."> is referencing missing element', () => {
		expect.assertions(2);
		const markup = '<div aria-activedescendant="missing id"></div>';
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveErrors([
			{ ruleId: "no-missing-references", message: 'Element references missing id "missing id"' },
		]);
	});

	it('should report error when <ANY aria-labelledby=".."> is referencing missing element', () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<div aria-labelledby="missing id"></div>');
		expect(report).toBeInvalid();
		expect(report).toHaveErrors([
			{ ruleId: "no-missing-references", message: 'Element references missing id "missing"' },
			{ ruleId: "no-missing-references", message: 'Element references missing id "id"' },
		]);
	});

	it('should report error when <ANY aria-describedby=".."> is referencing missing element', () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<div aria-describedby="missing id"></div>');
		expect(report).toBeInvalid();
		expect(report).toHaveErrors([
			{ ruleId: "no-missing-references", message: 'Element references missing id "missing"' },
			{ ruleId: "no-missing-references", message: 'Element references missing id "id"' },
		]);
	});

	it('should report error when <ANY aria-controls=".."> is referencing missing element', () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<div aria-controls="missing id"></div>');
		expect(report).toBeInvalid();
		expect(report).toHaveErrors([
			{ ruleId: "no-missing-references", message: 'Element references missing id "missing"' },
			{ ruleId: "no-missing-references", message: 'Element references missing id "id"' },
		]);
	});

	it('should report error when <ANY aria-details=".."> is referencing missing element', () => {
		expect.assertions(2);
		const markup = '<div aria-details="missing id"></div>';
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveErrors([
			{ ruleId: "no-missing-references", message: 'Element references missing id "missing id"' },
		]);
	});

	it('should report error when <ANY aria-errormessage=".."> is referencing missing element', () => {
		expect.assertions(2);
		const markup = '<div aria-errormessage="missing id"></div>';
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveErrors([
			{ ruleId: "no-missing-references", message: 'Element references missing id "missing id"' },
		]);
	});

	it('should report error when <ANY aria-flowto=".."> is referencing missing element', () => {
		expect.assertions(2);
		const markup = '<div aria-flowto="foo bar baz"></div><span id="bar"></span>';
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveErrors([
			{ ruleId: "no-missing-references", message: 'Element references missing id "foo"' },
			{ ruleId: "no-missing-references", message: 'Element references missing id "baz"' },
		]);
	});

	it('should report error when <ANY aria-owns=".."> is referencing missing element', () => {
		expect.assertions(2);
		const markup = '<div aria-owns="foo bar baz"></div><span id="bar"></span>';
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveErrors([
			{ ruleId: "no-missing-references", message: 'Element references missing id "foo"' },
			{ ruleId: "no-missing-references", message: 'Element references missing id "baz"' },
		]);
	});

	it("should handle colon in id", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<label for=":r1:">lorem ipsum</label>
			<input id=":r1:" />
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "no-missing-references": "error" },
		});
		const docs = await htmlvalidate.getRuleDocumentation("no-missing-references", null, {
			key: "my-attribute",
			value: "my-id",
		});
		expect(docs).toMatchSnapshot();
	});
});
