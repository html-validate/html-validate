import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule meta-refresh", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "meta-refresh": "error" },
		});
	});

	it("should not report error when refresh has 0 delay and url", () => {
		const report = htmlvalidate.validateString(
			'<meta http-equiv="refresh" content="0;url=target.html">'
		);
		expect(report).toBeValid();
	});

	it("should not report error for other http-equiv", () => {
		const report = htmlvalidate.validateString(
			'<meta http-equiv="foo" content="1">'
		);
		expect(report).toBeValid();
	});

	it("should not report error when refresh is missing content attribute", () => {
		const report = htmlvalidate.validateString('<meta http-equiv="refresh">');
		expect(report).toBeValid();
	});

	it("should not report error when refresh has boolean content attribute", () => {
		const report = htmlvalidate.validateString(
			'<meta http-equiv="refresh" content>'
		);
		expect(report).toBeValid();
	});

	it("should not report error when refresh has empty content attribute", () => {
		const report = htmlvalidate.validateString(
			'<meta http-equiv="refresh" content="">'
		);
		expect(report).toBeValid();
	});

	it("should not report error for other elements", () => {
		const report = htmlvalidate.validateString(
			'<div http-equiv="refresh" content="1;url=target.html"></div>'
		);
		expect(report).toBeValid();
	});

	it("should report error when refresh has non-zero delay", () => {
		const report = htmlvalidate.validateString(
			'<meta http-equiv="refresh" content="1;url=target.html">'
		);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"meta-refresh",
			"Meta refresh must use 0 second delay"
		);
	});

	it("should report error when refresh has non-zero delay (with whitespace)", () => {
		const report = htmlvalidate.validateString(
			'<meta http-equiv="refresh" content="1; url=target.html">'
		);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"meta-refresh",
			"Meta refresh must use 0 second delay"
		);
	});

	it("should report error when refresh is missing url", () => {
		const report = htmlvalidate.validateString(
			'<meta http-equiv="refresh" content="0">'
		);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"meta-refresh",
			"Don't use meta refresh to reload the page"
		);
	});

	it("should report error when refresh has empty url", () => {
		const report = htmlvalidate.validateString(
			'<meta http-equiv="refresh" content="0;url=">'
		);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"meta-refresh",
			"Don't use meta refresh to reload the page"
		);
	});

	it("should report error when refresh is malformed", () => {
		const report = htmlvalidate.validateString(
			'<meta http-equiv="refresh" content="foobar">'
		);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"meta-refresh",
			"Malformed meta refresh directive"
		);
	});

	it("should contain documentation", () => {
		expect(htmlvalidate.getRuleDocumentation("meta-refresh")).toMatchSnapshot();
	});
});
