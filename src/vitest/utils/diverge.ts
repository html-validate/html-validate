import {
	type AsyncExpectationResult,
	type MatcherState,
	type SyncExpectationResult,
} from "@vitest/expect";
import { isThenable } from "./is-thenable";

type SyncCallback<T, TArgs extends unknown[]> = (
	this: MatcherState,
	actual: T,
	...args: TArgs
) => SyncExpectationResult;

/**
 * @internal
 */
export interface MaybeAsyncCallback<TActual, TArgs extends unknown[]> {
	(this: MatcherState, actual: TActual, ...args: TArgs): SyncExpectationResult;
	(this: MatcherState, actual: Promise<TActual>, ...args: TArgs): AsyncExpectationResult;
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
 *
 * @internal
 */
export function diverge<T, TArgs extends unknown[]>(
	fn: SyncCallback<T, TArgs>,
): MaybeAsyncCallback<T, TArgs> {
	function diverged(this: MatcherState, actual: T, ...args: TArgs): SyncExpectationResult;
	function diverged(this: MatcherState, actual: Promise<T>, ...args: TArgs): AsyncExpectationResult;
	function diverged(
		this: MatcherState,
		actual: T | Promise<T>,
		...args: TArgs
	): SyncExpectationResult | AsyncExpectationResult {
		if (isThenable(actual)) {
			return actual.then((resolved) => fn.call(this, resolved, ...args));
		} else {
			return fn.call(this, actual, ...args);
		}
	}
	return diverged;
}
