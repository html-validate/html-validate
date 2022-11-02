import HtmlValidate from "../../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect-missing"] = `<th></th>`;
markup["incorrect-auto"] = `<!-- auto state cannot be set with a value -->
<th scope="auto"></th>`;
markup["correct-row"] = `<th scope="row"></th>`;
markup["correct-col"] = `<th scope="col"></th>`;
markup["correct-rowgroup"] = `<th scope="rowgroup"></th>`;
markup["correct-colgroup"] = `<th scope="colgroup"></th>`;

describe("docs/rules/wcag/h63.md", () => {
	it("inline validation: incorrect-missing", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h63":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect-missing"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: incorrect-auto", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h63":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect-auto"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct-row", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h63":"error"}});
		const report = htmlvalidate.validateString(markup["correct-row"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct-col", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h63":"error"}});
		const report = htmlvalidate.validateString(markup["correct-col"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct-rowgroup", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h63":"error"}});
		const report = htmlvalidate.validateString(markup["correct-rowgroup"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct-colgroup", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h63":"error"}});
		const report = htmlvalidate.validateString(markup["correct-colgroup"]);
		expect(report.results).toMatchSnapshot();
	});
});
