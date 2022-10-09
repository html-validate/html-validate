import HtmlValidate from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<!-- no label element at all -->
<div>
    <strong>My input field</strong>
    <input type="text">

    <textarea></textarea>

    <select>
        <option>Option</option>
    </select>
</div>

<!-- unassociated label -->
<div>
    <label>My input field</label>
    <input type="text">
</div>`;
markup["correct"] = `<!-- label with descendant -->
<div>
    <label>My field <input type="text"></label>
</div>

<!-- associated label -->
<div>
    <label for="my-field">My field</label>
    <input id="my-field" type="text">
</div>`;
markup["hidden"] = `<label for="my-input" aria-hidden="true">My field</label>
<input id="my-input" type="text">`;
markup["aria-label"] = `<div>
    <input id="my-input" type="text" aria-label="My field">
    <svg><use xlink:href="#search-icon"></svg>
</div>`;
markup["aria-labelledby"] = `<h2 id="my-heading">Enter your name</h2>
<input type="text" aria-labelledby="my-heading">`;

describe("docs/rules/input-missing-label.md", () => {
	it("inline validation: incorrect", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"input-missing-label":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"input-missing-label":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: hidden", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"input-missing-label":"error"}});
		const report = htmlvalidate.validateString(markup["hidden"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: aria-label", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"input-missing-label":"error"}});
		const report = htmlvalidate.validateString(markup["aria-label"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: aria-labelledby", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"input-missing-label":"error"}});
		const report = htmlvalidate.validateString(markup["aria-labelledby"]);
		expect(report.results).toMatchSnapshot();
	});
});
