import { type Source } from "../../context";
import { type MetaDataTable } from "../../meta";
import { type Plugin } from "../../plugin";
import { type Transformer } from "../../transform";
import { type ConfigData } from "../config-data";
import {
	resolveConfig,
	resolveConfigAsync,
	resolveElements,
	resolveElementsAsync,
	resolvePlugin,
	resolvePluginAsync,
	resolveTransformer,
	resolveTransformerAsync,
} from "./resolve-helpers";
import { type Resolver } from "./resolver";

function mockEmptyResolver(): Resolver {
	return {
		name: "mock-empty-resolver",
	};
}

function mockConfigResolver(givenId: string, config: ConfigData | Promise<ConfigData>): Resolver {
	return {
		name: "mock-config-resolver",
		resolveConfig(id: string): ConfigData | Promise<ConfigData> | null {
			return id === givenId ? config : null;
		},
	};
}

function mockElementsResolver(
	givenId: string,
	elements: MetaDataTable | Promise<MetaDataTable>,
): Resolver {
	return {
		name: "mock-elements-resolver",
		resolveElements(id: string): MetaDataTable | Promise<MetaDataTable> | null {
			return id === givenId ? elements : null;
		},
	};
}

function mockPluginResolver(givenId: string, plugin: Plugin | Promise<Plugin>): Resolver {
	return {
		name: "mock-plugin-resolver",
		resolvePlugin(id: string): Plugin | Promise<Plugin> | null {
			return id === givenId ? plugin : null;
		},
	};
}

function mockTransformerResolver(
	givenId: string,
	transformer: Transformer | Promise<Transformer>,
): Resolver {
	return {
		name: "mock-transformer-resolver",
		resolveTransformer(id: string): Transformer | Promise<Transformer> | null {
			return id === givenId ? transformer : null;
		},
	};
}

describe("resolveConfig()", () => {
	it("should query resolvers for requested id", async () => {
		expect.assertions(1);
		const resolver = mockConfigResolver("foo", {});
		const spy = jest.spyOn(resolver, "resolveConfig");
		await resolveConfig([resolver], "foo", { cache: false });
		expect(spy).toHaveBeenCalledWith("foo", { cache: false });
	});

	it("should return first matching entry", () => {
		expect.assertions(1);
		const resolvers = [
			mockConfigResolver("foo", { rules: { foo: "error" } }),
			mockConfigResolver("bar", { rules: { bar: "error" } }),
			mockConfigResolver("baz", { rules: { foo: "error" } }),
		];
		const resolved = resolveConfig(resolvers, "bar", { cache: false });
		expect(resolved).toEqual({ rules: { bar: "error" } });
	});

	it("should handle async results", async () => {
		expect.assertions(1);
		const resolver = mockConfigResolver("foo", Promise.resolve({ rules: { foo: "error" } }));
		const resolved = await resolveConfig([resolver], "foo", { cache: false });
		expect(resolved).toEqual({ rules: { foo: "error" } });
	});

	it("should handle resolvers not implementing the requested type", () => {
		expect.assertions(1);
		const resolvers = [mockEmptyResolver(), mockConfigResolver("foo", {})];
		const resolved = resolveConfig(resolvers, "foo", { cache: false });
		expect(resolved).toEqual({});
	});

	it("should throw error if no entry matches", () => {
		expect.assertions(1);
		const resolvers = [
			mockConfigResolver("foo", { rules: { foo: "error" } }),
			mockConfigResolver("bar", { rules: { bar: "error" } }),
			mockConfigResolver("baz", { rules: { foo: "error" } }),
		];
		expect(() => {
			return resolveConfig(resolvers, "spam", { cache: false });
		}).toThrowErrorMatchingInlineSnapshot(`"Failed to load configuration from "spam""`);
	});
});

