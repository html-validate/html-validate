import { HtmlValidate } from "../htmlvalidate";
import "../jest";

const DEFAULT_PATTERN = "^[a-z][a-z0-9\\-._]*-[a-z0-9\\-._]*$";

describe("rule element-name", () => {
	let htmlvalidate: HtmlValidate;

	describe("configured with default pattern", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "element-name": "error" },
			});
		});

		it("should report error when custom element name does not have a dash", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString("<foobar></foobar>");
			expect(report).toBeInvalid();
			expect(report).toHaveError("element-name", "<foobar> is not a valid element name");
		});

		it("should report error when custom element name does not start with letter", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString("<1-foo></1-foo>");
			expect(report).toBeInvalid();
			expect(report).toHaveError("element-name", "<1-foo> is not a valid element name");
		});

		it("should not report error when custom element name is valid", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<foo-bar></foo-bar>");
			expect(report).toBeValid();
		});

		it("should not report when using builtin elements", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<span><a><span></span></a></span>");
			expect(report).toBeValid();
		});

		it("should not report error for xml namespaces", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<xmlns:foo></xmlns:foo>");
			expect(report).toBeValid();
		});

		it("smoketest", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateFile("test-files/rules/element-name.html");
			expect(report).toMatchInlineCodeframe(`
				"error: <foo> is not a valid element name (element-name) at test-files/rules/element-name.html:30:2:
				  28 |
				  29 | <!-- invalid custom names -->
				> 30 | <foo></foo>
				     |  ^^^
				  31 | <1-bar></1-bar>
				  32 |
				Selector: foo
				error: <1-bar> is not a valid element name (element-name) at test-files/rules/element-name.html:31:2:
				  29 | <!-- invalid custom names -->
				  30 | <foo></foo>
				> 31 | <1-bar></1-bar>
				     |  ^^^^^
				  32 |
				Selector: 1-bar"
			`);
		});
	});

	describe("configured with custom pattern", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "element-name": ["error", { pattern: "^foo-\\w+$" }] },
			});
		});

		it("should report error when custom element name does not match pattern", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString("<spam-ham></spam-ham>");
			expect(report).toBeInvalid();
			expect(report).toHaveError("element-name", "<spam-ham> is not a valid element name");
		});

		it("should not report error when custom element name does match pattern", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<foo-bar></foo-bar>");
			expect(report).toBeValid();
		});

		it("should not report when using builtin elements", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<span><a><span></span></a></span>");
			expect(report).toBeValid();
		});

		it("should not report error for xml namespaces", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<xmlns:foo></xmlns:foo>");
			expect(report).toBeValid();
		});

		it("smoketest", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateFile("test-files/rules/element-name.html");
			expect(report).toMatchInlineCodeframe(`
				"error: <spam-ham> is not a valid element name (element-name) at test-files/rules/element-name.html:27:2:
				  25 | <!-- allowed custom names -->
				  26 | <foo-bar></foo-bar>
				> 27 | <spam-ham></spam-ham>
				     |  ^^^^^^^^
				  28 |
				  29 | <!-- invalid custom names -->
				  30 | <foo></foo>
				Selector: spam-ham
				error: <foo> is not a valid element name (element-name) at test-files/rules/element-name.html:30:2:
				  28 |
				  29 | <!-- invalid custom names -->
				> 30 | <foo></foo>
				     |  ^^^
				  31 | <1-bar></1-bar>
				  32 |
				Selector: foo
				error: <1-bar> is not a valid element name (element-name) at test-files/rules/element-name.html:31:2:
				  29 | <!-- invalid custom names -->
				  30 | <foo></foo>
				> 31 | <1-bar></1-bar>
				     |  ^^^^^
				  32 |
				Selector: 1-bar"
			`);
		});
	});

	it("should ignore whitelisted element", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "element-name": ["error", { whitelist: ["foobar"] }] },
		});
		const report = htmlvalidate.validateString("<foobar></foobar>");
		expect(report).toBeValid();
	});

	it("should report error when using blacklisted element", () => {
		expect.assertions(2);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "element-name": ["error", { blacklist: ["foo-bar"] }] },
		});
		const report = htmlvalidate.validateString("<foo-bar></foo-bar>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("element-name", "<foo-bar> element is blacklisted");
	});

	describe("should contain documentation for", () => {
		it("blacklisted element", async () => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "element-name": "error" },
			});
			const context = {
				tagName: "element-name",
				pattern: DEFAULT_PATTERN,
				blacklist: ["element-name"],
			};
			const docs = await htmlvalidate.getRuleDocumentation("element-name", null, context);
			expect(docs).toMatchSnapshot();
		});

		it("element not matching default pattern", async () => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "element-name": "error" },
			});
			const context = {
				tagName: "element-name",
				pattern: DEFAULT_PATTERN,
				blacklist: [] as string[],
			};
			const docs = await htmlvalidate.getRuleDocumentation("element-name", null, context);
			expect(docs).toMatchSnapshot();
		});

		it("element not matching custom pattern", async () => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "element-name": "error" },
			});
			const context = {
				tagName: "element-name",
				pattern: "^foo-.+$",
				blacklist: [] as string[],
			};
			const docs = await htmlvalidate.getRuleDocumentation("element-name", null, context);
			expect(docs).toMatchSnapshot();
		});
	});
});
