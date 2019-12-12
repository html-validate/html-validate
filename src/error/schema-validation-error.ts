import Ajv from "ajv";
import betterAjvErrors from "better-ajv-errors";
import { UserError } from "../error/user-error";

export class SchemaValidationError extends UserError {
	public filename: string | null;
	private obj: any;
	private schema: any;
	private errors: Ajv.ErrorObject[];

	public constructor(
		filename: string | null,
		message: string,
		obj: any,
		schema: any,
		errors: Ajv.ErrorObject[]
	) {
		super(message);
		this.filename = filename;
		this.obj = obj;
		this.schema = schema;
		this.errors = errors;
	}

	public prettyError(): void | betterAjvErrors.IOutputError[] {
		return betterAjvErrors(this.schema, this.obj, this.errors, {
			format: "cli",
			indent: 2,
		});
	}
}
