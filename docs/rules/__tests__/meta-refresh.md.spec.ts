import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect-delay"] = `<meta http-equiv="refresh" content="5;url=target.html">`;
markup["incorrect-url"] = `<meta http-equiv="refresh" content="0">`;
markup["correct"] = `<meta http-equiv="refresh" content="0;url=target.html">`;
markup["long-delay-invalid"] = `<meta http-equiv="refresh" content="72001">`;
markup["long-delay-valid"] = `<meta http-equiv="refresh" content="72001">`;

describe("docs/rules/meta-refresh.md", () => {
	it("inline validation: incorrect-delay", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"meta-refresh":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect-delay"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: incorrect-url", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"meta-refresh":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect-url"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"meta-refresh":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: long-delay-invalid", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"meta-refresh":["error",{"allowLongDelay":false}]}});
		const report = await htmlvalidate.validateString(markup["long-delay-invalid"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: long-delay-valid", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"meta-refresh":["error",{"allowLongDelay":true}]}});
		const report = await htmlvalidate.validateString(markup["long-delay-valid"]);
		expect(report.results).toMatchSnapshot();
	});
});
