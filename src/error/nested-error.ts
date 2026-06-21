/**
 * @public
 */
export class NestedError extends Error {
	/* eslint-disable-next-line unicorn/custom-error-definition -- technical debt */
	public constructor(message: string, nested?: Error) {
		super(message);
		this.name = "NestedError";

		if (nested?.stack) {
			this.stack ??= "";
			this.stack += `\nCaused by: ${nested.stack}`;
		}
	}
}
