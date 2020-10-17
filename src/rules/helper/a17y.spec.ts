import { Config } from "../../config";
import { DOMTree } from "../../dom";
import { Parser } from "../../parser";
import { processAttribute } from "../../transform/mocks/attribute";
import { inAccessibilityTree, isAriaHidden, isPresentation } from "./a17y";

describe("a17y helpers", () => {
	let parser: Parser;

	beforeEach(() => {
		parser = new Parser(Config.defaultConfig());
	});

	function parse(data: string): DOMTree {
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
			const p = root.querySelector("p");
			expect(inAccessibilityTree(p)).toBeFalsy();
		});

		it('should return false if element has role="presentation"', () => {
			expect.assertions(1);
			const root = parse('<p role="presentation">Lorem ipsum</p>');
			const p = root.querySelector("p");
			expect(inAccessibilityTree(p)).toBeFalsy();
		});

		it('should return false if ancestor has aria-hidden="true"', () => {
			expect.assertions(1);
			const root = parse('<div aria-hidden="true"><p>Lorem ipsum</p></div>');
			const p = root.querySelector("p");
			expect(inAccessibilityTree(p)).toBeFalsy();
		});

		it('should return false if ancestor has role="presentation"', () => {
			expect.assertions(1);
			const root = parse('<div role="presentation"><p>Lorem ipsum</p></div>');
			const p = root.querySelector("p");
			expect(inAccessibilityTree(p)).toBeFalsy();
		});

		it("should return true if element and ancestors are present in accessibility tree", () => {
			expect.assertions(1);
			const root = parse("<div><p>Lorem ipsum</p></div>");
			const p = root.querySelector("p");
			expect(inAccessibilityTree(p)).toBeTruthy();
		});
	});

	describe("isAriaHidden()", () => {
		it("should return false if node is missing aria-hidden", () => {
			expect.assertions(1);
			const root = parse("<p>Lorem ipsum</p>");
			const p = root.querySelector("p");
			expect(isAriaHidden(p)).toBeFalsy();
		});

		it("should return false if ancestors are missing aria-hidden", () => {
			expect.assertions(1);
			const root = parse("<div><p>Lorem ipsum</p></div>");
			const p = root.querySelector("p");
			expect(isAriaHidden(p)).toBeFalsy();
		});

		it("should return false if node has interpolated aria-hidden", () => {
			expect.assertions(1);
			const root = parse('<p aria-hidden="{{ interpolated }}">Lorem ipsum</p>');
			const p = root.querySelector("p");
			expect(isAriaHidden(p)).toBeFalsy();
		});

		it("should return false if node has dynamic aria-hidden", () => {
			expect.assertions(1);
			const root = parse('<p dynamic-aria-hidden="variable">Lorem ipsum</p>');
			const p = root.querySelector("p");
			expect(isAriaHidden(p)).toBeFalsy();
		});

		it('should return true if node has aria-hidden="true"', () => {
			expect.assertions(1);
			const root = parse('<p aria-hidden="true">Lorem ipsum</p>');
			const p = root.querySelector("p");
			expect(isAriaHidden(p)).toBeTruthy();
		});

		it('should return true if ancestor has aria-hidden="true"', () => {
			expect.assertions(1);
			const root = parse('<div aria-hidden="true"><p>Lorem ipsum</p></div>');
			const p = root.querySelector("p");
			expect(isAriaHidden(p)).toBeTruthy();
		});

		it("should cache result", () => {
			expect.assertions(4);
			const root = parse('<p aria-hidden="true"></p>');
			const p = root.querySelector("p");
			const spy = jest.spyOn(p, "getAttribute");
			expect(isAriaHidden(p)).toBeTruthy();
			expect(spy).toHaveBeenCalledTimes(1);
			spy.mockClear();
			expect(isAriaHidden(p)).toBeTruthy();
			expect(spy).toHaveBeenCalledTimes(0);
		});
	});

	describe("isPresentation()", () => {
		it("should return false if node is missing role", () => {
			expect.assertions(1);
			const root = parse("<p>Lorem ipsum</p>");
			const p = root.querySelector("p");
			expect(isPresentation(p)).toBeFalsy();
		});

		it("should return false if node has other role", () => {
			expect.assertions(1);
			const root = parse('<p role="checkbox">Lorem ipsum</p>');
			const p = root.querySelector("p");
			expect(isPresentation(p)).toBeFalsy();
		});

		it("should return false if ancestors are missing role", () => {
			expect.assertions(1);
			const root = parse("<div><p>Lorem ipsum</p></div>");
			const p = root.querySelector("p");
			expect(isPresentation(p)).toBeFalsy();
		});

		it("should return false if node has interpolated role", () => {
			expect.assertions(1);
			const root = parse('<p role="{{ interpolated }}">Lorem ipsum</p>');
			const p = root.querySelector("p");
			expect(isPresentation(p)).toBeFalsy();
		});

		it("should return false if node has dynamic role", () => {
			expect.assertions(1);
			const root = parse('<p dynamic-role="variable">Lorem ipsum</p>');
			const p = root.querySelector("p");
			expect(isPresentation(p)).toBeFalsy();
		});

		it('should return true if node has role="presentation"', () => {
			expect.assertions(1);
			const root = parse('<p role="presentation">Lorem ipsum</p>');
			const p = root.querySelector("p");
			expect(isPresentation(p)).toBeTruthy();
		});

		it('should return true if ancestor has role="presentation"', () => {
			expect.assertions(1);
			const root = parse('<div role="presentation"><p>Lorem ipsum</p></div>');
			const p = root.querySelector("p");
			expect(isPresentation(p)).toBeTruthy();
		});

		it("should cache result", () => {
			expect.assertions(4);
			const root = parse('<p role="presentation"></p>');
			const p = root.querySelector("p");
			const spy = jest.spyOn(p, "getAttribute");
			expect(isPresentation(p)).toBeTruthy();
			expect(spy).toHaveBeenCalledTimes(1);
			spy.mockClear();
			expect(isPresentation(p)).toBeTruthy();
			expect(spy).toHaveBeenCalledTimes(0);
		});
	});
});
