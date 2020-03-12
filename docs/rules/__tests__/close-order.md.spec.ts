import HtmlValidate from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect-1"] = `<!-- closed in wrong order -->
<p><strong></p></strong>`;
markup["incorrect-2"] = `<!-- opened but not closed -->
<div>`;
markup["incorrect-3"] = `<!-- closed but not opened -->
</div>`;
markup["correct-1"] = `<p><strong></strong></p>`;
markup["correct-2"] = `<div></div>`;

describe("docs/rules/close-order.md", () => {
	it("inline validation: incorrect-1", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"close-order":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect-1"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: incorrect-2", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"close-order":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect-2"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: incorrect-3", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"close-order":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect-3"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct-1", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"close-order":"error"}});
		const report = htmlvalidate.validateString(markup["correct-1"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct-2", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"close-order":"error"}});
		const report = htmlvalidate.validateString(markup["correct-2"]);
		expect(report.results).toMatchSnapshot();
	});
});
