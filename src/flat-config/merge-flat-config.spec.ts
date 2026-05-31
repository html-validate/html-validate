import { describe, expect, it, jest } from "@jest/globals";
import { type Transformer } from "../transform";
import { mergeFlatConfig } from "./merge-flat-config";

describe("mergeFlatConfig()", () => {
	it("should return empty object for empty array", () => {
		expect.assertions(1);
		const result = mergeFlatConfig([]);
		expect(result).toEqual({
			elements: [],
			plugins: [],
			transform: {},
			rules: {},
		});
	});

	it("should handle empty blocks", () => {
		expect.assertions(1);
		const result = mergeFlatConfig([{}, {}]);
		expect(result).toEqual({
			elements: [],
			plugins: [],
			transform: {},
			rules: {},
		});
	});

	it("should merge elements arrays", () => {
		expect.assertions(1);
		const a = { div: {} };
		const b = { span: {} };
		const result = mergeFlatConfig([{ elements: [a] }, { elements: [b] }]);
		expect(result.elements).toEqual([a, b]);
	});

	it("should merge plugins arrays", () => {
		expect.assertions(1);
		const pluginA = { name: "plugin-a" };
		const pluginB = { name: "plugin-b" };
		const result = mergeFlatConfig([{ plugins: [pluginA] }, { plugins: [pluginB] }]);
		expect(result.plugins).toEqual([pluginA, pluginB]);
	});

	it("should merge transform objects", () => {
		expect.assertions(1);
		const transformA = jest.fn<Transformer>();
		const transformB = jest.fn<Transformer>();
		const result = mergeFlatConfig([
			{ transform: { "^.*\\.foo$": transformA } },
			{ transform: { "^.*\\.bar$": transformB } },
		]);
		expect(result.transform).toEqual({
			"^.*\\.foo$": transformA,
			"^.*\\.bar$": transformB,
		});
	});

	it("should let later block win on transform key conflict", () => {
		expect.assertions(1);
		const transformA = jest.fn<Transformer>();
		const transformB = jest.fn<Transformer>();
		const result = mergeFlatConfig([
			{ transform: { "^.*\\.foo$": transformA } },
			{ transform: { "^.*\\.foo$": transformB } },
		]);
		expect(result.transform).toEqual({ "^.*\\.foo$": transformB });
	});

	it("should merge rules objects", () => {
		expect.assertions(1);
		const result = mergeFlatConfig([
			{ rules: { "void-style": "error" } },
			{ rules: { "attr-quotes": "warn" } },
		]);
		expect(result.rules).toEqual({
			"void-style": "error",
			"attr-quotes": "warn",
		});
	});

	it("should let later block win on rules key conflict", () => {
		expect.assertions(1);
		const result = mergeFlatConfig([
			{ rules: { "void-style": "error" } },
			{ rules: { "void-style": "warn" } },
		]);
		expect(result.rules).toEqual({ "void-style": "warn" });
	});
});
