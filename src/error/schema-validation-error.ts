import fs from "fs";
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
	public filename: string | null;
	private obj: unknown;
	private schema: SchemaObject;
	private errors: ErrorObject[];

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

	public prettyError(): string {
		const json = this.getRawJSON();
		return betterAjvErrors(this.schema, this.obj, this.errors, {
			format: "cli",
			indent: 2,
			json,
		});
	}

	private getRawJSON(): string | null {
		if (this.filename && fs.existsSync(this.filename)) {
			return fs.readFileSync(this.filename, "utf-8");
		} else {
			return null;
		}
	}
}
