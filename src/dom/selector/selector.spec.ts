import { Config } from "../../config";
import { Parser } from "../../parser";
import { reset as resetDOMCounter } from "../domnode";
import { type HtmlElement } from "../htmlelement";
import { type NodeType } from "../nodetype";
import { escapeSelectorComponent, generateIdSelector, Selector } from "./selector";

interface StrippedHtmlElement {
	id: string | null;
	class: string | null;
	nodeName: string;
	nodeType: NodeType;
	tagName: string;
	unique: number;
	testId: string | null;
}

function stripHtmlElement(node: HtmlElement): StrippedHtmlElement {
	return {
		id: node.id,
		class: node.hasAttribute("class") ? node.classList.join(" ") : null,
		nodeName: node.nodeName,
		nodeType: node.nodeType,
		tagName: node.tagName,
		unique: node.unique,
		testId: node.getAttributeValue("test-id"),
	};
}

function fetch(it: IterableIterator<HtmlElement>): StrippedHtmlElement[] {
	return Array.from(it, stripHtmlElement);
}

describe("escapeSelectorComponent", () => {
	describe("should escape character", () => {
		/* An oracle generated in Chrome 99 from the following code:
		 *
		 * ```js
		 * Array(127-32).fill().map((_, i) => {
		 *     const ch = String.fromCharCode(i + 32);
		 *     const id = `foo${ch}bar`;
		 *     return [ch, CSS.escape(id)];
		 * })
		 * ```
		 */
		const oracle = [
			["\t", "foo\\\u0039 bar"],
			["\n", "foo\\\u0061 bar"],
			["\r", "foo\\\u0064 bar"],
			[" ", "foo\\ bar"],
			["!", "foo\\!bar"],
			['"', 'foo\\"bar'],
			["#", "foo\\#bar"],
			["$", "foo\\$bar"],
			["%", "foo\\%bar"],
			["&", "foo\\&bar"],
			["'", "foo\\'bar"],
			["(", "foo\\(bar"],
			[")", "foo\\)bar"],
			["*", "foo\\*bar"],
			["+", "foo\\+bar"],
			[",", "foo\\,bar"],
			["-", "foo-bar"],
			[".", "foo\\.bar"],
			["/", "foo\\/bar"],
			["0", "foo0bar"],
			["1", "foo1bar"],
			["2", "foo2bar"],
			["3", "foo3bar"],
			["4", "foo4bar"],
			["5", "foo5bar"],
			["6", "foo6bar"],
			["7", "foo7bar"],
			["8", "foo8bar"],
			["9", "foo9bar"],
			[":", "foo\\:bar"],
			[";", "foo\\;bar"],
			["<", "foo\\<bar"],
			["=", "foo\\=bar"],
			[">", "foo\\>bar"],
			["?", "foo\\?bar"],
			["@", "foo\\@bar"],
			["A", "fooAbar"],
			["B", "fooBbar"],
			["C", "fooCbar"],
			["D", "fooDbar"],
			["E", "fooEbar"],
			["F", "fooFbar"],
			["G", "fooGbar"],
			["H", "fooHbar"],
			["I", "fooIbar"],
			["J", "fooJbar"],
			["K", "fooKbar"],
			["L", "fooLbar"],
			["M", "fooMbar"],
			["N", "fooNbar"],
			["O", "fooObar"],
			["P", "fooPbar"],
			["Q", "fooQbar"],
			["R", "fooRbar"],
			["S", "fooSbar"],
			["T", "fooTbar"],
			["U", "fooUbar"],
			["V", "fooVbar"],
			["W", "fooWbar"],
			["X", "fooXbar"],
			["Y", "fooYbar"],
			["Z", "fooZbar"],
			["[", "foo\\[bar"],
			["\\", "foo\\\\bar"],
			["]", "foo\\]bar"],
			["^", "foo\\^bar"],
			["_", "foo_bar"],
			["`", "foo\\`bar"],
			["a", "fooabar"],
			["b", "foobbar"],
			["c", "foocbar"],
			["d", "foodbar"],
			["e", "fooebar"],
			["f", "foofbar"],
			["g", "foogbar"],
			["h", "foohbar"],
			["i", "fooibar"],
			["j", "foojbar"],
			["k", "fookbar"],
			["l", "foolbar"],
			["m", "foombar"],
			["n", "foonbar"],
			["o", "fooobar"],
			["p", "foopbar"],
			["q", "fooqbar"],
			["r", "foorbar"],
			["s", "foosbar"],
			["t", "footbar"],
			["u", "fooubar"],
			["v", "foovbar"],
			["w", "foowbar"],
			["x", "fooxbar"],
			["y", "fooybar"],
			["z", "foozbar"],
			["{", "foo\\{bar"],
			["|", "foo\\|bar"],
			["}", "foo\\}bar"],
			["~", "foo\\~bar"],
		];
		it.each(oracle)('"%s"', (ch, expected) => {
			expect.assertions(1);
			const part = `foo${ch}bar`;
			expect(escapeSelectorComponent(part)).toBe(expected);
		});
	});

	it("should escape all occurrences", () => {
		expect.assertions(1);
		expect(escapeSelectorComponent("foo bar baz")).toBe("foo\\ bar\\ baz");
	});
});

