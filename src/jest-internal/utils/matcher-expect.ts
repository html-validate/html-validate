/**
 * Internal framework agnostic definition of `expect`.
 *
 * Compatible with:
 *
 * - `jest`
 * - `vitest`
 *
 * @internal
 */
export interface MatcherExpect {
	arrayContaining(arr: readonly unknown[]): unknown;
	objectContaining(obj: unknown): unknown;
}
