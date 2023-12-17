import betterAjvErrors from "@sidvind/better-ajv-errors";
import { type ErrorObject, type SchemaObject } from "ajv";
import { UserError } from "./user-error";

function getSummary(schema: any, obj: any, errors: ErrorObject[]): string {
	const output = betterAjvErrors(schema, obj, errors, {
		format: "js",
	});
	// istanbul ignore next: for safety only
	return output.length > 0 ? output[0].error : "unknown validation error";
}

/**
 * @public
 */
export class SchemaValidationError extends UserError {
	/** Configuration filename the error originates from */
	public readonly filename: string | null;
	/** Configuration object the error originates from */
	public readonly obj: unknown;
	/** JSON schema used when validating the configuration */
	public readonly schema: SchemaObject;
	/** List of schema validation errors */
	public readonly errors: ErrorObject[];

	public constructor(
		filename: string | null,
		message: string,
		obj: unknown,
		schema: SchemaObject,
		errors: ErrorObject[],
	) {
		const summary = getSummary(schema, obj, errors);
		super(`${message}: ${summary}`);

		this.filename = filename;
		this.obj = obj;
		this.schema = schema;
		this.errors = errors;
	}
}
