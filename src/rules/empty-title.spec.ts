import { Location } from "../context";
import { DynamicValue, HtmlElement } from "../dom";
import { HtmlValidate } from "../htmlvalidate";
import "../jest";

const location: Location = {
	filename: "inline",
	line: 1,
	column: 1,
	offset: 0,
	size: 1,
};

describe("rule empty-title", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "empty-title": "error" },
		});
	});

	it("should not report when title has text", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString("<title>lorem ipsum</title>");
		expect(report).toBeValid();
	});

	it("should not report when title has children with text", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString("<title><span>lorem ipsum</span></title>");
		expect(report).toBeValid();
	});

	it("should not report when title has dynamic text", async () => {
		expect.assertions(1);
		function processElement(node: HtmlElement): void {
			node.appendText(new DynamicValue(""), location);
		}
		const report = await htmlvalidate.validateString("<title></title>", {
			processElement,
		});
		expect(report).toBeValid();
	});

	it("should report error when title has no text content", async () => {
		expect.assertions(2);
		const report = await htmlvalidate.validateString("<title></title>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("empty-title", "<title> cannot be empty, must have text content");
	});

	it("should report error when title has no children with content", async () => {
		expect.assertions(2);
		const report = await htmlvalidate.validateString("<title><span></span></title>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("empty-title", "<title> cannot be empty, must have text content");
	});

	it("should report error when title only has whitespace content", async () => {
		expect.assertions(2);
		const report = await htmlvalidate.validateString("<title> </title>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("empty-title", "<title> cannot be empty, must have text content");
	});

	it("should report error when title only has comment", async () => {
		expect.assertions(2);
		const report = await htmlvalidate.validateString("<title>\n<!-- foo -->\n</title>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("empty-title", "<title> cannot be empty, must have text content");
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile("test-files/rules/empty-title.html");
		expect(report).toMatchInlineCodeframe(`
			"error: <title> cannot be empty, must have text content (empty-title) at test-files/rules/empty-title.html:2:2:
			  1 | <title>Lorem ipsum</title>
			> 2 | <title></title>
			    |  ^^^^^
			  3 | <title> </title>
			  4 |
			Selector: title:nth-child(2)
			error: <title> cannot be empty, must have text content (empty-title) at test-files/rules/empty-title.html:3:2:
			  1 | <title>Lorem ipsum</title>
			  2 | <title></title>
			> 3 | <title> </title>
			    |  ^^^^^
			  4 |
			Selector: title:nth-child(3)"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("empty-title");
		expect(docs).toMatchSnapshot();
	});
});
