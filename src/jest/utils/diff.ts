/* eslint-disable @typescript-eslint/ban-ts-comment */

import jestDiffDefault, * as jestDiff from "jest-diff";

/* ignore typing for compatibility so it will seem "impossible" but different version will yield different source */
const diffCandidates: Array<typeof jestDiff.diff> = [
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

/* istanbul ignore next: covered by compatibility tests but not a single pass */
/* @ts-ignore assume one of the candidate matches, there will be a reasonable error later on if not */
export const diff: typeof jestDiff.diff = diffCandidates.find(isFunction);
