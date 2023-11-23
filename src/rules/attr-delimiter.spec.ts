import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule attr-delimiter", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "attr-delimiter": ["error"] },
		});
	});

	it("should not report when attributes have proper delimiter", () => {
		expect.assertions(1);
		const markup = `<i foo="1" bar='2'></i>`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should handle boolean attributes", () => {
		expect.assertions(1);
		const markup = "<i foo bar></i>";
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when equal sign has leading whitespace", () => {
		expect.assertions(2);
		const markup = '<i foo ="1"></i>';
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"attr-delimiter",
			"Attribute value must not be delimited by whitespace",
		);
	});

	it("should report error when equal sign has trailing whitespace", () => {
		expect.assertions(2);
		const markup = '<i foo= "1"></i>';
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"attr-delimiter",
			"Attribute value must not be delimited by whitespace",
		);
	});

	it("should handle single quote", () => {
		expect.assertions(2);
		const markup = "<i foo = '1'></i>";
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"attr-delimiter",
			"Attribute value must not be delimited by whitespace",
		);
	});

	it("should handle unquoted value", () => {
		expect.assertions(2);
		const markup = "<i foo = bar></i>";
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"attr-delimiter",
			"Attribute value must not be delimited by whitespace",
		);
	});

	it("should handle spaces in value", () => {
		expect.assertions(1);
		const markup = '<i foo=" foo bar "></i>';
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("attr-delimiter");
		expect(docs).toMatchSnapshot();
	});
});
