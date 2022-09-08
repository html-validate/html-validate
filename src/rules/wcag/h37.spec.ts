import HtmlValidate from "../../htmlvalidate";
import "../../jest";

describe("rule h37", () => {
	let htmlvalidate: HtmlValidate;

	describe("with default options", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "wcag/h37": "error" },
			});
		});

		it("should not report when img has alt attribute", () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <img alt="foobar" /> `;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report when input image has alt attribute", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<input type="image" alt="foobar">');
			expect(report).toBeValid();
		});

		it("should not report when other input types are missing alt attribute", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<input type="text">');
			expect(report).toBeValid();
		});

		it("should not report when img has empty alt attribute", () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <img alt="" /> `;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report when input image has empty alt attribute", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<input type="image" alt="">');
			expect(report).toBeValid();
		});

		it("should not report when img is hidden from accessibility tree", () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<img aria-hidden="true" />
				<img role="presentation" />
			`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when img is missing alt attribute", () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <img /> `;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <img> is missing required "alt" attribute (wcag/h37) at inline:1:3:
				> 1 |  <img />
				    |   ^^^
				Selector: img"
			`);
		});

		it("should report error when input image is missing alt attribute", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<input type="image">');
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <input type="image"> is missing required "alt" attribute (wcag/h37) at inline:1:2:
				> 1 | <input type="image">
				    |  ^^^^^
				Selector: input"
			`);
		});

		it("smoketest", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateFile("test-files/rules/wcag/h37.html");
			expect(report.results).toMatchSnapshot();
		});
	});

	describe("with allowEmpty false", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "wcag/h37": ["error", { allowEmpty: false }] },
			});
		});

		it("should not report when img has alt attribute", () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <img alt="foobar" /> `;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report when img has empty alt attribute", () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <img alt="" /> `;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <img> is missing required "alt" attribute (wcag/h37) at inline:1:3:
				> 1 |  <img alt="" />
				    |   ^^^
				Selector: img"
			`);
		});

		it("should report when input image has empty alt attribute", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<input type="image" alt="">');
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <input type="image"> is missing required "alt" attribute (wcag/h37) at inline:1:2:
				> 1 | <input type="image" alt="">
				    |  ^^^^^
				Selector: input"
			`);
		});

		it("should report error when img is missing alt attribute", () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <img /> `;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <img> is missing required "alt" attribute (wcag/h37) at inline:1:3:
				> 1 |  <img />
				    |   ^^^
				Selector: img"
			`);
		});

		it("smoketest", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateFile("test-files/rules/wcag/h37.html");
			expect(report.results).toMatchSnapshot();
		});
	});

	describe("with alias", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "wcag/h37": ["error", { alias: "translate-attr" }] },
			});
		});

		it("should not report when img has alias attribute set", () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <img translate-attr="..." /> `;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when img is missing both alt and aliases", () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <img /> `;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <img> is missing required "alt" attribute (wcag/h37) at inline:1:3:
				> 1 |  <img />
				    |   ^^^
				Selector: img"
			`);
		});

		it("smoketest", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateFile("test-files/rules/wcag/h37.html");
			expect(report.results).toMatchSnapshot();
		});
	});

	describe("with alias (array)", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "wcag/h37": ["error", { alias: ["translate-attr"] }] },
			});
		});

		it("should not report when img has alias attribute set", () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <img translate-attr="..." /> `;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("smoketest", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateFile("test-files/rules/wcag/h37.html");
			expect(report.results).toMatchSnapshot();
		});
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "wcag/h37": "error" },
		});
		expect(htmlvalidate.getRuleDocumentation("wcag/h37")).toMatchSnapshot();
	});
});
