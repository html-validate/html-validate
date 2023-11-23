import path from "node:path";
import { Source } from "../../../context";
import * as resolve from "../../../resolve";
import { type RequireError, nodejsResolver } from "./nodejs-resolver";
import { determineRootDir } from "./determine-root-dir";

jest.mock("../../../resolve");

let mockModules: Record<string, unknown>;
const legacyRequire = jest.spyOn(resolve, "legacyRequire");

function createMockedModule(name: string, content: unknown): void {
	mockModules[name] = content;
}

beforeEach(() => {
	mockModules = {};
	legacyRequire.mockReset().mockImplementation((name: string) => {
		if (mockModules[name]) {
			return mockModules[name];
		} else {
			const error = new Error(`No mocked module named "${name}"`) as RequireError;
			error.code = "MODULE_NOT_FOUND";
			throw error;
		}
	});
});

const resolver = nodejsResolver();

it("should return null if no entry was found", () => {
	expect.assertions(4);
	const elements = resolver.resolveElements("non-existing", { cache: true });
	const config = resolver.resolveConfig("non-existing", { cache: true });
	const plugin = resolver.resolvePlugin("non-existing", { cache: true });
	const transfomer = resolver.resolveTransformer("non-existing", { cache: true });
	expect(elements).toBeNull();
	expect(config).toBeNull();
	expect(plugin).toBeNull();
	expect(transfomer).toBeNull();
});

it("should throw original error", () => {
	expect.assertions(4);
	legacyRequire.mockImplementation(() => {
		throw new Error("mock error");
	});
	const elements = (): unknown => resolver.resolveElements("faulty-module", { cache: true });
	const config = (): unknown => resolver.resolveConfig("faulty-module", { cache: true });
	const plugin = (): unknown => resolver.resolvePlugin("faulty-module", { cache: true });
	const transfomer = (): unknown => resolver.resolveTransformer("faulty-module", { cache: true });
	expect(elements).toThrow("mock error");
	expect(config).toThrow("mock error");
	expect(plugin).toThrow("mock error");
	expect(transfomer).toThrow("mock error");
});

describe("resolveElements()", () => {
	it("should resolve elements from module", () => {
		expect.assertions(1);
		createMockedModule("mock-elements", { "my-element": {} });
		const result = resolver.resolveElements("mock-elements", { cache: true });
		expect(result).toEqual({ "my-element": {} });
	});
});

describe("resolveConfig()", () => {
	it("should resolve config from module", () => {
		expect.assertions(1);
		createMockedModule("mock-config", { rules: { "my-rule": "error" } });
		const result = resolver.resolveConfig("mock-config", { cache: true });
		expect(result).toStrictEqual({
			rules: { "my-rule": "error" },
		});
	});

	it("should expand relative paths to be relative to folder containing the module", () => {
		expect.assertions(1);
		createMockedModule("/home/foo/projects/bar/mock-config", {
			elements: ["./my-elements", "other-elements"],
			extends: ["./my-extend", "other-extend"],
			plugins: ["./my-plugin", "other-plugin"],
		});
		const result = resolver.resolveConfig("/home/foo/projects/bar/mock-config", { cache: true });
		expect(result).toStrictEqual({
			elements: ["/home/foo/projects/bar/my-elements", "other-elements"],
			extends: ["/home/foo/projects/bar/my-extend", "other-extend"],
			plugins: ["/home/foo/projects/bar/my-plugin", "other-plugin"],
		});
	});
});

describe("resolvePlugin()", () => {
	it("should resolve plugin from module", () => {
		expect.assertions(1);
		createMockedModule("mock-plugin", { name: "mock-plugin" });
		const result = resolver.resolvePlugin("mock-plugin", { cache: true });
		expect(result).toEqual({ name: "mock-plugin" });
	});
});

describe("resolveTransformer()", () => {
	it("should resolve transformer function from module", () => {
		expect.assertions(1);
		function foo(): Source[] {
			return [];
		}
		createMockedModule("mock-transformer", foo);
		const result = resolver.resolveTransformer("mock-transformer", { cache: true });
		expect(result).toEqual(foo);
	});

	it("should throw helpful error when trying to load unregistered plugin as transformer", () => {
		expect.assertions(1);
		createMockedModule("mock-plugin-unregistered", { transformer: {} });
		expect(() => {
			resolver.resolveTransformer("mock-plugin-unregistered", { cache: true });
		}).toThrowErrorMatchingInlineSnapshot(
			`"Module "mock-plugin-unregistered" is not a valid transformer. This looks like a plugin, did you forget to load the plugin first?"`,
		);
	});

	it("should throw error when trying to load garbage as transformer", () => {
		expect.assertions(1);
		createMockedModule("mock-garbage", "foobar");
		expect(() => {
			resolver.resolveTransformer("mock-garbage", { cache: true });
		}).toThrowErrorMatchingInlineSnapshot(`"Module "mock-garbage" is not a valid transformer."`);
	});
});

describe("<rootDir>", () => {
	it("should resolve item with <rootDir> (default root dir)", () => {
		expect.assertions(1);
		const rootDir = determineRootDir();
		const resolver = nodejsResolver({});
		createMockedModule(path.join(rootDir, "mock-elements"), { "my-element": {} });
		const result = resolver.resolveElements("<rootDir>/mock-elements", { cache: true });
		expect(result).toEqual({ "my-element": {} });
	});

	it("should resolve item with <rootDir> (explicit root dir)", () => {
		expect.assertions(1);
		const rootDir = "/home/foo/project/bar";
		const resolver = nodejsResolver({ rootDir });
		createMockedModule(path.join(rootDir, "mock-elements"), { "my-element": {} });
		const result = resolver.resolveElements("<rootDir>/mock-elements", { cache: true });
		expect(result).toEqual({ "my-element": {} });
	});
});
