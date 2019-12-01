import fs from "fs";
import { TransformContext } from ".";
import { Source } from "../context";
import { transformFile, transformSource, transformString } from "./test-utils";

jest.mock("fs");

it("transformFile() should read file and apply transformer", () => {
	const transformer = jest.fn((source: Source) => [source]);
	const readFileSync = jest
		.spyOn(fs, "readFileSync")
		.mockImplementation(() => "mocked file data");
	const result = transformFile(transformer, "foo.html");
	expect(readFileSync).toHaveBeenCalledWith("foo.html", "utf-8");
	expect(result).toMatchInlineSnapshot(`
		Array [
		  Object {
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
	const transformer = jest.fn((source: Source) => [source]);
	const result = transformString(transformer, "inline data");
	expect(result).toMatchInlineSnapshot(`
		Array [
		  Object {
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
	const source: Source = {
		filename: "bar.html",
		line: 1,
		column: 2,
		offset: 3,
		data: "source data",
	};
	const transformer = jest.fn((source: Source) => [source]);
	const result = transformSource(transformer, source);
	expect(result).toMatchInlineSnapshot(`
		Array [
		  Object {
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
	const source: Source = {
		filename: "bar.html",
		line: 1,
		column: 2,
		offset: 3,
		data: "source data",
	};
	const transformer = jest.fn(function(this: TransformContext, source: Source) {
		return this.chain(source, "chained.html");
	});
	const result = transformSource(transformer, source);
	expect(result).toMatchInlineSnapshot(`
		Array [
		  Object {
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
	const source: Source = {
		filename: "bar.html",
		line: 1,
		column: 2,
		offset: 3,
		data: "source data",
	};
	const chain = jest.fn((source: Source) => [source]);
	const transformer = jest.fn(function(this: TransformContext, source: Source) {
		return this.chain(source, "chained.html");
	});
	const result = transformSource(transformer, source, chain);
	expect(chain).toHaveBeenCalledWith(source, "chained.html");
	expect(result).toMatchInlineSnapshot(`
		Array [
		  Object {
		    "column": 2,
		    "data": "source data",
		    "filename": "bar.html",
		    "line": 1,
		    "offset": 3,
		  },
		]
	`);
});
