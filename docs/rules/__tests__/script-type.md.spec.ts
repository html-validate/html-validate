import HtmlValidate from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<script type=""></script>
<script type="text/javascript"></script>
<script type="application/javascript"></script>`;
markup["correct"] = `<script></script>
<script type="module"></script>
<script type="text/plain"></script>
<script type="text/x-custom"></script>`;

describe("docs/rules/script-type.md", () => {
	it("inline validation: incorrect", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"script-type":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"script-type":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