describe("resolveConfigAsync()", () => {
	it("should query resolvers for requested id", async () => {
		expect.assertions(1);
		const resolver = mockConfigResolver("foo", {});
		const spy = jest.spyOn(resolver, "resolveConfig");
		await resolveConfigAsync([resolver], "foo", { cache: false });
		expect(spy).toHaveBeenCalledWith("foo", { cache: false });
	});

	it("should return first matching entry", async () => {
		expect.assertions(1);
		const resolvers = [
			mockConfigResolver("foo", { rules: { foo: "error" } }),
			mockConfigResolver("bar", { rules: { bar: "error" } }),
			mockConfigResolver("baz", { rules: { foo: "error" } }),
		];
		const resolved = await resolveConfigAsync(resolvers, "bar", { cache: false });
		expect(resolved).toEqual({ rules: { bar: "error" } });
	});

	it("should handle resolvers not implementing the requested type", async () => {
		expect.assertions(1);
		const resolvers = [mockEmptyResolver(), mockConfigResolver("foo", {})];
		const resolved = await resolveConfigAsync(resolvers, "foo", { cache: false });
		expect(resolved).toEqual({});
	});

	it("should throw error if no entry matches", async () => {
		expect.assertions(1);
		const resolvers = [
			mockConfigResolver("foo", { rules: { foo: "error" } }),
			mockConfigResolver("bar", { rules: { bar: "error" } }),
			mockConfigResolver("baz", { rules: { foo: "error" } }),
		];
		await expect(() => {
			return resolveConfigAsync(resolvers, "spam", { cache: false });
		}).rejects.toThrowErrorMatchingInlineSnapshot(`"Failed to load configuration from "spam""`);
	});
});

describe("resolveElements()", () => {
	it("should query resolvers for requested id", async () => {
		expect.assertions(1);
		const resolver = mockElementsResolver("foo", {});
		const spy = jest.spyOn(resolver, "resolveElements");
		await resolveElements([resolver], "foo", { cache: false });
		expect(spy).toHaveBeenCalledWith("foo", { cache: false });
	});

	it("should return first matching entry", () => {
		expect.assertions(1);
		const resolvers = [
			mockElementsResolver("foo", { foo: {} }),
			mockElementsResolver("bar", { bar: {} }),
			mockElementsResolver("baz", { foo: {} }),
		];
		const resolved = resolveElements(resolvers, "bar", { cache: false });
		expect(resolved).toEqual({ bar: {} });
	});

	it("should handle async results", async () => {
		expect.assertions(1);
		const resolver = mockElementsResolver("foo", Promise.resolve({ foo: {} }));
		const resolved = await resolveElements([resolver], "foo", { cache: false });
		expect(resolved).toEqual({ foo: {} });
	});

	it("should handle resolvers not implementing the requested type", () => {
		expect.assertions(1);
		const resolvers = [mockEmptyResolver(), mockElementsResolver("foo", {})];
		const resolved = resolveElements(resolvers, "foo", { cache: false });
		expect(resolved).toEqual({});
	});

	it("should throw error if no entry matches", () => {
		expect.assertions(1);
		const resolvers = [
			mockElementsResolver("foo", { foo: {} }),
			mockElementsResolver("bar", { bar: {} }),
			mockElementsResolver("baz", { foo: {} }),
		];
		expect(() => {
			return resolveElements(resolvers, "spam", { cache: false });
		}).toThrowErrorMatchingInlineSnapshot(`"Failed to load elements from "spam""`);
	});
});

