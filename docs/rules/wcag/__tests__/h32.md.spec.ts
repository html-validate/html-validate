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
	it("inline validation: incorrect", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h32":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h32":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: associated", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h32":"error"}});
		const report = htmlvalidate.validateString(markup["associated"]);
		expect(report.results).toMatchSnapshot();
	});
});
