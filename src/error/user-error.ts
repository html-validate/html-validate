import { NestedError } from "./nested-error";

/**
 * @public
 */
export class UserError extends NestedError {
	public constructor(message: string, nested?: Error) {
		super(message, nested);
		Error.captureStackTrace(this, UserError);
		this.name = UserError.name;
	}

	/**
	 * @public
	 */
	/* istanbul ignore next: default implementation */
	public prettyFormat(): string | undefined {
		return undefined;
	}
}
