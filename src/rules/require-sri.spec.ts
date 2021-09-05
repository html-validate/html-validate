import HtmlValidate from "../htmlvalidate";
import "../jest";

describe("rule require-sri", () => {
	let htmlvalidate: HtmlValidate;

	describe("common", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "require-sri": "error" },
			});
		});

		it("should report error when integrity attribute is missing on <link>", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString("<link>");
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"require-sri",
				'SRI "integrity" attribute is required on <link> element'
			);
		});

		it("should report error when integrity attribute is missing on <script>", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString("<script></script>");
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"require-sri",
				'SRI "integrity" attribute is required on <script> element'
			);
		});

		it("should not report error when integrity attribute is missing on other elements", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<div></div>");
			expect(report).toBeValid();
		});

		it("should not report error when integrity attribute is present on <link>", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<link integrity="...">');
			expect(report).toBeValid();
		});

		it("should not report error when integrity attribute is present on <script>", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<script integrity="..."></script>');
			expect(report).toBeValid();
		});
	});

	describe('configured with target "all"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "require-sri": ["error", { target: "all" }] },
			});
		});

		it("should report error when integrity attribute is missing on <link> with same origin", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<link href="/foo.css">');
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"require-sri",
				'SRI "integrity" attribute is required on <link> element'
			);
		});

		it("should report error when integrity attribute is missing on <script> with same origin", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<script src="./foo.js"></script>');
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"require-sri",
				'SRI "integrity" attribute is required on <script> element'
			);
		});

		it("should report error when integrity attribute is missing on <link> with crossorigin", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<link href="https://example.net/foo.css">');
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"require-sri",
				'SRI "integrity" attribute is required on <link> element'
			);
		});

		it("should report error when integrity attribute is missing on <script> with crossorigin", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<script src="//example.net/foo.js"></script>');
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"require-sri",
				'SRI "integrity" attribute is required on <script> element'
			);
		});
	});

	describe('configured with target "crossorigin"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "require-sri": ["error", { target: "crossorigin" }] },
			});
		});

		it("should not report error when integrity attribute is missing on <link> with same origin", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<link href="/foo.css">');
			expect(report).toBeValid();
		});

		it("should not report error when integrity attribute is missing on <script> with same origin", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<script src="./foo.js"></script>');
			expect(report).toBeValid();
		});

		it("should report error when integrity attribute is missing on <link> with crossorigin", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<link href="https://example.net/foo.css">');
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"require-sri",
				'SRI "integrity" attribute is required on <link> element'
			);
		});

		it("should report error when integrity attribute is missing on <script> with crossorigin", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<script src="//example.net/foo.js"></script>');
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"require-sri",
				'SRI "integrity" attribute is required on <script> element'
			);
		});

		it("should handle boolean and empty values", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<link href><link href="">');
			expect(report).toBeValid();
		});
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "require-sri": "error" },
		});
		expect(htmlvalidate.getRuleDocumentation("require-sri")).toMatchSnapshot();
	});
});
