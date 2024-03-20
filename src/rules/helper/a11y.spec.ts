import { Config } from "../../config";
import { HtmlElement, NodeClosed } from "../../dom";
import { Parser } from "../../parser";
import { processAttribute } from "../../transform/mocks/attribute";
import {
	inAccessibilityTree,
	isAriaHidden,
	isHTMLHidden,
	isInert,
	isPresentation,
	isStyleHidden,
} from "./a11y";

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

		it("should return false if element has inert attribute", () => {
			expect.assertions(1);
			const root = parse("<p inert>Lorem ipsum</p>");
			const p = root.querySelector("p")!;
			expect(inAccessibilityTree(p)).toBeFalsy();
		});

		it("should return false if element has display: none", () => {
			expect.assertions(1);
			const root = parse(`<p style="display: none">Lorem ipsum</p>`);
			const p = root.querySelector("p")!;
			expect(inAccessibilityTree(p)).toBeFalsy();
		});

		it("should return false if element has visibility: hidden", () => {
			expect.assertions(1);
			const root = parse(`<p style="visibility: hidden">Lorem ipsum</p>`);
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

		it("should return false if ancestor has inert attribute", () => {
			expect.assertions(1);
			const root = parse("<div inert><p>Lorem ipsum</p></div>");
			const p = root.querySelector("p")!;
			expect(inAccessibilityTree(p)).toBeFalsy();
		});

		it("should return false if ancestor has display: none", () => {
			expect.assertions(1);
			const root = parse(`<div style="display: none"><p>Lorem ipsum</p></div>`);
			const p = root.querySelector("p")!;
			expect(inAccessibilityTree(p)).toBeFalsy();
		});

		it("should return false if ancestor has visibility: hidden", () => {
			expect.assertions(1);
			const root = parse(`<div style="visibility: hidden"><p>Lorem ipsum</p></div>`);
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
			expect.assertions(2);
			const markup = /* HTML */ `
				<div id="shallow-parent" aria-hidden="true">
					<p>Lorem ipsum</p>
				</div>
				<div id="nested-parent" aria-hidden="true">
					<div>
						<p>Lorem ipsum</p>
					</div>
				</div>
			`;
			const root = parse(markup);
			const p1 = root.querySelector("#shallow-parent p")!;
			const p2 = root.querySelector("#nested-parent p")!;
			expect(isAriaHidden(p1)).toBeTruthy();
			expect(isAriaHidden(p2)).toBeTruthy();
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
			expect.assertions(2);
			const markup = /* HTML */ `
				<div id="shallow-parent" hidden>
					<p>Lorem ipsum</p>
				</div>
				<div id="nested-parent" hidden>
					<div>
						<p>Lorem ipsum</p>
					</div>
				</div>
			`;
			const root = parse(markup);
			const p1 = root.querySelector("#shallow-parent p")!;
			const p2 = root.querySelector("#nested-parent p")!;
			expect(isHTMLHidden(p1)).toBeTruthy();
			expect(isHTMLHidden(p2)).toBeTruthy();
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

	describe("isInert()", () => {
		it("should return false if node is missing inert", () => {
			expect.assertions(1);
			const root = parse("<p>Lorem ipsum</p>");
			const p = root.querySelector("p")!;
			expect(isInert(p)).toBeFalsy();
		});

		it("should return false if ancestors are missing inert", () => {
			expect.assertions(1);
			const root = parse("<div><p>Lorem ipsum</p></div>");
			const p = root.querySelector("p")!;
			expect(isInert(p)).toBeFalsy();
		});

		it("should return false if node has dynamic inert", () => {
			expect.assertions(1);
			const root = parse('<p dynamic-inert="variable">Lorem ipsum</p>');
			const p = root.querySelector("p")!;
			expect(isInert(p)).toBeFalsy();
		});

		it("should return true if node has inert", () => {
			expect.assertions(1);
			const root = parse("<p inert>Lorem ipsum</p>");
			const p = root.querySelector("p")!;
			expect(isInert(p)).toBeTruthy();
		});

		it("should return true if ancestor has inert", () => {
			expect.assertions(2);
			const markup = /* HTML */ `
				<div id="shallow-parent" inert>
					<p>Lorem ipsum</p>
				</div>
				<div id="nested-parent" inert>
					<div>
						<p>Lorem ipsum</p>
					</div>
				</div>
			`;
			const root = parse(markup);
			const p1 = root.querySelector("#shallow-parent p")!;
			const p2 = root.querySelector("#nested-parent p")!;
			expect(isInert(p1)).toBeTruthy();
			expect(isInert(p2)).toBeTruthy();
		});

		it("should cache result", () => {
			expect.assertions(5);
			const root = parse("<p inert></p>");
			const p = root.querySelector("p")!;
			const spy = jest.spyOn(p, "getAttribute");
			expect(isInert(p)).toBeTruthy();
			expect(spy).toHaveBeenCalledTimes(1);
			spy.mockClear();
			expect(isInert(p)).toBeTruthy();
			expect(isInert(p, true)).toEqual({ byParent: false, bySelf: true });
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
			expect(isInert(node)).toBeFalsy();
		});

		describe("details", () => {
			it("should return detailed result", () => {
				expect.assertions(4);
				const markup = /* HTML */ `
					<div id="by-self" inert>
						<p id="by-parent"></p>
						<p id="by-both" inert></p>
					</div>
					<p id="by-none"></p>
				`;
				const root = parse(markup);
				const a = root.querySelector("#by-parent")!;
				const b = root.querySelector("#by-self")!;
				const c = root.querySelector("#by-both")!;
				const d = root.querySelector("#by-none")!;
				expect(isInert(a, true)).toEqual({ byParent: true, bySelf: false });
				expect(isInert(b, true)).toEqual({ byParent: false, bySelf: true });
				expect(isInert(c, true)).toEqual({ byParent: true, bySelf: true });
				expect(isInert(d, true)).toEqual({ byParent: false, bySelf: false });
			});
		});
	});

	describe("isStyleHidden()", () => {
		it("should return false if node is not hidden", () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <p>Lorem ipsum</p> `;
			const root = parse(markup);
			const p = root.querySelector("p")!;
			expect(isStyleHidden(p)).toBeFalsy();
		});

		it("should return false if node has display: block", () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <p style="display: block;">Lorem ipsum</p> `;
			const root = parse(markup);
			const p = root.querySelector("p")!;
			expect(isStyleHidden(p)).toBeFalsy();
		});

		it("should return false if node has visibility: visible", () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <p style="visibility: visible;">Lorem ipsum</p> `;
			const root = parse(markup);
			const p = root.querySelector("p")!;
			expect(isStyleHidden(p)).toBeFalsy();
		});

		it("should return true if node has display: none", () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <p style="display: none;">Lorem ipsum</p> `;
			const root = parse(markup);
			const p = root.querySelector("p")!;
			expect(isStyleHidden(p)).toBeTruthy();
		});

		it("should return true if node has visibility: hidden", () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <p style="visibility: hidden;">Lorem ipsum</p> `;
			const root = parse(markup);
			const p = root.querySelector("p")!;
			expect(isStyleHidden(p)).toBeTruthy();
		});

		it('should return true if ancestor is hidden"', () => {
			expect.assertions(2);
			const markup = /* HTML */ `
				<div id="shallow-parent" style="visibility: hidden">
					<p>Lorem ipsum</p>
				</div>
				<div id="nested-parent" style="display: none">
					<div>
						<p>Lorem ipsum</p>
					</div>
				</div>
			`;
			const root = parse(markup);
			const p1 = root.querySelector("#shallow-parent p")!;
			const p2 = root.querySelector("#nested-parent p")!;
			expect(isStyleHidden(p1)).toBeTruthy();
			expect(isStyleHidden(p2)).toBeTruthy();
		});

		it("should cache result", () => {
			expect.assertions(4);
			const markup = /* HTML */ ` <p style="visibility: hidden;">Lorem ipsum</p> `;
			const root = parse(markup);
			const p = root.querySelector("p")!;
			const spy = jest.spyOn(p, "getAttribute");
			expect(isStyleHidden(p)).toBeTruthy();
			expect(spy).toHaveBeenCalledTimes(1);
			spy.mockClear();
			expect(isStyleHidden(p)).toBeTruthy();
			expect(spy).toHaveBeenCalledTimes(0);
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

		it("should return false if node is interactive", () => {
			expect.assertions(1);
			const root = parse('<button role="presentation">Lorem ipsum<button>');
			const button = root.querySelector("button")!;
			expect(isPresentation(button)).toBeFalsy();
		});

		it("should return false if node has tabindex", () => {
			expect.assertions(1);
			const root = parse('<p tabindex role="presentation">Lorem ipsum<p>');
			const button = root.querySelector("p")!;
			expect(isPresentation(button)).toBeFalsy();
		});

		it('should return true if node has role="presentation"', () => {
			expect.assertions(1);
			const root = parse('<p role="presentation">Lorem ipsum</p>');
			const p = root.querySelector("p")!;
			expect(isPresentation(p)).toBeTruthy();
		});

		it('should return true if node has role="none"', () => {
			expect.assertions(1);
			const root = parse('<p role="none">Lorem ipsum</p>');
			const p = root.querySelector("p")!;
			expect(isPresentation(p)).toBeTruthy();
		});

		it('should return false even if ancestor has role="presentation"', () => {
			expect.assertions(1);
			const root = parse('<div role="presentation"><p>Lorem ipsum</p></div>');
			const p = root.querySelector("p")!;
			expect(isPresentation(p)).toBeFalsy();
		});

		it('should return false even if ancestor has role="none"', () => {
			expect.assertions(1);
			const root = parse('<div role="none"><p>Lorem ipsum</p></div>');
			const p = root.querySelector("p")!;
			expect(isPresentation(p)).toBeFalsy();
		});

		it("should cache result", () => {
			expect.assertions(4);
			const root = parse('<p role="presentation"></p>');
			const p = root.querySelector("p")!;
			const spy = jest.spyOn(p, "getAttribute");
			expect(isPresentation(p)).toBeTruthy();
			expect(spy).toHaveBeenCalledTimes(2);
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
