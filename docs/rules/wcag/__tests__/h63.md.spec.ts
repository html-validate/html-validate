import { HtmlValidate } from "../../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect-missing"] = `<table>
    <tr>
        <th></th>
    </tr>
</table>`;
markup["incorrect-auto"] = `<table>
    <tr>
        <!-- auto state cannot be set with a value -->
        <th scope="auto"></th>
    </tr>
</table>`;
markup["correct-row"] = `<table>
    <tr>
        <th scope="row"></th>
    </tr>
</table>`;
markup["correct-col"] = `<table>
    <tr>
        <th scope="col"></th>
    </tr>
</table>`;
markup["correct-rowgroup"] = `<table>
    <tr>
        <th scope="rowgroup"></th>
    </tr>
</table>`;
markup["correct-colgroup"] = `<table>
    <tr>
        <th scope="colgroup"></th>
    </tr>
</table>`;

describe("docs/rules/wcag/h63.md", () => {
	it("inline validation: incorrect-missing", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h63":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect-missing"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: incorrect-auto", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h63":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect-auto"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct-row", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h63":"error"}});
		const report = await htmlvalidate.validateString(markup["correct-row"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct-col", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h63":"error"}});
		const report = await htmlvalidate.validateString(markup["correct-col"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct-rowgroup", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h63":"error"}});
		const report = await htmlvalidate.validateString(markup["correct-rowgroup"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct-colgroup", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h63":"error"}});
		const report = await htmlvalidate.validateString(markup["correct-colgroup"]);
		expect(report.results).toMatchSnapshot();
	});
});
