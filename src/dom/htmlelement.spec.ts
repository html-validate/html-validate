import { Config } from "../config";
import { Location, Source } from "../context";
import { Token, TokenType } from "../lexer";
import { MetaData, MetaElement, MetaTable } from "../meta";
import { Parser } from "../parser";
import { processAttribute } from "../transform/mocks/attribute";
import { DynamicValue } from "./dynamic-value";
import { Attribute, DOMTree, HtmlElement, NodeClosed, NodeType } from ".";

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
	let root: DOMTree;
	const location = createLocation({ column: 1, size: 4 });

	beforeEach(() => {
		const markup = `<div id="parent">
			<ul>
				<li class="foo" dynamic-class="expr">foo</li>
				<li class="bar baz" id="spam" title="ham">bar</li>
			</ul>
			<p class="bar">spam</p>
			<span class="baz">flux</span>
		</div>`;
		const parser = new Parser(Config.empty());
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
		root = parser.parseHtml(source);
	});

	describe("fromTokens()", () => {
		function createTokens(
			tagName: string,
			open: boolean = true,
			selfClose: boolean = false
		): [Token, Token] {
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
			const [startToken, endToken] = createTokens("foo"); // <foo>
			const node = HtmlElement.fromTokens(startToken, endToken, null, null);
			expect(node.nodeName).toEqual("foo");
			expect(node.tagName).toEqual("foo");
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
			const [startToken, endToken] = createTokens(""); // <foo>
			expect(() => {
				HtmlElement.fromTokens(startToken, endToken, null, null);
			}).toThrow("tagName cannot be empty");
		});

		it("should set parent for opening tag", () => {
			const [startToken1, endToken1] = createTokens("foo", true); //  <foo>
			const [startToken2, endToken2] = createTokens("foo", false); // </foo>
			const parent = new HtmlElement("parent");
			const open = HtmlElement.fromTokens(startToken1, endToken1, parent, null);
			const close = HtmlElement.fromTokens(
				startToken2,
				endToken2,
				parent,
				null
			);
			expect(open.parent).toBeDefined();
			expect(close.parent).toBeUndefined();
		});

		it("should set metadata", () => {
			const [startToken, endToken] = createTokens("foo"); // <foo>
			const foo: MetaData = mockEntry();
			const table = new MetaTable();
			table.loadFromObject({ foo });
			const node = HtmlElement.fromTokens(startToken, endToken, null, table);
			expect(node.meta).toEqual(expect.objectContaining(foo));
		});

		it("should set closed for omitted end tag", () => {
			const [startToken, endToken] = createTokens("foo"); // <foo>
			const foo: MetaData = mockEntry({ void: true });
			const table = new MetaTable();
			table.loadFromObject({ foo });
			const node = HtmlElement.fromTokens(startToken, endToken, null, table);
			expect(node.closed).toEqual(NodeClosed.VoidOmitted);
		});

		it("should set closed for self-closed end tag", () => {
			const [startToken, endToken] = createTokens("foo", true, true); // <foo/>
			const node = HtmlElement.fromTokens(startToken, endToken, null, null);
			expect(node.closed).toEqual(NodeClosed.VoidSelfClosed);
		});
	});

	describe("annotatedName", () => {
		it("should use annotation if set", () => {
			expect.assertions(1);
			const node = new HtmlElement("my-element");
			node.setAnnotation("my annotation");
			expect(node.annotatedName).toEqual("my annotation");
		});

		it("should default to <tagName>", () => {
			expect.assertions(1);
			const node = new HtmlElement("my-element");
			expect(node.annotatedName).toEqual("<my-element>");
		});
	});

	it("rootNode()", () => {
		const node = HtmlElement.rootNode(location);
		expect(node.isRootElement()).toBeTruthy();
		expect(node.nodeType).toEqual(NodeType.DOCUMENT_NODE);
		expect(node.nodeName).toEqual("#document");
		expect(node.tagName).toBeUndefined();
	});

	it("id property should return element id", () => {
		const el = new HtmlElement("foo");
		el.setAttribute("id", "bar", location, null);
		expect(el.id).toEqual("bar");
	});

	it("id property should return null if no id attribute exists", () => {
		const el = new HtmlElement("foo");
		expect(el.id).toBeNull();
	});

	it("previousSibling should return node before this node", () => {
		const root = new HtmlElement("root");
		const a = new HtmlElement("a", root);
		const b = new HtmlElement("b", root);
		const c = new HtmlElement("c", root);
		expect(c.previousSibling).toEqual(b);
		expect(b.previousSibling).toEqual(a);
		expect(a.previousSibling).toBeNull();
	});

	it("nextSibling should return node after this node", () => {
		const root = new HtmlElement("root");
		const a = new HtmlElement("a", root);
		const b = new HtmlElement("b", root);
		const c = new HtmlElement("c", root);
		expect(a.nextSibling).toEqual(b);
		expect(b.nextSibling).toEqual(c);
		expect(c.nextSibling).toBeNull();
	});

	describe("attributes getter", () => {
		it("should return list of all attributes", () => {
			const node = new HtmlElement("foo");
			node.setAttribute("foo", "a", location, location);
			node.setAttribute("bar", "b", location, location);
			expect(node.attributes).toEqual([
				expect.any(Attribute),
				expect.any(Attribute),
			]);
			expect(node.attributes).toEqual([
				expect.objectContaining({ key: "foo", value: "a" }),
				expect.objectContaining({ key: "bar", value: "b" }),
			]);
		});

		it("should handle duplicated or aliased attributes", () => {
			const node = new HtmlElement("foo");
			node.setAttribute("foo", "a", location, location);
			node.setAttribute("foo", "b", location, location);
			expect(node.attributes).toEqual([
				expect.any(Attribute),
				expect.any(Attribute),
			]);
			expect(node.attributes).toEqual([
				expect.objectContaining({ key: "foo", value: "a" }),
				expect.objectContaining({ key: "foo", value: "b" }),
			]);
		});
	});

	it("hasAttribute()", () => {
		const node = new HtmlElement("foo");
		node.setAttribute("foo", "", location, null);
		expect(node.hasAttribute("foo")).toBeTruthy();
		expect(node.hasAttribute("bar")).toBeFalsy();
	});

	describe("getAttribute()", () => {
		it("should get attribute", () => {
			const node = new HtmlElement("foo");
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
			const node = new HtmlElement("foo");
			const keyLocation = createLocation({ column: 1, size: 3 });
			const valueLocation = createLocation({ column: 5, size: 5 });
			node.setAttribute("foo", "a", keyLocation, valueLocation);
			node.setAttribute("foo", "b", keyLocation, valueLocation);
			expect(node.getAttribute("foo")).toEqual(
				expect.objectContaining({
					key: "foo",
					value: "a",
				})
			);
		});

		it("should get duplicated attributes if requested", () => {
			const node = new HtmlElement("foo");
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
			const node = new HtmlElement("foo");
			const keyLocation = createLocation({ column: 1, size: 3 });
			const valueLocation = createLocation({ column: 5, size: 5 });
			node.setAttribute("foo", "bar", keyLocation, valueLocation);
			expect(node.getAttribute("FOO")).toEqual(
				expect.objectContaining({
					key: "foo",
					value: "bar",
				})
			);
		});
	});

	describe("getAttributeValue", () => {
		it("should get attribute value", () => {
			const node = new HtmlElement("foo");
			node.setAttribute("bar", "value", location, null);
			expect(node.getAttributeValue("bar")).toEqual("value");
		});

		it("should get attribute expression for dynamic values", () => {
			const node = new HtmlElement("foo");
			const dynamic = new DynamicValue("{{ interpolated }}");
			node.setAttribute("bar", dynamic, location, null);
			expect(node.getAttributeValue("bar")).toEqual("{{ interpolated }}");
		});

		it("should return null for missing attributes", () => {
			const node = new HtmlElement("foo");
			expect(node.getAttributeValue("bar")).toBeNull();
		});

		it("should return null for boolean attributes", () => {
			const node = new HtmlElement("foo");
			node.setAttribute("bar", undefined, location, null);
			expect(node.getAttributeValue("bar")).toBeNull();
		});
	});

	describe("classList", () => {
		it("should return list of classes", () => {
			const node = new HtmlElement("foo");
			node.setAttribute("class", "foo bar baz", location, null);
			expect(Array.from(node.classList)).toEqual(["foo", "bar", "baz"]);
		});

		it("should return empty list when class is missing", () => {
			const node = new HtmlElement("foo");
			expect(Array.from(node.classList)).toEqual([]);
		});

		it("should handle duplicate (or aliased) class attribute", () => {
			const node = new HtmlElement("foo");
			node.setAttribute("class", "foo", location, null);
			node.setAttribute("class", "bar", location, null);
			expect(Array.from(node.classList)).toEqual(["foo", "bar"]);
		});

		it("should ignore dynamic values", () => {
			const node = new HtmlElement("foo");
			node.setAttribute("class", new DynamicValue("dynamic"), location, null);
			expect(Array.from(node.classList)).toEqual([]);
		});
	});

	describe("appendText()", () => {
		it("should add text to element", () => {
			const node = new HtmlElement("foo");
			node.appendText("foo");
			node.appendText("bar");
			expect(node.childNodes).toHaveLength(2);
			expect(node.textContent).toEqual("foobar");
		});
	});

	describe("should calculate depth", () => {
		it("for nodes without parent", () => {
			const node = new HtmlElement("foo");
			expect(node.depth).toEqual(0);
		});

		it("for nodes in a tree", () => {
			expect(root.querySelector("#parent").depth).toEqual(0);
			expect(root.querySelector("ul").depth).toEqual(1);
			expect(root.querySelector("li.foo").depth).toEqual(2);
			expect(root.querySelector("li.bar").depth).toEqual(2);
		});
	});

	describe("closest()", () => {
		let node: HtmlElement;

		beforeAll(() => {
			const parser = new Parser(Config.empty());
			root = parser.parseHtml(`
				<div id="1" class="x">
					<div id="2" class="x">
						<p id="3" class="x"></p>
					</div>
				</div>`);
			node = root.querySelector("p");
		});

		it("should return first parent matching the selector", () => {
			expect(node.closest("div").id).toEqual("2");
		});

		it("should return itself if matching the selector", () => {
			expect(node.closest(".x").id).toEqual("3");
		});

		it("should return null if no element matches the selector", () => {
			expect(node.closest(".y")).toBeNull();
		});
	});

	describe("generateSelector()", () => {
		let parser: Parser;

		beforeAll(() => {
			parser = new Parser(Config.empty());
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
			const el = document.querySelector("div").childElements[3];
			expect(el.generateSelector()).toEqual("div > p:nth-child(4)");
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
			const el = document.querySelector("p");
			expect(el.generateSelector()).toEqual("#foo > p");
		});

		it("should normalize tagnames", () => {
			expect.assertions(1);
			const document = parser.parseHtml(`<dIV></DIv>`);
			const el = document.querySelector("div");
			expect(el.generateSelector()).toEqual("div");
		});

		it("root element should not receive selector", () => {
			expect.assertions(1);
			const el = HtmlElement.rootNode(null);
			expect(el.generateSelector()).toBeNull();
		});
	});

	describe("is()", () => {
		it("should match tagname", () => {
			const el = new HtmlElement("foo");
			expect(el.is("foo")).toBeTruthy();
			expect(el.is("bar")).toBeFalsy();
		});

		it("should match case-insensitive", () => {
			expect.assertions(4);
			const a = new HtmlElement("foo");
			const b = new HtmlElement("BAR");
			expect(a.is("foo")).toBeTruthy();
			expect(a.is("FOO")).toBeTruthy();
			expect(b.is("bar")).toBeTruthy();
			expect(b.is("BAR")).toBeTruthy();
		});

		it("should match any tag when using asterisk", () => {
			const el = new HtmlElement("foo");
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
			node = new HtmlElement("my-element", null, null, original);
		});

		it("should overwrite copyable properties", () => {
			expect.assertions(1);
			node.loadMeta({ flow: false } as MetaElement);
			expect(node.meta.flow).toEqual(false);
		});

		it("should not overwrite non-copyable properties", () => {
			expect.assertions(1);
			node.loadMeta({ inherit: "bar" } as MetaElement);
			expect(node.meta.inherit).toEqual("foo");
		});

		it("should remove missing properties", () => {
			expect.assertions(1);
			node.loadMeta({} as MetaElement);
			expect(node.meta.flow).toBeUndefined();
		});

		it("should handle when original meta is null", () => {
			expect.assertions(1);
			const node = new HtmlElement("my-element");
			node.loadMeta({ flow: false } as MetaElement);
			expect(node.meta.flow).toEqual(false);
		});
	});

	describe("getElementsByTagName()", () => {
		it("should find elements", () => {
			const nodes = root.getElementsByTagName("li");
			expect(nodes).toHaveLength(2);
			expect(nodes[0].getAttributeValue("class")).toEqual("foo");
			expect(nodes[1].getAttributeValue("class")).toEqual("bar baz");
		});

		it("should support universal selector", () => {
			const tagNames = root
				.getElementsByTagName("*")
				.map((cur: HtmlElement) => cur.tagName);
			expect(tagNames).toHaveLength(6);
			expect(tagNames).toEqual(["div", "ul", "li", "li", "p", "span"]);
		});
	});

	describe("matches()", () => {
		it("should return true if element matches given selector", () => {
			const node = root.querySelector("#spam");
			expect(node.matches("ul > li")).toBeTruthy();
			expect(node.matches("li.baz")).toBeTruthy();
			expect(node.matches("#parent li")).toBeTruthy();
		});

		it("should return false if element does not match given selector", () => {
			const node = root.querySelector("#spam");
			expect(node.matches("div > li")).toBeFalsy();
			expect(node.matches("li.foo")).toBeFalsy();
			expect(node.matches("#ham li")).toBeFalsy();
		});
	});

	describe("querySelector()", () => {
		it("should find element by tagname", () => {
			const el = root.querySelector("ul");
			expect(el).toBeInstanceOf(HtmlElement);
			expect(el.tagName).toEqual("ul");
		});

		it("should find element by #id", () => {
			const el = root.querySelector("#parent");
			expect(el).toBeInstanceOf(HtmlElement);
			expect(el.tagName).toEqual("div");
			expect(el.getAttributeValue("id")).toEqual("parent");
		});

		it("should find element by .class", () => {
			const el = root.querySelector(".foo");
			expect(el).toBeInstanceOf(HtmlElement);
			expect(el.tagName).toEqual("li");
			expect(el.getAttributeValue("class")).toEqual("foo");
		});

		it("should find element by [attr]", () => {
			const el = root.querySelector("[title]");
			expect(el).toBeInstanceOf(HtmlElement);
			expect(el.tagName).toEqual("li");
			expect(el.getAttributeValue("class")).toEqual("bar baz");
		});

		it('should find element by [attr=".."]', () => {
			const el = root.querySelector('[class="foo"]');
			expect(el).toBeInstanceOf(HtmlElement);
			expect(el.tagName).toEqual("li");
			expect(el.getAttributeValue("class")).toEqual("foo");
		});

		it("should find element with compound selector", () => {
			const el = root.querySelector(".bar.baz#spam");
			expect(el).toBeInstanceOf(HtmlElement);
			expect(el.tagName).toEqual("li");
			expect(el.getAttributeValue("class")).toEqual("bar baz");
		});

		it("should find element with descendant combinator", () => {
			const el = root.querySelector("ul .bar");
			expect(el).toBeInstanceOf(HtmlElement);
			expect(el.tagName).toEqual("li");
			expect(el.getAttributeValue("class")).toEqual("bar baz");
		});

		it("should find element with child combinator", () => {
			const el = root.querySelector("div > .bar");
			expect(el).toBeInstanceOf(HtmlElement);
			expect(el.tagName).toEqual("p");
			expect(el.getAttributeValue("class")).toEqual("bar");
		});

		it("should find element with multiple child combinators", () => {
			const el = root.querySelector("#parent > ul > li");
			expect(el).toBeInstanceOf(HtmlElement);
			expect(el.tagName).toEqual("li");
			expect(el.getAttributeValue("class")).toEqual("foo");
		});

		it("should find element with adjacent sibling combinator", () => {
			const el = root.querySelector("li + li");
			expect(el).toBeInstanceOf(HtmlElement);
			expect(el.tagName).toEqual("li");
			expect(el.getAttributeValue("class")).toEqual("bar baz");
		});

		it("should find element with general sibling combinator", () => {
			const el = root.querySelector("ul ~ .baz");
			expect(el).toBeInstanceOf(HtmlElement);
			expect(el.tagName).toEqual("span");
			expect(el.getAttributeValue("class")).toEqual("baz");
		});

		it("should return null if nothing matches", () => {
			const el = root.querySelector("foobar");
			expect(el).toBeNull();
		});

		it("should return null if selector is empty", () => {
			const el = root.querySelector("");
			expect(el).toBeNull();
		});
	});

	describe("querySelectorAll()", () => {
		it("should find multiple elements", () => {
			const el = root.querySelectorAll(".bar");
			expect(el).toHaveLength(2);
			expect(el[0]).toBeInstanceOf(HtmlElement);
			expect(el[1]).toBeInstanceOf(HtmlElement);
			expect(el[0].tagName).toEqual("li");
			expect(el[1].tagName).toEqual("p");
		});

		it("should handle multiple selectors", () => {
			const el = root.querySelectorAll(".bar, li");
			el.sort(
				(a: HtmlElement, b: HtmlElement) => a.unique - b.unique
			); /* selector may give results in any order */
			expect(el).toHaveLength(3);
			expect(el[0].tagName).toEqual("li");
			expect(el[1].tagName).toEqual("li");
			expect(el[2].tagName).toEqual("p");
		});

		it("should return [] when nothing matches", () => {
			const el = root.querySelectorAll("missing");
			expect(el).toEqual([]);
		});

		it("should return [] if selector is empty", () => {
			const el = root.querySelectorAll("");
			expect(el).toEqual([]);
		});
	});

	describe("visitDepthFirst()", () => {
		it("should visit all nodes in correct order", () => {
			const root = HtmlElement.rootNode({
				filename: "inline",
				offset: 0,
				line: 1,
				column: 1,
				size: 1,
			});
			/* eslint-disable @typescript-eslint/no-unused-vars */
			const a = new HtmlElement("a", root);
			const b = new HtmlElement("b", root);
			const c = new HtmlElement("c", b);
			/* eslint-enable @typescript-eslint/no-unused-vars */
			const order: string[] = [];
			root.visitDepthFirst((node: HtmlElement) => order.push(node.tagName));
			expect(order).toEqual(["a", "c", "b"]);
		});
	});

	describe("someChildren()", () => {
		it("should return true if any child node evaluates to true", () => {
			const root = new HtmlElement("root");
			/* eslint-disable @typescript-eslint/no-unused-vars */
			const a = new HtmlElement("a", root);
			const b = new HtmlElement("b", root);
			const c = new HtmlElement("c", b);
			/* eslint-enable @typescript-eslint/no-unused-vars */
			const result = root.someChildren(
				(node: HtmlElement) => node.tagName === "c"
			);
			expect(result).toBeTruthy();
		});

		it("should return false if no child node evaluates to true", () => {
			const root = new HtmlElement("root");
			/* eslint-disable @typescript-eslint/no-unused-vars */
			const a = new HtmlElement("a", root);
			const b = new HtmlElement("b", root);
			const c = new HtmlElement("c", b);
			/* eslint-enable @typescript-eslint/no-unused-vars */
			const result = root.someChildren(() => false);
			expect(result).toBeFalsy();
		});

		it("should short-circuit when first node evalutes to true", () => {
			const root = new HtmlElement("root");
			/* eslint-disable @typescript-eslint/no-unused-vars */
			const a = new HtmlElement("a", root);
			const b = new HtmlElement("b", root);
			const c = new HtmlElement("c", b);
			/* eslint-enable @typescript-eslint/no-unused-vars */
			const order: string[] = [];
			root.someChildren((node: HtmlElement) => {
				order.push(node.tagName);
				return node.tagName === "a";
			});
			expect(order).toEqual(["a"]);
		});
	});

	describe("everyChildren()", () => {
		it("should return true if all nodes evaluates to true", () => {
			const root = new HtmlElement("root");
			/* eslint-disable @typescript-eslint/no-unused-vars */
			const a = new HtmlElement("a", root);
			const b = new HtmlElement("b", root);
			const c = new HtmlElement("c", b);
			/* eslint-enable @typescript-eslint/no-unused-vars */
			const result = root.everyChildren(() => true);
			expect(result).toBeTruthy();
		});

		it("should return false if any nodes evaluates to false", () => {
			const root = new HtmlElement("root");
			/* eslint-disable @typescript-eslint/no-unused-vars */
			const a = new HtmlElement("a", root);
			const b = new HtmlElement("b", root);
			const c = new HtmlElement("c", b);
			/* eslint-enable @typescript-eslint/no-unused-vars */
			const result = root.everyChildren(
				(node: HtmlElement) => node.tagName !== "b"
			);
			expect(result).toBeFalsy();
		});
	});

	describe("find()", () => {
		it("should visit all nodes until callback evaluates to true", () => {
			const root = new HtmlElement("root");
			/* eslint-disable @typescript-eslint/no-unused-vars */
			const a = new HtmlElement("a", root);
			const b = new HtmlElement("b", root);
			const c = new HtmlElement("c", b);
			/* eslint-enable @typescript-eslint/no-unused-vars */
			const result = root.find((node: HtmlElement) => node.tagName === "b");
			expect(result.tagName).toEqual("b");
		});
	});
});

function mockEntry(stub = {}): MetaData {
	return Object.assign(
		{
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
		},
		stub
	);
}
