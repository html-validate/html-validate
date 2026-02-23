/**
 * @public
 */
export class NestedError extends Error {
	public constructor(message: string, nested?: Error) {
		super(message);
		this.name = "NestedError";

		if (nested?.stack) {
			this.stack ??= "";
			this.stack += `\nCaused by: ${nested.stack}`;
		}
	}
}
