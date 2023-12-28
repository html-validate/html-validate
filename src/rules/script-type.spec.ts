import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { processAttribute } from "../transform/mocks/attribute";

describe("rule script-type", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "script-type": "error" },
		});
	});

	it("should not report when script element has implied type", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString("<script></script>");
		expect(report).toBeValid();
	});

	it("should not report when script element has module type", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<script type="module"></script>');
		expect(report).toBeValid();
	});

	it("should not report when script element has non-js type", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<script type="text/plain"></script>');
		expect(report).toBeValid();
	});

	it("should not report error for dynamic attributes", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<script dynamic-type="type">', {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should not report for other elements", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<p type="module"></p>');
		expect(report).toBeValid();
	});

	it("should report when script element have empty type", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<script type=""></script>');
		expect(report).toHaveError(
			"script-type",
			'"type" attribute is unnecessary for javascript resources',
		);
	});

	it("should report when script element have javascript type", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<script type="text/javascript"></script>');
		expect(report).toHaveError(
			"script-type",
			'"type" attribute is unnecessary for javascript resources',
		);
	});

	it("should report when script element have javascript type with parameter", async () => {
		expect.assertions(1);
		const markup = '<script type="text/javascript;charset=utf-8"></script>';
		const report = await htmlvalidate.validateString(markup);
		expect(report).toHaveError(
			"script-type",
			'"type" attribute is unnecessary for javascript resources',
		);
	});

	it("should report when script element have legacy javascript type", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<script type="text/javascript"></script>');
		expect(report).toHaveError(
			"script-type",
			'"type" attribute is unnecessary for javascript resources',
		);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("script-type");
		expect(docs).toMatchSnapshot();
	});
});
