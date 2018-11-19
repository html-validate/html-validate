import { Config } from "../config";
import { Source } from "../context";
import { DOMTree, HtmlElement, TextNode } from "../dom";
import { EventCallback } from "../event";
import HtmlValidate from "../htmlvalidate";
import { InvalidTokenError, Token, TokenStream, TokenType } from "../lexer";
import "../matchers";
import { AttributeData } from "./attribute-data";
import { Parser } from "./parser";

function mergeEvent(event: string, data: any) {
	const merged = Object.assign({}, { event }, data);

	/* not useful for these tests */
	delete merged.location;

	/* change HtmlElement instances to just tagname for easier testing */
	for (const key of ["target", "previous"]) {
		if (merged[key] && merged[key] instanceof HtmlElement) {
			merged[key] = merged[key].tagName;
		}
	}

	return merged;
}

class ExposedParser extends Parser {
	public consumeDirective(token: Token) {
		super.consumeDirective(token);
	}

	public *consumeUntil(
		tokenStream: TokenStream,
		search: TokenType
	): IterableIterator<Token> {
		yield* super.consumeUntil(tokenStream, search);
	}

	public trigger(event: any, data: any) {
		super.trigger(event, data);
	}
}

describe("parser", () => {
	const ignoredEvents = ["dom:load", "dom:ready", "whitespace"];

	let events: any[];
	let parser: ExposedParser;

	beforeEach(() => {
		events = [];
		parser = new ExposedParser(Config.empty());
		parser.on("*", (event: string, data: any) => {
			if (ignoredEvents.includes(event)) return;
			events.push(mergeEvent(event, data));
		});
	});

	describe("should parse elements", () => {
		it("simple element", () => {
			parser.parseHtml("<div></div>");
			expect(events.shift()).toEqual({ event: "tag:open", target: "div" });
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "div",
				previous: "div",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with numbers", () => {
			parser.parseHtml("<h1></h1>");
			expect(events.shift()).toEqual({ event: "tag:open", target: "h1" });
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "h1",
				previous: "h1",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with dashes", () => {
			parser.parseHtml("<foo-bar></foo-bar>");
			expect(events.shift()).toEqual({ event: "tag:open", target: "foo-bar" });
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "foo-bar",
				previous: "foo-bar",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("elements closed on wrong order", () => {
			parser.parseHtml("<div><label></div></label>");
			expect(events.shift()).toEqual({ event: "tag:open", target: "div" });
			expect(events.shift()).toEqual({ event: "tag:open", target: "label" });
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "div",
				previous: "label",
			});
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "label",
				previous: "div",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("self-closing elements", () => {
			parser.parseHtml("<input/>");
			expect(events.shift()).toEqual({ event: "tag:open", target: "input" });
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "input",
				previous: "input",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("void elements", () => {
			parser.parseHtml("<input>");
			expect(events.shift()).toEqual({ event: "tag:open", target: "input" });
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "input",
				previous: "input",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("void elements with close tag", () => {
			parser.parseHtml("<input></input>");
			expect(events.shift()).toEqual({ event: "tag:open", target: "input" });
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "input",
				previous: "input",
			});
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "input",
				previous: undefined,
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with text node", () => {
			parser.parseHtml("<p>Lorem ipsum</p>");
		});

		it("with trailing text", () => {
			parser.parseHtml("<p>Lorem ipsum</p>\n");
		});

		it("unclosed", () => {
			parser.parseHtml("<p>");
		});

		it("unopened", () => {
			parser.parseHtml("</p>");
		});

		it("multiple unopened", () => {
			/* mostly for regression testing: root element should never be
			 * popped from node stack. */
			parser.parseHtml("</p></p></p></p></p></p>");
		});

		it("with only text", () => {
			parser.parseHtml("Lorem ipsum");
		});

		it("with newlines", () => {
			parser.parseHtml('<div\nfoo="bar"></div>');
			expect(events.shift()).toEqual({ event: "tag:open", target: "div" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "foo",
				value: "bar",
				quote: '"',
				target: "div",
				valueLocation: expect.objectContaining({
					line: 2,
					column: 6,
				}),
			});
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "div",
				previous: "div",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with newline after attribute", () => {
			parser.parseHtml('<div foo="bar"\nspam="ham"></div>');
			expect(events.shift()).toEqual({ event: "tag:open", target: "div" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "foo",
				value: "bar",
				quote: '"',
				target: "div",
				valueLocation: expect.objectContaining({
					line: 1,
					column: 11,
				}),
			});
			expect(events.shift()).toEqual({
				event: "attr",
				key: "spam",
				value: "ham",
				quote: '"',
				target: "div",
				valueLocation: expect.objectContaining({
					line: 2,
					column: 7,
				}),
			});
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "div",
				previous: "div",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with xml namespaces", () => {
			parser.parseHtml("<foo:div></foo:div>");
			expect(events.shift()).toEqual({ event: "tag:open", target: "foo:div" });
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "foo:div",
				previous: "foo:div",
			});
			expect(events.shift()).toBeUndefined();
		});
	});

	describe("should fail on", () => {
		it('start tag with missing ">"', () => {
			expect(() => {
				parser.parseHtml("<p\n<p>foo</p></p>");
			}).toThrow(InvalidTokenError);
		});
	});

	describe("should parse attributes", () => {
		it("without quotes", () => {
			parser.parseHtml("<div foo=bar></div>");
			expect(events.shift()).toEqual({ event: "tag:open", target: "div" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "foo",
				value: "bar",
				quote: undefined,
				target: "div",
				valueLocation: expect.objectContaining({
					line: 1,
					column: 10,
				}),
			});
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "div",
				previous: "div",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with single quotes", () => {
			parser.parseHtml("<div foo='bar'></div>");
			expect(events.shift()).toEqual({ event: "tag:open", target: "div" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "foo",
				value: "bar",
				quote: "'",
				target: "div",
				valueLocation: expect.objectContaining({
					line: 1,
					column: 11,
				}),
			});
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "div",
				previous: "div",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with double quote", () => {
			parser.parseHtml('<div foo="bar"></div>');
			expect(events.shift()).toEqual({ event: "tag:open", target: "div" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "foo",
				value: "bar",
				quote: '"',
				target: "div",
				valueLocation: expect.objectContaining({
					line: 1,
					column: 11,
				}),
			});
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "div",
				previous: "div",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with nested quotes", () => {
			parser.parseHtml("<div foo='\"foo\"' bar=\"'foo'\"></div>");
			expect(events.shift()).toEqual({ event: "tag:open", target: "div" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "foo",
				value: '"foo"',
				quote: "'",
				target: "div",
				valueLocation: expect.objectContaining({
					line: 1,
					column: 11,
				}),
			});
			expect(events.shift()).toEqual({
				event: "attr",
				key: "bar",
				value: "'foo'",
				quote: '"',
				target: "div",
				valueLocation: expect.objectContaining({
					line: 1,
					column: 23,
				}),
			});
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "div",
				previous: "div",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("without value", () => {
			parser.parseHtml("<div foo></div>");
			expect(events.shift()).toEqual({ event: "tag:open", target: "div" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "foo",
				value: undefined,
				quote: undefined,
				target: "div",
				valueLocation: null,
			});
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "div",
				previous: "div",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with empty value", () => {
			parser.parseHtml("<div foo=\"\" bar=''></div>");
			expect(events.shift()).toEqual({ event: "tag:open", target: "div" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "foo",
				value: "",
				quote: '"',
				target: "div",
				valueLocation: null,
			});
			expect(events.shift()).toEqual({
				event: "attr",
				key: "bar",
				value: "",
				quote: "'",
				target: "div",
				valueLocation: null,
			});
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "div",
				previous: "div",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with dashes", () => {
			parser.parseHtml("<div foo-bar-baz></div>");
			expect(events.shift()).toEqual({ event: "tag:open", target: "div" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "foo-bar-baz",
				value: undefined,
				quote: undefined,
				target: "div",
				valueLocation: null,
			});
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "div",
				previous: "div",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with spaces inside", () => {
			parser.parseHtml('<div class="foo bar baz"></div>');
			expect(events.shift()).toEqual({ event: "tag:open", target: "div" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "class",
				value: "foo bar baz",
				quote: '"',
				target: "div",
				valueLocation: expect.objectContaining({
					line: 1,
					column: 13,
				}),
			});
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "div",
				previous: "div",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with uncommon characters", () => {
			parser.parseHtml('<div a2?()!="foo"></div>');
			expect(events.shift()).toEqual({ event: "tag:open", target: "div" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "a2?()!",
				value: "foo",
				quote: '"',
				target: "div",
				valueLocation: expect.objectContaining({
					line: 1,
					column: 14,
				}),
			});
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "div",
				previous: "div",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with multiple attributes", () => {
			parser.parseHtml('<div foo="bar" spam="ham"></div>');
			expect(events.shift()).toEqual({ event: "tag:open", target: "div" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "foo",
				value: "bar",
				quote: '"',
				target: "div",
				valueLocation: expect.objectContaining({
					line: 1,
					column: 11,
				}),
			});
			expect(events.shift()).toEqual({
				event: "attr",
				key: "spam",
				value: "ham",
				quote: '"',
				target: "div",
				valueLocation: expect.objectContaining({
					line: 1,
					column: 22,
				}),
			});
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "div",
				previous: "div",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("on self-closing elements", () => {
			parser.parseHtml('<input type="text"/>');
			expect(events.shift()).toEqual({ event: "tag:open", target: "input" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "type",
				value: "text",
				quote: '"',
				target: "input",
				valueLocation: expect.objectContaining({
					line: 1,
					column: 14,
				}),
			});
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "input",
				previous: "input",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with xml namespaces", () => {
			parser.parseHtml('<div foo:bar="baz"></div>');
			expect(events.shift()).toEqual({ event: "tag:open", target: "div" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "foo:bar",
				value: "baz",
				quote: '"',
				target: "div",
				valueLocation: expect.objectContaining({
					line: 1,
					column: 15,
				}),
			});
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "div",
				previous: "div",
			});
			expect(events.shift()).toBeUndefined();
		});
	});

	describe("should parse directive", () => {
		it("with action", () => {
			parser.parseHtml("<!-- [html-validate-foo-bar] -->");
			expect(events.shift()).toEqual({
				event: "directive",
				action: "foo-bar",
				data: "",
				comment: "",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with options", () => {
			parser.parseHtml("<!-- [html-validate-enable foo bar] -->");
			expect(events.shift()).toEqual({
				event: "directive",
				action: "enable",
				data: "foo bar",
				comment: "",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with comment", () => {
			parser.parseHtml("<!-- [html-validate-enable: lorem ipsum] -->");
			expect(events.shift()).toEqual({
				event: "directive",
				action: "enable",
				data: "",
				comment: "lorem ipsum",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with options and comment", () => {
			parser.parseHtml("<!-- [html-validate-enable foo bar: baz] -->");
			expect(events.shift()).toEqual({
				event: "directive",
				action: "enable",
				data: "foo bar",
				comment: "baz",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("throw on invalid directive", () => {
			expect(() => {
				parser.consumeDirective({
					type: TokenType.DIRECTIVE,
					location: { filename: "inline", offset: 0, line: 1, column: 1 },
					data: ["", "!"],
				});
			}).toThrowError('Failed to parse directive "!"');
		});
	});

	describe("should handle optional end tags", () => {
		it("<li>", () => {
			parser.parseHtml(`
				<ul>
					<li>explicit</li>
					<li>implicit
					<li><strong>nested</strong>
					<li><input>
				</ul>`);
			expect(events.shift()).toEqual({ event: "tag:open", target: "ul" });
			expect(events.shift()).toEqual({ event: "tag:open", target: "li" });
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "li",
				previous: "li",
			});
			expect(events.shift()).toEqual({ event: "tag:open", target: "li" });
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "li",
				previous: "li",
			});
			expect(events.shift()).toEqual({ event: "tag:open", target: "li" });
			expect(events.shift()).toEqual({ event: "tag:open", target: "strong" });
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "strong",
				previous: "strong",
			});
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "li",
				previous: "li",
			});
			expect(events.shift()).toEqual({ event: "tag:open", target: "li" });
			expect(events.shift()).toEqual({ event: "tag:open", target: "input" });
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "input",
				previous: "input",
			});
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "ul",
				previous: "li",
			});
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "ul",
				previous: "ul",
			});
			expect(events.shift()).toBeUndefined();
		});
	});

	describe("dom:ready", () => {
		let callback: EventCallback;
		let document: DOMTree;

		beforeEach(() => {
			callback = jest.fn((event: string, data: any) => {
				document = data.document;
			});
			parser.on("dom:ready", callback);
		});

		it("should trigger when parsing is complete", () => {
			parser.parseHtml("<div></div>");
			expect(callback).toHaveBeenCalled();
		});

		it("should contain DOMTree as argument", () => {
			parser.parseHtml("<div></div>");
			expect(document).toBeInstanceOf(DOMTree);
			expect(document.root.childNodes).toHaveLength(1);
		});
	});

	describe("should parse", () => {
		it("doctype", () => {
			const dom = parser.parseHtml("<!doctype foobar>");
			expect(events.shift()).toEqual({ event: "doctype", value: "foobar" });
			expect(events.shift()).toBeUndefined();
			expect(dom.doctype).toEqual("foobar");
		});

		it("conditional comment", () => {
			parser.parseHtml("<!--[if IE 6]>foo<![endif]-->");
			expect(events.shift()).toEqual({
				event: "conditional",
				condition: "if IE 6",
			});
			expect(events.shift()).toEqual({
				event: "conditional",
				condition: "endif",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("foreign elements", () => {
			parser.parseHtml("<svg><g></g></svg>");
			expect(events.shift()).toEqual({
				event: "tag:open",
				target: "svg",
			});
			expect(events.shift()).toEqual({
				event: "tag:close",
				previous: "svg",
				target: "svg",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("nested foreign elements", () => {
			parser.parseHtml("<svg><svg></svg><svg/></svg>");
			expect(events.shift()).toEqual({
				event: "tag:open",
				target: "svg",
			});
			expect(events.shift()).toEqual({
				event: "tag:close",
				previous: "svg",
				target: "svg",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("self-closed foreign elements", () => {
			parser.parseHtml("<svg/>");
			expect(events.shift()).toEqual({
				event: "tag:open",
				target: "svg",
			});
			expect(events.shift()).toEqual({
				event: "tag:close",
				previous: "svg",
				target: "svg",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("should parse elements with text", () => {
			const doc = parser.parseHtml("<b>foo</b> <u>bar</ul>").root;
			expect(doc.childNodes).toHaveLength(3);
			expect(doc.childNodes[0]).toBeInstanceOf(HtmlElement);
			expect(doc.childNodes[0].textContent).toEqual("foo");
			expect(doc.childNodes[1]).toBeInstanceOf(TextNode);
			expect(doc.childNodes[1].textContent).toEqual(" ");
			expect(doc.childNodes[2]).toBeInstanceOf(HtmlElement);
			expect(doc.childNodes[2].textContent).toEqual("bar");
			expect(doc.textContent).toEqual("foo bar");
		});
	});

	describe("should postprocess", () => {
		it("attribute", () => {
			const processAttribute = jest.fn((attr: AttributeData) => [
				attr /* original attribute */,
				{
					/* modified attribute */
					key: "fred",
					value: "barney",
					quote: attr.quote,
					originalAttribute: attr.key,
				},
			]);
			const source: Source = {
				data: '<input id="foo">',
				filename: "inline",
				line: 1,
				column: 1,
				hooks: {
					processAttribute,
				},
			};
			parser.parseHtml(source);
			expect(events.shift()).toEqual({ event: "tag:open", target: "input" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "id",
				value: "foo",
				quote: '"',
				target: "input",
				valueLocation: expect.objectContaining({
					line: 1,
					column: 12,
				}),
			});
			expect(events.shift()).toEqual({
				event: "attr",
				key: "fred",
				value: "barney",
				quote: '"',
				originalAttribute: "id",
				target: "input",
				valueLocation: expect.objectContaining({
					line: 1,
					column: 12,
				}),
			});
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "input",
				previous: "input",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("attribute (deprecated method)", () => {
			const processAttribute = jest.fn(attr => {
				attr.key = "fred";
				attr.value = "barney";
				return attr;
			});
			const source: Source = {
				data: '<input id="foo">',
				filename: "inline",
				line: 1,
				column: 1,
				hooks: {
					processAttribute,
				},
			};
			parser.parseHtml(source);
			expect(events.shift()).toEqual({ event: "tag:open", target: "input" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "fred",
				value: "barney",
				quote: '"',
				target: "input",
				valueLocation: expect.objectContaining({
					line: 1,
					column: 12,
				}),
			});
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "input",
				previous: "input",
			});
			expect(events.shift()).toBeUndefined();
		});
	});

	describe("regressiontesting", () => {
		let htmlvalidate: HtmlValidate;

		beforeEach(() => {
			htmlvalidate = new HtmlValidate({
				extends: ["htmlvalidate:recommended"],
			});
		});

		it("multiline", () => {
			const report = htmlvalidate.validateFile(
				"./test-files/parser/multiline.html"
			);
			expect(report).toBeValid();
		});

		it("xi:include", () => {
			const report = htmlvalidate.validateFile(
				"./test-files/parser/xi-include.html"
			);
			expect(report).toBeValid();
		});

		it("cdata", () => {
			const report = htmlvalidate.validateFile(
				"./test-files/parser/cdata.html"
			);
			expect(report).toBeValid();
		});
	});

	describe("consumeUntil()", () => {
		it("should yield list of tokens until match is found (inclusive)", () => {
			const src: TokenStream = [
				{
					type: TokenType.TAG_OPEN,
					location: { filename: "inline", offset: 0, line: 1, column: 1 },
					data: null,
				},
				{
					type: TokenType.ATTR_NAME,
					location: { filename: "inline", offset: 1, line: 1, column: 2 },
					data: null,
				},
				{
					type: TokenType.TAG_CLOSE,
					location: { filename: "inline", offset: 3, line: 1, column: 4 },
					data: null,
				},
				{
					type: TokenType.COMMENT,
					location: { filename: "inline", offset: 4, line: 1, column: 5 },
					data: null,
				},
			][Symbol.iterator]();
			const result = Array.from(parser.consumeUntil(src, TokenType.TAG_CLOSE));
			expect(result).toEqual([
				{
					type: TokenType.TAG_OPEN,
					location: { filename: "inline", offset: 0, line: 1, column: 1 },
					data: null,
				},
				{
					type: TokenType.ATTR_NAME,
					location: { filename: "inline", offset: 1, line: 1, column: 2 },
					data: null,
				},
				{
					type: TokenType.TAG_CLOSE,
					location: { filename: "inline", offset: 3, line: 1, column: 4 },
					data: null,
				},
			]);
		});

		it("should throw error if no match is found", () => {
			const src: TokenStream = [
				{
					type: TokenType.COMMENT,
					location: { filename: "inline", offset: 4, line: 1, column: 5 },
					data: null,
				},
			][Symbol.iterator]();
			expect(() =>
				Array.from(parser.consumeUntil(src, TokenType.TAG_CLOSE))
			).toThrowError("stream ended before consumeUntil finished");
		});
	});

	it("should recalculate location size", () => {
		const dom = parser.parseHtml('<div class="foo">\n\tlorem ipsum\n</div>');
		const div = dom.querySelector("div");
		expect(div.location).toEqual({
			filename: expect.any(String),
			offset: 1,
			line: 1,
			column: 2,
			size: 3,
		});
	});

	it("on() should delegate to eventhandler", () => {
		const delegate = jest.spyOn((parser as any).event, "on");
		parser.on("foo", () => null);
		expect(delegate).toHaveBeenCalledWith("foo", expect.any(Function));
	});

	it("once() should delegate to eventhandler", () => {
		const delegate = jest.spyOn((parser as any).event, "once");
		parser.once("foo", () => null);
		expect(delegate).toHaveBeenCalledWith("foo", expect.any(Function));
	});

	describe("defer()", () => {
		it("should push wildcard event on event queue", () => {
			const cb = jest.fn();
			(parser as any).event.once = jest.fn((event, fn) => fn());
			parser.defer(cb);
			expect((parser as any).event.once).toHaveBeenCalledWith("*", cb);
			expect(cb).toHaveBeenCalled();
		});
	});

	describe("trigger()", () => {
		it("should pass event to eventhandler", () => {
			const trigger = jest.spyOn((parser as any).event, "trigger");
			const event = { location: {} };
			parser.trigger("foo", event);
			expect(trigger).toHaveBeenCalledWith("foo", event);
		});

		it("should throw error if event is missing location", () => {
			expect(() => parser.trigger("foo", {})).toThrowError(
				"Triggered event must contain location"
			);
		});
	});
});
