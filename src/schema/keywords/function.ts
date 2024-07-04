import { type KeywordDefinition } from "ajv";
import { type DataValidateFunction, type DataValidationCxt } from "ajv/dist/types";

/**
 * AJV keyword "function" to validate the type to be a function. Injects errors
 * with the "type" keyword to give the same output.
 */
const ajvFunctionValidate: DataValidateFunction = function (
	data: unknown,
	dataCxt?: DataValidationCxt,
): boolean {
	const valid = typeof data === "function";
	if (!valid) {
		ajvFunctionValidate.errors = [
			{
				instancePath: /* istanbul ignore next */ dataCxt?.instancePath,
				schemaPath: undefined,
				keyword: "type",
				message: "should be a function",
				params: {
					keyword: "type",
				},
			},
		];
	}
	return valid;
};

export const ajvFunctionKeyword: KeywordDefinition = {
	keyword: "function",
	schema: false,
	errors: true,
	validate: ajvFunctionValidate,
};
