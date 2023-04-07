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
			expect(report.results).toMatchSnapshot();
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
			expect(report.results).toMatchSnapshot();
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

	it("should contain documentation", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "element-name": "error" },
		});
		expect(htmlvalidate.getRuleDocumentation("element-name")).toMatchSnapshot();
	});

	describe("should contain contextual documentation for", () => {
		it("blacklisted element", () => {
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
			expect(htmlvalidate.getRuleDocumentation("element-name", null, context)).toMatchSnapshot();
		});

		it("element not matching default pattern", () => {
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
			expect(htmlvalidate.getRuleDocumentation("element-name", null, context)).toMatchSnapshot();
		});

		it("element not matching custom pattern", () => {
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
			expect(htmlvalidate.getRuleDocumentation("element-name", null, context)).toMatchSnapshot();
		});
	});
});
