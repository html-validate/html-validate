import HtmlValidate from "../htmlvalidate";
import "../jest";

describe("rule heading-level", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "heading-level": "error" },
			elements: ["html5", { "custom-heading": { heading: true } }],
		});
	});

	it("should not report error for non-headings", () => {
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
		const markup = "<h1>heading 1</h1><h2>heading 2</h2><h3>heading 3</h3><h2>heading 4</h2>";
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when root element is closed unexpectedly", () => {
		expect.assertions(1);
		const markup = "</div><h1>lorem ipsum</h1>";
		const report = htmlvalidate.validateString(markup);
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
		const markup = "<h2>heading 2</h2>";
		const report = htmlvalidate.validateString(markup);
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
		const htmlvalidate = new HtmlValidate({
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

	describe("sectioning roots", () => {
		it("should allow restarting with <h1>", () => {
			expect.assertions(1);
			const markup = `
				<h1>heading 1</h1>
				<h2>heading 2</h2>
				<h3>heading 2</h3>
				<div role="dialog">
					<!-- heading level is restarted at <h1> -->
					<h1>modal header</h1>
				</div>
				<!-- this <h3> should valid because it is relative to the <h3> above the dialog -->
				<h3>heading 2</h3>
			`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should allow continuous headings", () => {
			expect.assertions(1);
			const markup = `
				<h1>heading 1</h1>
				<h2>heading 2</h2>
				<h3>heading 2</h3>
				<div role="dialog">
					<h4>modal header</h4>
				</div>
				<h3>heading 2</h3>
			`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not allow skipping heading levels", () => {
			expect.assertions(2);
			const markup = `
				<h1>heading 1</h1>
				<h2>heading 2</h2>
				<h3>heading 2</h3>
				<div role="dialog">
					<h5>modal header</h5>
				</div>
				<h3>heading 2</h3>
			`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"heading-level",
				"Initial heading level for sectioning root must be between <h1> and <h4> but got <h5>"
			);
		});

		it("should enforce h1 as initial heading level if sectioning root is the only content in document", () => {
			expect.assertions(2);
			const markup = `
				<div role="dialog">
					<h5>modal header</h5>
				</div>
			`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"heading-level",
				"Initial heading level for sectioning root must be <h1> but got <h5>"
			);
		});
	});

	describe("minInitialRank", () => {
		it("configured with h2 should allow initial h2", () => {
			expect.assertions(1);
			const htmlvalidate = new HtmlValidate({
				rules: { "heading-level": ["error", { minInitialRank: "h2" }] },
			});
			const markup = `
				<h2>heading 2</h2>
				<h3>heading 2</h3>
				<h1>heading 2</h1>
			`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("configured with h2 should not allow initial h3", () => {
			expect.assertions(2);
			const htmlvalidate = new HtmlValidate({
				rules: { "heading-level": ["error", { minInitialRank: "h2" }] },
			});
			const markup = `
				<h3>heading 3</h3>
				<h1>heading 3</h1>
			`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"heading-level",
				"Initial heading level must be <h2> or higher rank but got <h3>"
			);
		});

		it("should allow continuous sectioning root", () => {
			expect.assertions(1);
			const htmlvalidate = new HtmlValidate({
				rules: { "heading-level": ["error", { minInitialRank: "h2" }] },
			});
			const markup = `
				<h2>heading 2</h2>
				<div role="dialog">
					<h3>modal header</h3>
				</div>
			`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should allow sectioning root with initial heading level", () => {
			expect.assertions(1);
			const htmlvalidate = new HtmlValidate({
				rules: { "heading-level": ["error", { minInitialRank: "h2" }] },
			});
			const markup = `
				<h2>heading 2</h2>
				<div role="dialog">
					<h1>modal header</h1>
				</div>
			`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it('"any" should be equivalent to "h6"', () => {
			expect.assertions(1);
			const htmlvalidate = new HtmlValidate({
				rules: { "heading-level": ["error", { minInitialRank: "any" }] },
			});
			const markup = "<h6></h6>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it('false should be equivalent to "h6"', () => {
			expect.assertions(1);
			const htmlvalidate = new HtmlValidate({
				rules: { "heading-level": ["error", { minInitialRank: false }] },
			});
			const markup = "<h6></h6>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	it("smoketest", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateFile("test-files/rules/heading-level.html");
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation (without multiple h1)", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			rules: { "heading-level": ["error", { allowMultipleH1: false }] },
		});
		expect(htmlvalidate.getRuleDocumentation("heading-level")).toMatchSnapshot();
	});

	it("should contain documentation (with multiple h1)", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			rules: { "heading-level": ["error", { allowMultipleH1: true }] },
		});
		expect(htmlvalidate.getRuleDocumentation("heading-level")).toMatchSnapshot();
	});

	it("should contain documentation (with minInitialRank)", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			rules: { "heading-level": ["error", { minInitialRank: "h2" }] },
		});
		expect(htmlvalidate.getRuleDocumentation("heading-level")).toMatchSnapshot();
	});
});
