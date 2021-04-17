import HtmlValidate from "../htmlvalidate";
import "../matchers";
import { processAttribute } from "../transform/mocks/attribute";
import { Style } from "./allowed-links";

describe("rule allowed-links", () => {
	let htmlvalidate: HtmlValidate;

	describe("should report error for", () => {
		it.each`
			description       | markup
			${"<a href>"}     | ${'<a href="/foo"></a>'}
			${"<img src>"}    | ${'<img src="/foo">'}
			${"<link href>"}  | ${'<link href="/foo">'}
			${"<script src>"} | ${'<script src="/foo"></script>'}
		`("$description", ({ markup }) => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "allowed-links": ["error", { allowAbsolute: false }] },
			});
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
		});
	});

	it("should not report error for anchor links", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "allowed-links": ["error", { allowAbsolute: false }] },
		});
		const report = htmlvalidate.validateString('<a href="#foo"></a>');
		expect(report).toBeValid();
	});

	it("should not report error for link is dynamic", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"allowed-links": ["error", { allowRelative: false }],
			},
		});
		const report = htmlvalidate.validateString('<a dynamic-src="{{ expr }}"></a>', {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	describe("allowExternal: false", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "allowed-links": ["error", { allowExternal: false }] },
			});
		});

		it("should report error when link is external using //", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<a href="//example.net/foo"></a>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("allowed-links", "Link destination must not be external url");
		});

		it("should report error when link is external using protocol://", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<a href="http://example.net/foo"></a>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("allowed-links", "Link destination must not be external url");
		});

		it("should not report error link is absolute", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<a href="/foo"></a>');
			expect(report).toBeValid();
		});

		it("should not report error link is relative to path", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<a href="./foo"></a>');
			expect(report).toBeValid();
		});

		it("should not report error link is relative to base", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<a href="foo"></a>');
			expect(report).toBeValid();
		});
	});

	describe("allowRelative: false", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "allowed-links": ["error", { allowRelative: false }] },
			});
		});

		it("should not report error when link is external using //", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<a href="//example.net/foo"></a>');
			expect(report).toBeValid();
		});

		it("should not report error when link is external using protocol://", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<a href="http://example.net/foo"></a>');
			expect(report).toBeValid();
		});

		it("should not report error link is absolute", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<a href="/foo"></a>');
			expect(report).toBeValid();
		});

		it("should report error link is relative to path", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<a href="./foo"></a>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("allowed-links", "Link destination must not be relative url");
		});

		it("should report error link is relative to base", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<a href="foo"></a>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("allowed-links", "Link destination must not be relative url");
		});
	});

	describe("allowBase: false", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "allowed-links": ["error", { allowBase: false }] },
			});
		});

		it("should not report error when link is external using //", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<a href="//example.net/foo"></a>');
			expect(report).toBeValid();
		});

		it("should not report error when link is external using protocol://", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<a href="http://example.net/foo"></a>');
			expect(report).toBeValid();
		});

		it("should not report error link is absolute", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<a href="/foo"></a>');
			expect(report).toBeValid();
		});

		it("should not report error link is relative to path", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<a href="./foo"></a>');
			expect(report).toBeValid();
		});

		it("should report error link is relative to base", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<a href="foo"></a>');
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"allowed-links",
				"Relative links must be relative to current folder"
			);
		});
	});

	describe("allowAbsolute: false", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "allowed-links": ["error", { allowAbsolute: false }] },
			});
		});

		it("should not report error when link is external using //", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<a href="//example.net/foo"></a>');
			expect(report).toBeValid();
		});

		it("should not report error when link is external using protocol://", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<a href="http://example.net/foo"></a>');
			expect(report).toBeValid();
		});

		it("should report error link is absolute", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<a href="/foo"></a>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("allowed-links", "Link destination must not be absolute url");
		});

		it("should not report error link is relative to path", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<a href="./foo"></a>');
			expect(report).toBeValid();
		});

		it("should report error link is relative to base", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<a href="foo"></a>');
			expect(report).toBeValid();
		});
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "allowed-links": "error" },
		});
		expect(htmlvalidate.getRuleDocumentation("allowed-links")).toMatchSnapshot();
	});

	describe("should contain contextual documentation", () => {
		it.each`
			style                 | value
			${"external"}         | ${Style.EXTERNAL}
			${"relative to base"} | ${Style.RELATIVE_BASE}
			${"relative to path"} | ${Style.RELATIVE_PATH}
			${"absolute"}         | ${Style.ABSOLUTE}
		`("$style", ({ value }) => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "allowed-links": "error" },
			});
			expect(htmlvalidate.getRuleDocumentation("allowed-links", null, value)).toMatchSnapshot();
		});
	});
});
