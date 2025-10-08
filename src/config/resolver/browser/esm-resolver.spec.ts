import { type Source } from "../../../context";
import { esmResolver } from "./esm-resolver";
import * as ImportFunctionModule from "./import-function";

let mockModules: Record<string, unknown>;
const mockImport = jest.spyOn(ImportFunctionModule, "importFunction");
const resolver = esmResolver();

function createMockedModule(
	name: string,
	content: unknown,
	options: { default: boolean } = { default: true },
): void {
	if (options.default) {
		mockModules[name] = { default: content };
	} else {
		mockModules[name] = content;
	}
}

function moduleNotFound(name: string): never {
	throw new Error(`No mocked module named "${name}"`);
}

beforeEach(() => {
	mockModules = {};
	mockImport.mockReset().mockImplementation(async (name: string) => {
		if (name.startsWith("/\x00")) {
			name = name.slice(2);
		}
		if (mockModules[name]) {
			return mockModules[name];
		} else {
			moduleNotFound(name);
		}
	});
});

it("should throw error if import fails", async () => {
	expect.assertions(4);
	mockImport.mockImplementation(() => {
		throw new Error("mock error");
	});
	const elements = (): unknown => resolver.resolveElements("faulty-module", { cache: true });
	const config = (): unknown => resolver.resolveConfig("faulty-module", { cache: true });
	const plugin = (): unknown => resolver.resolvePlugin("faulty-module", { cache: true });
	const transfomer = (): unknown => resolver.resolveTransformer("faulty-module", { cache: true });
	await expect(elements).rejects.toThrow("mock error");
	await expect(config).rejects.toThrow("mock error");
	await expect(plugin).rejects.toThrow("mock error");
	await expect(transfomer).rejects.toThrow("mock error");
});

it("should throw error if not using default export", async () => {
	expect.assertions(4);
	createMockedModule("named-export-only", {}, { default: false });
	const elements = (): unknown => resolver.resolveElements("named-export-only", { cache: true });
	const config = (): unknown => resolver.resolveConfig("named-export-only", { cache: true });
	const plugin = (): unknown => resolver.resolvePlugin("named-export-only", { cache: true });
	const transfomer = (): unknown =>
		resolver.resolveTransformer("named-export-only", { cache: true });
	await expect(elements).rejects.toThrow(`"named-export-only" does not have a default export`);
	await expect(config).rejects.toThrow(`"named-export-only" does not have a default export`);
	await expect(plugin).rejects.toThrow(`"named-export-only" does not have a default export`);
	await expect(transfomer).rejects.toThrow(`"named-export-only" does not have a default export`);
});

describe("resolveElements()", () => {
	it("should resolve elements from module", async () => {
		expect.assertions(1);
		createMockedModule("mock-elements", { "my-element": {} });
		const result = await resolver.resolveElements("mock-elements", { cache: true });
		expect(result).toEqual({ "my-element": {} });
	});
});

describe("resolveConfig()", () => {
	it("should resolve config from module", async () => {
		expect.assertions(1);
		createMockedModule("mock-config", { rules: { "my-rule": "error" } });
		const result = await resolver.resolveConfig("mock-config", { cache: true });
		expect(result).toStrictEqual({
			rules: { "my-rule": "error" },
		});
	});
});

describe("resolvePlugin()", () => {
	it("should resolve plugin from module", async () => {
		expect.assertions(1);
		createMockedModule("mock-plugin", { name: "mock-plugin" });
		const result = await resolver.resolvePlugin("mock-plugin", { cache: true });
		expect(result).toEqual({ name: "mock-plugin" });
	});
});

describe("resolveTransformer()", () => {
	it("should resolve transformer function from module", async () => {
		expect.assertions(1);
		function foo(): Source[] {
			return [];
		}
		createMockedModule("mock-transformer", foo);
		const result = await resolver.resolveTransformer("mock-transformer", { cache: true });
		expect(result).toEqual(foo);
	});
});
