export class NestedError extends Error {
	constructor(message: string, nested?: Error) {
		super(message);
		Error.captureStackTrace(this, NestedError);

		if (nested) {
			this.stack += `\nCaused by: ${nested.stack}`;
		}
	}
}
