import { Config } from "../config";
import { Location, ProcessElementContext, Source } from "../context";
import { DOMTree, HtmlElement, TextNode } from "../dom";
import { EventCallback } from "../event";
import HtmlValidate from "../htmlvalidate";
import { InvalidTokenError, Token, TokenStream, TokenType } from "../lexer";
import "../matchers";
import { AttributeData } from "./attribute-data";
import { Parser } from "./parser";

function mergeEvent(event: string, data: any): any {
	const merged = { event, ...data };

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
	public consumeDirective(token: Token): void {
		super.consumeDirective(token);
	}

	public *consumeUntil(
		tokenStream: TokenStream,
		search: TokenType,
		errorLocation: Location
	): IterableIterator<Token> {
		yield* super.consumeUntil(tokenStream, search, errorLocation);
	}

	public trigger(event: any, data: any): void {
		super.trigger(event, data);
	}
}

describe("parser", () => {
	const ignoredEvents = ["dom:load", "dom:ready", "whitespace"];

	let events: any[];
	let parser: ExposedParser;

	beforeEach(() => {
		events = [];
		parser = new ExposedParser(Config.empty().resolve());
		parser.on("*", (event: string, data: any) => {
			if (ignoredEvents.includes(event)) return;
			events.push(mergeEvent(event, data));
		});
	});

	describe("should parse elements", () => {
		it("simple element", () => {
			expect.assertions(4);
			parser.parseHtml("<div></div>");
			expect(events.shift()).toEqual({ event: "tag:open", target: "div" });
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "div",
				previous: "div",
			});
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "div",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with numbers", () => {
			expect.assertions(4);
			parser.parseHtml("<h1></h1>");
			expect(events.shift()).toEqual({ event: "tag:open", target: "h1" });
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "h1",
				previous: "h1",
			});
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "h1",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with dashes", () => {
			expect.assertions(4);
			parser.parseHtml("<foo-bar></foo-bar>");
			expect(events.shift()).toEqual({ event: "tag:open", target: "foo-bar" });
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "foo-bar",
				previous: "foo-bar",
			});
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "foo-bar",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("elements closed on wrong order", () => {
			expect.assertions(7);
			parser.parseHtml("<div><label></div></label>");
			expect(events.shift()).toEqual({ event: "tag:open", target: "div" });
			expect(events.shift()).toEqual({ event: "tag:open", target: "label" });
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "div",
				previous: "label",
			});
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "label",
			});
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "label",
				previous: "div",
			});
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "div",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("self-closing elements", () => {
			expect.assertions(4);
			parser.parseHtml("<input/>");
			expect(events.shift()).toEqual({ event: "tag:open", target: "input" });
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "input",
				previous: "input",
			});
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "input",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("void elements", () => {
			expect.assertions(4);
			parser.parseHtml("<input>");
			expect(events.shift()).toEqual({ event: "tag:open", target: "input" });
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "input",
				previous: "input",
			});
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "input",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("void elements with close tag", () => {
			expect.assertions(5);
			parser.parseHtml("<input></input>");
			expect(events.shift()).toEqual({ event: "tag:open", target: "input" });
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "input",
				previous: "input",
			});
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "input",
			});
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "input",
				previous: undefined,
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with text node", () => {
			expect.assertions(1);
			expect(() => parser.parseHtml("<p>Lorem ipsum</p>")).not.toThrow();
		});

		it("with trailing text", () => {
			expect.assertions(1);
			expect(() => parser.parseHtml("<p>Lorem ipsum</p>\n")).not.toThrow();
		});

		it("unclosed", () => {
			expect.assertions(1);
			expect(() => parser.parseHtml("<p>")).not.toThrow();
		});

		it("unopened", () => {
			expect.assertions(1);
			expect(() => parser.parseHtml("</p>")).not.toThrow();
		});

		it("multiple unopened", () => {
			expect.assertions(1);
			/* mostly for regression testing: root element should never be
			 * popped from node stack. */
			expect(() => parser.parseHtml("</p></p></p></p></p></p>")).not.toThrow();
		});

		it("with only text", () => {
			expect.assertions(1);
			expect(() => parser.parseHtml("Lorem ipsum")).not.toThrow();
		});

		it("with newlines", () => {
			expect.assertions(5);
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
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "div",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with newline after attribute", () => {
			expect.assertions(6);
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
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "div",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with xml namespaces", () => {
			expect.assertions(4);
			parser.parseHtml("<foo:div></foo:div>");
			expect(events.shift()).toEqual({ event: "tag:open", target: "foo:div" });
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "foo:div",
				previous: "foo:div",
			});
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "foo:div",
			});
			expect(events.shift()).toBeUndefined();
		});

		describe("templating as text", () => {
			it.each`
				input
				${"<% ... %>"}
				${"<? ... ?>"}
				${"<$ ... $>"}
			`("$input", ({ input }) => {
				expect.assertions(1);
				const text = `lorem ${input} ipsum`;
				const doc = parser.parseHtml(`<p>${text}</p>`);
				const element = doc.querySelector("p");
				expect(element.textContent).toEqual(text);
			});
		});
	});

	describe("should fail on", () => {
		it('start tag with missing ">"', () => {
			expect.assertions(1);
			expect(() => {
				parser.parseHtml("<p\n<p>foo</p></p>");
			}).toThrow(InvalidTokenError);
		});
	});

	describe("should parse attributes", () => {
		it("without quotes", () => {
			expect.assertions(5);
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
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "div",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with single quotes", () => {
			expect.assertions(5);
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
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "div",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with double quote", () => {
			expect.assertions(5);
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
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "div",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with nested quotes", () => {
			expect.assertions(6);
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
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "div",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("without value", () => {
			expect.assertions(5);
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
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "div",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with empty value", () => {
			expect.assertions(6);
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
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "div",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with dashes", () => {
			expect.assertions(5);
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
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "div",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with spaces inside", () => {
			expect.assertions(5);
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
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "div",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with uncommon characters", () => {
			expect.assertions(5);
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
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "div",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with multiple attributes", () => {
			expect.assertions(6);
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
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "div",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("on self-closing elements", () => {
			expect.assertions(5);
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
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "input",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("with xml namespaces", () => {
			expect.assertions(5);
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
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "div",
			});
			expect(events.shift()).toBeUndefined();
		});
	});

	describe("should parse directive", () => {
		it("with action", () => {
			expect.assertions(2);
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
			expect.assertions(2);
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
			expect.assertions(2);
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
			expect.assertions(2);
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
			expect.assertions(1);
			expect(() => {
				parser.consumeDirective({
					type: TokenType.DIRECTIVE,
					location: {
						filename: "inline",
						offset: 0,
						line: 1,
						column: 1,
						size: 1,
					},
					data: ["", "!"],
				});
			}).toThrow('Failed to parse directive "!"');
		});
	});

	describe("should handle optional end tags", () => {
		it("<li>", () => {
			expect.assertions(22);
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
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "li",
			});
			expect(events.shift()).toEqual({ event: "tag:open", target: "li" });
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "li",
				previous: "li",
			});
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "li",
			});
			expect(events.shift()).toEqual({ event: "tag:open", target: "li" });
			expect(events.shift()).toEqual({ event: "tag:open", target: "strong" });
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "strong",
				previous: "strong",
			});
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "strong",
			});
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "li",
				previous: "li",
			});
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "li",
			});
			expect(events.shift()).toEqual({ event: "tag:open", target: "li" });
			expect(events.shift()).toEqual({ event: "tag:open", target: "input" });
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "input",
				previous: "input",
			});
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "input",
			});
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "ul",
				previous: "li",
			});
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "li",
			});
			expect(events.shift()).toEqual({
				event: "tag:close",
				target: "ul",
				previous: "ul",
			});
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "ul",
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
			expect.assertions(1);
			parser.parseHtml("<div></div>");
			expect(callback).toHaveBeenCalled();
		});

		it("should contain DOMTree as argument", () => {
			expect.assertions(2);
			parser.parseHtml("<div></div>");
			expect(document).toBeInstanceOf(DOMTree);
			expect(document.root.childNodes).toHaveLength(1);
		});
	});

	describe("should parse", () => {
		it("doctype", () => {
			expect.assertions(3);
			const dom = parser.parseHtml("<!doctype foobar>");
			expect(events.shift()).toEqual({
				event: "doctype",
				value: "foobar",
				valueLocation: expect.objectContaining({
					line: 1,
					column: 11,
					size: 6,
				}),
			});
			expect(events.shift()).toBeUndefined();
			expect(dom.doctype).toEqual("foobar");
		});

		it("conditional comment", () => {
			expect.assertions(3);
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
			expect.assertions(4);
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
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "svg",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("nested foreign elements", () => {
			expect.assertions(4);
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
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "svg",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("self-closed foreign elements", () => {
			expect.assertions(4);
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
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "svg",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("should parse elements with text", () => {
			expect.assertions(8);
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
			expect.assertions(6);
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
				offset: 0,
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
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "input",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("attribute (deprecated method)", () => {
			expect.assertions(5);
			const processAttribute = jest.fn((attr) => {
				attr.key = "fred";
				attr.value = "barney";
				return attr;
			});
			const source: Source = {
				data: '<input id="foo">',
				filename: "inline",
				line: 1,
				column: 1,
				offset: 0,
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
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "input",
			});
			expect(events.shift()).toBeUndefined();
		});

		describe("elements", () => {
			it("by calling hook", () => {
				expect.assertions(2);
				let context: any;
				const processElement = jest.fn(function (this: any) {
					context = this;
				});
				const source: Source = {
					data: "<input>",
					filename: "inline",
					line: 1,
					column: 1,
					offset: 0,
					hooks: {
						processElement,
					},
				};
				parser.parseHtml(source);
				expect(processElement).toHaveBeenCalledWith(expect.any(HtmlElement));
				expect(context).toEqual({
					getMetaFor: expect.any(Function),
				});
			});

			it("allow modifiy element metadata", () => {
				expect.assertions(2);
				function processElement(this: ProcessElementContext, node: HtmlElement): void {
					if (node.tagName === "i") {
						const meta = this.getMetaFor("div");
						node.loadMeta(meta!);
					}
				}
				const source: Source = {
					data: "<i></i><u></u>",
					filename: "inline",
					line: 1,
					column: 1,
					offset: 0,
					hooks: {
						processElement,
					},
				};
				const doc = parser.parseHtml(source);
				const i = doc.querySelector("i");
				const u = doc.querySelector("u");
				expect(i.meta).toMatchSnapshot();
				expect(u.meta).toMatchSnapshot();
			});
		});
	});

	describe("regressiontesting", () => {
		let htmlvalidate: HtmlValidate;

		beforeEach(() => {
			htmlvalidate = new HtmlValidate({
				extends: ["html-validate:recommended"],
			});
		});

		it("multiline", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateFile("./test-files/parser/multiline.html");
			expect(report).toBeValid();
		});

		it("xi:include", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateFile("./test-files/parser/xi-include.html");
			expect(report).toBeValid();
		});

		it("cdata", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateFile("./test-files/parser/cdata.html");
			expect(report).toBeValid();
		});
	});

	describe("consumeUntil()", () => {
		it("should yield list of tokens until match is found (inclusive)", () => {
			expect.assertions(1);
			const src: TokenStream = [
				{
					type: TokenType.TAG_OPEN,
					location: {
						filename: "inline",
						offset: 0,
						line: 1,
						column: 1,
						size: 1,
					},
					data: null,
				},
				{
					type: TokenType.ATTR_NAME,
					location: {
						filename: "inline",
						offset: 1,
						line: 1,
						column: 2,
						size: 1,
					},
					data: null,
				},
				{
					type: TokenType.TAG_CLOSE,
					location: {
						filename: "inline",
						offset: 3,
						line: 1,
						column: 4,
						size: 1,
					},
					data: null,
				},
				{
					type: TokenType.COMMENT,
					location: {
						filename: "inline",
						offset: 4,
						line: 1,
						column: 5,
						size: 1,
					},
					data: null,
				},
			][Symbol.iterator]();
			const location: Location = {
				filename: "inline",
				line: 1,
				column: 1,
				offset: 0,
				size: 1,
			};
			const result = Array.from(parser.consumeUntil(src, TokenType.TAG_CLOSE, location));
			expect(result).toEqual([
				{
					type: TokenType.TAG_OPEN,
					location: {
						filename: "inline",
						offset: 0,
						line: 1,
						column: 1,
						size: 1,
					},
					data: null,
				},
				{
					type: TokenType.ATTR_NAME,
					location: {
						filename: "inline",
						offset: 1,
						line: 1,
						column: 2,
						size: 1,
					},
					data: null,
				},
				{
					type: TokenType.TAG_CLOSE,
					location: {
						filename: "inline",
						offset: 3,
						line: 1,
						column: 4,
						size: 1,
					},
					data: null,
				},
			]);
		});

		it("should throw error if no match is found", () => {
			expect.assertions(1);
			const src: TokenStream = [
				{
					type: TokenType.COMMENT,
					location: {
						filename: "inline",
						offset: 4,
						line: 1,
						column: 5,
						size: 1,
					},
					data: null,
				},
			][Symbol.iterator]();
			const location: Location = {
				filename: "inline",
				line: 1,
				column: 1,
				offset: 0,
				size: 1,
			};
			expect(() => Array.from(parser.consumeUntil(src, TokenType.TAG_CLOSE, location))).toThrow(
				"stream ended before TAG_CLOSE token was found"
			);
		});
	});

	it("should recalculate location size", () => {
		expect.assertions(1);
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
		expect.assertions(1);
		const delegate = jest.spyOn((parser as any).event, "on");
		parser.on("foo", () => null);
		expect(delegate).toHaveBeenCalledWith("foo", expect.any(Function));
	});

	it("once() should delegate to eventhandler", () => {
		expect.assertions(1);
		const delegate = jest.spyOn((parser as any).event, "once");
		parser.once("foo", () => null);
		expect(delegate).toHaveBeenCalledWith("foo", expect.any(Function));
	});

	describe("defer()", () => {
		it("should push wildcard event on event queue", () => {
			expect.assertions(2);
			const cb = jest.fn();
			(parser as any).event.once = jest.fn((event, fn) => fn());
			parser.defer(cb);
			expect((parser as any).event.once).toHaveBeenCalledWith("*", cb);
			expect(cb).toHaveBeenCalled();
		});
	});

	describe("trigger()", () => {
		it("should pass event to eventhandler", () => {
			expect.assertions(1);
			const trigger = jest.spyOn((parser as any).event, "trigger");
			const event = { location: {} };
			parser.trigger("foo", event);
			expect(trigger).toHaveBeenCalledWith("foo", event);
		});

		it("should throw error if event is missing location", () => {
			expect.assertions(1);
			expect(() => parser.trigger("foo", {})).toThrow("Triggered event must contain location");
		});
	});
});
