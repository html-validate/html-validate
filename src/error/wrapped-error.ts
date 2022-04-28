function stringify<T>(value: T): string {
	if (typeof value === "string") {
		return String(value);
	} else {
		return JSON.stringify(value);
	}
}

/**
 * Represents an `Error` created from arbitrary values.
 *
 * @public
 */
export class WrappedError<T> extends Error {
	public constructor(message: T) {
		super(stringify(message));
	}
}
