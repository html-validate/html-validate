import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect-stray-endtag"] = `<main>
		<label>Lorem ipsum</label>
	</div> <!-- div closed but never opened -->
</main>`;
markup["incorrect-missing-endtag"] = `<main>
	<h1> <!-- h1 opened but not closed -->
		Lorem ipsum <small>dolor sit amet</small>
</main>`;
markup["incorrect-wrong-endtag"] = `<main>
	<h1>
		Lorem ipsum <small>dolor sit amet</small>
	</h1>
</div> <!-- opened as main but closed as div -->`;
markup["incorrect-out-of-order"] = `<div>
	<!-- closed in wrong order -->
	<p>
		<strong>
	</p>
		</strong>
</div>`;
markup["incorrect-incorrect-implicit"] = `<p>
	<address></address>
</p> <!-- p is already implicitly closed by address tag -->`;
markup["correct-1"] = `<p><strong></strong></p>`;
markup["correct-2"] = `<div></div>`;

describe("docs/rules/close-order.md", () => {
	it("inline validation: incorrect-stray-endtag", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"close-order":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect-stray-endtag"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: incorrect-missing-endtag", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"close-order":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect-missing-endtag"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: incorrect-wrong-endtag", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"close-order":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect-wrong-endtag"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: incorrect-out-of-order", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"close-order":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect-out-of-order"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: incorrect-incorrect-implicit", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"close-order":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect-incorrect-implicit"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct-1", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"close-order":"error"}});
		const report = await htmlvalidate.validateString(markup["correct-1"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct-2", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"close-order":"error"}});
		const report = await htmlvalidate.validateString(markup["correct-2"]);
		expect(report.results).toMatchSnapshot();
	});
});
