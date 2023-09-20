import { isThenable } from "./is-thenable";
import { type MatcherResult } from "./matcher-result";

type Utils = jest.MatcherContext;

type SyncCallback<T, TArgs extends any[]> = (
	this: Utils,
	actual: T,
	...args: TArgs
) => MatcherResult;

export interface MaybeAsyncCallback<T, TArgs extends any[]> {
	(this: Utils, actual: T, ...args: TArgs): MatcherResult;
	(this: Utils, actual: Promise<T>, ...args: TArgs): Promise<MatcherResult>;
}

/**
 * Creates a wrapped function based on the passed function.
 *
 * The returned function takes either a `T` or `Promise<T>`. If `T` the result
 * will be synchronous or if `Promise<T>` the result will be asynchronous.
 *
 * In practice this means that if you pass a synchronous object into it you will
 * maintain synchronous code but if you pass an asynchronous object you must
 * await the result.
 */
export function diverge<T, TArgs extends any[]>(
	fn: SyncCallback<T, TArgs>
): MaybeAsyncCallback<T, TArgs> {
	function diverged(this: Utils, actual: T, ...args: TArgs): MatcherResult;
	function diverged(this: Utils, actual: Promise<T>, ...args: TArgs): Promise<MatcherResult>;
	function diverged(
		this: Utils,
		actual: T | Promise<T>,
		...args: TArgs
	): MatcherResult | Promise<MatcherResult> {
		if (isThenable(actual)) {
			return actual.then((resolved) => fn.call(this, resolved, ...args));
		} else {
			return fn.call(this, actual, ...args);
		}
	}
	return diverged;
}
