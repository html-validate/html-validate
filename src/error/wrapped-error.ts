function stringify(value: unknown): string {
	if (typeof value === "string") {
		return value;
	}
	return JSON.stringify(value);
}

/**
 * Represents an `Error` created from arbitrary values.
 *
 * @public
 */
export class WrappedError extends Error {
	/* eslint-disable-next-line unicorn/custom-error-definition -- technical debt */
	public constructor(message: unknown) {
		super(stringify(message));
		this.name = "WrappedError";
	}
}
