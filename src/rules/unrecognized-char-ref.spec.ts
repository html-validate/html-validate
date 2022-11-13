import HtmlValidate from "../htmlvalidate";
import "../jest";
import { RuleContext } from "./unrecognized-char-ref";

describe("rule unrecognized-char-ref", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "unrecognized-char-ref": "error" },
		});
	});

	describe("text content", () => {
		it("should not report error for valid character reference", () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <p>&amp;</p> `;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error for raw ampersand", () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <p>&</p> `;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when for invalid character reference", () => {
			expect.assertions(2);
			const markup = /* HTML */ `
				<p>&spam;</p>
			`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Unrecognized character reference "&spam;" (unrecognized-char-ref) at inline:2:8:
				  1 |
				> 2 | 				<p>&spam;</p>
				    | 				   ^^^^^^
				  3 |
				Selector: p"
			`);
		});

		it("should handle multiple entities", () => {
			expect.assertions(2);
			const markup = /* HTML */ `
				<p>&foo; &bar; &baz;</p>
			`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Unrecognized character reference "&foo;" (unrecognized-char-ref) at inline:2:8:
				  1 |
				> 2 | 				<p>&foo; &bar; &baz;</p>
				    | 				   ^^^^^
				  3 |
				Selector: p
				error: Unrecognized character reference "&bar;" (unrecognized-char-ref) at inline:2:14:
				  1 |
				> 2 | 				<p>&foo; &bar; &baz;</p>
				    | 				         ^^^^^
				  3 |
				Selector: p
				error: Unrecognized character reference "&baz;" (unrecognized-char-ref) at inline:2:20:
				  1 |
				> 2 | 				<p>&foo; &bar; &baz;</p>
				    | 				               ^^^^^
				  3 |
				Selector: p"
			`);
		});

		it("should handle nested elements", () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <div><p>&amp;</p></div> `;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	describe("attribute", () => {
		it("should not report error for valid character reference", () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <p id="&amp;&#123;"></p> `;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error for raw ampersand", () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<a href="?foo&bar"></p>
				<a href="foo?bar&baz"></p>
			`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when for invalid character reference", () => {
			expect.assertions(2);
			const markup = /* HTML */ `
				<p title="&spam;"></p>
			`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Unrecognized character reference "&spam;" (unrecognized-char-ref) at inline:2:15:
				  1 |
				> 2 | 				<p title="&spam;"></p>
				    | 				          ^^^^^^
				  3 |
				Selector: p"
			`);
		});

		it("should handle boolean attributes", () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <p id></p> `;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	describe("ignoreCase", () => {
		const markup = /* HTML */ `
			<p id="lowercase">&nbsp;</p>
			<p id="uppercase">&NBSP;</p>
			<p id="mixedcase">&nBSp;</p>
			<p id="pascalcase">&ApplyFunction;</p>
		`;

		it("should be case sensitive by default", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString(markup);
			expect(report).toMatchInlineCodeframe(`
				"error: Unrecognized character reference "&NBSP;" (unrecognized-char-ref) at inline:3:22:
				  1 |
				  2 | 			<p id="lowercase">&nbsp;</p>
				> 3 | 			<p id="uppercase">&NBSP;</p>
				    | 			                  ^^^^^^
				  4 | 			<p id="mixedcase">&nBSp;</p>
				  5 | 			<p id="pascalcase">&ApplyFunction;</p>
				  6 |
				Selector: #uppercase
				error: Unrecognized character reference "&nBSp;" (unrecognized-char-ref) at inline:4:22:
				  2 | 			<p id="lowercase">&nbsp;</p>
				  3 | 			<p id="uppercase">&NBSP;</p>
				> 4 | 			<p id="mixedcase">&nBSp;</p>
				    | 			                  ^^^^^^
				  5 | 			<p id="pascalcase">&ApplyFunction;</p>
				  6 |
				Selector: #mixedcase"
			`);
		});

		it("should ignore case when option is enabled", () => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				rules: { "unrecognized-char-ref": ["error", { ignoreCase: true }] },
			});
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should retain capitalization in error message", () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <p>&UnKnOwN;</p> `;
			htmlvalidate = new HtmlValidate({
				rules: { "unrecognized-char-ref": ["error", { ignoreCase: true }] },
			});
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Unrecognized character reference "&UnKnOwN;" (unrecognized-char-ref) at inline:1:5:
				> 1 |  <p>&UnKnOwN;</p>
				    |     ^^^^^^^^^
				Selector: p"
			`);
		});
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(htmlvalidate.getRuleDocumentation("unrecognized-char-ref")).toMatchSnapshot();
	});

	it("should contain contextual documentation", () => {
		expect.assertions(1);
		const context: RuleContext = {
			entity: "&spam;",
		};
		expect(
			htmlvalidate.getRuleDocumentation("unrecognized-char-ref", null, context)
		).toMatchSnapshot();
	});
});
