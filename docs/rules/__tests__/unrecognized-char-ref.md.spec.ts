import HtmlValidate from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<p>&foobar;</p>`;
markup["correct"] = `<p>&amp;</p>`;
markup["disabled-ignore-case"] = `<p>&Amp;</p>`;
markup["enabled-ignore-case"] = `<p>&Amp;</p>`;

describe("docs/rules/unrecognized-char-ref.md", () => {
	it("inline validation: incorrect", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"unrecognized-char-ref":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"unrecognized-char-ref":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: disabled-ignore-case", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"unrecognized-char-ref":["error",{"ignoreCase":false}]}});
		const report = htmlvalidate.validateString(markup["disabled-ignore-case"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: enabled-ignore-case", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"unrecognized-char-ref":["error",{"ignoreCase":true}]}});
		const report = htmlvalidate.validateString(markup["enabled-ignore-case"]);
		expect(report.results).toMatchSnapshot();
	});
});
