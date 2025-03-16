/* eslint-disable @typescript-eslint/ban-ts-comment --
 * this code needs to work with multiple different versions of jest and it does
 * verification of which one is actually present but the other variants will
 * cause errors, as is expected */

import jestDiffDefault, * as jestDiff from "jest-diff";

/**
 * @internal
 */
export interface DiffOptions {
	aAnnotation?: string;
	bAnnotation?: string;
	expand?: boolean;
}

/**
 * @internal
 */
export type DiffFunction = (a: any, b: any, options?: DiffOptions) => string | null;

/* ignore typing for compatibility so it will seem "impossible" but different
 * version will yield different source */
/* istanbul ignore next: this is covered by integration tests */
const diffCandidates: Array<DiffFunction | undefined> = [
	// @ts-ignore
	jestDiffDefault?.diff,
	// @ts-ignore
	jestDiffDefault,
	// @ts-ignore
	jestDiff?.diff,
	// @ts-ignore
	jestDiff,
];

const isFunction = (fn: unknown): boolean => typeof fn === "function";

/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- assume
 * one of the candidate matches, there will be a reasonable error later on if
 * not */
export const diff: DiffFunction = diffCandidates.find(isFunction)!;
