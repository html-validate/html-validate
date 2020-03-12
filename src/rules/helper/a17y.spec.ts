import { Config } from "../../config";
import { DOMTree } from "../../dom";
import { Parser } from "../../parser";
import { processAttribute } from "../../transform/mocks/attribute";
import { inAccessibilityTree } from "./a17y";

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
		it("should return true if node is visibile in accessibility tree", () => {
			expect.assertions(1);
			const root = parse("<p>Lorem ipsum</p>");
			const p = root.querySelector("p");
			expect(inAccessibilityTree(p)).toBeTruthy();
		});

		it('should return true if node has role="{{ interpolated }}"', () => {
			expect.assertions(1);
			const root = parse('<p role="{{ interpolated }}">Lorem ipsum</p>');
			const p = root.querySelector("p");
			expect(inAccessibilityTree(p)).toBeTruthy();
		});

		it('should return true if node has aria-hidden="{{ interpolated }}"', () => {
			expect.assertions(1);
			const root = parse('<p aria-hidden="{{ interpolated }}">Lorem ipsum</p>');
			const p = root.querySelector("p");
			expect(inAccessibilityTree(p)).toBeTruthy();
		});

		it('should return false if node has role="presentation"', () => {
			expect.assertions(1);
			const root = parse('<p role="presentation">Lorem ipsum</p>');
			const p = root.querySelector("p");
			expect(inAccessibilityTree(p)).toBeFalsy();
		});

		it('should return false if node has aria-hidden="true"', () => {
			expect.assertions(1);
			const root = parse('<p aria-hidden="true">Lorem ipsum</p>');
			const p = root.querySelector("p");
			expect(inAccessibilityTree(p)).toBeFalsy();
		});

		it('should return false if parent has role="presentation"', () => {
			expect.assertions(1);
			const root = parse('<div role="presentation"><p>Lorem ipsum</p></div>');
			const p = root.querySelector("p");
			expect(inAccessibilityTree(p)).toBeFalsy();
		});

		it('should return false if parent has aria-hidden="true"', () => {
			expect.assertions(1);
			const root = parse('<div aria-hidden="true"><p>Lorem ipsum</p></div>');
			const p = root.querySelector("p");
			expect(inAccessibilityTree(p)).toBeFalsy();
		});
	});
});
