import {
	type AsyncExpectationResult,
	type MatcherContext,
	type SyncExpectationResult,
} from "expect";
import { isThenable } from "./is-thenable";

type SyncCallback<T, TArgs extends unknown[]> = (
	this: MatcherContext,
	actual: T,
	...args: TArgs
) => SyncExpectationResult;

/**
 * @internal
 */
export interface MaybeAsyncCallback<TActual, TArgs extends unknown[]> {
	(this: MatcherContext, actual: TActual, ...args: TArgs): SyncExpectationResult;
	(this: MatcherContext, actual: Promise<TActual>, ...args: TArgs): AsyncExpectationResult;
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
	function diverged(this: MatcherContext, actual: T, ...args: TArgs): SyncExpectationResult;
	function diverged(
		this: MatcherContext,
		actual: Promise<T>,
		...args: TArgs
	): AsyncExpectationResult;
	function diverged(
		this: MatcherContext,
		actual: T | Promise<T>,
		...args: TArgs
	): SyncExpectationResult | AsyncExpectationResult {
		if (isThenable(actual)) {
			/* eslint-disable-next-line unicorn/prefer-await -- intentional, we must return sync result if sync parameters are used */
			return actual.then((resolved) => fn.call(this, resolved, ...args));
		}
		return fn.call(this, actual, ...args);
	}
	return diverged;
}
