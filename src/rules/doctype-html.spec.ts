import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule doctype-html", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "doctype-html": "error" },
		});
	});

	it("should not report when correct doctype is used", () => {
		const report = htmlvalidate.validateString("<!DOCTYPE html>");
		expect(report).toBeValid();
	});

	it("should not report when doctype is uppercase", () => {
		const report = htmlvalidate.validateString("<!DOCTYPE HTML>");
		expect(report).toBeValid();
	});

	it("should report error when older doctype is used", () => {
		const html =
			'<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">';
		const report = htmlvalidate.validateString(html);
		expect(report).toBeInvalid();
		expect(report).toHaveError("doctype-html", 'doctype should be "html"');
	});

	it("should report error when doctype has legacy string", () => {
		const html = '<!DOCTYPE html SYSTEM "about:legacy-compat">';
		const report = htmlvalidate.validateString(html);
		expect(report).toBeInvalid();
		expect(report).toHaveError("doctype-html", 'doctype should be "html"');
	});

	it("should contain documentation", () => {
		expect(htmlvalidate.getRuleDocumentation("doctype-html")).toMatchSnapshot();
	});
});
