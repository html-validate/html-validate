import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<!--[if IE]>
<p>You are using Internet Explorer.</p>
<![endif]-->

<![if !IE]>
<p>You are not using Internet Explorer.</p>
<![endif]>`;

describe("docs/rules/no-conditional-comment.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-conditional-comment":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
});
