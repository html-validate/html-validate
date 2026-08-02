import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fs, vol } from "memfs";
import { loadFlatConfigFile } from "./load-flat-config-file.nodejs";

jest.mock("node:fs/promises", () => fs.promises);

const filePath = "/path/to/html-validate.config.mjs";

function mockImport(value: unknown): () => Promise<unknown> {
	return () => Promise.resolve({ default: value });
}

beforeEach(() => {
	vol.reset();
	vol.fromJSON({
		[filePath]: ``,
	});
});

describe("loadFlatConfigFile()", () => {
	it("should load a valid flat config array", async () => {
		expect.assertions(1);
		const mock = [{ rules: { "no-self-closing": "error" } }];
		const result = await loadFlatConfigFile(filePath, mockImport(mock));
		expect(result).toEqual([{ rules: { "no-self-closing": "error" } }]);
	});

	it("should silently ignore null entries", async () => {
		expect.assertions(1);
		const mock = [null, { rules: {} }];
		const result = await loadFlatConfigFile(filePath, mockImport(mock));
		expect(result).toEqual([{ rules: {} }]);
	});

	it("should silently ignore undefined entries", async () => {
		expect.assertions(1);
		const mock = [undefined, { rules: {} }];
		const result = await loadFlatConfigFile(filePath, mockImport(mock));
		expect(result).toEqual([{ rules: {} }]);
	});

	it("should throw when the default export is not an array", async () => {
		expect.assertions(3);
		await expect(loadFlatConfigFile(filePath, mockImport({}))).rejects.toThrow(
			`Flat config file "${filePath}" must have a default export that is an array of configuration objects`,
		);
		await expect(loadFlatConfigFile(filePath, mockImport("lorem ipsum"))).rejects.toThrow(
			`Flat config file "${filePath}" must have a default export that is an array of configuration objects`,
		);
		await expect(loadFlatConfigFile(filePath, mockImport(42))).rejects.toThrow(
			`Flat config file "${filePath}" must have a default export that is an array of configuration objects`,
		);
	});

	it("should throw when an entry is not a valid configuration object", async () => {
		expect.assertions(3);
		await expect(loadFlatConfigFile(filePath, mockImport([[]]))).rejects.toThrow(
			`Flat config file "${filePath}" must have a default export that is an array of configuration objects`,
		);
		await expect(loadFlatConfigFile(filePath, mockImport(["lorem ipsum"]))).rejects.toThrow(
			`Flat config file "${filePath}" must have a default export that is an array of configuration objects`,
		);
		await expect(loadFlatConfigFile(filePath, mockImport([42]))).rejects.toThrow(
			`Flat config file "${filePath}" must have a default export that is an array of configuration objects`,
		);
	});
});
