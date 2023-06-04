import { HtmlValidate } from "../../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<form>
    <label>
        Text field: <input type="text">
    </label>
</form>`;
markup["correct"] = `<form>
    <label>
        Text field: <input type="text">
    </label>
    <button type="submit">Submit</button>
</form>`;
markup["associated"] = `<form id="my-form">
    ...
</form>
<button form="my-form" type="submit">Submit</button>`;

describe("docs/rules/wcag/h32.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h32":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h32":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: associated", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h32":"error"}});
		const report = await htmlvalidate.validateString(markup["associated"]);
		expect(report.results).toMatchSnapshot();
	});
});
