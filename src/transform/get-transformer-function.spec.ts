import { cjsResolver } from "../config/resolver/nodejs";
import { Source } from "../context";
import { Plugin } from "../plugin";
import { getTransformerFunction } from "./get-transformer-function";
import { TRANSFORMER_API } from "./transformer-api";

expect.addSnapshotSerializer({
	serialize(value) {
		return value;
	},
	test(): boolean {
		return true;
	},
});

it("should load transformer from package", () => {
	expect.assertions(1);
	const resolvers = [cjsResolver()];
	const name = "mock-transform";
	const transformer = getTransformerFunction(resolvers, name, []);
	expect(transformer).toEqual(require("mock-transform")); // eslint-disable-line @typescript-eslint/no-var-requires -- for now
});

it("should load transformer from path with <rootDir>", () => {
	expect.assertions(1);
	const resolvers = [cjsResolver()];
	const name = "<rootDir>/src/transform/__mocks__/mock-transform";
	const transformer = getTransformerFunction(resolvers, name, []);
	expect(transformer).toEqual(require("mock-transform")); // eslint-disable-line @typescript-eslint/no-var-requires -- for now
});

describe("should load transformer from plugins", () => {
	function mockTransform(): Source[] {
		return [];
	}
	mockTransform.api = TRANSFORMER_API.VERSION;

	const plugins: Plugin[] = [
		{
			name: "mock-plugin-unnamed",
			transformer: mockTransform,
		},
		{
			name: "mock-plugin-named",
			transformer: {
				default: mockTransform,
				foobar: mockTransform,
			},
		},
	];

	it("unnamed", () => {
		expect.assertions(1);
		const name = "mock-plugin-unnamed";
		const transformer = getTransformerFunction([], name, plugins);
		expect(transformer).toEqual(mockTransform);
	});

	it("named", () => {
		expect.assertions(1);
		const name = "mock-plugin-named:foobar";
		const transformer = getTransformerFunction([], name, plugins);
		expect(transformer).toEqual(mockTransform);
	});

	it("named default", () => {
		expect.assertions(1);
		const name = "mock-plugin-named";
		const transformer = getTransformerFunction([], name, plugins);
		expect(transformer).toEqual(mockTransform);
	});
});

it("should throw error if transformer uses obsolete API", () => {
	expect.assertions(1);
	const resolvers = [cjsResolver()]; // uses jest automock from src/transform/__mocks__/
	expect(() => {
		getTransformerFunction(resolvers, "mock-transform-obsolete", []);
	}).toThrowErrorMatchingInlineSnapshot(
		`Failed to load transformer "mock-transform-obsolete": Transformer uses API version 0 but only version 1 is supported`,
	);
});

it("should throw error when transform is missing", () => {
	expect.assertions(1);
	expect(() => {
		getTransformerFunction([], "missing-transform", []);
	}).toThrowErrorMatchingInlineSnapshot(`Failed to load transformer "missing-transform"`);
});

it("should throw error when referencing plugin without any transformers", () => {
	expect.assertions(2);
	const mockPlugin: Plugin = {
		name: "mock-plugin",
	};
	expect(() => {
		getTransformerFunction([], "mock-plugin", [mockPlugin]);
	}).toThrowErrorMatchingInlineSnapshot(
		`Failed to load transformer "mock-plugin": Plugin does not expose any transformers`,
	);
	expect(() => {
		getTransformerFunction([], "mock-plugin:foobar", [mockPlugin]);
	}).toThrowErrorMatchingInlineSnapshot(
		`Failed to load transformer "mock-plugin:foobar": Plugin does not expose any transformers`,
	);
});

it("should throw error when named transform references missing plugin", () => {
	expect.assertions(1);
	expect(() => {
		getTransformerFunction([], "missing-plugin:foobar", []);
	}).toThrowErrorMatchingInlineSnapshot(
		`Failed to load transformer "missing-plugin:foobar": No plugin named "missing-plugin" has been loaded`,
	);
});

it("should throw error when named transform is missing", () => {
	expect.assertions(1);
	const mockPlugin: Plugin = {
		name: "mock-plugin",
		transformer: {},
	};
	expect(() => {
		getTransformerFunction([], "mock-plugin:foobar", [mockPlugin]);
	}).toThrowErrorMatchingInlineSnapshot(
		'Failed to load transformer "mock-plugin:foobar": Plugin "mock-plugin" does not expose a transformer named "foobar".',
	);
});

it("should throw error when referencing named transformer without name", () => {
	expect.assertions(1);
	const mockPlugin: Plugin = {
		name: "mock-plugin",
		transformer: {
			foobar: null,
		},
	};
	expect(() => {
		getTransformerFunction([], "mock-plugin", [mockPlugin]);
	}).toThrowErrorMatchingInlineSnapshot(
		'Failed to load transformer "mock-plugin": Transformer "mock-plugin" refers to unnamed transformer but plugin exposes only named.',
	);
});

it("should throw error when referencing unnamed transformer with name", () => {
	expect.assertions(1);
	const mockPlugin: Plugin = {
		name: "mock-plugin",
		transformer() {
			return [];
		},
	};
	expect(() => {
		getTransformerFunction([], "mock-plugin:foobar", [mockPlugin]);
	}).toThrowErrorMatchingInlineSnapshot(
		'Failed to load transformer "mock-plugin:foobar": Transformer "mock-plugin:foobar" refers to named transformer but plugin exposes only unnamed, use "mock-plugin" instead.',
	);
});
