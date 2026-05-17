import { type AsyncExpectationResult, type MatcherState } from "@vitest/expect";
import * as vitest from "vitest";
import { HtmlValidate } from "../../htmlvalidate";
import { type Report } from "../../reporter";
import { codeframe } from "../utils";

type ToMatchCodeframeMatcher = (
	this: MatcherState,
	received: Report | string | Promise<Report> | Promise<string>,
	hint?: string,
) => AsyncExpectationResult;

function createMatcher(): ToMatchCodeframeMatcher {
	const htmlvalidate = new HtmlValidate();

	async function toMatchCodeframe(
		this: MatcherState,
		received: Report | string | Promise<Report> | Promise<string>,
		hint?: string,
	): AsyncExpectationResult {
		/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- for backwards compatibility with older vitest versions */
		if (!vitest.Snapshots) {
			throw new Error("toMatchCodeframe() requires vitest 4.1.3 or later. Please upgrade vitest.");
		}

		const resolved = await received;

		let report: Report;
		if (typeof resolved === "string") {
			report = await htmlvalidate.validateString(resolved);
		} else {
			report = resolved;
		}

		const snapshot = codeframe(report.results).replaceAll(/\s+$/gm, "");

		return vitest.Snapshots.toMatchSnapshot.call(this, snapshot, hint);
	}

	return toMatchCodeframe;
}

export { createMatcher as toMatchCodeframe };
