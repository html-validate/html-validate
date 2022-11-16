import HtmlValidate from "../htmlvalidate";
import "../jest";
import { RuleContext } from "./unrecognized-char-ref";

describe("rule unrecognized-char-ref", () => {
	let htmlvalidate: HtmlValidate;

	beforeEach(() => {
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

	describe("requireSemicolon", () => {
		const markup = /* HTML */ `
			<p id="with-semicolon">&copy; &COPY;</p>
			<p id="without-semicolon">&copy &COPY</p>
		`;

		it("should require semicolon by default", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString(markup);
			expect(report).toMatchInlineCodeframe(`
				"error: Character reference "&copy" must be terminated by a semicolon (unrecognized-char-ref) at inline:3:30:
				  1 |
				  2 | 			<p id="with-semicolon">&copy; &COPY;</p>
				> 3 | 			<p id="without-semicolon">&copy &COPY</p>
				    | 			                          ^^^^^
				  4 |
				Selector: #without-semicolon
				error: Character reference "&COPY" must be terminated by a semicolon (unrecognized-char-ref) at inline:3:36:
				  1 |
				  2 | 			<p id="with-semicolon">&copy; &COPY;</p>
				> 3 | 			<p id="without-semicolon">&copy &COPY</p>
				    | 			                                ^^^^^
				  4 |
				Selector: #without-semicolon"
			`);
		});

		it("should allow missing semicolon for entities with legacy compatibility when option is enabled", () => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				rules: { "unrecognized-char-ref": ["error", { requireSemicolon: false }] },
			});
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should always require semicolon for entities without legacy compatibility", () => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				rules: { "unrecognized-char-ref": ["error", { requireSemicolon: false }] },
			});
			const markup = /* HTML */ ` <p>&star</p> `;
			const report = htmlvalidate.validateString(markup);
			expect(report).toMatchInlineCodeframe(`
				"error: Unrecognized character reference "&star" (unrecognized-char-ref) at inline:1:5:
				> 1 |  <p>&star</p>
				    |     ^^^^^
				Selector: p"
			`);
		});
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(htmlvalidate.getRuleDocumentation("unrecognized-char-ref")).toMatchSnapshot();
	});

	it("should contain contextual documentation (terminated)", () => {
		expect.assertions(1);
		const context: RuleContext = {
			entity: "&spam;",
			terminated: true,
		};
		expect(
			htmlvalidate.getRuleDocumentation("unrecognized-char-ref", null, context)
		).toMatchSnapshot();
	});

	it("should contain contextual documentation (not terminated)", () => {
		expect.assertions(1);
		const context: RuleContext = {
			entity: "&spam;",
			terminated: false,
		};
		expect(
			htmlvalidate.getRuleDocumentation("unrecognized-char-ref", null, context)
		).toMatchSnapshot();
	});
});
