import "../matchers";
import { Lexer } from "./lexer";
import { TokenType } from "./token";

function inlineSource(source: string, { line = 1, column = 1 } = {}) {
	return {
		data: source,
		filename: "inline",
		line,
		column,
	};
}

describe("lexer", () => {
	let lexer: Lexer;

	beforeEach(() => {
		lexer = new Lexer();
	});

	it("should read location information from source", () => {
		const source = inlineSource('<p foo="bar">\n\tfoo\n</p>', {
			line: 5,
			column: 42,
		});
		const token = lexer.tokenize(source);
		expect(token.next()).toBeToken({
			type: TokenType.TAG_OPEN,
			location: {
				offset: 0,
				line: 5,
				column: 42,
				size: 2,
				filename: expect.any(String),
			},
		}); // <p
		expect(token.next()).toBeToken({
			type: TokenType.WHITESPACE,
			location: {
				offset: 2,
				line: 5,
				column: 44,
				size: 1,
				filename: expect.any(String),
			},
		}); // [whitespace]
		expect(token.next()).toBeToken({
			type: TokenType.ATTR_NAME,
			location: {
				offset: 3,
				line: 5,
				column: 45,
				size: 3,
				filename: expect.any(String),
			},
		}); // foo
		expect(token.next()).toBeToken({
			type: TokenType.ATTR_VALUE,
			location: {
				offset: 6,
				line: 5,
				column: 48,
				size: 6,
				filename: expect.any(String),
			},
		}); // ="bar"
		expect(token.next()).toBeToken({
			type: TokenType.TAG_CLOSE,
			location: {
				offset: 12,
				line: 5,
				column: 54,
				size: 1,
				filename: expect.any(String),
			},
		}); // >
		expect(token.next()).toBeToken({
			type: TokenType.WHITESPACE,
			location: {
				offset: 13,
				line: 5,
				column: 55,
				size: 1,
				filename: expect.any(String),
			},
		}); // \n
		expect(token.next()).toBeToken({
			type: TokenType.WHITESPACE,
			location: {
				offset: 14,
				line: 6,
				column: 1,
				size: 1,
				filename: expect.any(String),
			},
		}); // \t
		expect(token.next()).toBeToken({
			type: TokenType.TEXT,
			location: {
				offset: 15,
				line: 6,
				column: 2,
				size: 3,
				filename: expect.any(String),
			},
		}); // foo
		expect(token.next()).toBeToken({
			type: TokenType.WHITESPACE,
			location: {
				offset: 18,
				line: 6,
				column: 5,
				size: 1,
				filename: expect.any(String),
			},
		}); // \n
		expect(token.next()).toBeToken({
			type: TokenType.TAG_OPEN,
			location: {
				offset: 19,
				line: 7,
				column: 1,
				size: 3,
				filename: expect.any(String),
			},
		}); // </p
		expect(token.next()).toBeToken({
			type: TokenType.TAG_CLOSE,
			location: {
				offset: 22,
				line: 7,
				column: 4,
				size: 1,
				filename: expect.any(String),
			},
		}); // >
		expect(token.next()).toBeToken({ type: TokenType.EOF });
		expect(token.next().done).toBeTruthy();
	});

	it("should throw error when source cannot be tokenized", () => {
		const shortSource = inlineSource("<p\n<p></p></p>");
		const longSource = inlineSource(
			"<p\n<p>lorem ipsum dolor sit amet</p></p>"
		);
		expect(() => {
			Array.from(lexer.tokenize(shortSource));
		}).toThrow(
			'failed to tokenize "<p></p></p>", expected attribute, ">" or "/>"'
		);
		expect(() => {
			Array.from(lexer.tokenize(longSource));
		}).toThrow(
			'failed to tokenize "<p>lorem i...", expected attribute, ">" or "/>"'
		);
	});

	describe("should tokenize", () => {
		it("xml declaration", () => {
			const token = lexer.tokenize(
				inlineSource('<?xml version="1.0" encoding="utf-8"?>\n')
			);
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("uppercase doctype", () => {
			const token = lexer.tokenize(inlineSource("<!DOCTYPE html>"));
			expect(token.next()).toBeToken({ type: TokenType.DOCTYPE_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.DOCTYPE_VALUE });
			expect(token.next()).toBeToken({ type: TokenType.DOCTYPE_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("lowercase doctype", () => {
			const token = lexer.tokenize(inlineSource("<!doctype html>"));
			expect(token.next()).toBeToken({ type: TokenType.DOCTYPE_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.DOCTYPE_VALUE });
			expect(token.next()).toBeToken({ type: TokenType.DOCTYPE_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("whitespace before doctype", () => {
			const token = lexer.tokenize(inlineSource(" <!doctype html>"));
			expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
			expect(token.next()).toBeToken({ type: TokenType.DOCTYPE_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.DOCTYPE_VALUE });
			expect(token.next()).toBeToken({ type: TokenType.DOCTYPE_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("open/void tags", () => {
			const token = lexer.tokenize(inlineSource("<foo>"));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("self-closing tags", () => {
			const token = lexer.tokenize(inlineSource("<foo/>"));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("close tags", () => {
			const token = lexer.tokenize(inlineSource("</foo>"));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("tags with numbers", () => {
			const token = lexer.tokenize(inlineSource("<h1>"));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("tags with dashes", () => {
			const token = lexer.tokenize(inlineSource("<foo-bar>"));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("attribute with double-quotes", () => {
			const token = lexer.tokenize(inlineSource('<foo bar="baz">'));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
			expect(token.next()).toBeToken({ type: TokenType.ATTR_NAME });
			expect(token.next()).toBeToken({ type: TokenType.ATTR_VALUE });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("attribute with single-quotes", () => {
			const token = lexer.tokenize(inlineSource("<foo bar='baz'>"));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
			expect(token.next()).toBeToken({ type: TokenType.ATTR_NAME });
			expect(token.next()).toBeToken({ type: TokenType.ATTR_VALUE });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		describe("unquoted attributes", () => {
			it("with text", () => {
				const token = lexer.tokenize(inlineSource("<foo bar=baz>"));
				expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
				expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
				expect(token.next()).toBeToken({ type: TokenType.ATTR_NAME });
				expect(token.next()).toBeToken({
					type: TokenType.ATTR_VALUE,
					data: ["=baz", "baz"],
				});
				expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
				expect(token.next()).toBeToken({ type: TokenType.EOF });
				expect(token.next().done).toBeTruthy();
			});

			it("with numerical values", () => {
				const token = lexer.tokenize(inlineSource("<foo rows=5>"));
				expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
				expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
				expect(token.next()).toBeToken({
					type: TokenType.ATTR_NAME,
					data: ["rows", "rows"],
				});
				expect(token.next()).toBeToken({
					type: TokenType.ATTR_VALUE,
					data: ["=5", "5"],
				});
				expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
				expect(token.next()).toBeToken({ type: TokenType.EOF });
				expect(token.next().done).toBeTruthy();
			});

			/* while some of these characters are technically illegal the lexer
			 * shouldn't choke on them, instead there are rules such as
			 * no-raw-characters that yields useful errors */
			it.each(Array.from("?/&=`"))("with '%s' character", (char: string) => {
				const token = lexer.tokenize(inlineSource(`<a href=${char}>`));
				expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
				expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
				expect(token.next()).toBeToken({
					type: TokenType.ATTR_NAME,
					data: ["href", "href"],
				});
				expect(token.next()).toBeToken({
					type: TokenType.ATTR_VALUE,
					data: [`=${char}`, char],
				});
				expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
				expect(token.next()).toBeToken({ type: TokenType.EOF });
				expect(token.next().done).toBeTruthy();
			});
		});

		it("attribute without value", () => {
			const token = lexer.tokenize(inlineSource("<foo bar>"));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
			expect(token.next()).toBeToken({ type: TokenType.ATTR_NAME });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("attribute with LF", () => {
			const token = lexer.tokenize(inlineSource("<foo\nbar>"));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
			expect(token.next()).toBeToken({ type: TokenType.ATTR_NAME });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("attribute with CR", () => {
			const token = lexer.tokenize(inlineSource("<foo\rbar>"));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({
				type: TokenType.WHITESPACE,
				data: ["\r"],
			});
			expect(token.next()).toBeToken({ type: TokenType.ATTR_NAME });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("attribute with CRLF", () => {
			const token = lexer.tokenize(inlineSource("<foo\r\nbar>"));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({
				type: TokenType.WHITESPACE,
				data: ["\r\n"],
			});
			expect(token.next()).toBeToken({ type: TokenType.ATTR_NAME });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("attribute with tag inside", () => {
			const token = lexer.tokenize(inlineSource('<foo bar="<div>">'));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
			expect(token.next()).toBeToken({ type: TokenType.ATTR_NAME });
			expect(token.next()).toBeToken({ type: TokenType.ATTR_VALUE });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("text", () => {
			const token = lexer.tokenize(inlineSource("foo"));
			expect(token.next()).toBeToken({ type: TokenType.TEXT });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("indented text", () => {
			const token = lexer.tokenize(inlineSource("  foo"));
			expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
			expect(token.next()).toBeToken({ type: TokenType.TEXT });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("element with text", () => {
			const token = lexer.tokenize(inlineSource("<p>foo</p>"));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.TEXT });
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("newlines", () => {
			const token = lexer.tokenize(inlineSource("<p>\nfoo\n</p>"));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
			expect(token.next()).toBeToken({ type: TokenType.TEXT });
			expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("whitespace CR", () => {
			const token = lexer.tokenize(inlineSource("<p>\r  foo\r</p>  \r"));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({
				type: TokenType.WHITESPACE,
				data: ["\r"],
			});
			expect(token.next()).toBeToken({
				type: TokenType.WHITESPACE,
				data: ["  "],
			});
			expect(token.next()).toBeToken({ type: TokenType.TEXT, data: ["foo"] });
			expect(token.next()).toBeToken({
				type: TokenType.WHITESPACE,
				data: ["\r"],
			});
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({
				type: TokenType.WHITESPACE,
				data: ["  \r"],
			});
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("whitespace LF", () => {
			const token = lexer.tokenize(inlineSource("<p>\n  foo\n</p>  \n"));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({
				type: TokenType.WHITESPACE,
				data: ["\n"],
			});
			expect(token.next()).toBeToken({
				type: TokenType.WHITESPACE,
				data: ["  "],
			});
			expect(token.next()).toBeToken({ type: TokenType.TEXT, data: ["foo"] });
			expect(token.next()).toBeToken({
				type: TokenType.WHITESPACE,
				data: ["\n"],
			});
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({
				type: TokenType.WHITESPACE,
				data: ["  \n"],
			});
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("whitespace CRLF", () => {
			const token = lexer.tokenize(inlineSource("<p>\r\n  foo\r\n</p>  \r\n"));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({
				type: TokenType.WHITESPACE,
				data: ["\r\n"],
			});
			expect(token.next()).toBeToken({
				type: TokenType.WHITESPACE,
				data: ["  "],
			});
			expect(token.next()).toBeToken({ type: TokenType.TEXT, data: ["foo"] });
			expect(token.next()).toBeToken({
				type: TokenType.WHITESPACE,
				data: ["\r\n"],
			});
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({
				type: TokenType.WHITESPACE,
				data: ["  \r\n"],
			});
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("nested with text", () => {
			const token = lexer.tokenize(inlineSource("<div>\n  <p>foo</p>\n</div>"));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
			expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.TEXT });
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("CDATA", () => {
			const token = lexer.tokenize(
				inlineSource("<![CDATA[ <p>lorem</div> ipsum ]]>")
			);
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("script tag", () => {
			const token = lexer.tokenize(
				inlineSource('<script>document.write("<p>lorem</p>");</script>')
			);
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.SCRIPT });
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("script tag with type", () => {
			const token = lexer.tokenize(
				inlineSource(
					'<script type="text/javascript">document.write("<p>lorem</p>");</script>'
				)
			);
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
			expect(token.next()).toBeToken({ type: TokenType.ATTR_NAME });
			expect(token.next()).toBeToken({ type: TokenType.ATTR_VALUE });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.SCRIPT });
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("self-closed script tag", () => {
			/* not legal but lexer shouldn't choke on it */
			const token = lexer.tokenize(
				inlineSource('<head><script src="foo.js"/></head>')
			);
			expect(token.next()).toBeToken({
				type: TokenType.TAG_OPEN,
				data: ["<head", "", "head"],
			});
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({
				type: TokenType.TAG_OPEN,
				data: ["<script", "", "script"],
			});
			expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
			expect(token.next()).toBeToken({ type: TokenType.ATTR_NAME });
			expect(token.next()).toBeToken({ type: TokenType.ATTR_VALUE });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({
				type: TokenType.TAG_OPEN,
				data: ["</head", "/", "head"],
			});
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("multiple script tags", () => {
			const token = lexer.tokenize(
				inlineSource("<script>foo</script>bar<script>baz</script>")
			);
			/* first script tag */
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.SCRIPT, data: ["foo"] });
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			/* text inbetween */
			expect(token.next()).toBeToken({ type: TokenType.TEXT, data: ["bar"] });
			/* second script tag */
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.SCRIPT, data: ["baz"] });
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("comment", () => {
			const token = lexer.tokenize(inlineSource("<!-- comment -->"));
			expect(token.next()).toBeToken({
				type: TokenType.COMMENT,
				data: ["<!-- comment -->", " comment "],
			});
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("html-validate directive", () => {
			const token = lexer.tokenize(
				inlineSource("<!-- [html-validate-action options: comment] -->")
			);
			expect(token.next()).toBeToken({
				type: TokenType.DIRECTIVE,
				data: [
					"<!-- [html-validate-action options: comment] -->",
					"action options: comment",
				],
			});
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		describe("browser conditional", () => {
			it("downlevel-hidden", () => {
				const token = lexer.tokenize(
					inlineSource("<!--[if IE 6]>foo<![endif]-->")
				);
				expect(token.next()).toBeToken({
					type: TokenType.CONDITIONAL,
					data: ["<!--[if IE 6]>", "if IE 6"],
				});
				expect(token.next()).toBeToken({ type: TokenType.TEXT, data: ["foo"] });
				expect(token.next()).toBeToken({
					type: TokenType.CONDITIONAL,
					data: ["<![endif]-->", "endif"],
				});
				expect(token.next()).toBeToken({ type: TokenType.EOF });
				expect(token.next().done).toBeTruthy();
			});

			it("downlevel-reveal", () => {
				const token = lexer.tokenize(inlineSource("<![if IE 6]>foo<![endif]>"));
				expect(token.next()).toBeToken({
					type: TokenType.CONDITIONAL,
					data: ["<![if IE 6]>", "if IE 6"],
				});
				expect(token.next()).toBeToken({ type: TokenType.TEXT, data: ["foo"] });
				expect(token.next()).toBeToken({
					type: TokenType.CONDITIONAL,
					data: ["<![endif]>", "endif"],
				});
				expect(token.next()).toBeToken({ type: TokenType.EOF });
			});

			it("nested comment", () => {
				const token = lexer.tokenize(
					inlineSource("<!--[if IE 6]><!-- foo --><![endif]-->")
				);
				expect(token.next()).toBeToken({
					type: TokenType.CONDITIONAL,
					data: ["<!--[if IE 6]>", "if IE 6"],
				});
				expect(token.next()).toBeToken({
					type: TokenType.COMMENT,
					data: ["<!-- foo -->", " foo "],
				});
				expect(token.next()).toBeToken({
					type: TokenType.CONDITIONAL,
					data: ["<![endif]-->", "endif"],
				});
				expect(token.next()).toBeToken({ type: TokenType.EOF });
			});
		});
	});
});
