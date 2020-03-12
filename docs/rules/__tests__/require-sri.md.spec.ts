import HtmlValidate from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<script href="//cdn.example.net/jquery.min.js"></script>`;
markup["correct"] = `<script href="//cdn.example.net/jquery.min.js" integrity="sha384-..."></script>`;
markup["crossorigin"] = `<!--- local resource -->
<link href="local.css">

<!-- resource loaded over CDN -->
<link href="//cdn.example.net/remote.css">`;

describe("docs/rules/require-sri.md", () => {
	it("inline validation: incorrect", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"require-sri":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"require-sri":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: crossorigin", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"require-sri":["error",{"target":"crossdomain"}]}});
		const report = htmlvalidate.validateString(markup["crossorigin"]);
		expect(report.results).toMatchSnapshot();
	});
});
