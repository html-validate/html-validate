import fs from "fs";
import path from "node:path";
import Ajv, { SchemaObject } from "ajv";
import { MetaElement } from "../meta/element";
import { MetaTable } from "../meta/table";
import { SchemaValidationError } from "./schema-validation-error";

function stripAnsi(text: string): string {
	/* eslint-disable-next-line no-control-regex -- technical debt, should use the one in jest/utils/strip-ansi */
	return text.replace(/\u001B\[[0-9;]*m/g, "");
}

it("SchemaValidationError should pretty-print validation errors", () => {
	expect.assertions(1);
	const table = new MetaTable();
	try {
		table.loadFromObject({
			foo: {
				flow: "spam",
			} as unknown as MetaElement,
		});
	} catch (err) {
		if (err instanceof SchemaValidationError) {
			const output = err.prettyError();

			/* cannot test prettyError() method with builtin helpers */
			/* eslint-disable-next-line jest/no-conditional-expect -- see above comment, protected by expect.assertions(..) */
			expect(stripAnsi(output)).toMatchSnapshot();
		}
	}
});

describe("prettyError()", () => {
	const ajv = new Ajv({ strict: true, strictTuples: true, strictTypes: true });
	const schema: SchemaObject = {
		type: "string",
	};
	const validator = ajv.compile(schema);
	const filename = path.join(__dirname, "__fixtures__", "invalid.json");
	const data = JSON.parse(fs.readFileSync(filename, "utf-8"));
	validator(data);
	const errors = validator.errors ?? [];

	it("should contain original formatting", () => {
		expect.assertions(1);
		const error = new SchemaValidationError(filename, "Mock error", data, schema, errors);
		expect(stripAnsi(error.prettyError())).toMatchInlineSnapshot(`
			"TYPE must be string

			> 1 | {
			    | ^
			> 2 |   "foo": [1, 2, 3],
			    | ^^^^^^^^^^^^^^^^^^^
			> 3 |   "bar": "baz"
			    | ^^^^^^^^^^^^^^^^^^^
			> 4 | }
			    | ^^ 👈🏽  type must be string
			  5 |"
		`);
	});

	it("should handle invalid file", () => {
		expect.assertions(1);
		const error = new SchemaValidationError("invalid-file", "Mock error", data, schema, errors);
		expect(stripAnsi(error.prettyError())).toMatchInlineSnapshot(`
			"TYPE must be string

			> 1 | {
			    | ^
			> 2 |   "foo": [
			    | ^^^^^^^^^^
			> 3 |     1,
			    | ^^^^^^^^^^
			> 4 |     2,
			    | ^^^^^^^^^^
			> 5 |     3
			    | ^^^^^^^^^^
			> 6 |   ],
			    | ^^^^^^^^^^
			> 7 |   "bar": "baz"
			    | ^^^^^^^^^^
			> 8 | }
			    | ^^ 👈🏽  type must be string"
		`);
	});

	it("should handle missing filename", () => {
		expect.assertions(1);
		const error = new SchemaValidationError(null, "Mock error", data, schema, errors);
		expect(stripAnsi(error.prettyError())).toMatchInlineSnapshot(`
			"TYPE must be string

			> 1 | {
			    | ^
			> 2 |   "foo": [
			    | ^^^^^^^^^^
			> 3 |     1,
			    | ^^^^^^^^^^
			> 4 |     2,
			    | ^^^^^^^^^^
			> 5 |     3
			    | ^^^^^^^^^^
			> 6 |   ],
			    | ^^^^^^^^^^
			> 7 |   "bar": "baz"
			    | ^^^^^^^^^^
			> 8 | }
			    | ^^ 👈🏽  type must be string"
		`);
	});
});
