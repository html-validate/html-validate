import { WrappedError } from "./wrapped-error";

/**
 * Ensures the value is an Error.
 *
 * If the passed value is not an `Error` instance a [[WrappedError]] is
 * constructed with the stringified value.
 *
 * @internal
 */
export function ensureError(value: unknown): Error {
	if (value instanceof Error) {
		return value;
	} else {
		return new WrappedError(value);
	}
}
