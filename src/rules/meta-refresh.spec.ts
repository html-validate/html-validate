import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule meta-refresh", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "meta-refresh": "error" },
		});
	});

	it("should not report error when refresh has 0 delay and url", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString(
			'<meta http-equiv="refresh" content="0;url=target.html">',
		);
		expect(report).toBeValid();
	});

	it("should not report error for other http-equiv", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<meta http-equiv="foo" content="1">');
		expect(report).toBeValid();
	});

	it("should not report error when refresh is missing content attribute", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<meta http-equiv="refresh">');
		expect(report).toBeValid();
	});

	it("should not report error when refresh has boolean content attribute", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<meta http-equiv="refresh" content>');
		expect(report).toBeValid();
	});

	it("should not report error when refresh has empty content attribute", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<meta http-equiv="refresh" content="">');
		expect(report).toBeValid();
	});

	it("should not report error for other elements", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString(
			'<div http-equiv="refresh" content="1;url=target.html"></div>',
		);
		expect(report).toBeValid();
	});

	it("should report error when refresh has non-zero delay", async () => {
		expect.assertions(2);
		const report = await htmlvalidate.validateString(
			'<meta http-equiv="refresh" content="1;url=target.html">',
		);
		expect(report).toBeInvalid();
		expect(report).toHaveError("meta-refresh", "Meta refresh must use 0 second delay");
	});

	it("should report error when refresh has non-zero delay (with whitespace)", async () => {
		expect.assertions(2);
		const report = await htmlvalidate.validateString(
			'<meta http-equiv="refresh" content="1; url=target.html">',
		);
		expect(report).toBeInvalid();
		expect(report).toHaveError("meta-refresh", "Meta refresh must use 0 second delay");
	});

	it("should report error when refresh is missing url", async () => {
		expect.assertions(2);
		const report = await htmlvalidate.validateString('<meta http-equiv="refresh" content="0">');
		expect(report).toBeInvalid();
		expect(report).toHaveError("meta-refresh", "Don't use meta refresh to reload the page");
	});

	it("should report error when refresh has empty url", async () => {
		expect.assertions(2);
		const report = await htmlvalidate.validateString(
			'<meta http-equiv="refresh" content="0;url=">',
		);
		expect(report).toBeInvalid();
		expect(report).toHaveError("meta-refresh", "Don't use meta refresh to reload the page");
	});

	it("should report error when refresh is malformed", async () => {
		expect.assertions(2);
		const report = await htmlvalidate.validateString(
			'<meta http-equiv="refresh" content="foobar">',
		);
		expect(report).toBeInvalid();
		expect(report).toHaveError("meta-refresh", "Malformed meta refresh directive");
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("meta-refresh");
		expect(docs).toMatchSnapshot();
	});
});
