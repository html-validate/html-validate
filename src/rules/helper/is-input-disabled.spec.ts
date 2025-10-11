import { Config } from "../../config";
import { type HtmlElement } from "../../dom";
import { Parser } from "../../parser";
import { processAttribute } from "../../transform/mocks/attribute";
import { isInputDisabled } from "./is-input-disabled";

let parser: Parser;

beforeAll(async () => {
	const config = await Config.defaultConfig().resolve();
	parser = new Parser(config);
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

it("should return false if <input> is not disabled", () => {
	expect.assertions(2);
	const markup = /* HTML */ ` <input /> `;
	const root = parse(markup);
	const input = root.querySelector("input")!;
	input.cacheEnable(false);
	expect(isInputDisabled(input)).toBeFalsy();
	expect(isInputDisabled(input, true)).toEqual({
		byFieldset: false,
		bySelf: false,
	});
});

it("should return false if <input> in fieldset is not disabled", () => {
	expect.assertions(2);
	const markup = /* HTML */ `
		<fieldset>
			<input />
		</fieldset>
	`;
	const root = parse(markup);
	const input = root.querySelector("input")!;
	input.cacheEnable(false);
	expect(isInputDisabled(input)).toBeFalsy();
	expect(isInputDisabled(input, true)).toEqual({
		byFieldset: false,
		bySelf: false,
	});
});

it("should return true if <input> is disabled", () => {
	expect.assertions(2);
	const markup = /* HTML */ ` <input disabled /> `;
	const root = parse(markup);
	const input = root.querySelector("input")!;
	input.cacheEnable(false);
	expect(isInputDisabled(input)).toBeTruthy();
	expect(isInputDisabled(input, true)).toEqual({
		byFieldset: false,
		bySelf: true,
	});
});

it("should return true if <input> is disabled by fieldset", () => {
	expect.assertions(2);
	const markup = /* HTML */ `
		<fieldset disabled>
			<input />
		</fieldset>
	`;
	const root = parse(markup);
	const input = root.querySelector("input")!;
	input.cacheEnable(false);
	expect(isInputDisabled(input)).toBeTruthy();
	expect(isInputDisabled(input, true)).toEqual({
		byFieldset: true,
		bySelf: false,
	});
});

it("should return true if <input> is disabled by ancestor fieldset", () => {
	expect.assertions(2);
	const markup = /* HTML */ `
		<fieldset disabled>
			<fieldset>
				<input />
			</fieldset>
		</fieldset>
	`;
	const root = parse(markup);
	const input = root.querySelector("input")!;
	input.cacheEnable(false);
	expect(isInputDisabled(input)).toBeTruthy();
	expect(isInputDisabled(input, true)).toEqual({
		byFieldset: true,
		bySelf: false,
	});
});

it("should return false if input has dynamic disabled", () => {
	expect.assertions(2);
	const markup = /* HTML */ ` <input dynamic-disabled="expr" /> `;
	const root = parse(markup);
	const input = root.querySelector("input")!;
	input.cacheEnable(false);
	expect(isInputDisabled(input)).toBeFalsy();
	expect(isInputDisabled(input, true)).toEqual({
		byFieldset: false,
		bySelf: false,
	});
});

it("should return false if fieldset has dynamic disabled", () => {
	expect.assertions(2);
	const markup = /* HTML */ `
		<fieldset dynamic-disabled="expr">
			<input />
		</fieldset>
	`;
	const root = parse(markup);
	const input = root.querySelector("input")!;
	input.cacheEnable(false);
	expect(isInputDisabled(input)).toBeFalsy();
	expect(isInputDisabled(input, true)).toEqual({
		byFieldset: false,
		bySelf: false,
	});
});

it("should cache result", () => {
	expect.assertions(5);
	const markup = /* HTML */ ` <input disabled /> `;
	const root = parse(markup);
	const input = root.querySelector("input")!;
	const spy = jest.spyOn(input, "getAttribute");
	expect(isInputDisabled(input)).toBeTruthy();
	expect(spy).toHaveBeenCalledTimes(1);
	spy.mockClear();
	expect(isInputDisabled(input)).toBeTruthy();
	expect(isInputDisabled(input, true)).toEqual({
		byFieldset: false,
		bySelf: true,
	});
	expect(spy).toHaveBeenCalledTimes(0);
});
