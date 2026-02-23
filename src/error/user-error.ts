import { NestedError } from "./nested-error";

/**
 * @internal
 */
export class UserError extends NestedError {
	public constructor(message: string, nested?: Error) {
		super(message, nested);
		this.name = "UserError";

		Object.defineProperty(this, "isUserError", {
			value: true,
			enumerable: false,
			writable: false,
		});
	}

	/**
	 * @public
	 */
	/* istanbul ignore next: default implementation */
	public prettyFormat(): string | undefined {
		return undefined;
	}
}
