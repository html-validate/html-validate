import { Location } from "../context";
import { DynamicValue, HtmlElement } from "../dom";
import HtmlValidate from "../htmlvalidate";
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
		const report = htmlvalidate.validateString("<h1>lorem ipsum</h1>");
		expect(report).toBeValid();
	});

	it("should not report when heading has children with text", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<h1><span>lorem ipsum</span></h1>");
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

	it("should not report when heading has dynamic text", () => {
		expect.assertions(1);
		function processElement(node: HtmlElement): void {
			node.appendText(new DynamicValue(""), location);
		}
		const report = htmlvalidate.validateString("<h1></h1>", {
			processElement,
		});
		expect(report).toBeValid();
	});

	it("should report error when heading has no text content", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<h1></h1>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("empty-heading", "<h1> cannot be empty, must have text content");
	});

	it("should report error when heading has no children with content", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<h1><span></span></h1>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("empty-heading", "<h1> cannot be empty, must have text content");
	});

	it("should report error when heading only has whitespace content", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<h1> </h1>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("empty-heading", "<h1> cannot be empty, must have text content");
	});

	it("should report error when heading only has comment", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<h1>\n<!-- foo -->\n</h1>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("empty-heading", "<h1> cannot be empty, must have text content");
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
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(htmlvalidate.getRuleDocumentation("empty-heading")).toMatchSnapshot();
	});
});
