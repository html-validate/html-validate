import { Config } from "../../config";
import { HtmlElement, NodeClosed } from "../../dom";
import { Parser } from "../../parser";
import { processAttribute } from "../../transform/mocks/attribute";
import { inAccessibilityTree, isAriaHidden, isHTMLHidden, isPresentation } from "./a11y";

describe("a11y helpers", () => {
	let parser: Parser;

	beforeEach(() => {
		parser = new Parser(Config.defaultConfig().resolve());
	});

	function parse(data: string): HtmlElement {
		return parser.parseHtml({
			data,
			filename: "inline",
			line: 1,
			column: 1,
			offset: 0,
			hooks: {
				processAttribute,
			},
		});
	}

	describe("inAccessibilityTree()", () => {
		it('should return false if element has aria-hidden="true"', () => {
			expect.assertions(1);
			const root = parse('<p aria-hidden="true">Lorem ipsum</p>');
			const p = root.querySelector("p")!;
			expect(inAccessibilityTree(p)).toBeFalsy();
		});

		it('should return false if element has role="presentation"', () => {
			expect.assertions(1);
			const root = parse('<p role="presentation">Lorem ipsum</p>');
			const p = root.querySelector("p")!;
			expect(inAccessibilityTree(p)).toBeFalsy();
		});

		it("should return false if element has hidden attribute", () => {
			expect.assertions(1);
			const root = parse("<p hidden>Lorem ipsum</p>");
			const p = root.querySelector("p")!;
			expect(inAccessibilityTree(p)).toBeFalsy();
		});

		it('should return false if ancestor has aria-hidden="true"', () => {
			expect.assertions(1);
			const root = parse('<div aria-hidden="true"><p>Lorem ipsum</p></div>');
			const p = root.querySelector("p")!;
			expect(inAccessibilityTree(p)).toBeFalsy();
		});

		it('should return true even if ancestor has role="presentation"', () => {
			expect.assertions(1);
			const root = parse('<div role="presentation"><p>Lorem ipsum</p></div>');
			const p = root.querySelector("p")!;
			expect(inAccessibilityTree(p)).toBeTruthy();
		});

		it("should return false if ancestor has hidden attribute", () => {
			expect.assertions(1);
			const root = parse("<div hidden><p>Lorem ipsum</p></div>");
			const p = root.querySelector("p")!;
			expect(inAccessibilityTree(p)).toBeFalsy();
		});

		it("should return true if element and ancestors are present in accessibility tree", () => {
			expect.assertions(1);
			const root = parse("<div><p>Lorem ipsum</p></div>");
			const p = root.querySelector("p")!;
			expect(inAccessibilityTree(p)).toBeTruthy();
		});

		it("should handle missing parent", () => {
			expect.assertions(1);
			const node = new HtmlElement("foo", null, NodeClosed.EndTag, null, {
				filename: "inline",
				line: 1,
				column: 1,
				offset: 0,
				size: 1,
			});
			expect(inAccessibilityTree(node)).toBeTruthy();
		});
	});

	describe("isAriaHidden()", () => {
		it("should return false if node is missing aria-hidden", () => {
			expect.assertions(1);
			const root = parse("<p>Lorem ipsum</p>");
			const p = root.querySelector("p")!;
			expect(isAriaHidden(p)).toBeFalsy();
		});

		it("should return false if ancestors are missing aria-hidden", () => {
			expect.assertions(1);
			const root = parse("<div><p>Lorem ipsum</p></div>");
			const p = root.querySelector("p")!;
			expect(isAriaHidden(p)).toBeFalsy();
		});

		it("should return false if node has interpolated aria-hidden", () => {
			expect.assertions(1);
			const root = parse('<p aria-hidden="{{ interpolated }}">Lorem ipsum</p>');
			const p = root.querySelector("p")!;
			expect(isAriaHidden(p)).toBeFalsy();
		});

		it("should return false if node has dynamic aria-hidden", () => {
			expect.assertions(1);
			const root = parse('<p dynamic-aria-hidden="variable">Lorem ipsum</p>');
			const p = root.querySelector("p")!;
			expect(isAriaHidden(p)).toBeFalsy();
		});

		it('should return true if node has aria-hidden="true"', () => {
			expect.assertions(1);
			const root = parse('<p aria-hidden="true">Lorem ipsum</p>');
			const p = root.querySelector("p")!;
			expect(isAriaHidden(p)).toBeTruthy();
		});

		it('should return true if ancestor has aria-hidden="true"', () => {
			expect.assertions(1);
			const root = parse('<div aria-hidden="true"><p>Lorem ipsum</p></div>');
			const p = root.querySelector("p")!;
			expect(isAriaHidden(p)).toBeTruthy();
		});

		it("should cache result", () => {
			expect.assertions(4);
			const root = parse('<p aria-hidden="true"></p>');
			const p = root.querySelector("p")!;
			const spy = jest.spyOn(p, "getAttribute");
			expect(isAriaHidden(p)).toBeTruthy();
			expect(spy).toHaveBeenCalledTimes(1);
			spy.mockClear();
			expect(isAriaHidden(p)).toBeTruthy();
			expect(spy).toHaveBeenCalledTimes(0);
		});

		it("should handle missing parent", () => {
			expect.assertions(1);
			const node = new HtmlElement("foo", null, NodeClosed.EndTag, null, {
				filename: "inline",
				line: 1,
				column: 1,
				offset: 0,
				size: 1,
			});
			expect(isAriaHidden(node)).toBeFalsy();
		});

		describe("details", () => {
			it("should return detailed results", () => {
				expect.assertions(4);
				const markup = /* HTML */ `
					<div id="by-self" aria-hidden="true">
						<p id="by-parent"></p>
						<p id="by-both" aria-hidden="true"></p>
					</div>
					<p id="by-none"></p>
				`;
				const root = parse(markup);
				const a = root.querySelector("#by-parent")!;
				const b = root.querySelector("#by-self")!;
				const c = root.querySelector("#by-both")!;
				const d = root.querySelector("#by-none")!;
				expect(isAriaHidden(a, true)).toEqual({ byParent: true, bySelf: false });
				expect(isAriaHidden(b, true)).toEqual({ byParent: false, bySelf: true });
				expect(isAriaHidden(c, true)).toEqual({ byParent: true, bySelf: true });
				expect(isAriaHidden(d, true)).toEqual({ byParent: false, bySelf: false });
			});
		});
	});

	describe("isHTMLHidden()", () => {
		it("should return false if node is missing hidden", () => {
			expect.assertions(1);
			const root = parse("<p>Lorem ipsum</p>");
			const p = root.querySelector("p")!;
			expect(isHTMLHidden(p)).toBeFalsy();
		});

		it("should return false if ancestors are missing hidden", () => {
			expect.assertions(1);
			const root = parse("<div><p>Lorem ipsum</p></div>");
			const p = root.querySelector("p")!;
			expect(isHTMLHidden(p)).toBeFalsy();
		});

		it("should return false if node has dynamic hidden", () => {
			expect.assertions(1);
			const root = parse('<p dynamic-hidden="variable">Lorem ipsum</p>');
			const p = root.querySelector("p")!;
			expect(isHTMLHidden(p)).toBeFalsy();
		});

		it("should return true if node has hidden", () => {
			expect.assertions(1);
			const root = parse("<p hidden>Lorem ipsum</p>");
			const p = root.querySelector("p")!;
			expect(isHTMLHidden(p)).toBeTruthy();
		});

		it("should return true if ancestor has hidden", () => {
			expect.assertions(1);
			const root = parse("<div hidden><p>Lorem ipsum</p></div>");
			const p = root.querySelector("p")!;
			expect(isHTMLHidden(p)).toBeTruthy();
		});

		it("should cache result", () => {
			expect.assertions(4);
			const root = parse("<p hidden></p>");
			const p = root.querySelector("p")!;
			const spy = jest.spyOn(p, "getAttribute");
			expect(isHTMLHidden(p)).toBeTruthy();
			expect(spy).toHaveBeenCalledTimes(1);
			spy.mockClear();
			expect(isHTMLHidden(p)).toBeTruthy();
			expect(spy).toHaveBeenCalledTimes(0);
		});

		it("should handle missing parent", () => {
			expect.assertions(1);
			const node = new HtmlElement("foo", null, NodeClosed.EndTag, null, {
				filename: "inline",
				line: 1,
				column: 1,
				offset: 0,
				size: 1,
			});
			expect(isHTMLHidden(node)).toBeFalsy();
		});

		describe("details", () => {
			it("should return detailed result", () => {
				expect.assertions(4);
				const markup = /* HTML */ `
					<div id="by-self" hidden>
						<p id="by-parent"></p>
						<p id="by-both" hidden></p>
					</div>
					<p id="by-none"></p>
				`;
				const root = parse(markup);
				const a = root.querySelector("#by-parent")!;
				const b = root.querySelector("#by-self")!;
				const c = root.querySelector("#by-both")!;
				const d = root.querySelector("#by-none")!;
				expect(isHTMLHidden(a, true)).toEqual({ byParent: true, bySelf: false });
				expect(isHTMLHidden(b, true)).toEqual({ byParent: false, bySelf: true });
				expect(isHTMLHidden(c, true)).toEqual({ byParent: true, bySelf: true });
				expect(isHTMLHidden(d, true)).toEqual({ byParent: false, bySelf: false });
			});
		});
	});

	describe("isPresentation()", () => {
		it("should return false if node is missing role", () => {
			expect.assertions(1);
			const root = parse("<p>Lorem ipsum</p>");
			const p = root.querySelector("p")!;
			expect(isPresentation(p)).toBeFalsy();
		});

		it("should return false if node has other role", () => {
			expect.assertions(1);
			const root = parse('<p role="checkbox">Lorem ipsum</p>');
			const p = root.querySelector("p")!;
			expect(isPresentation(p)).toBeFalsy();
		});

		it("should return false if ancestors are missing role", () => {
			expect.assertions(1);
			const root = parse("<div><p>Lorem ipsum</p></div>");
			const p = root.querySelector("p")!;
			expect(isPresentation(p)).toBeFalsy();
		});

		it("should return false if node has interpolated role", () => {
			expect.assertions(1);
			const root = parse('<p role="{{ interpolated }}">Lorem ipsum</p>');
			const p = root.querySelector("p")!;
			expect(isPresentation(p)).toBeFalsy();
		});

		it("should return false if node has dynamic role", () => {
			expect.assertions(1);
			const root = parse('<p dynamic-role="variable">Lorem ipsum</p>');
			const p = root.querySelector("p")!;
			expect(isPresentation(p)).toBeFalsy();
		});

		it('should return true if node has role="presentation"', () => {
			expect.assertions(1);
			const root = parse('<p role="presentation">Lorem ipsum</p>');
			const p = root.querySelector("p")!;
			expect(isPresentation(p)).toBeTruthy();
		});

		it('should return false even if ancestor has role="presentation"', () => {
			expect.assertions(1);
			const root = parse('<div role="presentation"><p>Lorem ipsum</p></div>');
			const p = root.querySelector("p")!;
			expect(isPresentation(p)).toBeFalsy();
		});

		it("should cache result", () => {
			expect.assertions(4);
			const root = parse('<p role="presentation"></p>');
			const p = root.querySelector("p")!;
			const spy = jest.spyOn(p, "getAttribute");
			expect(isPresentation(p)).toBeTruthy();
			expect(spy).toHaveBeenCalledTimes(1);
			spy.mockClear();
			expect(isPresentation(p)).toBeTruthy();
			expect(spy).toHaveBeenCalledTimes(0);
		});

		it("should handle missing parent", () => {
			expect.assertions(1);
			const node = new HtmlElement("foo", null, NodeClosed.EndTag, null, {
				filename: "inline",
				line: 1,
				column: 1,
				offset: 0,
				size: 1,
			});
			expect(isPresentation(node)).toBeFalsy();
		});
	});
});
