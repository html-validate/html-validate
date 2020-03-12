import HtmlValidate from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect-delay"] = `<meta http-equiv="refresh" content="5;url=target.html">`;
markup["incorrect-url"] = `<meta http-equiv="refresh" content="0">`;
markup["correct"] = `<meta http-equiv="refresh" content="0;url=target.html">`;

describe("docs/rules/meta-refresh.md", () => {
	it("inline validation: incorrect-delay", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"meta-refresh":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect-delay"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: incorrect-url", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"meta-refresh":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect-url"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"meta-refresh":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
