import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule class-pattern", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "class-pattern": "error" },
		});
	});

	it("should not report error when class follows pattern", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p class="foo-bar"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when class does not follow pattern", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <p class="foo-bar fooBar spam"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Class "fooBar" does not match required pattern "/^[a-z0-9-]+$/" (class-pattern) at inline:1:20:
			> 1 |  <p class="foo-bar fooBar spam"></p>
			    |                    ^^^^^^
			Selector: p"
		`);
	});

	it("should ignore other attributes", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p spam="fooBar"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile("test-files/rules/class-pattern.html");
		expect(report).toMatchInlineCodeframe(`
			"error: Class "foo_bar" does not match required pattern "/^[a-z0-9-]+$/" (class-pattern) at test-files/rules/class-pattern.html:3:17:
			  1 | <div class="foo foo-bar bar"></div>
			  2 |
			> 3 | <div class="foo foo_bar bar"></div>
			    |                 ^^^^^^^
			  4 |
			  5 | <div class="foo fooBar bar"></div>
			  6 |
			Selector: div:nth-child(2)
			error: Class "fooBar" does not match required pattern "/^[a-z0-9-]+$/" (class-pattern) at test-files/rules/class-pattern.html:5:17:
			  3 | <div class="foo foo_bar bar"></div>
			  4 |
			> 5 | <div class="foo fooBar bar"></div>
			    |                 ^^^^^^
			  6 |
			Selector: div:nth-child(3)"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("class-pattern");
		expect(docs).toMatchSnapshot();
	});
});
