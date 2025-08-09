function stringify(value: unknown): string {
	if (typeof value === "string") {
		return value;
	} else {
		return JSON.stringify(value);
	}
}

/**
 * Represents an `Error` created from arbitrary values.
 *
 * @public
 */
export class WrappedError extends Error {
	public constructor(message: unknown) {
		super(stringify(message));
	}
}
