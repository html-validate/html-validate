import { type KeywordDefinition } from "ajv";
import { type DataValidateFunction, type DataValidationCxt } from "ajv/dist/types";

/**
 * AJV keyword "regexp" to validate the type to be a regular expression.
 * Injects errors with the "type" keyword to give the same output.
 */
/* istanbul ignore next: manual testing */
const ajvRegexpValidate: DataValidateFunction = function (
	data: any,
	dataCxt?: DataValidationCxt,
): boolean {
	const valid = data instanceof RegExp;
	if (!valid) {
		ajvRegexpValidate.errors = [
			{
				instancePath: dataCxt?.instancePath,
				schemaPath: undefined,
				keyword: "type",
				message: "should be a regular expression",
				params: {
					keyword: "type",
				},
			},
		];
	}
	return valid;
};

export const ajvRegexpKeyword: KeywordDefinition = {
	keyword: "regexp",
	schema: false,
	errors: true,
	validate: ajvRegexpValidate,
};
