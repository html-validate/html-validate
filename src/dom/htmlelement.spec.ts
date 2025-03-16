/* eslint-disable sonarjs/no-dead-store -- has side-effects and in this case gives more consistent code */

import { Config } from "../config";
import { type Location, type Source } from "../context";
import { type TagCloseToken, type TagOpenToken, type Token, TokenType } from "../lexer";
import { type MetaData, type MetaElement, MetaTable } from "../meta";
import { Parser } from "../parser";
import { processAttribute } from "../transform/mocks/attribute";
import { DynamicValue } from "./dynamic-value";
import { Attribute, HtmlElement, NodeClosed, NodeType } from ".";

interface LocationSpec {
	column: number;
	size: number;
}

function createLocation({ column, size }: LocationSpec): Location {
	return {
		filename: "filename",
		offset: column - 1,
		line: 1,
		column,
		size,
	};
}

describe("HtmlElement", () => {
	let document: HtmlElement;
	let parser: Parser;
	const location = createLocation({ column: 1, size: 4 });

	beforeAll(async () => {
		const resolvedConfig = await Config.empty().resolve();
		parser = new Parser(resolvedConfig);
	});

	beforeEach(() => {
		const markup = /* HTML */ `
			<div id="parent">
				<ul>
					<li class="foo" dynamic-class="expr">foo</li>
					<li class="bar baz" id="spam" title="ham">bar</li>
				</ul>
				<p class="bar">spam</p>
				<span class="baz">flux</span>
			</div>
		`;
		const source: Source = {
			data: markup,
			filename: "inline",
			line: 1,
			column: 1,
			offset: 0,
			hooks: {
				processAttribute,
			},
		};
		document = parser.parseHtml(source);
	});

	describe("fromTokens()", () => {
		function createTokens(
			tagName: string,
			open: boolean = true,
			selfClose: boolean = false,
		): [TagOpenToken, TagCloseToken] {
			const slash = open ? "" : "/";
			const startToken: Token = {
				type: TokenType.TAG_OPEN,
				data: [`<${slash}${tagName}`, slash, tagName],
				location,
			};
			const endToken: Token = {
				type: TokenType.TAG_CLOSE,
				data: [selfClose ? "/>" : ">"],
				location,
			};
			return [startToken, endToken];
		}

		it("should create HtmlElement from tokens", () => {
			expect.assertions(4);
			const [startToken, endToken] = createTokens("foo"); // <foo>
			const node = HtmlElement.fromTokens(startToken, endToken, null, null);
			expect(node.nodeName).toBe("foo");
			expect(node.tagName).toBe("foo");
			expect(node.location).toEqual({
				filename: "filename",
				offset: 1,
				line: 1,
				column: 2,
				size: 3,
			});
			expect(node.closed).toEqual(NodeClosed.Open);
		});

		it("should throw error if tagname is missing", () => {
			expect.assertions(1);
			const [startToken, endToken] = createTokens(""); // <foo>
			expect(() => {
				HtmlElement.fromTokens(startToken, endToken, null, null);
			}).toThrow("tagName cannot be empty");
		});

		it("should set parent for opening tag", () => {
			expect.assertions(2);
			const [startToken1, endToken1] = createTokens("foo", true); //  <foo>
			const [startToken2, endToken2] = createTokens("foo", false); // </foo>
			const parent = HtmlElement.createElement("parent", location);
			const open = HtmlElement.fromTokens(startToken1, endToken1, parent, null);
			const close = HtmlElement.fromTokens(startToken2, endToken2, parent, null);
			expect(open.parent).toBeDefined();
			expect(close.parent).toBeNull();
		});

		it("should set metadata", () => {
			expect.assertions(1);
			const [startToken, endToken] = createTokens("foo"); // <foo>
			const foo: MetaData = mockEntry();
			const table = new MetaTable();
			table.loadFromObject({ foo });
			const node = HtmlElement.fromTokens(startToken, endToken, null, table);
			expect(node.meta).toEqual(expect.objectContaining(foo));
		});

		it("should set closed for omitted end tag", () => {
			expect.assertions(1);
			const [startToken, endToken] = createTokens("foo"); // <foo>
			const foo: MetaData = mockEntry({ void: true });
			const table = new MetaTable();
			table.loadFromObject({ foo });
			const node = HtmlElement.fromTokens(startToken, endToken, null, table);
			expect(node.closed).toEqual(NodeClosed.VoidOmitted);
		});

		it("should set closed for self-closed end tag", () => {
			expect.assertions(1);
			const [startToken, endToken] = createTokens("foo", true, true); // <foo/>
			const node = HtmlElement.fromTokens(startToken, endToken, null, null);
			expect(node.closed).toEqual(NodeClosed.VoidSelfClosed);
		});

		it("should append namespace if given", () => {
			expect.assertions(3);
			const [startToken, endToken] = createTokens("title"); // <title>
			const title: MetaData = mockEntry();
			const svgTitle: MetaData = mockEntry();
			const table = new MetaTable();
			table.loadFromObject({ title, "svg:title": svgTitle });
			const node = HtmlElement.fromTokens(startToken, endToken, null, table, "svg");
			expect(node.nodeName).toBe("svg:title");
			expect(node.tagName).toBe("svg:title");
			expect(node.meta).toEqual(
				expect.objectContaining({
					tagName: "svg:title",
				}),
			);
		});
	});

	describe("annotatedName", () => {
		it("should use annotation if set", () => {
			expect.assertions(1);
			const node = HtmlElement.createElement("my-element", location);
			node.setAnnotation("my annotation");
			expect(node.annotatedName).toBe("my annotation");
		});

		it("should default to <tagName>", () => {
			expect.assertions(1);
			const node = HtmlElement.createElement("my-element", location);
			expect(node.annotatedName).toBe("<my-element>");
		});
	});

	describe("ariaLabelledby", () => {
		it("should return list of id's", () => {
			expect.assertions(1);
			const node = HtmlElement.createElement("div", location);
			node.setAttribute("aria-labelledby", "foo bar baz", location, location);
			expect(node.ariaLabelledby).toEqual(["foo", "bar", "baz"]);
		});

		it("should trim whitespace", () => {
			expect.assertions(1);
			const node = HtmlElement.createElement("div", location);
			node.setAttribute("aria-labelledby", " foo bar ", location, location);
			expect(node.ariaLabelledby).toEqual(["foo", "bar"]);
		});

		it("should return dynamic attribute as is", () => {
			expect.assertions(1);
			const node = HtmlElement.createElement("div", location);
			const attr = new DynamicValue("expr");
			node.setAttribute("aria-labelledby", attr, location, location);
			expect(node.ariaLabelledby).toBe(attr);
		});

		it("should return null if attribute is unset", () => {
			expect.assertions(1);
			const node = HtmlElement.createElement("div", location);
			expect(node.ariaLabelledby).toBeNull();
		});

		it("should return null if attribute is empty", () => {
			expect.assertions(1);
			const node = HtmlElement.createElement("div", location);
			node.setAttribute("aria-labelledby", "", location, location);
			expect(node.ariaLabelledby).toBeNull();
		});

		it("should return null if attribute is whitespace only", () => {
			expect.assertions(1);
			const node = HtmlElement.createElement("div", location);
			node.setAttribute("aria-labelledby", " ", location, location);
			expect(node.ariaLabelledby).toBeNull();
		});
	});

	it("rootNode()", () => {
		expect.assertions(4);
		const node = HtmlElement.rootNode(location);
		expect(node.isRootElement()).toBeTruthy();
		expect(node.nodeType).toEqual(NodeType.DOCUMENT_NODE);
		expect(node.nodeName).toBe("#document");
		expect(node.tagName).toBe("#document");
	});

	it("id property should return element id", () => {
		expect.assertions(1);
		const el = HtmlElement.createElement("foo", location);
		el.setAttribute("id", "bar", location, null);
		expect(el.id).toBe("bar");
	});

	it("id property should return null if no id attribute exists", () => {
		expect.assertions(1);
		const el = HtmlElement.createElement("foo", location);
		expect(el.id).toBeNull();
	});

	describe("{first,last}ChildElement", () => {
		let root: HtmlElement;
		let a: HtmlElement;
		let b: HtmlElement;
		let c: HtmlElement;

		beforeAll(() => {
			root = HtmlElement.createElement("root", location);
			a = HtmlElement.createElement("a", location, { parent: root });
			b = HtmlElement.createElement("b", location, { parent: root });
			c = HtmlElement.createElement("c", location, { parent: root });
		});

		it("firstElementChild should return first child element", () => {
			expect.assertions(1);
			expect(root.firstElementChild).toEqual(a);
		});

		it("firstElementChild should return null if there are no child elements", () => {
			expect.assertions(1);
			expect(b.firstElementChild).toBeNull();
		});

		it("lastElementChild should return last child element", () => {
			expect.assertions(1);
			expect(root.lastElementChild).toEqual(c);
		});

		it("lastElementChild should return null if there are no child elements", () => {
			expect.assertions(1);
			expect(b.lastElementChild).toBeNull();
		});
	});

	it("previousSibling should return node before this node", () => {
		expect.assertions(3);
		const root = HtmlElement.createElement("root", location);
		const a = HtmlElement.createElement("a", location, { parent: root });
		const b = HtmlElement.createElement("b", location, { parent: root });
		const c = HtmlElement.createElement("c", location, { parent: root });
		expect(c.previousSibling).toEqual(b);
		expect(b.previousSibling).toEqual(a);
		expect(a.previousSibling).toBeNull();
	});

	it("nextSibling should return node after this node", () => {
		expect.assertions(3);
		const root = HtmlElement.createElement("root", location);
		const a = HtmlElement.createElement("a", location, { parent: root });
		const b = HtmlElement.createElement("b", location, { parent: root });
		const c = HtmlElement.createElement("c", location, { parent: root });
		expect(a.nextSibling).toEqual(b);
		expect(b.nextSibling).toEqual(c);
		expect(c.nextSibling).toBeNull();
	});

	describe("siblings", () => {
		it("should return list of siblings", () => {
			expect.assertions(1);
			expect.assertions(3);
			const root = HtmlElement.createElement("root", location);
			const a = HtmlElement.createElement("a", location, { parent: root });
			const b = HtmlElement.createElement("b", location, { parent: root });
			const c = HtmlElement.createElement("c", location, { parent: root });
			expect(a.siblings).toEqual([a, b, c]);
			expect(b.siblings).toEqual([a, b, c]);
			expect(c.siblings).toEqual([a, b, c]);
		});

		it("should handle detached elements", () => {
			expect.assertions(1);
			const element = HtmlElement.createElement("span", location);
			expect(element.siblings).toEqual([element]);
		});
	});

	describe("attributes getter", () => {
		it("should return list of all attributes", () => {
			expect.assertions(2);
			const node = HtmlElement.createElement("foo", location);
			node.setAttribute("foo", "a", location, location);
			node.setAttribute("bar", "b", location, location);
			expect(node.attributes).toEqual([expect.any(Attribute), expect.any(Attribute)]);
			expect(node.attributes).toEqual([
				expect.objectContaining({ key: "foo", value: "a" }),
				expect.objectContaining({ key: "bar", value: "b" }),
			]);
		});

		it("should handle duplicated or aliased attributes", () => {
			expect.assertions(2);
			const node = HtmlElement.createElement("foo", location);
			node.setAttribute("foo", "a", location, location);
			node.setAttribute("foo", "b", location, location);
			expect(node.attributes).toEqual([expect.any(Attribute), expect.any(Attribute)]);
			expect(node.attributes).toEqual([
				expect.objectContaining({ key: "foo", value: "a" }),
				expect.objectContaining({ key: "foo", value: "b" }),
			]);
		});
	});

	it("hasAttribute()", () => {
		expect.assertions(2);
		const node = HtmlElement.createElement("foo", location);
		node.setAttribute("foo", "", location, null);
		expect(node.hasAttribute("foo")).toBeTruthy();
		expect(node.hasAttribute("bar")).toBeFalsy();
	});

	describe("getAttribute()", () => {
		it("should get attribute", () => {
			expect.assertions(3);
			const node = HtmlElement.createElement("foo", location);
			const keyLocation = createLocation({ column: 1, size: 3 });
			const valueLocation = createLocation({ column: 5, size: 5 });
			node.setAttribute("foo", "value", keyLocation, valueLocation);
			expect(node.getAttribute("foo")).toBeInstanceOf(Attribute);
			expect(node.getAttribute("foo")).toEqual({
				key: "foo",
				value: "value",
				keyLocation,
				valueLocation,
			});
			expect(node.getAttribute("bar")).toBeNull();
		});

		it("should return first instance if attribute is duplicated", () => {
			expect.assertions(1);
			const node = HtmlElement.createElement("foo", location);
			const keyLocation = createLocation({ column: 1, size: 3 });
			const valueLocation = createLocation({ column: 5, size: 5 });
			node.setAttribute("foo", "a", keyLocation, valueLocation);
			node.setAttribute("foo", "b", keyLocation, valueLocation);
			expect(node.getAttribute("foo")).toEqual(
				expect.objectContaining({
					key: "foo",
					value: "a",
				}),
			);
		});

		it("should get duplicated attributes if requested", () => {
			expect.assertions(1);
			const node = HtmlElement.createElement("foo", location);
			const keyLocation = createLocation({ column: 1, size: 3 });
			const valueLocation = createLocation({ column: 5, size: 5 });
			node.setAttribute("foo", "a", keyLocation, valueLocation);
			node.setAttribute("foo", "b", keyLocation, valueLocation);
			expect(node.getAttribute("foo", true)).toEqual([
				expect.objectContaining({
					key: "foo",
					value: "a",
				}),
				expect.objectContaining({
					key: "foo",
					value: "b",
				}),
			]);
		});

		it("should ignore case", () => {
			expect.assertions(1);
			const node = HtmlElement.createElement("foo", location);
			const keyLocation = createLocation({ column: 1, size: 3 });
			const valueLocation = createLocation({ column: 5, size: 5 });
			node.setAttribute("foo", "bar", keyLocation, valueLocation);
			expect(node.getAttribute("FOO")).toEqual(
				expect.objectContaining({
					key: "foo",
					value: "bar",
				}),
			);
		});
	});

	describe("getAttributeValue", () => {
		it("should get attribute value", () => {
			expect.assertions(1);
			const node = HtmlElement.createElement("foo", location);
			node.setAttribute("bar", "value", location, null);
			expect(node.getAttributeValue("bar")).toBe("value");
		});

		it("should get attribute expression for dynamic values", () => {
			expect.assertions(1);
			const node = HtmlElement.createElement("foo", location);
			const dynamic = new DynamicValue("{{ interpolated }}");
			node.setAttribute("bar", dynamic, location, null);
			expect(node.getAttributeValue("bar")).toBe("{{ interpolated }}");
		});

		it("should return null for missing attributes", () => {
			expect.assertions(1);
			const node = HtmlElement.createElement("foo", location);
			expect(node.getAttributeValue("bar")).toBeNull();
		});

		it("should return null for boolean attributes", () => {
			expect.assertions(1);
			const node = HtmlElement.createElement("foo", location);
			node.setAttribute("bar", null, location, null);
			expect(node.getAttributeValue("bar")).toBeNull();
		});
	});

	describe("classList", () => {
		it("should return list of classes", () => {
			expect.assertions(1);
			const node = HtmlElement.createElement("foo", location);
			node.setAttribute("class", "foo bar baz", location, null);
			expect(Array.from(node.classList)).toEqual(["foo", "bar", "baz"]);
		});

		it("should return empty list when class is missing", () => {
			expect.assertions(1);
			const node = HtmlElement.createElement("foo", location);
			expect(Array.from(node.classList)).toEqual([]);
		});

		it("should handle duplicate (or aliased) class attribute", () => {
			expect.assertions(1);
			const node = HtmlElement.createElement("foo", location);
			node.setAttribute("class", "foo", location, null);
			node.setAttribute("class", "bar", location, null);
			expect(Array.from(node.classList)).toEqual(["foo", "bar"]);
		});

		it("should ignore dynamic values", () => {
			expect.assertions(1);
			const node = HtmlElement.createElement("foo", location);
			node.setAttribute("class", new DynamicValue("dynamic"), location, null);
			expect(Array.from(node.classList)).toEqual([]);
		});
	});

	describe("appendText()", () => {
		it("should add text to element", () => {
			expect.assertions(2);
			const node = HtmlElement.createElement("foo", location);
			node.appendText("foo", location);
			node.appendText("bar", location);
			expect(node.childNodes).toHaveLength(2);
			expect(node.textContent).toBe("foobar");
		});
	});

	describe("should calculate depth", () => {
		it("for nodes without parent", () => {
			expect.assertions(1);
			const node = HtmlElement.createElement("foo", location);
			expect(node.depth).toBe(0);
		});

		it("for nodes in a tree", () => {
			expect.assertions(4);
			expect(document.querySelector("#parent")!.depth).toBe(0);
			expect(document.querySelector("ul")!.depth).toBe(1);
			expect(document.querySelector("li.foo")!.depth).toBe(2);
			expect(document.querySelector("li.bar")!.depth).toBe(2);
		});
	});

	describe("closest()", () => {
		let node: HtmlElement;

		beforeAll(async () => {
			const resolvedConfig = await Config.empty().resolve();
			const parser = new Parser(resolvedConfig);
			document = parser.parseHtml(`
				<div id="1" class="x">
					<div id="2" class="x">
						<p id="3" class="x"></p>
					</div>
				</div>`);
			node = document.querySelector("p")!;
		});

		it("should return first parent matching the selector", () => {
			expect.assertions(1);
			expect(node.closest("div")?.id).toBe("2");
		});

		it("should return itself if matching the selector", () => {
			expect.assertions(1);
			expect(node.closest(".x")?.id).toBe("3");
		});

		it("should return null if no element matches the selector", () => {
			expect.assertions(1);
			expect(node.closest(".y")).toBeNull();
		});
	});

	describe("generateSelector()", () => {
		let parser: Parser;

		beforeAll(async () => {
			const resolvedConfig = await Config.empty().resolve();
			parser = new Parser(resolvedConfig);
		});

		it("should generate a unique selector", () => {
			expect.assertions(1);
			const document = parser.parseHtml(`
				<div>
					<i>a</i>
					<p>b</p>
					<i>c</i>
					<p>d</p>
				</div>
			`);
			const el = document.querySelector("div")!.childElements[3];
			expect(el.generateSelector()).toBe("div > p:nth-child(4)");
		});

		it("should use id if a unique id is present", () => {
			expect.assertions(1);
			const document = parser.parseHtml(`
				<div>
					<div id="foo">
						<p></p>
					</div>
				</div>
			`);
			const el = document.querySelector("p")!;
			expect(el.generateSelector()).toBe("#foo > p");
		});

		it("should not use id if id is not unique", () => {
			expect.assertions(1);
			const document = parser.parseHtml(`
				<div>
					<div id="foo">
						<p></p>
					</div>
					<div id="foo"></div>
				</div>
			`);
			const el = document.querySelector("p")!;
			expect(el.generateSelector()).toBe("div > div:nth-child(1) > p");
		});

		it("should handle colon in id", () => {
			expect.assertions(1);
			const document = parser.parseHtml(`
				<div>
					<div id="foo:">
						<p></p>
					</div>
				</div>
			`);
			const el = document.querySelector("p")!;
			expect(el.generateSelector()).toBe("#foo\\: > p");
		});

		it("should handle space in id", () => {
			expect.assertions(1);
			const document = parser.parseHtml(`
				<div>
					<div id="foo ">
						<p></p>
					</div>
				</div>
			`);
			const el = document.querySelector("p")!;
			expect(el.generateSelector()).toBe("#foo\\  > p");
		});

		it("should handle bracket in id", () => {
			expect.assertions(1);
			const document = parser.parseHtml(`
				<div>
					<div id="foo[bar]">
						<p></p>
					</div>
				</div>
			`);
			const el = document.querySelector("p")!;
			expect(el.generateSelector()).toBe("#foo\\[bar\\] > p");
		});

		it("should handle leading digits in id by replacing with [id=...]", () => {
			expect.assertions(1);
			const document = parser.parseHtml(`
				<div>
					<div id="123">
						<p></p>
					</div>
				</div>
			`);
			const el = document.querySelector("p")!;
			expect(el.generateSelector()).toBe('[id="123"] > p');
		});

		it("should escape special characters", () => {
			expect.assertions(1);
			const document = parser.parseHtml(`
				<div>
					<div id="foo+b[a]r/baz">
						<p></p>
					</div>
				</div>
			`);
			const el = document.querySelector("p")!;
			expect(el.generateSelector()).toBe("#foo\\+b\\[a\\]r\\/baz > p");
		});

		it("should normalize tagnames", () => {
			expect.assertions(1);
			const document = parser.parseHtml(`<dIV></DIv>`);
			const el = document.querySelector("div")!;
			expect(el.generateSelector()).toBe("div");
		});

		it("root element should not receive selector", () => {
			expect.assertions(1);
			const el = HtmlElement.rootNode(location);
			expect(el.generateSelector()).toBeNull();
		});
	});

	describe("is()", () => {
		it("should match tagname", () => {
			expect.assertions(2);
			const el = HtmlElement.createElement("foo", location);
			expect(el.is("foo")).toBeTruthy();
			expect(el.is("bar")).toBeFalsy();
		});

		it("should match case-insensitive", () => {
			expect.assertions(4);
			const a = HtmlElement.createElement("foo", location);
			const b = HtmlElement.createElement("BAR", location);
			expect(a.is("foo")).toBeTruthy();
			expect(a.is("FOO")).toBeTruthy();
			expect(b.is("bar")).toBeTruthy();
			expect(b.is("BAR")).toBeTruthy();
		});

		it("should match any tag when using asterisk", () => {
			expect.assertions(1);
			const el = HtmlElement.createElement("foo", location);
			expect(el.is("*")).toBeTruthy();
		});
	});

	describe("loadMeta()", () => {
		let node: HtmlElement;
		const original = {
			inherit: "foo",
			flow: true,
		} as MetaElement;

		beforeEach(() => {
			node = HtmlElement.createElement("my-element", location, { meta: original });
		});

		it("should overwrite copyable properties", () => {
			expect.assertions(1);
			node.loadMeta({ flow: false } as MetaElement);
			expect(node.meta?.flow).toBe(false);
		});

		it("should not overwrite non-copyable properties", () => {
			expect.assertions(1);
			node.loadMeta({ inherit: "bar" } as MetaElement);
			expect(node.meta?.inherit).toBe("foo");
		});

		it("should remove missing properties", () => {
			expect.assertions(1);
			node.loadMeta({} as MetaElement);
			expect(node.meta?.flow).toBeUndefined();
		});

		it("should handle when original meta is null", () => {
			expect.assertions(1);
			const node = HtmlElement.createElement("my-element", location);
			node.loadMeta({ flow: false } as MetaElement);
			expect(node.meta?.flow).toBe(false);
		});
	});

	describe("getElementsByTagName()", () => {
		it("should find elements", () => {
			expect.assertions(3);
			const nodes = document.getElementsByTagName("li");
			expect(nodes).toHaveLength(2);
			expect(nodes[0].getAttributeValue("class")).toBe("foo");
			expect(nodes[1].getAttributeValue("class")).toBe("bar baz");
		});

		it("should support universal selector", () => {
			expect.assertions(2);
			const tagNames = document.getElementsByTagName("*").map((cur: HtmlElement) => cur.tagName);
			expect(tagNames).toHaveLength(6);
			expect(tagNames).toEqual(["div", "ul", "li", "li", "p", "span"]);
		});
	});

	describe("matches()", () => {
		it("should return true if element matches given selector", () => {
			expect.assertions(3);
			const node = document.querySelector("#spam")!;
			expect(node.matches("ul > li")).toBeTruthy();
			expect(node.matches("li.baz")).toBeTruthy();
			expect(node.matches("#parent li")).toBeTruthy();
		});

		it("should return false if element does not match given selector", () => {
			expect.assertions(3);
			const node = document.querySelector("#spam")!;
			expect(node.matches("div > li")).toBeFalsy();
			expect(node.matches("li.foo")).toBeFalsy();
			expect(node.matches("#ham li")).toBeFalsy();
		});
	});

	describe("role", () => {
		it("should return explicitly set role", () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <div role="banner"></div> `;
			const document = parser.parseHtml(markup);
			const element = document.querySelector("div")!;
			expect(element.role).toBe("banner");
		});

		it("should return implicit role", () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<ul>
					<li></li>
				</ul>
			`;
			const document = parser.parseHtml(markup);
			const element = document.querySelector("li")!;
			expect(element.role).toBe("listitem");
		});

		it("should handle elements without metadata", () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <any></any> `;
			const document = parser.parseHtml(markup);
			const element = document.querySelector("any")!;
			expect(element.role).toBeNull();
		});

		it("should cache result", () => {
			expect.assertions(4);
			const markup = /* HTML */ ` <img /> `;
			const document = parser.parseHtml(markup);
			const element = document.querySelector("img")!;
			const spy = jest.spyOn(element, "getAttribute");
			expect(element.role).toBe("img");
			expect(spy).toHaveBeenCalled();
			spy.mockClear();
			expect(element.role).toBe("img");
			expect(spy).not.toHaveBeenCalled();
		});
	});

	describe("tabIndex", () => {
		it("should return null if tabindex attribute is missing", () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <any></any> `;
			const document = parser.parseHtml(markup);
			const element = document.querySelector("any")!;
			expect(element.tabIndex).toBeNull();
		});

		it("should return null if tabindex value is omitted", () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <any tabindex></any> `;
			const document = parser.parseHtml(markup);
			const element = document.querySelector("any")!;
			expect(element.tabIndex).toBeNull();
		});

		it("should return null if tabindex value is empty string", () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <any tabindex=""></any> `;
			const document = parser.parseHtml(markup);
			const element = document.querySelector("any")!;
			expect(element.tabIndex).toBeNull();
		});

		it("should return null if tabindex value is invalid string", () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <any tabindex="invalid"></any> `;
			const document = parser.parseHtml(markup);
			const element = document.querySelector("any")!;
			expect(element.tabIndex).toBeNull();
		});

		it("should return 0 if tabindex is dynamic", () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <any dynamic-tabindex="foo"></any> `;
			const source: Source = {
				data: markup,
				filename: "inline",
				line: 1,
				column: 1,
				offset: 0,
				hooks: {
					processAttribute,
				},
			};
			const document = parser.parseHtml(source);
			const element = document.querySelector("any")!;
			expect(element.tabIndex).toBe(0);
		});

		it("should return parsed value", () => {
			expect.assertions(3);
			const markup = /* HTML */ `
				<any id="a" tabindex="-1"></any>
				<any id="b" tabindex="0"></any>
				<any id="c" tabindex="1"></any>
			`;
			const document = parser.parseHtml(markup);
			const a = document.querySelector("#a")!;
			const b = document.querySelector("#b")!;
			const c = document.querySelector("#c")!;
			expect(a.tabIndex).toBe(-1);
			expect(b.tabIndex).toBe(0);
			expect(c.tabIndex).toBe(1);
		});

		it("should cache result", () => {
			expect.assertions(4);
			const markup = /* HTML */ ` <div tabindex="0" /> `;
			const document = parser.parseHtml(markup);
			const element = document.querySelector("div")!;
			const spy = jest.spyOn(element, "getAttribute");
			expect(element.tabIndex).toBe(0);
			expect(spy).toHaveBeenCalled();
			spy.mockClear();
			expect(element.tabIndex).toBe(0);
			expect(spy).not.toHaveBeenCalled();
		});
	});

	describe("querySelector()", () => {
		it("should find element by tagname", () => {
			expect.assertions(2);
			const el = document.querySelector("ul")!;
			expect(el).toBeInstanceOf(HtmlElement);
			expect(el.tagName).toBe("ul");
		});

		it("should find element by #id", () => {
			expect.assertions(3);
			const el = document.querySelector("#parent")!;
			expect(el).toBeInstanceOf(HtmlElement);
			expect(el.tagName).toBe("div");
			expect(el.getAttributeValue("id")).toBe("parent");
		});

		it("should find element by .class", () => {
			expect.assertions(3);
			const el = document.querySelector(".foo")!;
			expect(el).toBeInstanceOf(HtmlElement);
			expect(el.tagName).toBe("li");
			expect(el.getAttributeValue("class")).toBe("foo");
		});

		it("should find element by [attr]", () => {
			expect.assertions(3);
			const el = document.querySelector("[title]")!;
			expect(el).toBeInstanceOf(HtmlElement);
			expect(el.tagName).toBe("li");
			expect(el.getAttributeValue("class")).toBe("bar baz");
		});

		it('should find element by [attr=".."]', () => {
			expect.assertions(3);
			const el = document.querySelector('[class="foo"]')!;
			expect(el).toBeInstanceOf(HtmlElement);
			expect(el.tagName).toBe("li");
			expect(el.getAttributeValue("class")).toBe("foo");
		});

		it("should find element with compound selector", () => {
			expect.assertions(3);
			const el = document.querySelector(".bar.baz#spam")!;
			expect(el).toBeInstanceOf(HtmlElement);
			expect(el.tagName).toBe("li");
			expect(el.getAttributeValue("class")).toBe("bar baz");
		});

		it("should find element with descendant combinator", () => {
			expect.assertions(3);
			const el = document.querySelector("ul .bar")!;
			expect(el).toBeInstanceOf(HtmlElement);
			expect(el.tagName).toBe("li");
			expect(el.getAttributeValue("class")).toBe("bar baz");
		});

		it("should find element with child combinator", () => {
			expect.assertions(3);
			const el = document.querySelector("div > .bar")!;
			expect(el).toBeInstanceOf(HtmlElement);
			expect(el.tagName).toBe("p");
			expect(el.getAttributeValue("class")).toBe("bar");
		});

		it("should find element with multiple child combinators", () => {
			expect.assertions(3);
			const el = document.querySelector("#parent > ul > li")!;
			expect(el).toBeInstanceOf(HtmlElement);
			expect(el.tagName).toBe("li");
			expect(el.getAttributeValue("class")).toBe("foo");
		});

		it("should find element with adjacent sibling combinator", () => {
			expect.assertions(3);
			const el = document.querySelector("li + li")!;
			expect(el).toBeInstanceOf(HtmlElement);
			expect(el.tagName).toBe("li");
			expect(el.getAttributeValue("class")).toBe("bar baz");
		});

		it("should find element with general sibling combinator", () => {
			expect.assertions(3);
			const el = document.querySelector("ul ~ .baz")!;
			expect(el).toBeInstanceOf(HtmlElement);
			expect(el.tagName).toBe("span");
			expect(el.getAttributeValue("class")).toBe("baz");
		});

		it("should find element with :scope", async () => {
			expect.assertions(1);
			const markup = `
				<h1 id="first"></h1>
				<section>
					<div><h1 id="second"></h1></div>
					<h1 id="third"></h1>
					<div><h1 id="forth"></h1></div>
				</section>
				<h1 id="fifth"></h1>`;
			const resolvedConfig = await Config.empty().resolve();
			const parser = new Parser(resolvedConfig);
			const document = parser.parseHtml(markup);
			const section = document.querySelector("section")!;
			const el = section.querySelectorAll(":scope > h1");
			expect(el.map((it) => it.id)).toEqual(["third"]);
		});

		it("should handle escaped comma", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <div id="foo,bar"></div> `;
			const resolvedConfig = await Config.empty().resolve();
			const parser = new Parser(resolvedConfig);
			const document = parser.parseHtml(markup);
			const el = document.querySelector("#foo\\,bar");
			expect(el?.tagName).toBe("div");
			expect(el?.id).toBe("foo,bar");
		});

		it("should return null if nothing matches", () => {
			expect.assertions(1);
			const el = document.querySelector("foobar");
			expect(el).toBeNull();
		});

		it("should return null if selector is empty", () => {
			expect.assertions(1);
			const el = document.querySelector("");
			expect(el).toBeNull();
		});
	});

	describe("querySelectorAll()", () => {
		it("should find multiple elements", () => {
			expect.assertions(5);
			const el = document.querySelectorAll(".bar");
			expect(el).toHaveLength(2);
			expect(el[0]).toBeInstanceOf(HtmlElement);
			expect(el[1]).toBeInstanceOf(HtmlElement);
			expect(el[0].tagName).toBe("li");
			expect(el[1].tagName).toBe("p");
		});

		it("should handle multiple selectors", () => {
			expect.assertions(4);
			const el = document.querySelectorAll(".bar, li");
			el.sort(
				(a: HtmlElement, b: HtmlElement) => a.unique - b.unique,
			); /* selector may give results in any order */
			expect(el).toHaveLength(3);
			expect(el[0].tagName).toBe("li");
			expect(el[1].tagName).toBe("li");
			expect(el[2].tagName).toBe("p");
		});

		it("should handle escaped comma", async () => {
			expect.assertions(3);
			const markup = /* HTML */ ` <div id="foo,bar"></div> `;
			const resolvedConfig = await Config.empty().resolve();
			const parser = new Parser(resolvedConfig);
			const document = parser.parseHtml(markup);
			const el = document.querySelectorAll("#foo\\,bar");
			expect(el).toHaveLength(1);
			expect(el[0].tagName).toBe("div");
			expect(el[0].id).toBe("foo,bar");
		});

		it("should return [] when nothing matches", () => {
			expect.assertions(1);
			const el = document.querySelectorAll("missing");
			expect(el).toEqual([]);
		});

		it("should return [] if selector is empty", () => {
			expect.assertions(1);
			const el = document.querySelectorAll("");
			expect(el).toEqual([]);
		});
	});

	describe("someChildren()", () => {
		it("should return true if any child node evaluates to true", () => {
			expect.assertions(1);
			const root = HtmlElement.createElement("root", location);
			/* eslint-disable-next-line @typescript-eslint/no-unused-vars -- for consistency */
			const a = HtmlElement.createElement("a", location, { parent: root });
			const b = HtmlElement.createElement("b", location, { parent: root });
			const c = HtmlElement.createElement("c", location, { parent: b });
			const result = root.someChildren((node: HtmlElement) => node.tagName === c.tagName);
			expect(result).toBeTruthy();
		});

		it("should return false if no child node evaluates to true", () => {
			expect.assertions(1);
			const root = HtmlElement.createElement("root", location);
			/* eslint-disable @typescript-eslint/no-unused-vars -- for consistency */
			const a = HtmlElement.createElement("a", location, { parent: root });
			const b = HtmlElement.createElement("b", location, { parent: root });
			const c = HtmlElement.createElement("c", location, { parent: b });
			/* eslint-enable @typescript-eslint/no-unused-vars */
			const result = root.someChildren(() => false);
			expect(result).toBeFalsy();
		});

		it("should short-circuit when first node evalutes to true", () => {
			expect.assertions(1);
			const root = HtmlElement.createElement("root", location);
			const a = HtmlElement.createElement("a", location, { parent: root });
			const b = HtmlElement.createElement("b", location, { parent: root });
			/* eslint-disable-next-line @typescript-eslint/no-unused-vars -- for consistency */
			const c = HtmlElement.createElement("c", location, { parent: b });
			const order: string[] = [];
			root.someChildren((node: HtmlElement) => {
				order.push(node.tagName);
				return node.tagName === a.tagName;
			});
			expect(order).toEqual([a.tagName]);
		});
	});

	describe("everyChildren()", () => {
		it("should return true if all nodes evaluates to true", () => {
			expect.assertions(1);
			const root = HtmlElement.createElement("root", location);
			/* eslint-disable @typescript-eslint/no-unused-vars -- for consistency */
			const a = HtmlElement.createElement("a", location, { parent: root });
			const b = HtmlElement.createElement("b", location, { parent: root });
			const c = HtmlElement.createElement("c", location, { parent: b });
			/* eslint-enable @typescript-eslint/no-unused-vars */
			const result = root.everyChildren(() => true);
			expect(result).toBeTruthy();
		});

		it("should return false if any nodes evaluates to false", () => {
			expect.assertions(1);
			const root = HtmlElement.createElement("root", location);
			/* eslint-disable @typescript-eslint/no-unused-vars -- for consistency */
			const a = HtmlElement.createElement("a", location, { parent: root });
			const b = HtmlElement.createElement("b", location, { parent: root });
			const c = HtmlElement.createElement("c", location, { parent: b });
			/* eslint-enable @typescript-eslint/no-unused-vars */
			const result = root.everyChildren((node: HtmlElement) => node.tagName !== b.tagName);
			expect(result).toBeFalsy();
		});
	});

	describe("find()", () => {
		it("should visit all nodes until callback evaluates to true", () => {
			expect.assertions(1);
			const root = HtmlElement.createElement("root", location);
			/* eslint-disable @typescript-eslint/no-unused-vars -- for consistency */
			const a = HtmlElement.createElement("a", location, { parent: root });
			const b = HtmlElement.createElement("b", location, { parent: root });
			const c = HtmlElement.createElement("c", location, { parent: b });
			/* eslint-enable @typescript-eslint/no-unused-vars */
			const result = root.find((node: HtmlElement) => node.tagName === b.tagName);
			expect(result?.tagName).toBe(b.tagName);
		});
	});

	it("should not throw error if tagName is undefined", () => {
		expect.assertions(1);
		// @ts-expect-error not allowed by typing but runtime checks for this condition
		expect(() => HtmlElement.createElement(undefined, location)).not.toThrow();
	});

	it("should throw error if tagName is empty string", () => {
		expect.assertions(1);
		expect(() => HtmlElement.createElement("", location)).toThrow(
			`The tag name provided ("") is not a valid name`,
		);
	});

	it("should throw error if tagName is asterisk", () => {
		expect.assertions(1);
		expect(() => HtmlElement.createElement("*", location)).toThrow(
			`The tag name provided ("*") is not a valid name`,
		);
	});
});

function mockEntry(stub: Partial<MetaData> = {}): MetaData {
	return {
		metadata: false,
		flow: false,
		foreign: false,
		sectioning: false,
		heading: false,
		phrasing: false,
		embedded: false,
		interactive: false,
		deprecated: false,
		void: false,
		transparent: false,
		scriptSupporting: false,
		form: false,
		...stub,
	};
}
