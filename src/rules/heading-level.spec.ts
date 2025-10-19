import { HtmlValidate } from "../htmlvalidate";
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

	it("should not report error for non-headings", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p>lorem ipsum</p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when <h1> is followed by <h2>", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<h1>heading 1</h1>
			<h2>heading 2</h2>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when <h3> is followed by <h2>", async () => {
		expect.assertions(1);
		const markup = "<h1>heading 1</h1><h2>heading 2</h2><h3>heading 3</h3><h2>heading 4</h2>";
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when root element is closed unexpectedly", async () => {
		expect.assertions(1);
		const markup = "</div><h1>lorem ipsum</h1>";
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when <h1> is followed by <h3>", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<h1>heading 1</h1>
			<h3>heading 2</h3>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Heading level can only increase by one, expected <h2> but got <h3> (heading-level) at inline:3:5:
			  1 |
			  2 | 			<h1>heading 1</h1>
			> 3 | 			<h3>heading 2</h3>
			    | 			 ^^
			  4 |
			Selector: h3"
		`);
	});

	it("should report error when initial heading isn't <h1>", async () => {
		expect.assertions(2);
		const markup = "<h2>heading 2</h2>";
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Initial heading level must be <h1> but got <h2> (heading-level) at inline:1:2:
			> 1 | <h2>heading 2</h2>
			    |  ^^
			Selector: h2"
		`);
	});

	it("should report error when multiple <h1> are used", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<h1>heading 1</h1>
			<h1>heading 1</h1>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Multiple <h1> are not allowed (heading-level) at inline:3:5:
			  1 |
			  2 | 			<h1>heading 1</h1>
			> 3 | 			<h1>heading 1</h1>
			    | 			 ^^
			  4 |
			Selector: h1:nth-child(2)"
		`);
	});

	it("should not report error when multiple <h1> are used but allowed via option", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			rules: { "heading-level": ["error", { allowMultipleH1: true }] },
		});
		const markup = /* HTML */ `
			<h1>heading 1</h1>
			<h1>heading 1</h1>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should handle custom elements marked as heading", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <custom-heading></custom-heading> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	describe("sectioning roots", () => {
		it("should allow restarting with <h1>", async () => {
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
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should allow continuous headings", async () => {
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
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not allow skipping heading levels", async () => {
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
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Initial heading level for sectioning root must be between <h1> and <h4> but got <h5> (heading-level) at inline:6:7:
				  4 | 				<h3>heading 2</h3>
				  5 | 				<div role="dialog">
				> 6 | 					<h5>modal header</h5>
				    | 					 ^^
				  7 | 				</div>
				  8 | 				<h3>heading 2</h3>
				  9 |
				Selector: div > h5"
			`);
		});

		it("should enforce h1 as initial heading level if sectioning root is the only content in document", async () => {
			expect.assertions(2);
			const markup = `
				<div role="dialog">
					<h5>modal header</h5>
				</div>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Initial heading level for sectioning root must be <h1> but got <h5> (heading-level) at inline:3:7:
				  1 |
				  2 | 				<div role="dialog">
				> 3 | 					<h5>modal header</h5>
				    | 					 ^^
				  4 | 				</div>
				  5 |
				Selector: div > h5"
			`);
		});
	});

	describe("minInitialRank", () => {
		it("configured with h2 should allow initial h2", async () => {
			expect.assertions(1);
			const htmlvalidate = new HtmlValidate({
				rules: { "heading-level": ["error", { minInitialRank: "h2" }] },
			});
			const markup = `
				<h2>heading 2</h2>
				<h3>heading 2</h3>
				<h1>heading 2</h1>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("configured with h2 should not allow initial h3", async () => {
			expect.assertions(2);
			const htmlvalidate = new HtmlValidate({
				rules: { "heading-level": ["error", { minInitialRank: "h2" }] },
			});
			const markup = `
				<h3>heading 3</h3>
				<h1>heading 3</h1>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Initial heading level must be <h2> or higher rank but got <h3> (heading-level) at inline:2:6:
				  1 |
				> 2 | 				<h3>heading 3</h3>
				    | 				 ^^
				  3 | 				<h1>heading 3</h1>
				  4 |
				Selector: h3"
			`);
		});

		it("should allow continuous sectioning root", async () => {
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
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should allow sectioning root with initial heading level", async () => {
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
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it('"any" should be equivalent to "h6"', async () => {
			expect.assertions(1);
			const htmlvalidate = new HtmlValidate({
				rules: { "heading-level": ["error", { minInitialRank: "any" }] },
			});
			const markup = "<h6></h6>";
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it('false should be equivalent to "h6"', async () => {
			expect.assertions(1);
			const htmlvalidate = new HtmlValidate({
				rules: { "heading-level": ["error", { minInitialRank: false }] },
			});
			const markup = "<h6></h6>";
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile("test-files/rules/heading-level.html");
		expect(report).toMatchInlineCodeframe(`
			"error: Initial heading level must be <h1> but got <h2> (heading-level) at test-files/rules/heading-level.html:1:2:
			> 1 | <h2>foo</h2>
			    |  ^^
			  2 | <h3>spam</h3>
			  3 | <p>lorem ipsum</p>
			  4 | <h3>ham</h3>
			Selector: h2:nth-child(1)
			error: Heading level can only increase by one, expected <h3> but got <h4> (heading-level) at test-files/rules/heading-level.html:6:2:
			  4 | <h3>ham</h3>
			  5 | <H2>bar</H2>
			> 6 | <h4>baz</h4>
			    |  ^^
			  7 |
			Selector: h4"
		`);
	});

	it("should contain documentation (without multiple h1)", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			rules: { "heading-level": ["error", { allowMultipleH1: false }] },
		});
		/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
		const docs = await htmlvalidate.getRuleDocumentation("heading-level");
		expect(docs).toMatchSnapshot();
	});

	it("should contain documentation (with multiple h1)", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			rules: { "heading-level": ["error", { allowMultipleH1: true }] },
		});
		/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
		const docs = await htmlvalidate.getRuleDocumentation("heading-level");
		expect(docs).toMatchSnapshot();
	});

	it("should contain documentation (with minInitialRank)", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			rules: { "heading-level": ["error", { minInitialRank: "h2" }] },
		});
		/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
		const docs = await htmlvalidate.getRuleDocumentation("heading-level");
		expect(docs).toMatchSnapshot();
	});
});
