import Ajv from "ajv";
import betterAjvErrors from "better-ajv-errors";
import { MetaDataTable } from "./element";

export class MetaValidationError extends Error {
	private obj: MetaDataTable;
	private schema: any;
	private errors: Ajv.ErrorObject[];

	constructor(
		message: string,
		obj: MetaDataTable,
		schema: any,
		errors: Ajv.ErrorObject[]
	) {
		super(message);
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
