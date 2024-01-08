import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect"] = `<nav>
	lorem ipsum
</nav>
<nav>
	dolor sit amet
</nav>`;
markup["correct"] = `<nav aria-label="Primary">
	lorem ipsum
</nav>
<h2 id="secondary-nav-heading">Secondary</h2>
<nav aria-labelledby="secondary-nav-heading">
	dolor sit amet
</nav>`;

describe("docs/rules/unique-landmark.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"unique-landmark":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"unique-landmark":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
