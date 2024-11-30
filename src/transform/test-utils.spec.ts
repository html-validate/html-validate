import fs from "fs";
import { type Source } from "../context";
import { type Transformer, transformFile, transformSource, transformString } from "./test-utils";

jest.mock("fs");

it("transformFile() should read file and apply transformer", () => {
	expect.assertions(2);
	const transformer: Transformer = (source) => [source];
	const readFileSync = jest.spyOn(fs, "readFileSync").mockImplementation(() => "mocked file data");
	const result = transformFile(transformer, "foo.html");
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

it("transformString() should apply transformer", () => {
	expect.assertions(1);
	const transformer: Transformer = (source) => [source];
	const result = transformString(transformer, "inline data");
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

it("transformSource() should apply transformer", () => {
	expect.assertions(1);
	const source: Source = {
		filename: "bar.html",
		line: 1,
		column: 2,
		offset: 3,
		data: "source data",
	};
	const transformer: Transformer = (source) => [source];
	const result = transformSource(transformer, source);
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

it("transformSource() should support chaining", () => {
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
	const result = transformSource(transformer, source);
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

it("transformSource() should support custom chaining", () => {
	expect.assertions(2);
	const source: Source = {
		filename: "bar.html",
		line: 1,
		column: 2,
		offset: 3,
		data: "source data",
	};
	const chain: Transformer = jest.fn((source) => [source]);
	const transformer: Transformer = function mockTransformer(source) {
		return this.chain(source, "chained.html");
	};
	const result = transformSource(transformer, source, chain);
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
