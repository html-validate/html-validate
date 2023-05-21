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

	it("should not report error when class follows pattern", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<p class="foo-bar"></p>');
		expect(report).toBeValid();
	});

	it("should report error when class does not follow pattern", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<p class="foo-bar fooBar spam"></p>');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"class-pattern",
			expect.stringMatching(/Class "fooBar" does not match required pattern ".*"/)
		);
	});

	it("should ignore other attributes", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<p spam="fooBar"></p>');
		expect(report).toBeValid();
	});

	it("smoketest", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateFile("test-files/rules/class-pattern.html");
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

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(htmlvalidate.getRuleDocumentation("class-pattern")).toMatchSnapshot();
	});
});