describe("generateIdSelector()", () => {
	it("should escape characters", () => {
		expect.assertions(1);
		const id = "foo:bar[baz]";
		expect(generateIdSelector(id)).toBe("#foo\\:bar\\[baz\\]");
	});

	it("should handle leading digits", () => {
		expect.assertions(1);
		const id = "123foo";
		expect(generateIdSelector(id)).toBe('[id="123foo"]');
	});
});

describe("Selector", () => {
	let doc: HtmlElement;

	beforeEach(async () => {
		const resolvedConfig = await Config.empty().resolve();
		const parser = new Parser(resolvedConfig);
		doc = parser.parseHtml(`
			<foo id="barney" test-id="foo-1">first foo</foo>
			<foo CLASS="fred" test-id="foo-2">second foo</foo>
			<bar test-id="bar-1">

				<!-- not valid but verify selectors can handle it -->
				<baz class="a" class="fred" class="b" test-id="baz-1">
					<foo test-id="foo-3">third foo</foo>
				</baz>

				<foo wilma="flintstone" lorem-123-ipsum="dolor-sit-amet" test-id="foo-4">forth foo</foo>
				<spam wilma="rubble" boolean test-id="spam-1"></spam>
				<baz test-id="baz-2"></baz>
			</bar>
		`);
	});

	afterEach(() => {
		resetDOMCounter();
	});

	it("should match tagName (foo)", () => {
		expect.assertions(1);
		const selector = new Selector("foo");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-1" }),
			expect.objectContaining({ tagName: "foo", testId: "foo-2" }),
			expect.objectContaining({ tagName: "foo", testId: "foo-3" }),
			expect.objectContaining({ tagName: "foo", testId: "foo-4" }),
		]);
	});

	it("should match descendant (bar foo)", () => {
		expect.assertions(1);
		const selector = new Selector("bar foo");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-3" }),
			expect.objectContaining({ tagName: "foo", testId: "foo-4" }),
		]);
	});

	it("should match child (bar > foo)", () => {
		expect.assertions(1);
		const selector = new Selector("bar > foo");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-4" }),
		]);
	});

	it("should match adjacent sibling (baz + foo)", () => {
		expect.assertions(1);
		const selector = new Selector("baz + foo");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-4" }),
		]);
	});

	it("should match general sibling (foo ~ baz)", () => {
		expect.assertions(1);
		const selector = new Selector("foo ~ baz");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "baz", testId: "baz-2" }),
		]);
	});

	it("should match class (.fred)", () => {
		expect.assertions(1);
		const selector = new Selector(".fred");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-2" }),
			expect.objectContaining({ tagName: "baz", testId: "baz-1" }),
		]);
	});

	it("should match id (#barney)", () => {
		expect.assertions(1);
		const selector = new Selector("#barney");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-1" }),
		]);
	});

	it("should match id with escaped colon", async () => {
		expect.assertions(1);
		const resolvedConfig = await Config.empty().resolve();
		const parser = new Parser(resolvedConfig);
		const document = parser.parseHtml(`<div id="foo:"></div>`);
		const selector = new Selector("#foo\\:");
		expect(fetch(selector.match(document))).toEqual([expect.objectContaining({ tagName: "div" })]);
	});

	it("should match id with escaped space", async () => {
		expect.assertions(1);
		const resolvedConfig = await Config.empty().resolve();
		const parser = new Parser(resolvedConfig);
		const document = parser.parseHtml(`<div id="foo "></div>`);
		const selector = new Selector("#foo\\ ");
		expect(fetch(selector.match(document))).toEqual([expect.objectContaining({ tagName: "div" })]);
	});

	it("should match id with escaped tab", async () => {
		expect.assertions(1);
		const resolvedConfig = await Config.empty().resolve();
		const parser = new Parser(resolvedConfig);
		const document = parser.parseHtml(`<div id="foo\t"></div>`);
		const selector = new Selector("#foo\\9 ");
		expect(fetch(selector.match(document))).toEqual([expect.objectContaining({ tagName: "div" })]);
	});

	it("should match id with escaped newline (\\n)", async () => {
		expect.assertions(1);
		const resolvedConfig = await Config.empty().resolve();
		const parser = new Parser(resolvedConfig);
		const document = parser.parseHtml(`<div id="foo\n"></div>`);
		const selector = new Selector("#foo\\a ");
		expect(fetch(selector.match(document))).toEqual([expect.objectContaining({ tagName: "div" })]);
	});

	it("should match id with escaped newline (\\r)", async () => {
		expect.assertions(1);
		const resolvedConfig = await Config.empty().resolve();
		const parser = new Parser(resolvedConfig);
		const document = parser.parseHtml(`<div id="foo\r"></div>`);
		const selector = new Selector("#foo\\d ");
		expect(fetch(selector.match(document))).toEqual([expect.objectContaining({ tagName: "div" })]);
	});

	it("should match id with escaped bracket", async () => {
		expect.assertions(1);
		const resolvedConfig = await Config.empty().resolve();
		const parser = new Parser(resolvedConfig);
		const document = parser.parseHtml(`<div id="foo[bar]"></div>`);
		const selector = new Selector("#foo\\[bar\\]");
		expect(fetch(selector.match(document))).toEqual([expect.objectContaining({ tagName: "div" })]);
	});

	it("should match having attribute ([wilma])", () => {
		expect.assertions(1);
		const selector = new Selector("[wilma]");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-4" }),
			expect.objectContaining({ tagName: "spam", testId: "spam-1" }),
		]);
	});

	it("should match having boolean attribute ([boolean])", () => {
		expect.assertions(1);
		const selector = new Selector("[boolean]");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "spam", testId: "spam-1" }),
		]);
	});

	it("should match having attribute with dashes and numbers ([lorem-123-ipsum])", () => {
		expect.assertions(1);
		const selector = new Selector("[lorem-123-ipsum]");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-4" }),
		]);
	});

	it('should match attribute value ([wilma="flintstone"])', () => {
		expect.assertions(1);
		const selector = new Selector('[wilma="flintstone"]');
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-4" }),
		]);
	});

	it('should match nested : in string ([id=":r1:"])', async () => {
		expect.assertions(1);
		const resolvedConfig = await Config.empty().resolve();
		const parser = new Parser(resolvedConfig);
		doc = parser.parseHtml(/* HTML */ ` <label id="#r1:"> lorem ipsum </label> `);
		const element = doc.querySelector("label")!;
		const id = element.id;
		const selector = new Selector('[id="#r1:"]');
		expect(Array.from(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "label", id }),
		]);
	});

	it('should match attribute value with special characters ([lorem-123-ipsum="dolor-sit-amet"])', () => {
		expect.assertions(1);
		const selector = new Selector('[lorem-123-ipsum="dolor-sit-amet"]');
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-4" }),
		]);
	});

	it("should match attribute value on duplicated attributes", () => {
		expect.assertions(2);
		const selectorA = new Selector('[class="a"]');
		const selectorB = new Selector('[class="b"]');
		expect(fetch(selectorA.match(doc))).toEqual([
			expect.objectContaining({ tagName: "baz", testId: "baz-1" }),
		]);
		expect(fetch(selectorB.match(doc))).toEqual([
			expect.objectContaining({ tagName: "baz", testId: "baz-1" }),
		]);
	});

	it("should match multiple attributes ([wilma][lorem-123-ipsum])", () => {
		expect.assertions(1);
		const selector = new Selector("[wilma][lorem-123-ipsum]");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-4" }),
		]);
	});

	it("should match pseudo-classes", () => {
		expect.assertions(1);
		const selector = new Selector("foo:first-child");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-1" }),
			expect.objectContaining({ tagName: "foo", testId: "foo-3" }),
		]);
	});

	it("should match pseudo-classes with arguments", () => {
		expect.assertions(1);
		const selector = new Selector("foo:nth-child(1)");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-1" }),
			expect.objectContaining({ tagName: "foo", testId: "foo-3" }),
		]);
	});

	it("should match with :scope", () => {
		expect.assertions(1);
		const element = doc.querySelector("bar")!;
		const selector = new Selector(":scope > foo");
		expect(fetch(selector.match(element))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-4" }),
		]);
	});

	it("should throw error for missing pseudo-class", () => {
		expect.assertions(1);
		expect(() => new Selector("foo:")).toThrow(
			'Missing pseudo-class after colon in selector pattern "foo:"',
		);
	});

	it("should throw error for invalid pseudo-classes", () => {
		expect.assertions(1);
		const selector = new Selector("foo:missing");
		expect(() => fetch(selector.match(doc))).toThrow('Pseudo-class "missing" is not implemented');
	});
});
