import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule heading-level", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "heading-level": "error" },
			elements: ["html5", { "custom-heading": { heading: true } }],
		});
	});

	it("should not report error for non-headings>", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<p>lorem ipsum</p>");
		expect(report).toBeValid();
	});

	it("should not report error when <h1> is followed by <h2>", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<h1>heading 1</h1><h2>heading 2</h2>");
		expect(report).toBeValid();
	});

	it("should not report error when <h3> is followed by <h2>", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString(
			"<h1>heading 1</h1><h2>heading 2</h2><h3>heading 3</h3><h2>heading 4</h2>"
		);
		expect(report).toBeValid();
	});

	it("should report error when <h1> is followed by <h3>", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<h1>heading 1</h1><h3>heading 2</h3>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"heading-level",
			"Heading level can only increase by one, expected <h2> but got <h3>"
		);
	});

	it("should report error when initial heading isn't <h1>", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<h2>heading 2</h2>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("heading-level", "Initial heading level must be <h1> but got <h2>");
	});

	it("should report error when multiple <h1> are used", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<h1>heading 1</h1><h1>heading 1</h1>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("heading-level", "Multiple <h1> are not allowed");
	});

	it("should not report error when multiple <h1> are used but allowed via option", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "heading-level": ["error", { allowMultipleH1: true }] },
		});
		const report = htmlvalidate.validateString("<h1>heading 1</h1><h1>heading 1</h1>");
		expect(report).toBeValid();
	});

	it("should handle custom elements marked as heading", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<custom-heading></custom-heading>");
		expect(report).toBeValid();
	});

	it("smoketest", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateFile("test-files/rules/heading-level.html");
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation (without multiple h1)", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "heading-level": ["error", { allowMultipleH1: false }] },
		});
		expect(htmlvalidate.getRuleDocumentation("heading-level")).toMatchSnapshot();
	});

	it("should contain documentation (with multiple h1)", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "heading-level": ["error", { allowMultipleH1: true }] },
		});
		expect(htmlvalidate.getRuleDocumentation("heading-level")).toMatchSnapshot();
	});
});
