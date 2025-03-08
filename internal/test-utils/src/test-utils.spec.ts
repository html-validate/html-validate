import fs from "fs";
import { type Source } from "html-validate";
import {
	type Transformer,
	type TransformerChainedResult,
	transformFile,
	transformSource,
	transformString,
} from "./test-utils";

jest.mock("fs");

it("transformFile() should read file and apply transformer", async () => {
	expect.assertions(2);
	const transformer: Transformer = (source) => [source];
	const readFileSync = jest.spyOn(fs, "readFileSync").mockImplementation(() => "mocked file data");
	const result = await transformFile(transformer, "foo.html");
	expect(readFileSync).toHaveBeenCalledWith("foo.html", "utf-8");
	expect(result).toMatchInlineSnapshot(`
		[
		  {
		    "column": 1,
		    "data": "mocked file data",
		    "filename": "foo.html",
		    "line": 1,
		    "offset": 0,
		  },
		]
	`);
});

it("transformString() should apply transformer", async () => {
	expect.assertions(1);
	const transformer: Transformer = (source) => [source];
	const result = await transformString(transformer, "inline data");
	expect(result).toMatchInlineSnapshot(`
		[
		  {
		    "column": 1,
		    "data": "inline data",
		    "filename": "inline",
		    "line": 1,
		    "offset": 0,
		  },
		]
	`);
});

it("transformSource() should apply transformer", async () => {
	expect.assertions(1);
	const source: Source = {
		filename: "bar.html",
		line: 1,
		column: 2,
		offset: 3,
		data: "source data",
	};
	const transformer: Transformer = (source) => [source];
	const result = await transformSource(transformer, source);
	expect(result).toMatchInlineSnapshot(`
		[
		  {
		    "column": 2,
		    "data": "source data",
		    "filename": "bar.html",
		    "line": 1,
		    "offset": 3,
		  },
		]
	`);
});

it("transformSource() should support chaining", async () => {
	expect.assertions(1);
	const source: Source = {
		filename: "bar.html",
		line: 1,
		column: 2,
		offset: 3,
		data: "source data",
	};
	const transformer: Transformer = function mockTransformer(source) {
		return this.chain(source, "chained.html");
	};
	const result = await transformSource(transformer, source);
	expect(result).toMatchInlineSnapshot(`
		[
		  {
		    "column": 2,
		    "data": "source data",
		    "filename": "bar.html",
		    "line": 1,
		    "offset": 3,
		  },
		]
	`);
});

it("transformSource() should support custom chaining", async () => {
	expect.assertions(2);
	const source: Source = {
		filename: "bar.html",
		line: 1,
		column: 2,
		offset: 3,
		data: "source data",
	};
	const chain: (source: Source) => TransformerChainedResult = jest.fn((source) => [source]);
	const transformer: Transformer = function mockTransformer(source) {
		return this.chain(source, "chained.html");
	};
	const result = await transformSource(transformer, source, chain);
	expect(chain).toHaveBeenCalledWith(source, "chained.html");
	expect(result).toMatchInlineSnapshot(`
		[
		  {
		    "column": 2,
		    "data": "source data",
		    "filename": "bar.html",
		    "line": 1,
		    "offset": 3,
		  },
		]
	`);
});

it("should handle transformer returning Source", async () => {
	expect.assertions(1);
	const source: Source = {
		filename: "bar.html",
		line: 1,
		column: 2,
		offset: 3,
		data: "source data",
	};
	const transformer: Transformer = (source) => source;
	const result = await transformSource(transformer, source);
	expect(result).toMatchInlineSnapshot(`
		[
		  {
		    "column": 2,
		    "data": "source data",
		    "filename": "bar.html",
		    "line": 1,
		    "offset": 3,
		  },
		]
	`);
});

it("should handle transformer returning Source[]", async () => {
	expect.assertions(1);
	const source: Source = {
		filename: "bar.html",
		line: 1,
		column: 2,
		offset: 3,
		data: "source data",
	};
	const transformer: Transformer = (source) => [source];
	const result = await transformSource(transformer, source);
	expect(result).toMatchInlineSnapshot(`
		[
		  {
		    "column": 2,
		    "data": "source data",
		    "filename": "bar.html",
		    "line": 1,
		    "offset": 3,
		  },
		]
	`);
});

it("should handle transformer returning Promise<Source>", async () => {
	expect.assertions(1);
	const source: Source = {
		filename: "bar.html",
		line: 1,
		column: 2,
		offset: 3,
		data: "source data",
	};
	const transformer: Transformer = (source) => Promise.resolve(source);
	const result = await transformSource(transformer, source);
	expect(result).toMatchInlineSnapshot(`
		[
		  {
		    "column": 2,
		    "data": "source data",
		    "filename": "bar.html",
		    "line": 1,
		    "offset": 3,
		  },
		]
	`);
});

it("should handle transformer returning Promise<Source>[]", async () => {
	expect.assertions(1);
	const source: Source = {
		filename: "bar.html",
		line: 1,
		column: 2,
		offset: 3,
		data: "source data",
	};
	const transformer: Transformer = (source) => [Promise.resolve(source)];
	const result = await transformSource(transformer, source);
	expect(result).toMatchInlineSnapshot(`
		[
		  {
		    "column": 2,
		    "data": "source data",
		    "filename": "bar.html",
		    "line": 1,
		    "offset": 3,
		  },
		]
	`);
});

it("should handle transformer returning Promise<Source[]>", async () => {
	expect.assertions(1);
	const source: Source = {
		filename: "bar.html",
		line: 1,
		column: 2,
		offset: 3,
		data: "source data",
	};
	const transformer: Transformer = (source) => Promise.resolve([source]);
	const result = await transformSource(transformer, source);
	expect(result).toMatchInlineSnapshot(`
		[
		  {
		    "column": 2,
		    "data": "source data",
		    "filename": "bar.html",
		    "line": 1,
		    "offset": 3,
		  },
		]
	`);
});
