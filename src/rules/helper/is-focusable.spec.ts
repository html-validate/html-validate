import { Config } from "../../config";
import { HtmlElement } from "../../dom";
import { Parser } from "../../parser";
import { processAttribute } from "../../transform/mocks/attribute";
import { isFocusable } from "./is-focusable";

const parser = new Parser(Config.defaultConfig().resolve());

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

it("should return true if element is naturally focusable", () => {
	expect.assertions(1);
	const markup = /* HTML */ ` <input /> `;
	const root = parse(markup);
	const element = root.querySelector("input")!;
	expect(isFocusable(element)).toBeTruthy();
});

it("should return true if element has tabindex=0", () => {
	expect.assertions(1);
	const markup = /* HTML */ ` <p tabindex="0"></p> `;
	const root = parse(markup);
	const element = root.querySelector("p")!;
	expect(isFocusable(element)).toBeTruthy();
});

it("should return true if element has positive tabindex", () => {
	expect.assertions(1);
	const markup = /* HTML */ ` <p tabindex="1"></p> `;
	const root = parse(markup);
	const element = root.querySelector("p")!;
	expect(isFocusable(element)).toBeTruthy();
});

it("should return false if element isn't naturally focusable", () => {
	expect.assertions(1);
	const markup = /* HTML */ ` <p></p> `;
	const root = parse(markup);
	const element = root.querySelector("p")!;
	expect(isFocusable(element)).toBeFalsy();
});

it("should return false if element has negative tabindex", () => {
	expect.assertions(1);
	const markup = /* HTML */ ` <p tabindex="-1"></p> `;
	const root = parse(markup);
	const element = root.querySelector("p")!;
	expect(isFocusable(element)).toBeFalsy();
});

it("should return false if element is hidden", () => {
	expect.assertions(1);
	const markup = /* HTML */ ` <input hidden /> `;
	const root = parse(markup);
	const element = root.querySelector("input")!;
	expect(isFocusable(element)).toBeFalsy();
});

it("should return false if parent is hidden", () => {
	expect.assertions(1);
	const markup = /* HTML */ ` <div hidden><input /></div> `;
	const root = parse(markup);
	const element = root.querySelector("input")!;
	expect(isFocusable(element)).toBeFalsy();
});

it("should return false if element is inert", () => {
	expect.assertions(1);
	const markup = /* HTML */ ` <input inert /> `;
	const root = parse(markup);
	const element = root.querySelector("input")!;
	expect(isFocusable(element)).toBeFalsy();
});

it("should return false if parent is inert", () => {
	expect.assertions(1);
	const markup = /* HTML */ ` <div inert><input /></div> `;
	const root = parse(markup);
	const element = root.querySelector("input")!;
	expect(isFocusable(element)).toBeFalsy();
});

it("should return false if element has display: none", () => {
	expect.assertions(1);
	const markup = /* HTML */ ` <input style="display: none" /> `;
	const root = parse(markup);
	const element = root.querySelector("input")!;
	expect(isFocusable(element)).toBeFalsy();
});

it("should return false if parent has display: none", () => {
	expect.assertions(1);
	const markup = /* HTML */ ` <div style="display: none"><input /></div> `;
	const root = parse(markup);
	const element = root.querySelector("input")!;
	expect(isFocusable(element)).toBeFalsy();
});

it("should return false if element has visibility: hidden", () => {
	expect.assertions(1);
	const markup = /* HTML */ ` <input style="visibility: hidden" /> `;
	const root = parse(markup);
	const element = root.querySelector("input")!;
	expect(isFocusable(element)).toBeFalsy();
});

it("should return false if parent has visibility: hidden", () => {
	expect.assertions(1);
	const markup = /* HTML */ ` <div style="visibility: hidden"><input /></div> `;
	const root = parse(markup);
	const element = root.querySelector("input")!;
	expect(isFocusable(element)).toBeFalsy();
});
