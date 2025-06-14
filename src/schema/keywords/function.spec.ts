import Ajv from "ajv";
import { ajvFunctionKeyword } from "./function";

const ajv = new Ajv({ strict: true, strictTuples: true, strictTypes: true });
ajv.addKeyword(ajvFunctionKeyword);

const schema = {
	type: "object",
	properties: {
		foo: {
			function: true,
		},
	},
};
const validate = ajv.compile(schema);

it("should give error if value isn't function", () => {
	expect.assertions(2);
	const result = validate({
		foo: "spam",
	});
	expect(result).toBeFalsy();
	expect(validate.errors).toEqual([
		{
			instancePath: "/foo",
			keyword: "type",
			message: "should be a function",
			params: {
				keyword: "type",
			},
			schemaPath: "#/properties/foo/function",
		},
	]);
});

it("should not give error if value is function", () => {
	expect.assertions(2);
	function foo(): void {
		/* do nothing */
	}
	const result = validate({
		foo,
	});
	expect(result).toBeTruthy();
	expect(validate.errors).toBeNull();
});

it("should not give error if value is arrow function", () => {
	expect.assertions(2);
	const result = validate({
		foo: (): void => {
			/* do nothing */
		},
	});
	expect(result).toBeTruthy();
	expect(validate.errors).toBeNull();
});

it("should not give error if value is method", () => {
	expect.assertions(2);
	const result = validate({
		foo(): void {
			/* do nothing */
		},
	});
	expect(result).toBeTruthy();
	expect(validate.errors).toBeNull();
});
