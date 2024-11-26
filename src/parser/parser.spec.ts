import { type SourceLocation, codeFrameColumns } from "@babel/code-frame";
import { Config } from "../config";
import { type Location, type ProcessElementContext, type Source } from "../context";
import { DOMTree, HtmlElement, TextNode } from "../dom";
import { type EventCallback } from "../event";
import { HtmlValidate } from "../htmlvalidate";
import {
	type AttrNameToken,
	type CommentToken,
	type DirectiveToken,
	type TagCloseToken,
	type TagOpenToken,
	type Token,
	type TokenStream,
	InvalidTokenError,
	TokenType,
} from "../lexer";
import "../jest";
import { dumpTree } from "../utils";
import { type AttributeData } from "./attribute-data";
import { Parser } from "./parser";
import { ParserError } from "./parser-error";

const codeframePrefix = "codeframe:";

/* removes " around strings in snapshot */
expect.addSnapshotSerializer({
	test(val: unknown): boolean {
		return typeof val === "string" && val.startsWith(codeframePrefix);
	},
	serialize(val: string): string {
		return val
			.slice(codeframePrefix.length)
			.split("\n")
			.map((it) => it.trimEnd())
			.join("\n");
	},
});

/* serializer to handle HtmlElement in a human readable format */
expect.addSnapshotSerializer({
	test(val: unknown): boolean {
		return val instanceof HtmlElement;
	},
	serialize(val: HtmlElement): string {
		return dumpTree(val).join("\n");
	},
});

function codeframe(source: string, location: Location): string {
	let line = location.line;
	let column = location.column;
	for (let i = 0; i < location.size; i++) {
		if (source.charAt(location.offset + i) === "\n") {
			line++;
			column = 0;
		} else {
			column++;
		}
	}
	const sourceLocation: SourceLocation = {
		start: { line: location.line, column: location.column },
		end: { line, column },
	};
	const codeframe = codeFrameColumns(source, sourceLocation, { highlightCode: false });
	return `${codeframePrefix}${codeframe}`;
}

