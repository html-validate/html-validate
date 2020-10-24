import betterAjvErrors from "@sidvind/better-ajv-errors";
import Ajv from "ajv";
import { UserError } from "./user-error";

function getSummary(schema: any, obj: any, errors: Ajv.ErrorObject[]): string {
	const output = betterAjvErrors(schema, obj, errors, {
		format: "js",
	}) as any;
	// istanbul ignore next: for safety only
	return output.length > 0 ? output[0].error : "unknown validation error";
}

export class SchemaValidationError extends UserError {
	public filename: string | null;
	private obj: any;
	private schema: any;
	private errors: Ajv.ErrorObject[];

	public constructor(
		filename: string | null,
		message: string,
		obj: any, // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
		schema: any, // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
		errors: Ajv.ErrorObject[]
	) {
		const summary = getSummary(schema, obj, errors);
		super(`${message}: ${summary}`);

		this.filename = filename;
		this.obj = obj;
		this.schema = schema;
		this.errors = errors;
	}

	public prettyError(): string {
		return betterAjvErrors(this.schema, this.obj, this.errors, {
			format: "cli",
			indent: 2,
		});
	}
}
