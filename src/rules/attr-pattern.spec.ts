import HtmlValidate from "../htmlvalidate";
import "../matchers";
import { processAttribute } from "../transform/mocks/attribute";
import { DEFAULT_PATTERN } from "./attr-pattern";

describe("rule attr-pattern", () => {
	let htmlvalidate: HtmlValidate;

	describe("default configuration", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "attr-pattern": "error" },
			});
		});

		it("should not report error when attribute has letters and characters only", () => {
			expect.assertions(1);
			const markup = "<div foo></div>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when attribute has digits", () => {
			expect.assertions(1);
			const markup = "<div foo></div>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when attribute has dashes", () => {
			expect.assertions(1);
			const markup = "<div foo></div>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when attribute has xml namespace", () => {
			expect.assertions(1);
			const markup = "<div xfoo:bar></div>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it.each`
			attr         | description
			${"foo_bar"} | ${"underscore"}
		`("should report error when attribute has $description", ({ attr }) => {
			expect.assertions(2);
			const markup = `<div ${attr}></div>`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"attr-pattern",
				`Attribute "${attr}" should match /${DEFAULT_PATTERN}/`
			);
		});
	});

	describe("configured with single pattern", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "attr-pattern": ["error", { pattern: "[a-z]+" }] },
			});
		});

		it("should not report error when attribute has allowed characters only", () => {
			expect.assertions(1);
			const markup = "<div foo></div>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when attribute has other characters", () => {
			expect.assertions(2);
			const markup = "<div foo-2000></div>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toHaveError("attr-pattern", 'Attribute "foo-2000" should match /[a-z]+/');
		});
	});

	describe("configured with multiple patterns", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "attr-pattern": ["error", { pattern: ["[a-z]+", "[0-9]+"] }] },
			});
		});

		it("should not report error when attributes matches one of the allowed patterns", () => {
			expect.assertions(1);
			const markup = "<div foo 123></div>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when attribute doesn't match any pattern", () => {
			expect.assertions(2);
			const markup = "<div foo-123></div>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"attr-pattern",
				'Attribute "foo-123" should match one of [/[a-z]+/, /[0-9]+/]'
			);
		});
	});

	describe('configured with "ignoreForeign" true', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "attr-pattern": ["error", { ignoreForeign: true }] },
			});
		});

		it("should not report error on foreign elements", () => {
			expect.assertions(1);
			const markup = "<svg foo_bar/>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	describe('configured with "ignoreForeign" false', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "attr-pattern": ["error", { ignoreForeign: false }] },
			});
		});

		it("should report error on foreign elements", () => {
			expect.assertions(2);
			const markup = "<svg foo_bar/>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"attr-pattern",
				`Attribute "foo_bar" should match /${DEFAULT_PATTERN}/`
			);
		});
	});

	it("should not report duplicate errors for dynamic attributes", () => {
		expect.assertions(2);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "attr-pattern": "error" },
		});
		const markup = '<input dynamic-foo_bar="foo">';
		const report = htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeInvalid();
		expect(report).toHaveErrors([
			{
				ruleId: "attr-pattern",
				message: `Attribute "dynamic-foo_bar" should match /${DEFAULT_PATTERN}/`,
			},
		]);
	});

	it("should throw error if configured with invalid regexp", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "attr-pattern": ["error", { pattern: "[" }] },
		});
		expect(() => htmlvalidate.validateString("")).toThrowErrorMatchingInlineSnapshot(
			`"Invalid regular expression: /^[$/: Unterminated character class"`
		);
	});

	it("should throw error if configured with no patterns", () => {
		expect.assertions(1);
		expect(() => {
			return new HtmlValidate({
				root: true,
				rules: { "attr-pattern": ["error", { pattern: [] }] },
			});
		}).toThrowErrorMatchingInlineSnapshot(
			`"Rule configuration error: /rules/attr-pattern/1/pattern: minItems must NOT have fewer than 1 items"`
		);
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "attr-pattern": "error" },
		});
		expect(htmlvalidate.getRuleDocumentation("attr-pattern")).toMatchSnapshot();
	});

	it("should contain contextual documentation (single pattern)", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "attr-pattern": "error" },
		});
		const context = {
			attr: "foobar",
			pattern: "[a-z]+",
		};
		expect(htmlvalidate.getRuleDocumentation("attr-pattern", null, context)).toMatchSnapshot();
	});

	it("should contain contextual documentation (multiple patterns)", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "attr-pattern": "error" },
		});
		const context = {
			attr: "foobar",
			pattern: ["[a-z]+", "[0-9]+"],
		};
		expect(htmlvalidate.getRuleDocumentation("attr-pattern", null, context)).toMatchSnapshot();
	});
});
