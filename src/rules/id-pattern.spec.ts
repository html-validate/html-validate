import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { processAttribute } from "../transform/mocks/attribute";

describe("rule id-pattern", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "id-pattern": "error" },
		});
	});

	it("should not report error when id follows pattern", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<p id="foo-bar"></p>');
		expect(report).toBeValid();
	});

	it("should not report error when id is interpolated", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<p id="{{ interpolated }}"></p>', {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should report error when id does not follow pattern", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<p id="fooBar"></p>');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"id-pattern",
			expect.stringMatching(/ID "fooBar" does not match required pattern ".*"/)
		);
	});

	it("should report error when id is empty string", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<p id=""></p>');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"id-pattern",
			expect.stringMatching(/ID "" does not match required pattern ".*"/)
		);
	});

	it("should report error when id is omitted", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<p id></p>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"id-pattern",
			expect.stringMatching(/ID "" does not match required pattern ".*"/)
		);
	});

	it("should ignore other attributes", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<p spam="fooBar"></p>');
		expect(report).toBeValid();
	});

	it("smoketest", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateFile("test-files/rules/id-pattern.html");
		expect(report).toMatchInlineCodeframe(`
			"error: ID "foo_bar" does not match required pattern "/^[a-z0-9-]+$/" (id-pattern) at test-files/rules/id-pattern.html:3:10:
			  1 | <div id="foo-bar"></div>
			  2 |
			> 3 | <div id="foo_bar"></div>
			    |          ^^^^^^^
			  4 |
			  5 | <div id="fooBar"></div>
			  6 |
			Selector: #foo_bar
			error: ID "fooBar" does not match required pattern "/^[a-z0-9-]+$/" (id-pattern) at test-files/rules/id-pattern.html:5:10:
			  3 | <div id="foo_bar"></div>
			  4 |
			> 5 | <div id="fooBar"></div>
			    |          ^^^^^^
			  6 |
			Selector: #fooBar"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("id-pattern");
		expect(docs).toMatchSnapshot();
	});
});
