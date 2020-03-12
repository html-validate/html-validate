import HtmlValidate from "../htmlvalidate";
import "../matchers";

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

	it('should report error when <label for=".."> is referencing missing element', () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<label for="missing"></label>');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"no-missing-references",
			'Element references missing id "missing"'
		);
	});

	it('should report error when <input list=".."> is referencing missing element', () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<input list="missing">');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"no-missing-references",
			'Element references missing id "missing"'
		);
	});

	it('should report error when <ANY aria-labelledby=".."> is referencing missing element', () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString(
			'<div aria-labelledby="missing"></div>'
		);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"no-missing-references",
			'Element references missing id "missing"'
		);
	});

	it('should report error when <ANY aria-describedby=".."> is referencing missing element', () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString(
			'<div aria-describedby="missing"></div>'
		);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"no-missing-references",
			'Element references missing id "missing"'
		);
	});

	it('should report error when <ANY aria-controls=".."> is referencing missing element', () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString(
			'<div aria-controls="missing"></div>'
		);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"no-missing-references",
			'Element references missing id "missing"'
		);
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "no-missing-references": "error" },
		});
		expect(
			htmlvalidate.getRuleDocumentation("no-missing-references")
		).toMatchSnapshot();
	});

	it("should contain contextual documentation", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "no-missing-references": "error" },
		});
		expect(
			htmlvalidate.getRuleDocumentation("no-missing-references", null, {
				key: "my-attribute",
				value: "my-id",
			})
		).toMatchSnapshot();
	});
});
