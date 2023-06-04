import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule no-utf8-bom", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "no-utf8-bom": ["error"] },
		});
	});

	it("should not report when no BOM is included", () => {
		expect.assertions(1);
		const markup = "<p>lorem ipsum</p>";
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when BOM is present elsewhere", () => {
		expect.assertions(1);
		const markup = "<p>lorem\uFEFFipsum</p>";
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error file starts with UTF-8 BOM", () => {
		expect.assertions(2);
		const markup = "\uFEFF<p>lorem ipsum</p>";
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError("no-utf8-bom", "File should be saved without UTF-8 BOM");
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("no-utf8-bom");
		expect(docs).toMatchSnapshot();
	});
});