describe("resolveElementsAsync()", () => {
	it("should query resolvers for requested id", async () => {
		expect.assertions(1);
		const resolver = mockElementsResolver("foo", {});
		const spy = jest.spyOn(resolver, "resolveElements");
		await resolveElementsAsync([resolver], "foo", { cache: false });
		expect(spy).toHaveBeenCalledWith("foo", { cache: false });
	});

	it("should return first matching entry", async () => {
		expect.assertions(1);
		const resolvers = [
			mockElementsResolver("foo", { foo: {} }),
			mockElementsResolver("bar", { bar: {} }),
			mockElementsResolver("baz", { foo: {} }),
		];
		const resolved = await resolveElementsAsync(resolvers, "bar", { cache: false });
		expect(resolved).toEqual({ bar: {} });
	});

	it("should handle resolvers not implementing the requested type", async () => {
		expect.assertions(1);
		const resolvers = [mockEmptyResolver(), mockElementsResolver("foo", {})];
		const resolved = await resolveElementsAsync(resolvers, "foo", { cache: false });
		expect(resolved).toEqual({});
	});

	it("should throw error if no entry matches", async () => {
		expect.assertions(1);
		const resolvers = [
			mockElementsResolver("foo", { foo: {} }),
			mockElementsResolver("bar", { bar: {} }),
			mockElementsResolver("baz", { foo: {} }),
		];
		await expect(() => {
			return resolveElementsAsync(resolvers, "spam", { cache: false });
		}).rejects.toThrowErrorMatchingInlineSnapshot(`"Failed to load elements from "spam""`);
	});
});

describe("resolvePlugin()", () => {
	it("should query resolvers for requested id", async () => {
		expect.assertions(1);
		const resolver = mockPluginResolver("foo", {});
		const spy = jest.spyOn(resolver, "resolvePlugin");
		await resolvePlugin([resolver], "foo", { cache: false });
		expect(spy).toHaveBeenCalledWith("foo", { cache: false });
	});

	it("should return first matching entry", () => {
		expect.assertions(1);
		const resolvers = [
			mockPluginResolver("foo", { name: "foo" }),
			mockPluginResolver("bar", { name: "bar" }),
			mockPluginResolver("baz", { name: "foo" }),
		];
		const resolved = resolvePlugin(resolvers, "bar", { cache: false });
		expect(resolved).toEqual({ name: "bar" });
	});

	it("should handle async results", async () => {
		expect.assertions(1);
		const resolver = mockPluginResolver("foo", Promise.resolve({ name: "foo" }));
		const resolved = await resolvePlugin([resolver], "foo", { cache: false });
		expect(resolved).toEqual({ name: "foo" });
	});

	it("should handle resolvers not implementing the requested type", () => {
		expect.assertions(1);
		const resolvers = [mockEmptyResolver(), mockPluginResolver("foo", {})];
		const resolved = resolvePlugin(resolvers, "foo", { cache: false });
		expect(resolved).toEqual({});
	});

	it("should throw error if no entry matches", () => {
		expect.assertions(1);
		const resolvers = [
			mockPluginResolver("foo", { name: "foo" }),
			mockPluginResolver("bar", { name: "bar" }),
			mockPluginResolver("baz", { name: "foo" }),
		];
		expect(() => {
			return resolvePlugin(resolvers, "spam", { cache: false });
		}).toThrowErrorMatchingInlineSnapshot(`"Failed to load plugin from "spam""`);
	});
});

describe("resolvePluginAsync()", () => {
	it("should query resolvers for requested id", async () => {
		expect.assertions(1);
		const resolver = mockPluginResolver("foo", {});
		const spy = jest.spyOn(resolver, "resolvePlugin");
		await resolvePluginAsync([resolver], "foo", { cache: false });
		expect(spy).toHaveBeenCalledWith("foo", { cache: false });
	});

	it("should return first matching entry", async () => {
		expect.assertions(1);
		const resolvers = [
			mockPluginResolver("foo", { name: "foo" }),
			mockPluginResolver("bar", { name: "bar" }),
			mockPluginResolver("baz", { name: "foo" }),
		];
		const resolved = await resolvePluginAsync(resolvers, "bar", { cache: false });
		expect(resolved).toEqual({ name: "bar" });
	});

	it("should handle resolvers not implementing the requested type", async () => {
		expect.assertions(1);
		const resolvers = [mockEmptyResolver(), mockPluginResolver("foo", {})];
		const resolved = await resolvePluginAsync(resolvers, "foo", { cache: false });
		expect(resolved).toEqual({});
	});

	it("should throw error if no entry matches", async () => {
		expect.assertions(1);
		const resolvers = [
			mockPluginResolver("foo", { name: "foo" }),
			mockPluginResolver("bar", { name: "bar" }),
			mockPluginResolver("baz", { name: "foo" }),
		];
		await expect(() => {
			return resolvePluginAsync(resolvers, "spam", { cache: false });
		}).rejects.toThrowErrorMatchingInlineSnapshot(`"Failed to load plugin from "spam""`);
	});
});

