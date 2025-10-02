import { type Source } from "../context";
import "../jest";
import { Lexer } from "./lexer";
import { TokenType } from "./token";

function inlineSource(source: string, { line = 1, column = 1 } = {}): Source {
	return {
		data: source,
		filename: "inline",
		line,
		column,
		offset: 0,
	};
}

describe("lexer", () => {
	let lexer: Lexer;

	beforeEach(() => {
		lexer = new Lexer();
	});

	it("should read location information from source", () => {
		expect.assertions(13);
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
		expect.assertions(2);
		const shortSource = inlineSource("<p\n<p></p></p>");
		const longSource = inlineSource("<p\n<p>lorem ipsum dolor sit amet</p></p>");
		expect(() => {
			Array.from(lexer.tokenize(shortSource));
		}).toThrow('failed to tokenize "<p></p></p>", expected attribute, ">" or "/>"');
		expect(() => {
			Array.from(lexer.tokenize(longSource));
		}).toThrow('failed to tokenize "<p>lorem i...", expected attribute, ">" or "/>"');
	});

	describe("should tokenize", () => {
		it("unicode bom", () => {
			expect.assertions(6);
			const token = lexer.tokenize(inlineSource("\uFEFF<!DOCTYPE html>"));
			expect(token.next()).toBeToken({ type: TokenType.UNICODE_BOM });
			expect(token.next()).toBeToken({ type: TokenType.DOCTYPE_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.DOCTYPE_VALUE });
			expect(token.next()).toBeToken({ type: TokenType.DOCTYPE_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("xml declaration", () => {
			expect.assertions(2);
			const token = lexer.tokenize(inlineSource('<?xml version="1.0" encoding="utf-8"?>\n'));
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("xml declaration trailing whitespace", () => {
			expect.assertions(2);
			const token = lexer.tokenize(inlineSource('<?xml version="1.0" encoding="utf-8"?> \r\n'));
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("uppercase doctype", () => {
			expect.assertions(5);
			const token = lexer.tokenize(inlineSource("<!DOCTYPE html>"));
			expect(token.next()).toBeToken({ type: TokenType.DOCTYPE_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.DOCTYPE_VALUE });
			expect(token.next()).toBeToken({ type: TokenType.DOCTYPE_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("lowercase doctype", () => {
			expect.assertions(5);
			const token = lexer.tokenize(inlineSource("<!doctype html>"));
			expect(token.next()).toBeToken({ type: TokenType.DOCTYPE_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.DOCTYPE_VALUE });
			expect(token.next()).toBeToken({ type: TokenType.DOCTYPE_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("mixed case doctype", () => {
			expect.assertions(5);
			const token = lexer.tokenize(inlineSource("<!dOcTypE html>"));
			expect(token.next()).toBeToken({ type: TokenType.DOCTYPE_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.DOCTYPE_VALUE });
			expect(token.next()).toBeToken({ type: TokenType.DOCTYPE_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("whitespace before doctype", () => {
			expect.assertions(6);
			const token = lexer.tokenize(inlineSource(" <!doctype html>"));
			expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
			expect(token.next()).toBeToken({ type: TokenType.DOCTYPE_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.DOCTYPE_VALUE });
			expect(token.next()).toBeToken({ type: TokenType.DOCTYPE_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("comment before doctype", () => {
			expect.assertions(7);
			const token = lexer.tokenize(inlineSource("<!-- foo -->\n<!doctype html>"));
			expect(token.next()).toBeToken({ type: TokenType.COMMENT });
			expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
			expect(token.next()).toBeToken({ type: TokenType.DOCTYPE_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.DOCTYPE_VALUE });
			expect(token.next()).toBeToken({ type: TokenType.DOCTYPE_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("open/void tags", () => {
			expect.assertions(4);
			const token = lexer.tokenize(inlineSource("<foo>"));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("self-closing tags", () => {
			expect.assertions(4);
			const token = lexer.tokenize(inlineSource("<foo/>"));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("close tags", () => {
			expect.assertions(4);
			const token = lexer.tokenize(inlineSource("</foo>"));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("tags with numbers", () => {
			expect.assertions(4);
			const token = lexer.tokenize(inlineSource("<h1>"));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("tags with dashes", () => {
			expect.assertions(4);
			const token = lexer.tokenize(inlineSource("<foo-bar>"));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("tags with underscore", () => {
			expect.assertions(4);
			const token = lexer.tokenize(inlineSource("<foo_bar>"));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("attribute with double-quotes", () => {
			expect.assertions(7);
			const token = lexer.tokenize(inlineSource('<foo bar="baz">'));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
			expect(token.next()).toBeToken({ type: TokenType.ATTR_NAME });
			expect(token.next()).toBeToken({
				type: TokenType.ATTR_VALUE,
				data: ['="baz"', "=", "baz", '"'],
			});
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("attribute with whitespace and double-quotes", () => {
			expect.assertions(7);
			const token = lexer.tokenize(inlineSource('<foo bar = "baz">'));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
			expect(token.next()).toBeToken({ type: TokenType.ATTR_NAME });
			expect(token.next()).toBeToken({
				type: TokenType.ATTR_VALUE,
				data: [' = "baz"', " = ", "baz", '"'],
			});
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("attribute with single-quotes", () => {
			expect.assertions(7);
			const token = lexer.tokenize(inlineSource("<foo bar='baz'>"));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
			expect(token.next()).toBeToken({ type: TokenType.ATTR_NAME });
			expect(token.next()).toBeToken({
				type: TokenType.ATTR_VALUE,
				data: ["='baz'", "=", "baz", "'"],
			});
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("attribute with whitespace and single-quotes", () => {
			expect.assertions(7);
			const token = lexer.tokenize(inlineSource("<foo bar = 'baz'>"));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
			expect(token.next()).toBeToken({ type: TokenType.ATTR_NAME });
			expect(token.next()).toBeToken({
				type: TokenType.ATTR_VALUE,
				data: [" = 'baz'", " = ", "baz", "'"],
			});
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		describe("unquoted attributes", () => {
			it("with text", () => {
				expect.assertions(7);
				const token = lexer.tokenize(inlineSource("<foo bar=baz>"));
				expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
				expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
				expect(token.next()).toBeToken({ type: TokenType.ATTR_NAME });
				expect(token.next()).toBeToken({
					type: TokenType.ATTR_VALUE,
					data: ["=baz", "=", "baz"],
				});
				expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
				expect(token.next()).toBeToken({ type: TokenType.EOF });
				expect(token.next().done).toBeTruthy();
			});

			it("with numerical values", () => {
				expect.assertions(7);
				const token = lexer.tokenize(inlineSource("<foo rows=5>"));
				expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
				expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
				expect(token.next()).toBeToken({
					type: TokenType.ATTR_NAME,
					data: ["rows", "rows"],
				});
				expect(token.next()).toBeToken({
					type: TokenType.ATTR_VALUE,
					data: ["=5", "=", "5"],
				});
				expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
				expect(token.next()).toBeToken({ type: TokenType.EOF });
				expect(token.next().done).toBeTruthy();
			});

			it("with whitespace", () => {
				expect.assertions(7);
				const token = lexer.tokenize(inlineSource("<foo bar = baz>"));
				expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
				expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
				expect(token.next()).toBeToken({ type: TokenType.ATTR_NAME });
				expect(token.next()).toBeToken({
					type: TokenType.ATTR_VALUE,
					data: [" = baz", " = ", "baz"],
				});
				expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
				expect(token.next()).toBeToken({ type: TokenType.EOF });
				expect(token.next().done).toBeTruthy();
			});

			/* while some of these characters are technically illegal the lexer
			 * shouldn't choke on them, instead there are rules such as
			 * no-raw-characters that yields useful errors */
			it.each(Array.from("?/&=`"))("with '%s' character", (char: string) => {
				expect.assertions(7);
				const token = lexer.tokenize(inlineSource(`<a href=${char}>`));
				expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
				expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
				expect(token.next()).toBeToken({
					type: TokenType.ATTR_NAME,
					data: ["href", "href"],
				});
				expect(token.next()).toBeToken({
					type: TokenType.ATTR_VALUE,
					data: [`=${char}`, "=", char],
				});
				expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
				expect(token.next()).toBeToken({ type: TokenType.EOF });
				expect(token.next().done).toBeTruthy();
			});
		});

		it("attribute without value", () => {
			expect.assertions(6);
			const token = lexer.tokenize(inlineSource("<foo bar>"));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
			expect(token.next()).toBeToken({ type: TokenType.ATTR_NAME });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("attribute with LF", () => {
			expect.assertions(6);
			const token = lexer.tokenize(inlineSource("<foo\nbar>"));
			expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
			expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
			expect(token.next()).toBeToken({ type: TokenType.ATTR_NAME });
			expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("attribute with CR", () => {
			expect.assertions(6);
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
			expect.assertions(6);
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
			expect.assertions(7);
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
			expect.assertions(3);
			const token = lexer.tokenize(inlineSource("foo"));
			expect(token.next()).toBeToken({ type: TokenType.TEXT });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("indented text", () => {
			expect.assertions(4);
			const token = lexer.tokenize(inlineSource("  foo"));
			expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
			expect(token.next()).toBeToken({ type: TokenType.TEXT });
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		it("element with text", () => {
			expect.assertions(7);
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
			expect.assertions(9);
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
			expect.assertions(11);
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
			expect.assertions(11);
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
			expect.assertions(11);
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
			expect.assertions(14);
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
			expect.assertions(2);
			const token = lexer.tokenize(inlineSource("<![CDATA[ <p>lorem</div> ipsum ]]>"));
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		describe("script tag", () => {
			it("with nested html-markup in string", () => {
				expect.assertions(7);
				const token = lexer.tokenize(
					inlineSource('<script>document.write("<p>lorem</p>");</script>'),
				);
				expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
				expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
				expect(token.next()).toBeToken({ type: TokenType.SCRIPT });
				expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
				expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
				expect(token.next()).toBeToken({ type: TokenType.EOF });
				expect(token.next().done).toBeTruthy();
			});

			it("with type attribute", () => {
				expect.assertions(10);
				const token = lexer.tokenize(
					inlineSource('<script type="text/javascript">document.write("<p>lorem</p>");</script>'),
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

			it("self-closed", () => {
				expect.assertions(11);
				/* not legal but lexer shouldn't choke on it */
				const token = lexer.tokenize(inlineSource('<head><script src="foo.js"/></head>'));
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
				expect.assertions(13);
				const token = lexer.tokenize(inlineSource("<script>foo</script>bar<script>baz</script>"));
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
		});

		describe("style tag", () => {
			it("with regular content", () => {
				expect.assertions(7);
				const token = lexer.tokenize(inlineSource("<style>:root { color: red; }</style>"));
				expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
				expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
				expect(token.next()).toBeToken({ type: TokenType.STYLE, data: [":root { color: red; }"] });
				expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
				expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
				expect(token.next()).toBeToken({ type: TokenType.EOF });
				expect(token.next().done).toBeTruthy();
			});

			it("with tag-like content", () => {
				expect.assertions(7);
				const token = lexer.tokenize(inlineSource("<style>.\\<foo {}</style>"));
				expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
				expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
				expect(token.next()).toBeToken({ type: TokenType.STYLE, data: [".\\<foo {}"] });
				expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
				expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
				expect(token.next()).toBeToken({ type: TokenType.EOF });
				expect(token.next().done).toBeTruthy();
			});

			it("with type", () => {
				expect.assertions(10);
				const token = lexer.tokenize(inlineSource('<style type="text/css">*{}</style>'));
				expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
				expect(token.next()).toBeToken({ type: TokenType.WHITESPACE });
				expect(token.next()).toBeToken({ type: TokenType.ATTR_NAME });
				expect(token.next()).toBeToken({ type: TokenType.ATTR_VALUE });
				expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
				expect(token.next()).toBeToken({ type: TokenType.STYLE, data: ["*{}"] });
				expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
				expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
				expect(token.next()).toBeToken({ type: TokenType.EOF });
				expect(token.next().done).toBeTruthy();
			});

			it("without content", () => {
				expect.assertions(6);
				const token = lexer.tokenize(inlineSource("<style></style>"));
				expect(token.next()).toBeToken({
					type: TokenType.TAG_OPEN,
					data: ["<style", "", "style"],
				});
				expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
				expect(token.next()).toBeToken({
					type: TokenType.TAG_OPEN,
					data: ["</style", "/", "style"],
				});
				expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
				expect(token.next()).toBeToken({ type: TokenType.EOF });
				expect(token.next().done).toBeTruthy();
			});

			it("self-closed style tag", () => {
				expect.assertions(4);
				const token = lexer.tokenize(inlineSource("<style/>"));
				expect(token.next()).toBeToken({
					type: TokenType.TAG_OPEN,
					data: ["<style", "", "style"],
				});
				expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
				expect(token.next()).toBeToken({ type: TokenType.EOF });
				expect(token.next().done).toBeTruthy();
			});

			it("multiple style tags", () => {
				expect.assertions(13);
				const token = lexer.tokenize(inlineSource("<style>foo</style>bar<style>baz</style>"));
				/* first style tag */
				expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
				expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
				expect(token.next()).toBeToken({ type: TokenType.STYLE, data: ["foo"] });
				expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
				expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
				/* text inbetween */
				expect(token.next()).toBeToken({ type: TokenType.TEXT, data: ["bar"] });
				/* second style tag */
				expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
				expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
				expect(token.next()).toBeToken({ type: TokenType.STYLE, data: ["baz"] });
				expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
				expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
				expect(token.next()).toBeToken({ type: TokenType.EOF });
				expect(token.next().done).toBeTruthy();
			});
		});

		describe("textarea tag", () => {
			it("with text content", () => {
				expect.assertions(7);
				const markup = `<textarea>lorem ipsum</textarea>`;
				const token = lexer.tokenize(inlineSource(markup));
				expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
				expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
				expect(token.next()).toBeToken({ type: TokenType.TEXT, data: ["lorem ipsum"] });
				expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
				expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
				expect(token.next()).toBeToken({ type: TokenType.EOF });
				expect(token.next().done).toBeTruthy();
			});

			it("with markup as text content", () => {
				expect.assertions(7);
				const markup = `<textarea><ul><li>foo</li></ul></textarea>`;
				const token = lexer.tokenize(inlineSource(markup));
				expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
				expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
				expect(token.next()).toBeToken({ type: TokenType.TEXT, data: ["<ul><li>foo</li></ul>"] });
				expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
				expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
				expect(token.next()).toBeToken({ type: TokenType.EOF });
				expect(token.next().done).toBeTruthy();
			});

			it("with malformed markup as text content", () => {
				expect.assertions(7);
				const markup = `<textarea><ul><li</textarea>`;
				const token = lexer.tokenize(inlineSource(markup));
				expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
				expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
				expect(token.next()).toBeToken({ type: TokenType.TEXT, data: ["<ul><li"] });
				expect(token.next()).toBeToken({ type: TokenType.TAG_OPEN });
				expect(token.next()).toBeToken({ type: TokenType.TAG_CLOSE });
				expect(token.next()).toBeToken({ type: TokenType.EOF });
				expect(token.next().done).toBeTruthy();
			});
		});

		it("comment", () => {
			expect.assertions(3);
			const token = lexer.tokenize(inlineSource("<!-- comment -->"));
			expect(token.next()).toBeToken({
				type: TokenType.COMMENT,
				data: ["<!-- comment -->", " comment "],
			});
			expect(token.next()).toBeToken({ type: TokenType.EOF });
			expect(token.next().done).toBeTruthy();
		});

		describe("html-validate directive", () => {
			it("with only action", () => {
				expect.assertions(3);
				const markup = "<!-- [html-validate-disable] -->";
				const token = lexer.tokenize(inlineSource(markup));
				expect(token.next()).toBeToken({
					type: TokenType.DIRECTIVE,
					data: [
						"<!-- [html-validate-disable] -->",
						"<!-- [html-validate-",
						"disable",
						"",
						"",
						"] -->",
					],
				});
				expect(token.next()).toBeToken({ type: TokenType.EOF });
				expect(token.next().done).toBeTruthy();
			});

			it("with obscure action", () => {
				expect.assertions(3);
				const markup = "<!-- [html-validate-foo-123-bar] -->";
				const token = lexer.tokenize(inlineSource(markup));
				expect(token.next()).toBeToken({
					type: TokenType.DIRECTIVE,
					data: [
						"<!-- [html-validate-foo-123-bar] -->",
						"<!-- [html-validate-",
						"foo-123-bar",
						"",
						"",
						"] -->",
					],
				});
				expect(token.next()).toBeToken({ type: TokenType.EOF });
				expect(token.next().done).toBeTruthy();
			});

			it("with colon comment", () => {
				expect.assertions(3);
				const token = lexer.tokenize(
					inlineSource("<!-- [html-validate-action options: comment] -->"),
				);
				expect(token.next()).toBeToken({
					type: TokenType.DIRECTIVE,
					data: [
						"<!-- [html-validate-action options: comment] -->",
						"<!-- [html-validate-",
						"action",
						" ",
						"options: comment",
						"] -->",
					],
				});
				expect(token.next()).toBeToken({ type: TokenType.EOF });
				expect(token.next().done).toBeTruthy();
			});

			it("with dashdash comment", () => {
				expect.assertions(3);
				const token = lexer.tokenize(
					inlineSource("<!-- [html-validate-action options -- comment] -->"),
				);
				expect(token.next()).toBeToken({
					type: TokenType.DIRECTIVE,
					data: [
						"<!-- [html-validate-action options -- comment] -->",
						"<!-- [html-validate-",
						"action",
						" ",
						"options -- comment",
						"] -->",
					],
				});
				expect(token.next()).toBeToken({ type: TokenType.EOF });
				expect(token.next().done).toBeTruthy();
			});

			it("without comment", () => {
				expect.assertions(3);
				const token = lexer.tokenize(inlineSource("<!-- [html-validate-action options] -->"));
				expect(token.next()).toBeToken({
					type: TokenType.DIRECTIVE,
					data: [
						"<!-- [html-validate-action options] -->",
						"<!-- [html-validate-",
						"action",
						" ",
						"options",
						"] -->",
					],
				});
				expect(token.next()).toBeToken({ type: TokenType.EOF });
				expect(token.next().done).toBeTruthy();
			});

			it("with excessive whitespace", () => {
				expect.assertions(3);
				const token = lexer.tokenize(
					inlineSource("<!--   \t\n\t   [html-validate-action options: comment]   \t\n\t   -->"),
				);
				expect(token.next()).toBeToken({
					type: TokenType.DIRECTIVE,
					data: [
						"<!--   \t\n\t   [html-validate-action options: comment]   \t\n\t   -->",
						"<!--   \t\n\t   [html-validate-",
						"action",
						" ",
						"options: comment",
						"]   \t\n\t   -->",
					],
				});
				expect(token.next()).toBeToken({ type: TokenType.EOF });
				expect(token.next().done).toBeTruthy();
			});

			it("with no whitespace", () => {
				expect.assertions(3);
				const token = lexer.tokenize(
					inlineSource("<!--[html-validate-action options: comment]-->"),
				);
				expect(token.next()).toBeToken({
					type: TokenType.DIRECTIVE,
					data: [
						"<!--[html-validate-action options: comment]-->",
						"<!--[html-validate-",
						"action",
						" ",
						"options: comment",
						"]-->",
					],
				});
				expect(token.next()).toBeToken({ type: TokenType.EOF });
				expect(token.next().done).toBeTruthy();
			});

			it("missing end bracket ]", () => {
				expect.assertions(3);
				const token = lexer.tokenize(
					inlineSource("<!-- [html-validate-action options: comment -->"),
				);
				expect(token.next()).toBeToken({
					type: TokenType.DIRECTIVE,
					data: [
						"<!-- [html-validate-action options: comment -->",
						"<!-- [html-validate-",
						"action",
						" ",
						"options: comment",
						" -->",
					],
				});
				expect(token.next()).toBeToken({ type: TokenType.EOF });
				expect(token.next().done).toBeTruthy();
			});
		});

		/* downlevel reveal is a non-standard "tag", handled separately */
		it("browser conditional downlevel-reveal", () => {
			expect.assertions(4);
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
	});

	describe("should not choke on templating", () => {
		it.each`
			input            | description
			${"<% ... %>"}   | ${"<% ... %>"}
			${"<%\n...\n%>"} | ${"<% ... %> (with newlines)"}
			${"<? ... ?>"}   | ${"<? ... ?>"}
			${"<?\n...\n?>"} | ${"<? ... ?> (with newlines)"}
			${"<$ ... $>"}   | ${"<$ ... $>"}
			${"<$\n...\n$>"} | ${"<$ ... $> (with newlines)"}
		`("$description", ({ input }) => {
			expect.assertions(2);
			const token = lexer.tokenize(inlineSource(input));
			expect(token.next()).toBeToken({
				type: TokenType.TEMPLATING,
				data: [input],
			});
			expect(token.next()).toBeToken({ type: TokenType.EOF });
		});
	});
});
