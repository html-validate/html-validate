import { HtmlValidate } from "../../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect-missing"] = `<table>
    <tr>
        <th>Column A</th>
        <th>Column B</th>
    </tr>
    <tr>
        <!-- complex table with both column and row headers -->
        <th>Row 1</th>
        <td>Row 1</td>
    </tr>
</table>`;
markup["correct-simple"] = `<table>
    <tr>
        <th>Column A</th>
        <th>Column B</th>
    </tr>
    <tr>
        <td>Cell 1</td>
        <td>Cell 2</td>
    </tr>
</table>`;
markup["correct-col"] = `<table>
    <tr>
        <th scope="col">Column A</th>
        <th scope="col">Column B</th>
    </tr>
    <tr>
        <td>Cell 1</td>
        <td>Cell 2</td>
    </tr>
</table>`;
markup["correct-row"] = `<table>
    <tr>
        <th scope="row">Row 1</th>
        <td>Cell 1</td>
        <td>Cell 2</td>
    </tr>
    <tr>
        <th scope="row">Row 2</th>
        <td>Cell 3</td>
        <td>Cell 4</td>
    </tr>
</table>`;

describe("docs/rules/wcag/h63.md", () => {
	it("inline validation: incorrect-missing", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h63":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect-missing"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct-simple", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h63":"error"}});
		const report = await htmlvalidate.validateString(markup["correct-simple"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct-col", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h63":"error"}});
		const report = await htmlvalidate.validateString(markup["correct-col"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct-row", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h63":"error"}});
		const report = await htmlvalidate.validateString(markup["correct-row"]);
		expect(report.results).toMatchSnapshot();
	});
});
