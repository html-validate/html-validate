import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule element-name", () => {

	let htmlvalidate: HtmlValidate;

	describe("configured with default pattern", () => {

		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: {"element-name": "error"},
			});
		});

		it("should report error when custom element name does not have a dash", () => {
			const report = htmlvalidate.validateString("<foobar></foobar>");
			expect(report).toBeInvalid();
			expect(report).toHaveError("element-name", "<foobar> is not a valid element name");
		});

		it("should report error when custom element name does not start with letter", () => {
			const report = htmlvalidate.validateString("<1-foo></1-foo>");
			expect(report).toBeInvalid();
			expect(report).toHaveError("element-name", "<1-foo> is not a valid element name");
		});

		it("should not report error when custom element name is valid", () => {
			const report = htmlvalidate.validateString("<foo-bar></foo-bar>");
			expect(report).toBeValid();
		});

		it("should not report when using builtin elements", () => {
			const report = htmlvalidate.validateString("<span><a><span></span></a></span>");
			expect(report).toBeValid();
		});

		it("should not report error for xml namespaces", () => {
			const report = htmlvalidate.validateString("<xmlns:foo></xmlns:foo>");
			expect(report).toBeValid();
		});

		it("smoketest", () => {
			const report = htmlvalidate.validateFile("test-files/rules/element-name.html");
			expect(report.results).toMatchSnapshot();
		});

	});

	describe("configured with custom pattern", () => {

		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: {"element-name": ["error", {pattern: "^foo-\\w+$"}]},
			});
		});

		it("should report error when custom element name does not match pattern", () => {
			const report = htmlvalidate.validateString("<spam-ham></spam-ham>");
			expect(report).toBeInvalid();
			expect(report).toHaveError("element-name", "<spam-ham> is not a valid element name");
		});

		it("should not report error when custom element name does match pattern", () => {
			const report = htmlvalidate.validateString("<foo-bar></foo-bar>");
			expect(report).toBeValid();
		});

		it("should not report when using builtin elements", () => {
			const report = htmlvalidate.validateString("<span><a><span></span></a></span>");
			expect(report).toBeValid();
		});

		it("should not report error for xml namespaces", () => {
			const report = htmlvalidate.validateString("<xmlns:foo></xmlns:foo>");
			expect(report).toBeValid();
		});

		it("smoketest", () => {
			const report = htmlvalidate.validateFile("test-files/rules/element-name.html");
			expect(report.results).toMatchSnapshot();
		});

	});

	it("should ignore whitelisted element", () => {
		htmlvalidate = new HtmlValidate({
			rules: {"element-name": ["error", {whitelist: ["foobar"]}]},
		});
		const report = htmlvalidate.validateString("<foobar></foobar>");
		expect(report).toBeValid();
	});

	it("should report error when using blacklisted element", () => {
		htmlvalidate = new HtmlValidate({
			rules: {"element-name": ["error", {blacklist: ["foo-bar"]}]},
		});
		const report = htmlvalidate.validateString("<foo-bar></foo-bar>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("element-name", "<foo-bar> element is blacklisted");
	});

	it("should contain documentation", () => {
		htmlvalidate = new HtmlValidate({
			rules: {"element-name": "error"},
		});
		expect(htmlvalidate.getRuleDocumentation("element-name")).toMatchSnapshot();
	});

});
