/**
 * @public
 */
export class NestedError extends Error {
	public constructor(message: string, nested?: Error) {
		super(message);
		Error.captureStackTrace(this, NestedError);
		this.name = NestedError.name;

		if (nested?.stack) {
			this.stack ??= "";
			this.stack += `\nCaused by: ${nested.stack}`;
		}
	}
}
