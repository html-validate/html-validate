import Ajv from "ajv";
import { SchemaValidationError } from "../../error";
import { stripAnsi } from "../../jest/utils";
import { ajvRegexpKeyword } from "./regexp";

const ajv = new Ajv({ strict: true, strictTuples: true, strictTypes: true });
ajv.addKeyword(ajvRegexpKeyword);

it("should pass if value is regexp", () => {
	expect.assertions(2);
	const schema = { regexp: true };
	const validate = ajv.compile(schema);
	const data = /foo/;
	expect(validate(data)).toBeTruthy();
	expect(validate.errors).toBeNull();
});

it("should fail if value it not regex", () => {
	expect.assertions(2);
	const schema = { regexp: true };
	const validate = ajv.compile(schema);
	const data = "foo";
	expect(validate(data)).toBeFalsy();
	expect(validate.errors).toMatchInlineSnapshot(`
		[
		  {
		    "instancePath": "",
		    "keyword": "type",
		    "message": "should be a regular expression",
		    "params": {
		      "keyword": "type",
		    },
		    "schemaPath": "#/regexp",
		  },
		]
	`);
});

it("should be supported by SchemaValidationError", () => {
	expect.assertions(1);
	const schema = { regexp: true };
	const validate = ajv.compile(schema);
	const data = "foo";
	validate(data);
	const error = new SchemaValidationError(
		"mock-filename",
		`Mock message`,
		data,
		schema,
		validate.errors ?? [],
	);
	expect(stripAnsi(error.prettyError())).toMatchInlineSnapshot(`
		"TYPE should be a regular expression

		> 1 | "foo"
		    | ^^^^^ 👈🏽  type should be a regular expression"
	`);
});
