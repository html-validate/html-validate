import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fs, vol } from "memfs";
import { type Transformer } from "../transform";
import { type FlatConfig } from "./flat-config";
import { FlatConfigLoader } from "./flat-config-loader";
import { loadFlatConfigFile } from "./load-flat-config-file";

jest.mock("./load-flat-config-file", () => ({
	loadFlatConfigFile: jest.fn(),
}));

jest.mock("node:fs", () => fs);

const mockLoadFlatConfigFile = jest.mocked(loadFlatConfigFile);

function serializeFlatConfig(config: FlatConfig): string {
	return JSON.stringify(config);
}

beforeEach(() => {
	vol.reset();
	mockLoadFlatConfigFile.mockReset().mockImplementation((filename: string) => {
		const content = fs.readFileSync(filename);
		const parsed = JSON.parse(content.toString()) as FlatConfig;
		return Promise.resolve(parsed);
	});
});

describe("FlatConfigLoader", () => {
	describe("fromDirectory()", () => {
		it("should return null when no flat config file is found", () => {
			expect.assertions(1);
			vol.fromJSON({ "/project/index.html": "" });
			const result = FlatConfigLoader.fromDirectory("/project");
			expect(result).toBeNull();
		});

		it("should return a loader when a flat config file is found", () => {
			expect.assertions(1);
			vol.fromJSON({ "/project/html-validate.config.js": "" });
			const result = FlatConfigLoader.fromDirectory("/project");
			expect(result).toBeInstanceOf(FlatConfigLoader);
		});

		it("should find a config file in a parent directory", () => {
			expect.assertions(1);
			vol.fromJSON({ "/project/html-validate.config.js": "" });
			const result = FlatConfigLoader.fromDirectory("/project/src");
			expect(result).toBeInstanceOf(FlatConfigLoader);
		});
	});

	describe("getConfigFor()", () => {
		it("should return empty config when no blocks match", async () => {
			expect.assertions(1);
			vol.fromJSON({
				"/project/html-validate.config.js": serializeFlatConfig([
					{
						files: ["**/*.html"],
						rules: {
							"no-self-closing": "error",
						},
					},
				]),
			});
			const loader = new FlatConfigLoader("/project/html-validate.config.js");
			const config = await loader.getConfigFor("/project/file.ts");
			const rules = Object.fromEntries(config.getRules().entries());
			expect(rules).toMatchInlineSnapshot(`{}`);
		});

		it("should apply a block with no files restriction to every file", async () => {
			expect.assertions(1);
			vol.fromJSON({
				["/project/html-validate.config.js"]: serializeFlatConfig([
					{
						rules: {
							"no-self-closing": "error",
						},
					},
				]),
			});
			const loader = new FlatConfigLoader("/project/html-validate.config.js");
			const config = await loader.getConfigFor("/project/file.html");
			const rules = Object.fromEntries(config.getRules().entries());
			expect(rules).toMatchInlineSnapshot(`
				{
				  "no-self-closing": [
				    2,
				    {},
				  ],
				}
			`);
		});

		it("should apply a block whose files glob matches the file", async () => {
			expect.assertions(1);
			vol.fromJSON({
				["/project/html-validate.config.js"]: serializeFlatConfig([
					{
						files: ["**/*.html"],
						rules: {
							"no-self-closing": "error",
						},
					},
				]),
			});
			const loader = new FlatConfigLoader("/project/html-validate.config.js");
			const config = await loader.getConfigFor("/project/file.html");
			const rules = Object.fromEntries(config.getRules().entries());
			expect(rules).toMatchInlineSnapshot(`
				{
				  "no-self-closing": [
				    2,
				    {},
				  ],
				}
			`);
		});

		it("should not apply a block whose files glob does not match", async () => {
			expect.assertions(1);
			vol.fromJSON({
				["/project/html-validate.config.js"]: serializeFlatConfig([
					{
						files: ["**/*.html"],
						rules: {
							"no-self-closing": "error",
						},
					},
				]),
			});
			const loader = new FlatConfigLoader("/project/html-validate.config.js");
			const config = await loader.getConfigFor("/project/file.vue");
			const rules = Object.fromEntries(config.getRules().entries());
			expect(rules).toMatchInlineSnapshot(`{}`);
		});

		it("should treat *.html as matching html files anywhere in the project", async () => {
			expect.assertions(2);
			vol.fromJSON({
				["/project/html-validate.config.js"]: serializeFlatConfig([
					{
						files: ["*.html"],
						rules: {
							"no-self-closing": "error",
						},
					},
				]),
			});
			const loader = new FlatConfigLoader("/project/html-validate.config.js");
			const shallow = await loader.getConfigFor("/project/file.html");
			const nested = await loader.getConfigFor("/project/src/file.html");
			const shallowRules = Object.fromEntries(shallow.getRules().entries());
			const nestedRules = Object.fromEntries(nested.getRules().entries());
			expect(shallowRules).toMatchInlineSnapshot(`
				{
				  "no-self-closing": [
				    2,
				    {},
				  ],
				}
			`);
			expect(nestedRules).toMatchInlineSnapshot(`
				{
				  "no-self-closing": [
				    2,
				    {},
				  ],
				}
			`);
		});

		it("should exclude a file matched by block-level ignores", async () => {
			expect.assertions(1);
			vol.fromJSON({
				["/project/html-validate.config.js"]: serializeFlatConfig([
					{
						ignores: ["**/ignored.html"],
						rules: {
							"no-self-closing": "error",
						},
					},
				]),
			});
			const loader = new FlatConfigLoader("/project/html-validate.config.js");
			const config = await loader.getConfigFor("/project/ignored.html");
			const rules = Object.fromEntries(config.getRules().entries());
			expect(rules).toMatchInlineSnapshot(`{}`);
		});

		it("should not exclude a file not matched by block-level ignores", async () => {
			expect.assertions(1);
			vol.fromJSON({
				["/project/html-validate.config.js"]: serializeFlatConfig([
					{
						ignores: ["**/ignored.html"],
						rules: {
							"no-self-closing": "error",
						},
					},
				]),
			});
			const loader = new FlatConfigLoader("/project/html-validate.config.js");
			const config = await loader.getConfigFor("/project/kept.html");
			const rules = Object.fromEntries(config.getRules().entries());
			expect(rules).toMatchInlineSnapshot(`
				{
				  "no-self-closing": [
				    2,
				    {},
				  ],
				}
			`);
		});

		it("should return empty config for a file matched by global ignores", async () => {
			expect.assertions(1);
			vol.fromJSON({
				["/project/html-validate.config.js"]: serializeFlatConfig([
					{
						ignores: ["dist/**"],
					},
					{
						rules: {
							"no-self-closing": "error",
						},
					},
				]),
			});
			const loader = new FlatConfigLoader("/project/html-validate.config.js");
			const config = await loader.getConfigFor("/project/dist/output.html");
			const rules = Object.fromEntries(config.getRules().entries());
			expect(rules).toMatchInlineSnapshot(`{}`);
		});

		it("should apply rules to a file not matched by global ignores", async () => {
			expect.assertions(1);
			vol.fromJSON({
				["/project/html-validate.config.js"]: serializeFlatConfig([
					{
						ignores: ["dist/**"],
					},
					{
						rules: {
							"no-self-closing": "error",
						},
					},
				]),
			});
			const loader = new FlatConfigLoader("/project/html-validate.config.js");
			const config = await loader.getConfigFor("/project/src/index.html");
			const rules = Object.fromEntries(config.getRules().entries());
			expect(rules).toMatchInlineSnapshot(`
				{
				  "no-self-closing": [
				    2,
				    {},
				  ],
				}
			`);
		});

		it("should merge rules from multiple matching blocks (last wins)", async () => {
			expect.assertions(1);
			vol.fromJSON({
				["/project/html-validate.config.js"]: serializeFlatConfig([
					{
						rules: {
							"no-self-closing": "error",
							deprecated: "warn",
						},
					},
					{
						files: ["**/*.html"],
						rules: {
							"no-self-closing": "warn",
						},
					},
				]),
			});
			const loader = new FlatConfigLoader("/project/html-validate.config.js");
			const config = await loader.getConfigFor("/project/file.html");
			const rules = Object.fromEntries(config.getRules().entries());
			expect(rules).toMatchInlineSnapshot(`
				{
				  "deprecated": [
				    1,
				    {},
				  ],
				  "no-self-closing": [
				    1,
				    {},
				  ],
				}
			`);
		});

		it("should merge configOverride rules on top of matching blocks", async () => {
			expect.assertions(1);
			vol.fromJSON({
				["/project/html-validate.config.js"]: serializeFlatConfig([
					{
						rules: {
							"no-self-closing": "error",
						},
					},
				]),
			});
			const loader = new FlatConfigLoader("/project/html-validate.config.js");
			const config = await loader.getConfigFor("/project/file.html", {
				rules: { "no-self-closing": "warn" },
			});
			const rules = Object.fromEntries(config.getRules().entries());
			expect(rules).toMatchInlineSnapshot(`
				{
				  "no-self-closing": [
				    1,
				    {},
				  ],
				}
			`);
		});

		it("should load element metadata from elements blocks", async () => {
			expect.assertions(1);
			mockLoadFlatConfigFile.mockResolvedValue([
				{
					elements: [{ p: {} }],
				},
			]);
			const loader = new FlatConfigLoader("/project/html-validate.config.js");
			const config = await loader.getConfigFor("/project/file.html");
			expect(config.getMetaTable().getMetaFor("p")).not.toBeNull();
		});

		it("should support rules in short array format [severity]", async () => {
			expect.assertions(1);
			mockLoadFlatConfigFile.mockResolvedValue([
				{
					rules: {
						"no-self-closing": ["error"],
					},
				},
			]);
			const loader = new FlatConfigLoader("/project/html-validate.config.js");
			const config = await loader.getConfigFor("/project/file.html");
			const rules = Array.from(config.getRules().entries());
			expect(rules).toMatchInlineSnapshot(`
				[
				  [
				    "no-self-closing",
				    [
				      2,
				      {},
				    ],
				  ],
				]
			`);
		});

		it("should support rules in full array format [severity, options]", async () => {
			expect.assertions(1);
			mockLoadFlatConfigFile.mockResolvedValue([
				{
					rules: {
						"no-self-closing": ["error", { style: "omit" }],
					},
				},
			]);
			const loader = new FlatConfigLoader("/project/html-validate.config.js");
			const config = await loader.getConfigFor("/project/file.html");
			const rules = Array.from(config.getRules().entries());
			expect(rules).toMatchInlineSnapshot(`
				[
				  [
				    "no-self-closing",
				    [
				      2,
				      {
				        "style": "omit",
				      },
				    ],
				  ],
				]
			`);
		});
	});

	it("should resolve filenames relative to the config file directory", async () => {
		expect.assertions(2);
		vol.fromJSON({
			["/project/html-validate.config.js"]: serializeFlatConfig([
				{
					files: ["src/**/*.html"],
					rules: {
						"no-self-closing": "error",
					},
				},
			]),
		});
		const loader = new FlatConfigLoader("/project/html-validate.config.js");
		const config1 = await loader.getConfigFor("/project/src/index.html");
		const config2 = await loader.getConfigFor("/project/foo/src/index.html");
		const rules1 = Object.fromEntries(config1.getRules().entries());
		const rules2 = Object.fromEntries(config2.getRules().entries());
		expect(rules1).toMatchInlineSnapshot(`
			{
			  "no-self-closing": [
			    2,
			    {},
			  ],
			}
		`);
		expect(rules2).toMatchInlineSnapshot(`{}`);
	});

	it("should not match a file outside the config directory pattern", async () => {
		expect.assertions(1);
		vol.fromJSON({
			["/project/html-validate.config.js"]: serializeFlatConfig([
				{
					files: ["src/**/*.html"],
					rules: {
						"no-self-closing": "error",
					},
				},
			]),
		});
		const loader = new FlatConfigLoader("/project/html-validate.config.js");
		const config = await loader.getConfigFor("/project/tests/index.html");
		const rules = Object.fromEntries(config.getRules().entries());
		expect(rules).toMatchInlineSnapshot(`{}`);
	});

	it("should build transform entries from a transform function", async () => {
		expect.assertions(2);
		const transformer = jest.fn() as unknown as Transformer;
		mockLoadFlatConfigFile.mockResolvedValue([
			{
				transform: { ".*\\.vue$": transformer },
			},
		]);
		const loader = new FlatConfigLoader("/project/html-validate.config.js");
		const config = await loader.getConfigFor("/project/file.vue");
		const entry = config.findTransformer("file.vue");
		expect(entry).toMatchObject({ kind: "function", function: transformer });
		expect(entry?.pattern).toEqual(/.*\.vue$/);
	});

	it("should return the same object on repeated calls for the same filename", async () => {
		expect.assertions(2);
		vol.fromJSON({
			["/project/html-validate.config.js"]: serializeFlatConfig([
				{ rules: { "no-self-closing": "error" } },
			]),
		});
		const loader = new FlatConfigLoader("/project/html-validate.config.js");
		const config1 = await loader.getConfigFor("/project/file.html");
		const config2 = await loader.getConfigFor("/project/file.html");
		expect(config1).toBe(config2);
		expect(mockLoadFlatConfigFile).toHaveBeenCalledTimes(1);
	});
});
