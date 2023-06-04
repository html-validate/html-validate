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

describe("rule empty-heading", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "empty-heading": "error" },
		});
	});

	it("should not report when heading has text", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <h1>lorem ipsum</h1> `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when heading has children with text", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <h1><span>lorem ipsum</span></h1> `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it('should not report when heading has <img alt="..">', () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <h1><img alt="lorem ipsum" /></h1> `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when heading has <svg> with <title>", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<h1>
				<svg>
					<title>lorem ipsum</title>
				</svg>
			</h1>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when hidden heading has text content", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<h1 hidden>lorem ipsum</h1>
			<div hidden>
				<h2>lorem ipsum</h2>
			</div>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when heading has dynamic text", () => {
		expect.assertions(1);
		function processElement(node: HtmlElement): void {
			node.appendText(new DynamicValue(""), location);
		}
		const markup = /* HTML */ ` <h1></h1> `;
		const report = htmlvalidate.validateString(markup, {
			processElement,
		});
		expect(report).toBeValid();
	});

	it("should report error when heading has no text content", () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <h1></h1> `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <h1> cannot be empty, must have text content (empty-heading) at inline:1:3:
			> 1 |  <h1></h1>
			    |   ^^
			Selector: h1"
		`);
	});

	it("should report error when heading has no children with content", () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <h1><span></span></h1> `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <h1> cannot be empty, must have text content (empty-heading) at inline:1:3:
			> 1 |  <h1><span></span></h1>
			    |   ^^
			Selector: h1"
		`);
	});

	it("should report error when heading only has whitespace content", () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <h1></h1> `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <h1> cannot be empty, must have text content (empty-heading) at inline:1:3:
			> 1 |  <h1></h1>
			    |   ^^
			Selector: h1"
		`);
	});

	it("should report error when heading only has comment", () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<h1>
				<!-- foo -->
			</h1>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <h1> cannot be empty, must have text content (empty-heading) at inline:2:5:
			  1 |
			> 2 | 			<h1>
			    | 			 ^^
			  3 | 				<!-- foo -->
			  4 | 			</h1>
			  5 |
			Selector: h1"
		`);
	});

	it("should report error when hidden heading has no text content", () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<h1 hidden></h1>
			<div hidden>
				<h2></h2>
			</div>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <h1> cannot be empty, must have text content (empty-heading) at inline:2:5:
			  1 |
			> 2 | 			<h1 hidden></h1>
			    | 			 ^^
			  3 | 			<div hidden>
			  4 | 				<h2></h2>
			  5 | 			</div>
			Selector: h1
			error: <h2> cannot be empty, must have text content (empty-heading) at inline:4:6:
			  2 | 			<h1 hidden></h1>
			  3 | 			<div hidden>
			> 4 | 				<h2></h2>
			    | 				 ^^
			  5 | 			</div>
			  6 |
			Selector: div > h2"
		`);
	});

	it("should report error for all heading levels", () => {
		expect.assertions(6);
		expect(htmlvalidate.validateString("<h1></h1>")).toBeInvalid();
		expect(htmlvalidate.validateString("<h2></h2>")).toBeInvalid();
		expect(htmlvalidate.validateString("<h3></h3>")).toBeInvalid();
		expect(htmlvalidate.validateString("<h4></h4>")).toBeInvalid();
		expect(htmlvalidate.validateString("<h5></h5>")).toBeInvalid();
		expect(htmlvalidate.validateString("<h6></h6>")).toBeInvalid();
	});

	it("smoketest", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateFile("test-files/rules/empty-heading.html");
		expect(report).toMatchInlineCodeframe(`
			"error: <h2> cannot be empty, must have text content (empty-heading) at test-files/rules/empty-heading.html:2:2:
			  1 | <h1>Lorem ipsum</h1>
			> 2 | <h2></h2>
			    |  ^^
			  3 | <h3> </h3>
			  4 |
			Selector: h2
			error: <h3> cannot be empty, must have text content (empty-heading) at test-files/rules/empty-heading.html:3:2:
			  1 | <h1>Lorem ipsum</h1>
			  2 | <h2></h2>
			> 3 | <h3> </h3>
			    |  ^^
			  4 |
			Selector: h3"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("empty-heading");
		expect(docs).toMatchSnapshot();
	});
});
