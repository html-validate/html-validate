import Ajv from "ajv";
import betterAjvErrors from "better-ajv-errors";
import { MetaDataTable } from "./element";

const metaSchema = require("../../elements/schema.json");

export class MetaValidationError extends Error {
	private obj: MetaDataTable;
	private errors: Ajv.ErrorObject[];

	constructor(message: string, obj: MetaDataTable, errors: Ajv.ErrorObject[]) {
		super(message);
		this.obj = obj;
		this.errors = errors;
	}

	public prettyError(): void | betterAjvErrors.IOutputError[] {
		return betterAjvErrors(metaSchema, this.obj, this.errors, {
			format: "cli",
			indent: 2,
		});
	}
}