function mergeEvent(event: string, data: any): any {
	const merged = { event, ...data };

	/* legacy: not useful for these tests */
	if (event !== "attr" && event !== "directive") {
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
	public consumeDirective(token: DirectiveToken): void {
		super.consumeDirective(token);
	}

	public *consumeUntil(
		tokenStream: TokenStream,
		search: TokenType,
		errorLocation: Location,
	): IterableIterator<Token> {
		yield* super.consumeUntil(tokenStream, search, errorLocation);
	}

	public trigger(event: any, data: any): void {
		super.trigger(event, data);
	}
}

describe("parser", () => {
	const ignoredEvents = [
		"dom:load",
		"dom:ready",
		"parse:begin",
		"parse:end",
		"token",
		"whitespace",
	];

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

		it("elements closed on wrong order (case 1: stray end tag)", () => {
			expect.assertions(7);
			const markup = `
					<label></label>
				</div>
			`;
			const document = parser.parseHtml(markup);
			expect(document).toMatchInlineSnapshot(`
				(root)
				└── label
			`);
			expect(events.shift()).toEqual({ event: "tag:start", target: "label" });
			expect(events.shift()).toEqual({ event: "tag:ready", target: "label" });
			expect(events.shift()).toEqual({ event: "tag:end", target: "label", previous: "label" });
			expect(events.shift()).toEqual({ event: "element:ready", target: "label" });
			expect(events.shift()).toEqual({ event: "tag:end", target: "div", previous: "#document" });
			expect(events.shift()).toBeUndefined();
		});

		it("elements closed on wrong order (case 2: missing end tag)", () => {
			expect.assertions(10);
			const markup = `
				<div>
					<label></label>
			`;
			const document = parser.parseHtml(markup);
			expect(document).toMatchInlineSnapshot(`
				(root)
				└── div
				    └── label
			`);
			expect(events.shift()).toEqual({ event: "tag:start", target: "div" });
			expect(events.shift()).toEqual({ event: "tag:ready", target: "div" });
			expect(events.shift()).toEqual({ event: "tag:start", target: "label" });
			expect(events.shift()).toEqual({ event: "tag:ready", target: "label" });
			expect(events.shift()).toEqual({ event: "tag:end", target: "label", previous: "label" });
			expect(events.shift()).toEqual({ event: "element:ready", target: "label" });
			expect(events.shift()).toEqual({ event: "tag:end", target: null, previous: "div" });
			expect(events.shift()).toEqual({ event: "element:ready", target: "div" });
			expect(events.shift()).toBeUndefined();
		});

		it("elements closed on wrong order (case 3: wrong end tag)", () => {
			expect.assertions(11);
			const markup = `
				<div>
					<label></label>
				</main>
			`;
			const document = parser.parseHtml(markup);
			expect(document).toMatchInlineSnapshot(`
				(root)
				└── div
				    └── label
			`);
			expect(events.shift()).toEqual({ event: "tag:start", target: "div" });
			expect(events.shift()).toEqual({ event: "tag:ready", target: "div" });
			expect(events.shift()).toEqual({ event: "tag:start", target: "label" });
			expect(events.shift()).toEqual({ event: "tag:ready", target: "label" });
			expect(events.shift()).toEqual({ event: "tag:end", target: "label", previous: "label" });
			expect(events.shift()).toEqual({ event: "element:ready", target: "label" });
			expect(events.shift()).toEqual({ event: "tag:end", target: "main", previous: "div" });
			expect(events.shift()).toEqual({ event: "tag:end", target: null, previous: "div" });
			expect(events.shift()).toEqual({ event: "element:ready", target: "div" });
			expect(events.shift()).toBeUndefined();
		});

		it("elements closed on wrong order (case 4: out of order)", () => {
			expect.assertions(11);
			const markup = `
				<div>
					<label>
				</div>
					</label>
			`;
			const document = parser.parseHtml(markup);
			expect(document).toMatchInlineSnapshot(`
				(root)
				└── div
				    └── label
			`);
			expect(events.shift()).toEqual({ event: "tag:start", target: "div" });
			expect(events.shift()).toEqual({ event: "tag:ready", target: "div" });
			expect(events.shift()).toEqual({ event: "tag:start", target: "label" });
			expect(events.shift()).toEqual({ event: "tag:ready", target: "label" });
			expect(events.shift()).toEqual({ event: "tag:end", target: "div", previous: "label" });
			expect(events.shift()).toEqual({ event: "tag:end", target: "label", previous: "label" });
			expect(events.shift()).toEqual({ event: "element:ready", target: "label" });
			expect(events.shift()).toEqual({ event: "tag:end", target: null, previous: "div" });
			expect(events.shift()).toEqual({ event: "element:ready", target: "div" });
			expect(events.shift()).toBeUndefined();
		});

		it("elements closed on wrong order (case 5: unintended implicit closed)", () => {
			expect.assertions(19);
			const markup = `
				<main>
					<p>
						<address></address>
						<address></address>
					</p>
				</main>
			`;
			const document = parser.parseHtml(markup);
			expect(document).toMatchInlineSnapshot(`
				(root)
				└── main
				    ├── p
				    ├── address
				    └── address
			`);
			expect(events.shift()).toEqual({ event: "tag:start", target: "main" });
			expect(events.shift()).toEqual({ event: "tag:ready", target: "main" });
			expect(events.shift()).toEqual({ event: "tag:start", target: "p" });
			expect(events.shift()).toEqual({ event: "tag:ready", target: "p" });
			expect(events.shift()).toEqual({ event: "tag:end", target: "address", previous: "p" });
			expect(events.shift()).toEqual({ event: "element:ready", target: "p" });
			expect(events.shift()).toEqual({ event: "tag:start", target: "address" });
			expect(events.shift()).toEqual({ event: "tag:ready", target: "address" });
			expect(events.shift()).toEqual({ event: "tag:end", target: "address", previous: "address" });
			expect(events.shift()).toEqual({ event: "element:ready", target: "address" });
			expect(events.shift()).toEqual({ event: "tag:start", target: "address" });
			expect(events.shift()).toEqual({ event: "tag:ready", target: "address" });
			expect(events.shift()).toEqual({ event: "tag:end", target: "address", previous: "address" });
			expect(events.shift()).toEqual({ event: "element:ready", target: "address" });
			expect(events.shift()).toEqual({ event: "tag:end", target: "p", previous: "main" });
			expect(events.shift()).toEqual({ event: "tag:end", target: "main", previous: "main" });
			expect(events.shift()).toEqual({ event: "element:ready", target: "main" });
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
				meta: null,
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
				meta: null,
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
				meta: null,
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
				const element = doc.querySelector("p")!;
				expect(element.textContent).toEqual(text);
			});
		});

		it("script tag", () => {
			expect.assertions(5);
			parser.parseHtml('<script>document.write("</p>");</script>');
			expect(events.shift()).toEqual({ event: "tag:start", target: "script" });
			expect(events.shift()).toEqual({ event: "tag:ready", target: "script" });
			expect(events.shift()).toEqual({
				event: "tag:end",
				target: "script",
				previous: "script",
			});
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "script",
			});
			expect(events.shift()).toBeUndefined();
		});

		it("style tag tag", () => {
			expect.assertions(5);
			parser.parseHtml("<style>body { background: hotpink; }</style>");
			expect(events.shift()).toEqual({ event: "tag:start", target: "style" });
			expect(events.shift()).toEqual({ event: "tag:ready", target: "style" });
			expect(events.shift()).toEqual({
				event: "tag:end",
				target: "style",
				previous: "style",
			});
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "style",
			});
			expect(events.shift()).toBeUndefined();
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
				meta: null,
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
				meta: null,
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
				meta: null,
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
				meta: null,
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
				meta: null,
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
				meta: null,
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
				meta: null,
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
				meta: null,
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
				meta: null,
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
				meta: null,
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
				meta: null,
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
				meta: null,
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
				meta: null,
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
				meta: expect.anything(),
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
				meta: null,
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

	it("should add attribute metadata if present", () => {
		expect.assertions(7);
		const markup = /* HTML */ ` <input type="text" foo="bar" /> `;
		parser.parseHtml(markup);
		expect(events.shift()).toEqual({ event: "tag:start", target: "input" });
		expect(events.shift()).toEqual(
			expect.objectContaining({
				event: "attr",
				key: "type",
				value: "text",
				meta: {
					enum: expect.anything(),
				},
			}),
		);
		expect(events.shift()).toEqual(
			expect.objectContaining({
				event: "attr",
				key: "foo",
				value: "bar",
				meta: null,
			}),
		);
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

	describe("should parse directive", () => {
		it("with action", () => {
			expect.assertions(4);
			const markup = /* HTML */ ` <!-- [html-validate-enable] --> `;
			parser.parseHtml(markup);
			const event = events.shift();
			expect(event).toEqual({
				event: "directive",
				action: "enable",
				data: "",
				comment: "",
				location: expect.anything(),
				actionLocation: expect.anything(),
				optionsLocation: undefined,
				commentLocation: undefined,
			});
			expect(codeframe(markup, event.location)).toMatchInlineSnapshot(`
				> 1 |  <!-- [html-validate-enable] -->
				    |       ^^^^^^^^^^^^^^^^^^^^^^
			`);
			expect(codeframe(markup, event.actionLocation)).toMatchInlineSnapshot(`
				> 1 |  <!-- [html-validate-enable] -->
				    |                      ^^^^^^
			`);
			expect(events.shift()).toBeUndefined();
		});

		it("with options", () => {
			expect.assertions(5);
			const markup = /* HTML */ ` <!-- [html-validate-enable foo bar] --> `;
			parser.parseHtml(markup);
			const event = events.shift();
			expect(event).toEqual({
				event: "directive",
				action: "enable",
				data: "foo bar",
				comment: "",
				location: expect.anything(),
				actionLocation: expect.anything(),
				optionsLocation: expect.anything(),
				commentLocation: undefined,
			});
			expect(codeframe(markup, event.location)).toMatchInlineSnapshot(`
				> 1 |  <!-- [html-validate-enable foo bar] -->
				    |       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
			`);
			expect(codeframe(markup, event.actionLocation)).toMatchInlineSnapshot(`
				> 1 |  <!-- [html-validate-enable foo bar] -->
				    |                      ^^^^^^
			`);
			expect(codeframe(markup, event.optionsLocation)).toMatchInlineSnapshot(`
				> 1 |  <!-- [html-validate-enable foo bar] -->
				    |                             ^^^^^^^
			`);
			expect(events.shift()).toBeUndefined();
		});

		it("with colon comment", () => {
			expect.assertions(5);
			const markup = /* HTML */ ` <!-- [html-validate-enable: lorem ipsum] --> `;
			parser.parseHtml(markup);
			const event = events.shift();
			expect(event).toEqual({
				event: "directive",
				action: "enable",
				data: "",
				comment: "lorem ipsum",
				location: expect.anything(),
				actionLocation: expect.anything(),
				optionsLocation: undefined,
				commentLocation: expect.anything(),
			});
			expect(codeframe(markup, event.location)).toMatchInlineSnapshot(`
				> 1 |  <!-- [html-validate-enable: lorem ipsum] -->
				    |       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
			`);
			expect(codeframe(markup, event.actionLocation)).toMatchInlineSnapshot(`
				> 1 |  <!-- [html-validate-enable: lorem ipsum] -->
				    |                      ^^^^^^
			`);
			expect(codeframe(markup, event.commentLocation)).toMatchInlineSnapshot(`
				> 1 |  <!-- [html-validate-enable: lorem ipsum] -->
				    |                              ^^^^^^^^^^^
			`);
			expect(events.shift()).toBeUndefined();
		});

		it("with dashdash comment", () => {
			expect.assertions(5);
			const markup = /* HTML */ ` <!-- [html-validate-enable -- lorem ipsum] --> `;
			parser.parseHtml(markup);
			const event = events.shift();
			expect(event).toEqual({
				event: "directive",
				action: "enable",
				data: "",
				comment: "lorem ipsum",
				location: expect.anything(),
				actionLocation: expect.anything(),
				optionsLocation: undefined,
				commentLocation: expect.anything(),
			});
			expect(codeframe(markup, event.location)).toMatchInlineSnapshot(`
				> 1 |  <!-- [html-validate-enable -- lorem ipsum] -->
				    |       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
			`);
			expect(codeframe(markup, event.actionLocation)).toMatchInlineSnapshot(`
				> 1 |  <!-- [html-validate-enable -- lorem ipsum] -->
				    |                      ^^^^^^
			`);
			expect(codeframe(markup, event.commentLocation)).toMatchInlineSnapshot(`
				> 1 |  <!-- [html-validate-enable -- lorem ipsum] -->
				    |                                ^^^^^^^^^^^
			`);
			expect(events.shift()).toBeUndefined();
		});

		it("with options and colon comment", () => {
			expect.assertions(6);
			const markup = /* HTML */ ` <!-- [html-validate-enable foo bar: baz] --> `;
			parser.parseHtml(markup);
			const event = events.shift();
			expect(event).toEqual({
				event: "directive",
				action: "enable",
				data: "foo bar",
				comment: "baz",
				location: expect.anything(),
				actionLocation: expect.anything(),
				optionsLocation: expect.anything(),
				commentLocation: expect.anything(),
			});
			expect(codeframe(markup, event.location)).toMatchInlineSnapshot(`
				> 1 |  <!-- [html-validate-enable foo bar: baz] -->
				    |       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
			`);
			expect(codeframe(markup, event.actionLocation)).toMatchInlineSnapshot(`
				> 1 |  <!-- [html-validate-enable foo bar: baz] -->
				    |                      ^^^^^^
			`);
			expect(codeframe(markup, event.optionsLocation)).toMatchInlineSnapshot(`
				> 1 |  <!-- [html-validate-enable foo bar: baz] -->
				    |                             ^^^^^^^
			`);
			expect(codeframe(markup, event.commentLocation)).toMatchInlineSnapshot(`
				> 1 |  <!-- [html-validate-enable foo bar: baz] -->
				    |                                      ^^^
			`);
			expect(events.shift()).toBeUndefined();
		});

		it("with options and dashdash comment", () => {
			expect.assertions(6);
			const markup = /* HTML */ ` <!-- [html-validate-enable foo bar -- baz] --> `;
			parser.parseHtml(markup);
			const event = events.shift();
			expect(event).toEqual({
				event: "directive",
				action: "enable",
				data: "foo bar",
				comment: "baz",
				location: expect.anything(),
				actionLocation: expect.anything(),
				optionsLocation: expect.anything(),
				commentLocation: expect.anything(),
			});
			expect(codeframe(markup, event.location)).toMatchInlineSnapshot(`
				> 1 |  <!-- [html-validate-enable foo bar -- baz] -->
				    |       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
			`);
			expect(codeframe(markup, event.actionLocation)).toMatchInlineSnapshot(`
				> 1 |  <!-- [html-validate-enable foo bar -- baz] -->
				    |                      ^^^^^^
			`);
			expect(codeframe(markup, event.optionsLocation)).toMatchInlineSnapshot(`
				> 1 |  <!-- [html-validate-enable foo bar -- baz] -->
				    |                             ^^^^^^^
			`);
			expect(codeframe(markup, event.commentLocation)).toMatchInlineSnapshot(`
				> 1 |  <!-- [html-validate-enable foo bar -- baz] -->
				    |                                        ^^^
			`);
			expect(events.shift()).toBeUndefined();
		});

		it("with obscure whitespace", () => {
			expect.assertions(6);
			const markup = /* HTML */ ` <!--[html-validate-enable 	 foo bar    --    baz]--> `;
			parser.parseHtml(markup);
			const event = events.shift();
			expect(event).toEqual({
				event: "directive",
				action: "enable",
				data: "foo bar",
				comment: "baz",
				location: expect.anything(),
				actionLocation: expect.anything(),
				optionsLocation: expect.anything(),
				commentLocation: expect.anything(),
			});
			expect(codeframe(markup, event.location)).toMatchInlineSnapshot(`
				> 1 |  <!--[html-validate-enable 	 foo bar    --    baz]-->
				    |      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
			`);
			expect(codeframe(markup, event.actionLocation)).toMatchInlineSnapshot(`
				> 1 |  <!--[html-validate-enable 	 foo bar    --    baz]-->
				    |                     ^^^^^^
			`);
			expect(codeframe(markup, event.optionsLocation)).toMatchInlineSnapshot(`
				> 1 |  <!--[html-validate-enable 	 foo bar    --    baz]-->
				    |                            	 ^^^^^^^
			`);
			expect(codeframe(markup, event.commentLocation)).toMatchInlineSnapshot(`
				> 1 |  <!--[html-validate-enable 	 foo bar    --    baz]-->
				    |                            	                  ^^^
			`);
			expect(events.shift()).toBeUndefined();
		});

		it("should report unknown directives", () => {
			expect.assertions(2);
			const parse = (): void => {
				parser.parseHtml("<!-- [html-validate-arbitrary-action foo bar] -->");
			};
			expect(parse).toThrow(ParserError);
			expect(parse).toThrow('Unknown directive "arbitrary-action"');
		});

		it("throw when missing end bracket ]", () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <!-- [html-validate-disable-next foo -- bar --> `;
			const fn = (): HtmlElement => parser.parseHtml(markup);
			expect(fn).toThrow(ParserError);
			expect(fn).toThrow(
				'Missing end bracket "]" on directive "<!-- [html-validate-disable-next foo -- bar -->"',
			);
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
					parent: expect.objectContaining({
						nodeName: "#document",
					}),
				});
				expect(events.shift()).toEqual({
					event: "conditional",
					condition: "endif",
					parent: expect.objectContaining({
						nodeName: "#document",
					}),
				});
				expect(events.shift()).toBeUndefined();
			});

			it("downlevel reveal", () => {
				expect.assertions(3);
				parser.parseHtml("<![if IE 6]>foo<![endif]>");
				expect(events.shift()).toEqual({
					event: "conditional",
					condition: "if IE 6",
					parent: expect.objectContaining({
						nodeName: "#document",
					}),
				});
				expect(events.shift()).toEqual({
					event: "conditional",
					condition: "endif",
					parent: expect.objectContaining({
						nodeName: "#document",
					}),
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

		it("svg with title", () => {
			expect.assertions(9);
			parser.parseHtml("<svg><title></title></svg>");
			expect(events.shift()).toEqual({
				event: "tag:start",
				target: "svg",
			});
			expect(events.shift()).toEqual({
				event: "tag:ready",
				target: "svg",
			});
			expect(events.shift()).toEqual({
				event: "tag:start",
				target: "svg:title",
			});
			expect(events.shift()).toEqual({
				event: "tag:ready",
				target: "svg:title",
			});
			expect(events.shift()).toEqual({
				event: "tag:end",
				previous: "svg:title",
				target: "svg:title",
			});
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "svg:title",
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

		it("svg with nested title", () => {
			expect.assertions(13);
			parser.parseHtml("<svg><title><title></title></title></svg>");
			expect(events.shift()).toEqual({
				event: "tag:start",
				target: "svg",
			});
			expect(events.shift()).toEqual({
				event: "tag:ready",
				target: "svg",
			});
			expect(events.shift()).toEqual({
				event: "tag:start",
				target: "svg:title",
			});
			expect(events.shift()).toEqual({
				event: "tag:ready",
				target: "svg:title",
			});
			expect(events.shift()).toEqual({
				event: "tag:start",
				target: "svg:title",
			});
			expect(events.shift()).toEqual({
				event: "tag:ready",
				target: "svg:title",
			});
			expect(events.shift()).toEqual({
				event: "tag:end",
				previous: "svg:title",
				target: "svg:title",
			});
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "svg:title",
			});
			expect(events.shift()).toEqual({
				event: "tag:end",
				previous: "svg:title",
				target: "svg:title",
			});
			expect(events.shift()).toEqual({
				event: "element:ready",
				target: "svg:title",
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

		it("should parse elements with text", () => {
			expect.assertions(8);
			const document = parser.parseHtml("<b>foo</b> <u>bar</ul>");
			expect(document.childNodes).toHaveLength(3);
			expect(document.childNodes[0]).toBeInstanceOf(HtmlElement);
			expect(document.childNodes[0].textContent).toBe("foo");
			expect(document.childNodes[1]).toBeInstanceOf(TextNode);
			expect(document.childNodes[1].textContent).toBe(" ");
			expect(document.childNodes[2]).toBeInstanceOf(HtmlElement);
			expect(document.childNodes[2].textContent).toBe("bar");
			expect(document.textContent).toBe("foo bar");
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
				meta: expect.anything(),
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
				meta: null,
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
				meta: null,
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
					context = this; // eslint-disable-line @typescript-eslint/no-this-alias -- hack
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
				const i = doc.querySelector("i")!;
				const u = doc.querySelector("u")!;
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

		it("multiline", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateFile("./test-files/parser/multiline.html");
			expect(report).toBeValid();
		});

		it("xi:include", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateFile("./test-files/parser/xi-include.html");
			expect(report).toBeValid();
		});

		it("cdata", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateFile("./test-files/parser/cdata.html");
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
					data: ["<div", "", "div"],
				} as TagOpenToken,
				{
					type: TokenType.ATTR_NAME,
					location: {
						filename: "inline",
						offset: 1,
						line: 1,
						column: 2,
						size: 1,
					},
					data: ["contenteditable", "contenteditable"],
				} as AttrNameToken,
				{
					type: TokenType.TAG_CLOSE,
					location: {
						filename: "inline",
						offset: 3,
						line: 1,
						column: 4,
						size: 1,
					},
					data: [">"],
				} as TagCloseToken,
				{
					type: TokenType.COMMENT,
					location: {
						filename: "inline",
						offset: 4,
						line: 1,
						column: 5,
						size: 1,
					},
					data: ["<-- foo -->", " foo "],
				} as CommentToken,
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
					data: ["<div", "", "div"],
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
					data: ["contenteditable", "contenteditable"],
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
					data: [">"],
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
					data: ["<!-- foo -->", " foo "],
				} as CommentToken,
			][Symbol.iterator]();
			const location: Location = {
				filename: "inline",
				line: 1,
				column: 1,
				offset: 0,
				size: 1,
			};
			expect(() => Array.from(parser.consumeUntil(src, TokenType.TAG_CLOSE, location))).toThrow(
				"stream ended before TAG_CLOSE token was found",
			);
		});
	});

	it("should recalculate location size", () => {
		expect.assertions(1);
		const dom = parser.parseHtml('<div class="foo">\n\tlorem ipsum\n</div>');
		const div = dom.querySelector("div")!;
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
			expect(() => {
				parser.trigger("foo", {});
			}).toThrow("Triggered event must contain location");
		});
	});
});
