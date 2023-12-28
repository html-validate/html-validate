import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule no-dup-class", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "no-dup-class": "error" },
		});
	});

	it("should not report when class is missing", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString("<p></p>");
		expect(report).toBeValid();
	});

	it("should not report when class has no duplicates", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<p class="foo bar"></p>');
		expect(report).toBeValid();
	});

	it("should not report for other attributes", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<p attr="foo bar foo"></p>');
		expect(report).toBeValid();
	});

	it("should report when when class has duplicates", async () => {
		expect.assertions(2);
		const report = await htmlvalidate.validateString('<p class="foo bar foo"></p>');
		expect(report).toBeInvalid();
		expect(report).toHaveError("no-dup-class", 'Class "foo" duplicated');
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile("test-files/rules/no-dup-class.html");
		expect(report).toMatchInlineCodeframe(`
			"error: Class "foo" duplicated (no-dup-class) at test-files/rules/no-dup-class.html:5:21:
			  3 | <div class="foo bar"></div>
			  4 |
			> 5 | <div class="foo bar foo"></div>
			    |                     ^^^
			  6 |
			Selector: div:nth-child(3)"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("no-dup-class");
		expect(docs).toMatchSnapshot();
	});
});
