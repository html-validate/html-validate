import path from "node:path";
import { fileURLToPath } from "node:url";
import { type Source } from "../../../context";
import * as ResolveModule from "../../../resolve";
import { determineRootDir } from "./determine-root-dir";
import { esmResolver } from "./esm-resolver";
import * as ImportFunctionModule from "./import-function";
import { type ImportError } from "./internal-import";

let mockModules: Record<string, unknown>;
const mockResolve = jest.spyOn(ResolveModule, "importResolve");
const mockImport = ImportFunctionModule.importFunction as jest.Mock<unknown, [id: string]>; // mocked in jest.setup.js
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
	const error = new Error(`No mocked module named "${name}"`) as ImportError;
	error.code = "MODULE_NOT_FOUND";
	throw error;
}

beforeEach(() => {
	mockModules = {};
	mockResolve.mockReset().mockImplementation((name: string) => {
		if (mockModules[name]) {
			return new URL(`file:///\x00${name}`);
		} else {
			moduleNotFound(name);
		}
	});
	mockImport.mockReset().mockImplementation((name: string) => {
		name = fileURLToPath(name);
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

it("should return null if no entry was found", async () => {
	expect.assertions(4);
	const elements = await resolver.resolveElements("non-existing", { cache: true });
	const config = await resolver.resolveConfig("non-existing", { cache: true });
	const plugin = await resolver.resolvePlugin("non-existing", { cache: true });
	const transfomer = await resolver.resolveTransformer("non-existing", { cache: true });
	expect(elements).toBeNull();
	expect(config).toBeNull();
	expect(plugin).toBeNull();
	expect(transfomer).toBeNull();
});

it("should return null if entry resolves to non-file protocol", async () => {
	expect.assertions(4);
	mockResolve.mockImplementation(() => {
		return new URL("https://example.net");
	});
	const elements = await resolver.resolveElements("non-file", { cache: true });
	const config = await resolver.resolveConfig("non-file", { cache: true });
	const plugin = await resolver.resolvePlugin("non-file", { cache: true });
	const transfomer = await resolver.resolveTransformer("non-file", { cache: true });
	expect(elements).toBeNull();
	expect(config).toBeNull();
	expect(plugin).toBeNull();
	expect(transfomer).toBeNull();
});

it("should throw original error", async () => {
	expect.assertions(4);
	mockResolve.mockImplementation(() => {
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

	it("should expand relative paths to be relative to folder containing the module", async () => {
		expect.assertions(1);
		createMockedModule("/home/foo/projects/bar/mock-config", {
			elements: ["./my-elements", "other-elements"],
			extends: ["./my-extend", "other-extend"],
			plugins: ["./my-plugin", "other-plugin"],
		});
		const result = await resolver.resolveConfig("/home/foo/projects/bar/mock-config", {
			cache: true,
		});
		expect(result).toStrictEqual({
			elements: ["/home/foo/projects/bar/my-elements", "other-elements"],
			extends: ["/home/foo/projects/bar/my-extend", "other-extend"],
			plugins: ["/home/foo/projects/bar/my-plugin", "other-plugin"],
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

	it("should throw helpful error when trying to load unregistered plugin as transformer", async () => {
		expect.assertions(1);
		createMockedModule("mock-plugin-unregistered", { transformer: {} });
		await expect(() => {
			return resolver.resolveTransformer("mock-plugin-unregistered", { cache: true });
		}).rejects.toThrowErrorMatchingInlineSnapshot(
			`"Module "mock-plugin-unregistered" is not a valid transformer. This looks like a plugin, did you forget to load the plugin first?"`,
		);
	});

	it("should throw error when trying to load garbage as transformer", async () => {
		expect.assertions(1);
		createMockedModule("mock-garbage", "foobar");
		await expect(() => {
			return resolver.resolveTransformer("mock-garbage", { cache: true });
		}).rejects.toThrowErrorMatchingInlineSnapshot(
			`"Module "mock-garbage" is not a valid transformer."`,
		);
	});
});

describe("<rootDir>", () => {
	it("should resolve item with <rootDir> (default root dir)", async () => {
		expect.assertions(1);
		const rootDir = determineRootDir();
		const resolver = esmResolver({});
		createMockedModule(path.join(rootDir, "mock-elements"), { "my-element": {} });
		const result = await resolver.resolveElements("<rootDir>/mock-elements", { cache: true });
		expect(result).toEqual({ "my-element": {} });
	});

	it("should resolve item with <rootDir> (explicit root dir)", async () => {
		expect.assertions(1);
		const rootDir = "/home/foo/project/bar";
		const resolver = esmResolver({ rootDir });
		createMockedModule(path.join(rootDir, "mock-elements"), { "my-element": {} });
		const result = await resolver.resolveElements("<rootDir>/mock-elements", { cache: true });
		expect(result).toEqual({ "my-element": {} });
	});
});
