import { HtmlValidate } from "../../htmlvalidate";
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

		it("should not report when img has alt attribute", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <img alt="foobar" /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report when img has empty alt attribute", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <img alt="" /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report when img has null alt attribute", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <img alt /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report when img is hidden from accessibility tree", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<img aria-hidden="true" />
				<img role="presentation" />
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when img is missing alt attribute", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <img /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <img> is missing required "alt" attribute (wcag/h37) at inline:1:3:
				> 1 |  <img />
				    |   ^^^
				Selector: img"
			`);
		});

		it("smoketest", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateFile("test-files/rules/wcag/h37.html");
			expect(report).toMatchInlineCodeframe(`
				"error: <img> is missing required "alt" attribute (wcag/h37) at test-files/rules/wcag/h37.html:3:2:
				  1 | <img alt="..">
				  2 | <img alt="">
				> 3 | <img translate-attr="..">
				    |  ^^^
				  4 | <img>
				  5 |
				  6 | <!-- regression #33 (https://gitlab.com/html-validate/html-validate/issues/33) -->
				Selector: img:nth-child(3)
				error: <img> is missing required "alt" attribute (wcag/h37) at test-files/rules/wcag/h37.html:4:2:
				  2 | <img alt="">
				  3 | <img translate-attr="..">
				> 4 | <img>
				    |  ^^^
				  5 |
				  6 | <!-- regression #33 (https://gitlab.com/html-validate/html-validate/issues/33) -->
				  7 | <div>
				Selector: img:nth-child(4)"
			`);
		});
	});

	describe("with allowEmpty false", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "wcag/h37": ["error", { allowEmpty: false }] },
			});
		});

		it("should not report when img has alt attribute", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <img alt="foobar" /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report when img has empty alt attribute", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <img alt="" /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <img> cannot have empty "alt" attribute (wcag/h37) at inline:1:7:
				> 1 |  <img alt="" />
				    |       ^^^
				Selector: img"
			`);
		});

		it("should report when img has null alt attribute", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <img alt /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <img> cannot have empty "alt" attribute (wcag/h37) at inline:1:7:
				> 1 |  <img alt />
				    |       ^^^
				Selector: img"
			`);
		});

		it("should report error when img is missing alt attribute", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <img /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <img> is missing required "alt" attribute (wcag/h37) at inline:1:3:
				> 1 |  <img />
				    |   ^^^
				Selector: img"
			`);
		});

		it("smoketest", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateFile("test-files/rules/wcag/h37.html");
			expect(report).toMatchInlineCodeframe(`
				"error: <img> cannot have empty "alt" attribute (wcag/h37) at test-files/rules/wcag/h37.html:2:6:
				  1 | <img alt="..">
				> 2 | <img alt="">
				    |      ^^^
				  3 | <img translate-attr="..">
				  4 | <img>
				  5 |
				Selector: img:nth-child(2)
				error: <img> is missing required "alt" attribute (wcag/h37) at test-files/rules/wcag/h37.html:3:2:
				  1 | <img alt="..">
				  2 | <img alt="">
				> 3 | <img translate-attr="..">
				    |  ^^^
				  4 | <img>
				  5 |
				  6 | <!-- regression #33 (https://gitlab.com/html-validate/html-validate/issues/33) -->
				Selector: img:nth-child(3)
				error: <img> is missing required "alt" attribute (wcag/h37) at test-files/rules/wcag/h37.html:4:2:
				  2 | <img alt="">
				  3 | <img translate-attr="..">
				> 4 | <img>
				    |  ^^^
				  5 |
				  6 | <!-- regression #33 (https://gitlab.com/html-validate/html-validate/issues/33) -->
				  7 | <div>
				Selector: img:nth-child(4)"
			`);
		});
	});

	describe("with alias", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "wcag/h37": ["error", { alias: "translate-attr" }] },
			});
		});

		it("should not report when img has alias attribute set", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <img translate-attr="..." /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when img is missing both alt and aliases", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <img /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <img> is missing required "alt" attribute (wcag/h37) at inline:1:3:
				> 1 |  <img />
				    |   ^^^
				Selector: img"
			`);
		});

		it("smoketest", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateFile("test-files/rules/wcag/h37.html");
			expect(report).toMatchInlineCodeframe(`
				"error: <img> is missing required "alt" attribute (wcag/h37) at test-files/rules/wcag/h37.html:4:2:
				  2 | <img alt="">
				  3 | <img translate-attr="..">
				> 4 | <img>
				    |  ^^^
				  5 |
				  6 | <!-- regression #33 (https://gitlab.com/html-validate/html-validate/issues/33) -->
				  7 | <div>
				Selector: img:nth-child(4)"
			`);
		});
	});

	describe("with alias (array)", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "wcag/h37": ["error", { alias: ["translate-attr"] }] },
			});
		});

		it("should not report when img has alias attribute set", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <img translate-attr="..." /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("smoketest", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateFile("test-files/rules/wcag/h37.html");
			expect(report).toMatchInlineCodeframe(`
				"error: <img> is missing required "alt" attribute (wcag/h37) at test-files/rules/wcag/h37.html:4:2:
				  2 | <img alt="">
				  3 | <img translate-attr="..">
				> 4 | <img>
				    |  ^^^
				  5 |
				  6 | <!-- regression #33 (https://gitlab.com/html-validate/html-validate/issues/33) -->
				  7 | <div>
				Selector: img:nth-child(4)"
			`);
		});
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "wcag/h37": "error" },
		});
		const docs = await htmlvalidate.getRuleDocumentation("wcag/h37");
		expect(docs).toMatchSnapshot();
	});
});
