import { HtmlValidate } from "../htmlvalidate";
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
		it("should not report error for valid character reference", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <p>&amp;</p> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error for raw ampersand", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <p>&</p> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when for invalid character reference", async () => {
			expect.assertions(2);
			const markup = /* HTML */ `
				<p>&spam;</p>
			`;
			const report = await htmlvalidate.validateString(markup);
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

		it("should handle multiple entities", async () => {
			expect.assertions(2);
			const markup = /* HTML */ `
				<p>&foo; &bar; &baz;</p>
			`;
			const report = await htmlvalidate.validateString(markup);
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

		it("should handle nested elements", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <div><p>&amp;</p></div> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	describe("attribute", () => {
		it("should not report error for valid character reference", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <p id="&amp;&#123;"></p> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error for raw ampersand", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<a href="?foo&bar"></p>
				<a href="foo?bar&baz"></p>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when for invalid character reference", async () => {
			expect.assertions(2);
			const markup = /* HTML */ `
				<p title="&spam;"></p>
			`;
			const report = await htmlvalidate.validateString(markup);
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

		it("should handle boolean attributes", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <p id></p> `;
			const report = await htmlvalidate.validateString(markup);
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

		it("should be case sensitive by default", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString(markup);
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

		it("should ignore case when option is enabled", async () => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				rules: { "unrecognized-char-ref": ["error", { ignoreCase: true }] },
			});
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should retain capitalization in error message", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <p>&UnKnOwN;</p> `;
			htmlvalidate = new HtmlValidate({
				rules: { "unrecognized-char-ref": ["error", { ignoreCase: true }] },
			});
			const report = await htmlvalidate.validateString(markup);
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

		it("should require semicolon by default", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString(markup);
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

		it("should allow missing semicolon for entities with legacy compatibility when option is enabled", async () => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				rules: { "unrecognized-char-ref": ["error", { requireSemicolon: false }] },
			});
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should always require semicolon for entities without legacy compatibility", async () => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				rules: { "unrecognized-char-ref": ["error", { requireSemicolon: false }] },
			});
			const markup = /* HTML */ ` <p>&star</p> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toMatchInlineCodeframe(`
				"error: Unrecognized character reference "&star" (unrecognized-char-ref) at inline:1:5:
				> 1 |  <p>&star</p>
				    |     ^^^^^
				Selector: p"
			`);
		});
	});

	it("should contain documentation (terminated)", async () => {
		expect.assertions(1);
		const context: RuleContext = {
			entity: "&spam;",
			terminated: true,
		};
		const docs = await htmlvalidate.getContextualDocumentation({
			ruleId: "unrecognized-char-ref",
			context,
		});
		expect(docs).toMatchInlineSnapshot(`
			{
			  "description": "Unrecognized character reference \`&spam;\`.
			HTML5 defines a set of [valid character references](https://html.spec.whatwg.org/multipage/named-characters.html) but this is not a valid one.

			Ensure that:

			1. The character is one of the listed names.
			1. The case is correct (names are case sensitive).
			1. The name is terminated with a \`;\`.",
			  "url": "https://html-validate.org/rules/unrecognized-char-ref.html",
			}
		`);
	});

	it("should contain documentation (not terminated)", async () => {
		expect.assertions(1);
		const context: RuleContext = {
			entity: "&spam",
			terminated: false,
		};
		const docs = await htmlvalidate.getContextualDocumentation({
			ruleId: "unrecognized-char-ref",
			context,
		});
		expect(docs).toMatchInlineSnapshot(`
			{
			  "description": "Character reference \`&spam\` must be terminated by a semicolon.
			HTML5 defines a set of [valid character references](https://html.spec.whatwg.org/multipage/named-characters.html) but this is not a valid one.

			Ensure that:

			1. The character is one of the listed names.
			1. The case is correct (names are case sensitive).
			1. The name is terminated with a \`;\`.",
			  "url": "https://html-validate.org/rules/unrecognized-char-ref.html",
			}
		`);
	});
});
