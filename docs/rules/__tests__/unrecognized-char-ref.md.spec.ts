import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect"] = `<p>&foobar;</p>`;
markup["correct"] = `<p>&amp;</p>`;
markup["disabled-ignore-case"] = `<p>&Amp;</p>`;
markup["enabled-ignore-case"] = `<p>&Amp;</p>`;
markup["enabled-require-semicolon"] = `<p>&copy</p>`;
markup["disabled-require-semicolon"] = `<p>&copy</p>`;
markup["querystring"] = `<a href="foo.php?foo=1&bar=2">...</a>`;

describe("docs/rules/unrecognized-char-ref.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"unrecognized-char-ref":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"unrecognized-char-ref":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: disabled-ignore-case", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"unrecognized-char-ref":["error",{"ignoreCase":false}]}});
		const report = await htmlvalidate.validateString(markup["disabled-ignore-case"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: enabled-ignore-case", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"unrecognized-char-ref":["error",{"ignoreCase":true}]}});
		const report = await htmlvalidate.validateString(markup["enabled-ignore-case"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: enabled-require-semicolon", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"unrecognized-char-ref":["error",{"requireSemicolon":true}]}});
		const report = await htmlvalidate.validateString(markup["enabled-require-semicolon"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: disabled-require-semicolon", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"unrecognized-char-ref":["error",{"requireSemicolon":false}]}});
		const report = await htmlvalidate.validateString(markup["disabled-require-semicolon"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: querystring", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"unrecognized-char-ref":"error"}});
		const report = await htmlvalidate.validateString(markup["querystring"]);
		expect(report.results).toMatchSnapshot();
	});
});
