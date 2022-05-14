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
			const markup = /* HTML */ `<link href=".." />`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: SRI "integrity" attribute is required on <link> element (require-sri) at inline:1:2:
				> 1 | <link href=".." />
				    |  ^^^^
				Selector: link"
			`);
		});

		it("should report error when integrity attribute is missing on <script>", () => {
			expect.assertions(2);
			const markup = /* HTML */ `<script src=".."></script>`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: SRI "integrity" attribute is required on <script> element (require-sri) at inline:1:2:
				> 1 | <script src=".."></script>
				    |  ^^^^^^
				Selector: script"
			`);
		});

		it("should not report error on <link> without href attribute", () => {
			expect.assertions(1);
			const markup = /* HTML */ `<link />`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error on <link> with empty href attribute", () => {
			expect.assertions(1);
			const markup = /* HTML */ `<link href="" />`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error on <script> without src attribute", () => {
			expect.assertions(1);
			const markup = /* HTML */ `<script></script>`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error on <script> with empty src attribute", () => {
			expect.assertions(1);
			const markup = /* HTML */ `<script src=""></script>`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when integrity attribute is missing on other elements", () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div></div>`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when integrity attribute is present on <link>", () => {
			expect.assertions(1);
			const markup = /* HTML */ `<link href=".." integrity="..." />`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when integrity attribute is present on <script>", () => {
			expect.assertions(1);
			const markup = /* HTML */ `<script src=".." integrity="..."></script>`;
			const report = htmlvalidate.validateString(markup);
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
			const markup = /* HTML */ `<link href="/foo.css" />`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: SRI "integrity" attribute is required on <link> element (require-sri) at inline:1:2:
				> 1 | <link href="/foo.css" />
				    |  ^^^^
				Selector: link"
			`);
		});

		it("should report error when integrity attribute is missing on <script> with same origin", () => {
			expect.assertions(2);
			const markup = /* HTML */ `<script src="./foo.js"></script>`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: SRI "integrity" attribute is required on <script> element (require-sri) at inline:1:2:
				> 1 | <script src="./foo.js"></script>
				    |  ^^^^^^
				Selector: script"
			`);
		});

		it("should report error when integrity attribute is missing on <link> with crossorigin", () => {
			expect.assertions(2);
			const markup = /* HTML */ `<link href="https://example.net/foo.css" />`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: SRI "integrity" attribute is required on <link> element (require-sri) at inline:1:2:
				> 1 | <link href="https://example.net/foo.css" />
				    |  ^^^^
				Selector: link"
			`);
		});

		it("should report error when integrity attribute is missing on <script> with crossorigin", () => {
			expect.assertions(2);
			const markup = /* HTML */ `<script src="//example.net/foo.js"></script>`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: SRI "integrity" attribute is required on <script> element (require-sri) at inline:1:2:
				> 1 | <script src="//example.net/foo.js"></script>
				    |  ^^^^^^
				Selector: script"
			`);
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
			const markup = /* HTML */ `<link href="/foo.css" />`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when integrity attribute is missing on <script> with same origin", () => {
			expect.assertions(1);
			const markup = /* HTML */ `<script src="./foo.js"></script>`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when integrity attribute is missing on <link> with crossorigin", () => {
			expect.assertions(2);
			const markup = /* HTML */ `<link href="https://example.net/foo.css" />`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: SRI "integrity" attribute is required on <link> element (require-sri) at inline:1:2:
				> 1 | <link href="https://example.net/foo.css" />
				    |  ^^^^
				Selector: link"
			`);
		});

		it("should report error when integrity attribute is missing on <script> with crossorigin", () => {
			expect.assertions(2);
			const markup = /* HTML */ `<script src="//example.net/foo.js"></script>`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: SRI "integrity" attribute is required on <script> element (require-sri) at inline:1:2:
				> 1 | <script src="//example.net/foo.js"></script>
				    |  ^^^^^^
				Selector: script"
			`);
		});

		it("should handle boolean and empty values", () => {
			expect.assertions(1);
			const markup = /* HTML */ `<link href /><link href="" />`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	describe('include"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: {
					"require-sri": ["error", { include: ["//include.example.net/", "//other.example.net/"] }],
				},
			});
		});

		it("should not report error when url isn't matching any patterns listed in include", () => {
			expect.assertions(1);
			const markup = /* HTML */ `<link href="//domain.example.net/foo.css" />`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when url matches one pattern listed in include", () => {
			expect.assertions(2);
			const markup = /* HTML */ `<link href="//include.example.net/foo.css" />`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: SRI "integrity" attribute is required on <link> element (require-sri) at inline:1:2:
				> 1 | <link href="//include.example.net/foo.css" />
				    |  ^^^^
				Selector: link"
			`);
		});
	});

	describe('exclude"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: {
					"require-sri": ["error", { exclude: ["//exclude.example.net/", "//other.example.net/"] }],
				},
			});
		});

		it("should not report error when url matches one pattern listed in exclude", () => {
			expect.assertions(1);
			const markup = /* HTML */ `<link href="//exclude.example.net/foo.css" />`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when url isn't matching any patterns listed in exclude", () => {
			expect.assertions(2);
			const markup = /* HTML */ `<link href="//domain.example.net/foo.css" />`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: SRI "integrity" attribute is required on <link> element (require-sri) at inline:1:2:
				> 1 | <link href="//domain.example.net/foo.css" />
				    |  ^^^^
				Selector: link"
			`);
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
