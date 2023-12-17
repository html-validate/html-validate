import fs from "node:fs";
import path from "node:path";
import { Console } from "node:console";
import { WritableStreamBuffer } from "stream-buffers";
import Ajv, { type SchemaObject } from "ajv";
import kleur from "kleur";
import { SchemaValidationError } from "../../error";
import { stripAnsi } from "../../jest/utils";
import { ajvFunctionKeyword, ajvRegexpKeyword } from "../../schema/keywords";
import { handleSchemaValidationError } from "./handle-schema-validation-error";

kleur.enabled = true;

let stdout: WritableStreamBuffer;
let stderr: WritableStreamBuffer;
let console: Console;

beforeEach(() => {
	stdout = new WritableStreamBuffer();
	stderr = new WritableStreamBuffer();
	console = new Console(stdout, stderr);
});

function loadFixture(filename: string): { data: unknown; filePath: string } {
	const filePath = path.join(__dirname, "__fixtures__", filename);
	return { data: JSON.parse(fs.readFileSync(filePath, "utf-8")), filePath };
}

function errorFromFixture(
	filename: string | null,
	data: unknown,
	schema: SchemaObject,
): SchemaValidationError {
	const ajv = new Ajv({ strict: true, strictTuples: true, strictTypes: true });
	ajv.addKeyword(ajvFunctionKeyword);
	ajv.addKeyword(ajvRegexpKeyword);
	const validator = ajv.compile(schema);
	validator(data);
	const errors = validator.errors ?? [];
	return new SchemaValidationError(filename, "Mock error", data, schema, errors);
}

it("should present error in pretty format", () => {
	expect.assertions(2);
	const { data, filePath } = loadFixture("invalid.json");
	const error = errorFromFixture(filePath, data, {
		type: "object",
		properties: {
			foo: {
				type: "string",
			},
		},
	});
	handleSchemaValidationError(console, error);
	expect(stripAnsi(stdout.getContentsAsString("utf-8"))).toMatchSnapshot("stdout");
	expect(stripAnsi(stderr.getContentsAsString("utf-8"))).toMatchSnapshot("stderr");
});

it("should handle when filename is missing", () => {
	expect.assertions(2);
	const { data } = loadFixture("invalid.json");
	const error = errorFromFixture(null, data, {
		type: "object",
		properties: {
			foo: {
				type: "string",
			},
		},
	});
	handleSchemaValidationError(console, error);
	expect(stripAnsi(stdout.getContentsAsString("utf-8"))).toMatchSnapshot("stdout");
	expect(stripAnsi(stderr.getContentsAsString("utf-8"))).toMatchSnapshot("stderr");
});

it("should handle when filename does not exist", () => {
	expect.assertions(2);
	const { data } = loadFixture("invalid.json");
	const error = errorFromFixture("missing-file.json", data, {
		type: "object",
		properties: {
			foo: {
				type: "string",
			},
		},
	});
	handleSchemaValidationError(console, error);
	expect(stripAnsi(stdout.getContentsAsString("utf-8"))).toMatchSnapshot("stdout");
	expect(stripAnsi(stderr.getContentsAsString("utf-8"))).toMatchSnapshot("stderr");
});

it("should handle function keyword", () => {
	expect.assertions(2);
	const { data, filePath } = loadFixture("invalid.json");
	const error = errorFromFixture(filePath, data, {
		type: "object",
		properties: {
			foo: {
				function: true,
			},
		},
	});
	handleSchemaValidationError(console, error);
	expect(stripAnsi(stdout.getContentsAsString("utf-8"))).toMatchSnapshot("stdout");
	expect(stripAnsi(stderr.getContentsAsString("utf-8"))).toMatchSnapshot("stderr");
});

it("should handle regexp keyword", () => {
	expect.assertions(2);
	const { data, filePath } = loadFixture("invalid.json");
	const error = errorFromFixture(filePath, data, {
		type: "object",
		properties: {
			foo: {
				regexp: true,
			},
		},
	});
	handleSchemaValidationError(console, error);
	expect(stripAnsi(stdout.getContentsAsString("utf-8"))).toMatchSnapshot("stdout");
	expect(stripAnsi(stderr.getContentsAsString("utf-8"))).toMatchSnapshot("stderr");
});
