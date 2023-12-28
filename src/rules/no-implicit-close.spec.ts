import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule no-implicit-close", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "no-implicit-close": "error" },
		});
	});

	it("should not report when element is explicitly closed", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString("<li></li>");
		expect(report).toBeValid();
	});

	it("should report error when element is implicitly closed by parent", async () => {
		expect.assertions(2);
		const report = await htmlvalidate.validateString("<ul><li>foo</ul>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"no-implicit-close",
			"Element <li> is implicitly closed by parent </ul>",
		);
	});

	it("should report error when element is implicitly closed by sibling", async () => {
		expect.assertions(2);
		const report = await htmlvalidate.validateString("<li>foo<li>bar");
		expect(report).toBeInvalid();
		expect(report).toHaveError("no-implicit-close", "Element <li> is implicitly closed by sibling");
	});

	it("should report error when element is implicitly closed by adjacent block element", async () => {
		expect.assertions(2);
		const report = await htmlvalidate.validateString("<p>foo<div>bar");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"no-implicit-close",
			"Element <p> is implicitly closed by adjacent <div>",
		);
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile("test-files/rules/no-implicit-close.html");
		expect(report).toMatchCodeframe();
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("no-implicit-close");
		expect(docs).toMatchSnapshot();
	});
});
