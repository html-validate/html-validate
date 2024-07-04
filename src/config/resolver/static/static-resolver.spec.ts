import { type Source } from "../../../context";
import { type StaticResolver, staticResolver } from "./static-resolver";

function fooTransformer(): Source[] {
	return [];
}

let resolver: StaticResolver;

beforeEach(() => {
	resolver = staticResolver({
		elements: {
			foo: {
				"my-element": {},
			},
		},
		configs: {
			foo: {
				rules: {
					"my-rule": "error",
				},
			},
		},
		plugins: {
			foo: {
				name: "foo-plugin",
			},
		},
		transformers: {
			foo: fooTransformer,
		},
	});
});

it("should resolve elements", () => {
	expect.assertions(1);
	const result = resolver.resolveElements("foo", { cache: false });
	expect(result).toEqual({ "my-element": {} });
});

it("should resolve config", () => {
	expect.assertions(1);
	const result = resolver.resolveConfig("foo", { cache: false });
	expect(result).toEqual({ rules: { "my-rule": "error" } });
});

it("should resolve plugin", () => {
	expect.assertions(1);
	const result = resolver.resolvePlugin("foo", { cache: false });
	expect(result).toEqual({ name: "foo-plugin" });
});

it("should resolve transformer", () => {
	expect.assertions(1);
	const result = resolver.resolveTransformer("foo", { cache: false });
	expect(result).toEqual(fooTransformer);
});

it("should return null if no entry was found", () => {
	expect.assertions(4);
	const resolver = staticResolver();
	const elements = resolver.resolveElements("non-existing", { cache: false });
	const config = resolver.resolveConfig("non-existing", { cache: false });
	const plugin = resolver.resolvePlugin("non-existing", { cache: false });
	const transfomer = resolver.resolveTransformer("non-existing", { cache: false });
	expect(elements).toBeNull();
	expect(config).toBeNull();
	expect(plugin).toBeNull();
	expect(transfomer).toBeNull();
});

it("should support dynamically adding elements", () => {
	expect.assertions(1);
	resolver.addElements("bar", { "other-element": {} });
	const result = resolver.resolveElements("bar", { cache: false });
	expect(result).toEqual({ "other-element": {} });
});

it("should support dynamically adding config", () => {
	expect.assertions(1);
	resolver.addConfig("bar", { rules: { "other-rule": "error" } });
	const result = resolver.resolveConfig("bar", { cache: false });
	expect(result).toEqual({ rules: { "other-rule": "error" } });
});

it("should support dynamically adding plugins", () => {
	expect.assertions(1);
	resolver.addPlugin("bar", { name: "bar-plugin" });
	const result = resolver.resolvePlugin("bar", { cache: false });
	expect(result).toEqual({ name: "bar-plugin" });
});

it("should support dynamically adding transfomers", () => {
	expect.assertions(1);
	function barTransformer(): Source[] {
		return [];
	}
	resolver.addTransformer("bar", barTransformer);
	const result = resolver.resolveTransformer("bar", { cache: false });
	expect(result).toEqual(barTransformer);
});
