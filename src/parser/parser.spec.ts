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

	/* legacy: not useful for these tests */
	if (event !== "attr") {
		delete merged.location;
	}

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
	const ignoredEvents = ["dom:load", "dom:ready", "token", "whitespace"];

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
			expect.assertions(5);
			parser.parseHtml("<div></div>");
			expect(events.shift()).toEqual({ event: "tag:start", target: "div" });
			expect(events.shift()).toEqual({ event: "tag:ready", target: "div" });
			expect(events.shift()).toEqual({
				event: "tag:end",
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
			expect.assertions(5);
			parser.parseHtml("<h1></h1>");
			expect(events.shift()).toEqual({ event: "tag:start", target: "h1" });
			expect(events.shift()).toEqual({ event: "tag:ready", target: "h1" });
			expect(events.shift()).toEqual({
				event: "tag:end",
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
			expect.assertions(5);
			parser.parseHtml("<foo-bar></foo-bar>");
			expect(events.shift()).toEqual({ event: "tag:start", target: "foo-bar" });
			expect(events.shift()).toEqual({ event: "tag:ready", target: "foo-bar" });
			expect(events.shift()).toEqual({
				event: "tag:end",
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
			expect.assertions(9);
			parser.parseHtml("<div><label></div></label>");
			expect(events.shift()).toEqual({ event: "tag:start", target: "div" });
			expect(events.shift()).toEqual({ event: "tag:ready", target: "div" });
			expect(events.shift()).toEqual({ event: "tag:start", target: "label" });
			expect(events.shift()).toEqual({ event: "tag:ready", target: "label" });
			expect(events.shift()).toEqual({
				event: "tag:end",
				target: "div",
				previous: "label",
			});
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "label",
			});
			expect(events.shift()).toEqual({
				event: "tag:end",
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
			expect.assertions(5);
			parser.parseHtml("<input/>");
			expect(events.shift()).toEqual({ event: "tag:start", target: "input" });
			expect(events.shift()).toEqual({ event: "tag:ready", target: "input" });
			expect(events.shift()).toEqual({
				event: "tag:end",
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
			expect.assertions(5);
			parser.parseHtml("<input>");
			expect(events.shift()).toEqual({ event: "tag:start", target: "input" });
			expect(events.shift()).toEqual({ event: "tag:ready", target: "input" });
			expect(events.shift()).toEqual({
				event: "tag:end",
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
			expect.assertions(6);
			parser.parseHtml("<input></input>");
			expect(events.shift()).toEqual({ event: "tag:start", target: "input" });
			expect(events.shift()).toEqual({ event: "tag:ready", target: "input" });
			expect(events.shift()).toEqual({
				event: "tag:end",
				target: "input",
				previous: "input",
			});
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "input",
			});
			expect(events.shift()).toEqual({
				event: "tag:end",
				target: "input",
				previous: "#document",
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
			expect.assertions(6);
			parser.parseHtml('<div\nfoo="bar"></div>');
			expect(events.shift()).toEqual({ event: "tag:start", target: "div" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "foo",
				value: "bar",
				quote: '"',
				target: "div",
				location: expect.objectContaining({
					line: 2,
					column: 1,
					size: 9,
				}),
				keyLocation: expect.objectContaining({
					line: 2,
					column: 1,
					size: 3,
				}),
				valueLocation: expect.objectContaining({
					line: 2,
					column: 6,
					size: 3,
				}),
			});
			expect(events.shift()).toEqual({ event: "tag:ready", target: "div" });
			expect(events.shift()).toEqual({
				event: "tag:end",
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
			expect.assertions(7);
			parser.parseHtml('<div foo="bar"\nspam="ham"></div>');
			expect(events.shift()).toEqual({ event: "tag:start", target: "div" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "foo",
				value: "bar",
				quote: '"',
				target: "div",
				location: expect.objectContaining({
					line: 1,
					column: 6,
					size: 9,
				}),
				keyLocation: expect.objectContaining({
					line: 1,
					column: 6,
					size: 3,
				}),
				valueLocation: expect.objectContaining({
					line: 1,
					column: 11,
					size: 3,
				}),
			});
			expect(events.shift()).toEqual({
				event: "attr",
				key: "spam",
				value: "ham",
				quote: '"',
				target: "div",
				location: expect.objectContaining({
					line: 2,
					column: 1,
					size: 10,
				}),
				keyLocation: expect.objectContaining({
					line: 2,
					column: 1,
					size: 4,
				}),
				valueLocation: expect.objectContaining({
					line: 2,
					column: 7,
					size: 3,
				}),
			});
			expect(events.shift()).toEqual({ event: "tag:ready", target: "div" });
			expect(events.shift()).toEqual({
				event: "tag:end",
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
			expect.assertions(5);
			parser.parseHtml("<foo:div></foo:div>");
			expect(events.shift()).toEqual({ event: "tag:start", target: "foo:div" });
			expect(events.shift()).toEqual({ event: "tag:ready", target: "foo:div" });
			expect(events.shift()).toEqual({
				event: "tag:end",
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
			expect.assertions(6);
			parser.parseHtml("<div foo=bar></div>");
			expect(events.shift()).toEqual({ event: "tag:start", target: "div" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "foo",
				value: "bar",
				quote: null,
				target: "div",
				location: expect.objectContaining({
					line: 1,
					column: 6,
					size: 7,
				}),
				keyLocation: expect.objectContaining({
					line: 1,
					column: 6,
					size: 3,
				}),
				valueLocation: expect.objectContaining({
					line: 1,
					column: 10,
					size: 3,
				}),
			});
			expect(events.shift()).toEqual({ event: "tag:ready", target: "div" });
			expect(events.shift()).toEqual({
				event: "tag:end",
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
			expect.assertions(6);
			parser.parseHtml("<div foo='bar'></div>");
			expect(events.shift()).toEqual({ event: "tag:start", target: "div" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "foo",
				value: "bar",
				quote: "'",
				target: "div",
				location: expect.objectContaining({
					line: 1,
					column: 6,
					size: 9,
				}),
				keyLocation: expect.objectContaining({
					line: 1,
					column: 6,
					size: 3,
				}),
				valueLocation: expect.objectContaining({
					line: 1,
					column: 11,
					size: 3,
				}),
			});
			expect(events.shift()).toEqual({ event: "tag:ready", target: "div" });
			expect(events.shift()).toEqual({
				event: "tag:end",
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
			expect.assertions(6);
			parser.parseHtml('<div foo="bar"></div>');
			expect(events.shift()).toEqual({ event: "tag:start", target: "div" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "foo",
				value: "bar",
				quote: '"',
				target: "div",
				location: expect.objectContaining({
					line: 1,
					column: 6,
					size: 9,
				}),
				keyLocation: expect.objectContaining({
					line: 1,
					column: 6,
					size: 3,
				}),
				valueLocation: expect.objectContaining({
					line: 1,
					column: 11,
					size: 3,
				}),
			});
			expect(events.shift()).toEqual({ event: "tag:ready", target: "div" });
			expect(events.shift()).toEqual({
				event: "tag:end",
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
			expect.assertions(7);
			parser.parseHtml(`<div foo='"foo"' bar="'foo'"></div>`);
			expect(events.shift()).toEqual({ event: "tag:start", target: "div" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "foo",
				value: '"foo"',
				quote: "'",
				target: "div",
				location: expect.objectContaining({
					line: 1,
					column: 6,
					size: 11,
				}),
				keyLocation: expect.objectContaining({
					line: 1,
					column: 6,
					size: 3,
				}),
				valueLocation: expect.objectContaining({
					line: 1,
					column: 11,
					size: 5,
				}),
			});
			expect(events.shift()).toEqual({
				event: "attr",
				key: "bar",
				value: "'foo'",
				quote: '"',
				target: "div",
				location: expect.objectContaining({
					line: 1,
					column: 18,
					size: 11,
				}),
				keyLocation: expect.objectContaining({
					line: 1,
					column: 18,
					size: 3,
				}),
				valueLocation: expect.objectContaining({
					line: 1,
					column: 23,
					size: 5,
				}),
			});
			expect(events.shift()).toEqual({ event: "tag:ready", target: "div" });
			expect(events.shift()).toEqual({
				event: "tag:end",
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
			expect.assertions(6);
			parser.parseHtml("<div foo></div>");
			expect(events.shift()).toEqual({ event: "tag:start", target: "div" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "foo",
				value: null,
				quote: null,
				target: "div",
				location: expect.objectContaining({
					line: 1,
					column: 6,
					size: 3,
				}),
				keyLocation: expect.objectContaining({
					line: 1,
					column: 6,
					size: 3,
				}),
				valueLocation: null,
			});
			expect(events.shift()).toEqual({ event: "tag:ready", target: "div" });
			expect(events.shift()).toEqual({
				event: "tag:end",
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
			expect.assertions(7);
			parser.parseHtml(`<div foo="" bar=''></div>`);
			expect(events.shift()).toEqual({ event: "tag:start", target: "div" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "foo",
				value: "",
				quote: '"',
				target: "div",
				location: expect.objectContaining({
					line: 1,
					column: 6,
					size: 6,
				}),
				keyLocation: expect.objectContaining({
					line: 1,
					column: 6,
					size: 3,
				}),
				valueLocation: null,
			});
			expect(events.shift()).toEqual({
				event: "attr",
				key: "bar",
				value: "",
				quote: "'",
				target: "div",
				location: expect.objectContaining({
					line: 1,
					column: 13,
					size: 6,
				}),
				keyLocation: expect.objectContaining({
					line: 1,
					column: 13,
					size: 3,
				}),
				valueLocation: null,
			});
			expect(events.shift()).toEqual({ event: "tag:ready", target: "div" });
			expect(events.shift()).toEqual({
				event: "tag:end",
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
			expect.assertions(6);
			parser.parseHtml("<div foo-bar-baz></div>");
			expect(events.shift()).toEqual({ event: "tag:start", target: "div" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "foo-bar-baz",
				value: null,
				quote: null,
				target: "div",
				location: expect.objectContaining({
					line: 1,
					column: 6,
					size: 11,
				}),
				keyLocation: expect.objectContaining({
					line: 1,
					column: 6,
					size: 11,
				}),
				valueLocation: null,
			});
			expect(events.shift()).toEqual({ event: "tag:ready", target: "div" });
			expect(events.shift()).toEqual({
				event: "tag:end",
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
			expect.assertions(6);
			parser.parseHtml('<div class="foo bar baz"></div>');
			expect(events.shift()).toEqual({ event: "tag:start", target: "div" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "class",
				value: "foo bar baz",
				quote: '"',
				target: "div",
				location: expect.objectContaining({
					line: 1,
					column: 6,
					size: 19,
				}),
				keyLocation: expect.objectContaining({
					line: 1,
					column: 6,
					size: 5,
				}),
				valueLocation: expect.objectContaining({
					line: 1,
					column: 13,
					size: 11,
				}),
			});
			expect(events.shift()).toEqual({ event: "tag:ready", target: "div" });
			expect(events.shift()).toEqual({
				event: "tag:end",
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
			expect.assertions(6);
			parser.parseHtml('<div a2?()!="foo"></div>');
			expect(events.shift()).toEqual({ event: "tag:start", target: "div" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "a2?()!",
				value: "foo",
				quote: '"',
				target: "div",
				location: expect.objectContaining({
					line: 1,
					column: 6,
					size: 12,
				}),
				keyLocation: expect.objectContaining({
					line: 1,
					column: 6,
					size: 6,
				}),
				valueLocation: expect.objectContaining({
					line: 1,
					column: 14,
					size: 3,
				}),
			});
			expect(events.shift()).toEqual({ event: "tag:ready", target: "div" });
			expect(events.shift()).toEqual({
				event: "tag:end",
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
			expect.assertions(7);
			parser.parseHtml('<div foo="bar" spam="ham"></div>');
			expect(events.shift()).toEqual({ event: "tag:start", target: "div" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "foo",
				value: "bar",
				quote: '"',
				target: "div",
				location: expect.objectContaining({
					line: 1,
					column: 6,
					size: 9,
				}),
				keyLocation: expect.objectContaining({
					line: 1,
					column: 6,
					size: 3,
				}),
				valueLocation: expect.objectContaining({
					line: 1,
					column: 11,
					size: 3,
				}),
			});
			expect(events.shift()).toEqual({
				event: "attr",
				key: "spam",
				value: "ham",
				quote: '"',
				target: "div",
				location: expect.objectContaining({
					line: 1,
					column: 16,
					size: 10,
				}),
				keyLocation: expect.objectContaining({
					line: 1,
					column: 16,
					size: 4,
				}),
				valueLocation: expect.objectContaining({
					line: 1,
					column: 22,
					size: 3,
				}),
			});
			expect(events.shift()).toEqual({ event: "tag:ready", target: "div" });
			expect(events.shift()).toEqual({
				event: "tag:end",
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
			expect.assertions(6);
			parser.parseHtml('<input type="text"/>');
			expect(events.shift()).toEqual({ event: "tag:start", target: "input" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "type",
				value: "text",
				quote: '"',
				target: "input",
				location: expect.objectContaining({
					line: 1,
					column: 8,
					size: 11,
				}),
				keyLocation: expect.objectContaining({
					line: 1,
					column: 8,
					size: 4,
				}),
				valueLocation: expect.objectContaining({
					line: 1,
					column: 14,
					size: 4,
				}),
			});
			expect(events.shift()).toEqual({ event: "tag:ready", target: "input" });
			expect(events.shift()).toEqual({
				event: "tag:end",
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
			expect.assertions(6);
			parser.parseHtml('<div foo:bar="baz"></div>');
			expect(events.shift()).toEqual({ event: "tag:start", target: "div" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "foo:bar",
				value: "baz",
				quote: '"',
				target: "div",
				location: expect.objectContaining({
					line: 1,
					column: 6,
					size: 13,
				}),
				keyLocation: expect.objectContaining({
					line: 1,
					column: 6,
					size: 7,
				}),
				valueLocation: expect.objectContaining({
					line: 1,
					column: 15,
					size: 3,
				}),
			});
			expect(events.shift()).toEqual({ event: "tag:ready", target: "div" });
			expect(events.shift()).toEqual({
				event: "tag:end",
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
			expect.assertions(29);
			parser.parseHtml(`
				<ul>
					<li>explicit</li>
					<li>implicit
					<li><strong>nested</strong>
					<li><input>
				</ul>`);
			expect(events.shift()).toEqual({ event: "tag:start", target: "ul" });
			expect(events.shift()).toEqual({ event: "tag:ready", target: "ul" });

			/* 1: explicitly closed <li> */
			expect(events.shift()).toEqual({ event: "tag:start", target: "li" });
			expect(events.shift()).toEqual({ event: "tag:ready", target: "li" });
			expect(events.shift()).toEqual({
				event: "tag:end",
				target: "li",
				previous: "li",
			});
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "li",
			});

			/* 2: implicitly closed <li> */
			expect(events.shift()).toEqual({ event: "tag:start", target: "li" });
			expect(events.shift()).toEqual({ event: "tag:ready", target: "li" });
			expect(events.shift()).toEqual({
				event: "tag:end",
				target: "li",
				previous: "li",
			});
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "li",
			});

			/* 3: implicit with children */
			expect(events.shift()).toEqual({ event: "tag:start", target: "li" });
			expect(events.shift()).toEqual({ event: "tag:ready", target: "li" });
			expect(events.shift()).toEqual({ event: "tag:start", target: "strong" });
			expect(events.shift()).toEqual({ event: "tag:ready", target: "strong" });
			expect(events.shift()).toEqual({
				event: "tag:end",
				target: "strong",
				previous: "strong",
			});
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "strong",
			});
			expect(events.shift()).toEqual({
				event: "tag:end",
				target: "li",
				previous: "li",
			});
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "li",
			});

			/* 3: implicit with void */
			expect(events.shift()).toEqual({ event: "tag:start", target: "li" });
			expect(events.shift()).toEqual({ event: "tag:ready", target: "li" });
			expect(events.shift()).toEqual({ event: "tag:start", target: "input" });
			expect(events.shift()).toEqual({ event: "tag:ready", target: "input" });
			expect(events.shift()).toEqual({
				event: "tag:end",
				target: "input",
				previous: "input",
			});
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "input",
			});
			expect(events.shift()).toEqual({
				event: "tag:end",
				target: "ul",
				previous: "li",
			});
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "li",
			});

			/* finialize <ul> */
			expect(events.shift()).toEqual({
				event: "tag:end",
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
		it("unicode bom", () => {
			expect.assertions(2);
			parser.parseHtml("\uFEFF<!DOCTYPE html>");
			expect(events.shift()).toEqual({
				event: "doctype",
				tag: "DOCTYPE",
				value: "html",
				valueLocation: expect.objectContaining({
					line: 1,
					column: 12,
					size: 4,
				}),
			});
			expect(events.shift()).toBeUndefined();
		});

		it("doctype", () => {
			expect.assertions(2);
			parser.parseHtml("<!doctype foobar>");
			expect(events.shift()).toEqual({
				event: "doctype",
				tag: "doctype",
				value: "foobar",
				valueLocation: expect.objectContaining({
					line: 1,
					column: 11,
					size: 6,
				}),
			});
			expect(events.shift()).toBeUndefined();
		});

		describe("conditional comment", () => {
			it("downlevel hidden", () => {
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

			it("downlevel reveal", () => {
				expect.assertions(3);
				parser.parseHtml("<![if IE 6]>foo<![endif]>");
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
		});

		it("foreign elements", () => {
			expect.assertions(5);
			parser.parseHtml("<svg><g></g></svg>");
			expect(events.shift()).toEqual({
				event: "tag:start",
				target: "svg",
			});
			expect(events.shift()).toEqual({
				event: "tag:ready",
				target: "svg",
			});
			expect(events.shift()).toEqual({
				event: "tag:end",
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
			expect.assertions(5);
			parser.parseHtml("<svg><svg></svg><svg/></svg>");
			expect(events.shift()).toEqual({
				event: "tag:start",
				target: "svg",
			});
			expect(events.shift()).toEqual({
				event: "tag:ready",
				target: "svg",
			});
			expect(events.shift()).toEqual({
				event: "tag:end",
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
			expect.assertions(5);
			parser.parseHtml("<svg/>");
			expect(events.shift()).toEqual({
				event: "tag:start",
				target: "svg",
			});
			expect(events.shift()).toEqual({ event: "tag:ready", target: "svg" });
			expect(events.shift()).toEqual({
				event: "tag:end",
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
			const document = parser.parseHtml("<b>foo</b> <u>bar</ul>");
			expect(document.childNodes).toHaveLength(3);
			expect(document.childNodes[0]).toBeInstanceOf(HtmlElement);
			expect(document.childNodes[0].textContent).toEqual("foo");
			expect(document.childNodes[1]).toBeInstanceOf(TextNode);
			expect(document.childNodes[1].textContent).toEqual(" ");
			expect(document.childNodes[2]).toBeInstanceOf(HtmlElement);
			expect(document.childNodes[2].textContent).toEqual("bar");
			expect(document.textContent).toEqual("foo bar");
		});
	});

	describe("should postprocess", () => {
		it("attribute", () => {
			expect.assertions(7);
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
			expect(events.shift()).toEqual({ event: "tag:start", target: "input" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "id",
				value: "foo",
				quote: '"',
				target: "input",
				location: expect.objectContaining({
					line: 1,
					column: 8,
					size: 8,
				}),
				keyLocation: expect.objectContaining({
					line: 1,
					column: 8,
					size: 2,
				}),
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
				location: expect.objectContaining({
					line: 1,
					column: 8,
					size: 8,
				}),
				keyLocation: expect.objectContaining({
					line: 1,
					column: 8,
					size: 2,
				}),
				valueLocation: expect.objectContaining({
					line: 1,
					column: 12,
				}),
			});
			expect(events.shift()).toEqual({ event: "tag:ready", target: "input" });
			expect(events.shift()).toEqual({
				event: "tag:end",
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
			expect.assertions(6);
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
			expect(events.shift()).toEqual({ event: "tag:start", target: "input" });
			expect(events.shift()).toEqual({
				event: "attr",
				key: "fred",
				value: "barney",
				quote: '"',
				target: "input",
				location: expect.objectContaining({
					line: 1,
					column: 8,
					size: 8,
				}),
				keyLocation: expect.objectContaining({
					line: 1,
					column: 8,
					size: 2,
				}),
				valueLocation: expect.objectContaining({
					line: 1,
					column: 12,
					size: 3,
				}),
			});
			expect(events.shift()).toEqual({ event: "tag:ready", target: "input" });
			expect(events.shift()).toEqual({
				event: "tag:end",
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

			it("allow modify element metadata", () => {
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
				root: true,
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
