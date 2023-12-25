/**
 * Test if value is a Promise (thenable).
 *
 * @internal
 */
export function isThenable<T>(value: T | Promise<T>): value is Promise<T> {
	return value && typeof value === "object" && "then" in value && typeof value.then === "function";
}
