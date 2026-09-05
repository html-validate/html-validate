import { type AsyncExpectationResult } from "@vitest/expect";
import * as vitest from "vitest";
import { type MatcherState } from "vitest";
import { type Report } from "../../reporter";
import { codeframe, getReport } from "../utils";

type ToMatchCodeframeMatcher = (
	this: MatcherState,
	received: Report | string | Promise<Report> | Promise<string>,
	hint?: string,
) => AsyncExpectationResult;

async function toMatchCodeframe(
	this: MatcherState,
	received: Report | string | Promise<Report> | Promise<string>,
	hint?: string,
): AsyncExpectationResult {
	/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- for backwards compatibility with older vitest versions */
	if (!vitest.Snapshots) {
		throw new Error("toMatchCodeframe() requires vitest 4.1.3 or later. Please upgrade vitest.");
	}

	const report = await getReport(received, this);
	const snapshot = codeframe(report.results).replaceAll(/\s+$/gm, "");

	return vitest.Snapshots.toMatchSnapshot.call(this, snapshot, hint);
}

function createMatcher(): ToMatchCodeframeMatcher {
	return toMatchCodeframe;
}

export { createMatcher as toMatchCodeframe };