describe("resolveTransformer()", () => {
	function foo(): Source[] {
		return [];
	}

	function bar(): Source[] {
		return [];
	}

	function baz(): Source[] {
		return [];
	}

	it("should query resolvers for requested id", async () => {
		expect.assertions(1);
		const resolver = mockTransformerResolver("foo", foo);
		const spy = jest.spyOn(resolver, "resolveTransformer");
		await resolveTransformer([resolver], "foo", { cache: false });
		expect(spy).toHaveBeenCalledWith("foo", { cache: false });
	});

	it("should return first matching entry", () => {
		expect.assertions(1);
		const resolvers = [
			mockTransformerResolver("foo", foo),
			mockTransformerResolver("bar", bar),
			mockTransformerResolver("baz", baz),
		];
		const resolved = resolveTransformer(resolvers, "bar", { cache: false });
		expect(resolved).toEqual(bar);
	});

	it("should handle async results", async () => {
		expect.assertions(1);
		const resolver = mockTransformerResolver("foo", Promise.resolve(foo));
		const resolved = await resolveTransformer([resolver], "foo", { cache: false });
		expect(resolved).toEqual(foo);
	});

	it("should handle resolvers not implementing the requested type", () => {
		expect.assertions(1);
		const resolvers = [mockEmptyResolver(), mockTransformerResolver("foo", foo)];
		const resolved = resolveTransformer(resolvers, "foo", { cache: false });
		expect(resolved).toEqual(foo);
	});

	it("should throw error if no entry matches", () => {
		expect.assertions(1);
		const resolvers = [
			mockTransformerResolver("foo", foo),
			mockTransformerResolver("bar", bar),
			mockTransformerResolver("baz", foo),
		];
		expect(() => {
			return resolveTransformer(resolvers, "spam", { cache: false });
		}).toThrowErrorMatchingInlineSnapshot(`"Failed to load transformer from "spam""`);
	});
});

describe("resolveTransformerAsync()", () => {
	function foo(): Source[] {
		return [];
	}

	function bar(): Source[] {
		return [];
	}

	function baz(): Source[] {
		return [];
	}

	it("should query resolvers for requested id", async () => {
		expect.assertions(1);
		const resolver = mockTransformerResolver("foo", foo);
		const spy = jest.spyOn(resolver, "resolveTransformer");
		await resolveTransformerAsync([resolver], "foo", { cache: false });
		expect(spy).toHaveBeenCalledWith("foo", { cache: false });
	});

	it("should return first matching entry", async () => {
		expect.assertions(1);
		const resolvers = [
			mockTransformerResolver("foo", foo),
			mockTransformerResolver("bar", bar),
			mockTransformerResolver("baz", baz),
		];
		const resolved = await resolveTransformerAsync(resolvers, "bar", { cache: false });
		expect(resolved).toEqual(bar);
	});

	it("should handle resolvers not implementing the requested type", async () => {
		expect.assertions(1);
		const resolvers = [mockEmptyResolver(), mockTransformerResolver("foo", foo)];
		const resolved = await resolveTransformerAsync(resolvers, "foo", { cache: false });
		expect(resolved).toEqual(foo);
	});

	it("should throw error if no entry matches", async () => {
		expect.assertions(1);
		const resolvers = [
			mockTransformerResolver("foo", foo),
			mockTransformerResolver("bar", bar),
			mockTransformerResolver("baz", foo),
		];
		await expect(() => {
			return resolveTransformerAsync(resolvers, "spam", { cache: false });
		}).rejects.toThrowErrorMatchingInlineSnapshot(`"Failed to load transformer from "spam""`);
	});
});
