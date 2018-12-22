import { Config } from "../config";
import { Parser } from "../parser";
import { Selector } from "./selector";
import { HtmlElement, reset as resetDOMCounter } from "./htmlelement";

describe("Selector", () => {

	let doc: HtmlElement;

	beforeEach(() => {
		const parser = new Parser(Config.empty());
		doc = parser.parseHtml(`
<foo id="barney">first foo</foo>
<foo CLASS="fred">second foo</foo>
<bar>
  <baz class="fred">
    <foo>third foo</foo>
  </baz>
  <foo wilma="flintstone" lorem-123-ipsum="dolor sit amet">forth foo</foo>
  <spam wilma="rubble"></spam>
  <baz></baz>
</bar>
`).root;
	});

	afterEach(() => {
		resetDOMCounter();
	});

	it("should match tagName (foo)", () => {
		const selector = new Selector("foo");
		expect(Array.from(selector.match(doc))).toEqual([
			expect.objectContaining({tagName: "foo", unique: 1}),
			expect.objectContaining({tagName: "foo", unique: 3}),
			expect.objectContaining({tagName: "foo", unique: 7}),
			expect.objectContaining({tagName: "foo", unique: 10}),
		]);
	});

	it("should match descendant (bar foo)", () => {
		const selector = new Selector("bar foo");
		expect(Array.from(selector.match(doc))).toEqual([
			expect.objectContaining({tagName: "foo", unique: 7}),
			expect.objectContaining({tagName: "foo", unique: 10}),
		]);
	});

	it("should match child (bar > foo)", () => {
		const selector = new Selector("bar > foo");
		expect(Array.from(selector.match(doc))).toEqual([
			expect.objectContaining({tagName: "foo", unique: 10}),
		]);
	});

	it("should match adjacent sibling (baz + foo)", () => {
		const selector = new Selector("baz + foo");
		expect(Array.from(selector.match(doc))).toEqual([
			expect.objectContaining({tagName: "foo", unique: 10}),
		]);
	});

	it("should match general sibling (foo ~ baz)", () => {
		const selector = new Selector("foo ~ baz");
		expect(Array.from(selector.match(doc))).toEqual([
			expect.objectContaining({tagName: "baz", unique: 14}),
		]);
	});

	it("should match class (.fred)", () => {
		const selector = new Selector(".fred");
		expect(Array.from(selector.match(doc))).toEqual([
			expect.objectContaining({tagName: "foo", unique: 3}),
			expect.objectContaining({tagName: "baz", unique: 6}),
		]);
	});

	it("should match id (#barney)", () => {
		const selector = new Selector("#barney");
		expect(Array.from(selector.match(doc))).toEqual([
			expect.objectContaining({tagName: "foo", unique: 1}),
		]);
	});

	it("should match having attribute ([wilma])", () => {
		const selector = new Selector("[wilma]");
		expect(Array.from(selector.match(doc))).toEqual([
			expect.objectContaining({tagName: "foo", unique: 10}),
			expect.objectContaining({tagName: "spam", unique: 12}),
		]);
	});

	it("should match having attribute with dashes and numbers ([lorem-123-ipsum])", () => {
		const selector = new Selector("[lorem-123-ipsum]");
		expect(Array.from(selector.match(doc))).toEqual([
			expect.objectContaining({tagName: "foo", unique: 10}),
		]);
	});

	it('should match attribute value ([wilma="flintstone"])', () => {
		const selector = new Selector('[wilma="flintstone"]');
		expect(Array.from(selector.match(doc))).toEqual([
			expect.objectContaining({tagName: "foo", unique: 10}),
		]);
	});

	it("should match multiple attributes ([wilma][lorem-123-ipsum])", () => {
		const selector = new Selector("[wilma][lorem-123-ipsum]");
		expect(Array.from(selector.match(doc))).toEqual([
			expect.objectContaining({tagName: "foo", unique: 10}),
		]);
	});

});
