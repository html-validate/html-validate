import { HtmlValidate } from "../../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect"] = `<input type="image" src="submit-button.png">`;
markup["correct"] = `<input type="image" src="submit-button.png" alt="Submit Button">`;

describe("docs/rules/wcag/h36.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h36":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h36":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
