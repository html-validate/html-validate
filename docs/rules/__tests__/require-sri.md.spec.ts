import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect"] = `<script src="//cdn.example.net/jquery.min.js"></script>`;
markup["correct"] = `<script src="//cdn.example.net/jquery.min.js" integrity="sha384-..."></script>`;
markup["crossorigin"] = `<!--- local resource -->
<link rel="stylesheet" href="local.css">

<!-- resource loaded over CDN -->
<link rel="stylesheet" href="//cdn.example.net/remote.css">`;
markup["include-option"] = `<!-- matches included pattern, yields error -->
<link rel="stylesheet" href="//cdn.example.net/remote.css" />
<!-- doesn't match, no error -->
<link rel="stylesheet" href="//static-assets.example.org/remote.css" />`;
markup["exclude-option"] = `<!-- doesn't match excluded pattern, yields error -->
<link rel="stylesheet" href="//cdn.example.net/remote.css">
<!-- matches excluded pattern, no error -->
<link rel="stylesheet" href="//static-assets.example.org/remote.css">`;

describe("docs/rules/require-sri.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"require-sri":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"require-sri":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: crossorigin", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"require-sri":["error",{"target":"crossorigin"}]}});
		const report = await htmlvalidate.validateString(markup["crossorigin"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: include-option", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"require-sri":["error",{"include":["//cdn.example.net/"]}]}});
		const report = await htmlvalidate.validateString(markup["include-option"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: exclude-option", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"require-sri":["error",{"exclude":["//cdn.example.net/"]}]}});
		const report = await htmlvalidate.validateString(markup["exclude-option"]);
		expect(report.results).toMatchSnapshot();
	});
});
