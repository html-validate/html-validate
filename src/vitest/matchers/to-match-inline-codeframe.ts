import { type AsyncExpectationResult, type MatcherState } from "@vitest/expect";
import * as vitest from "vitest";
import { HtmlValidate } from "../../htmlvalidate";
import { type Report } from "../../reporter";
import { codeframe } from "../utils";

type ToMatchInlineCodeframeMatcher = (
	this: MatcherState,
	received: Report | string | Promise<Report> | Promise<string>,
	inlineSnapshot?: string,
) => AsyncExpectationResult;

function createMatcher(): ToMatchInlineCodeframeMatcher {
	const htmlvalidate = new HtmlValidate();

	async function toMatchInlineCodeframe(
		this: MatcherState,
		received: Report | string | Promise<Report> | Promise<string>,
		inlineSnapshot?: string,
	): AsyncExpectationResult {
		/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- for backwards compatibility with older vitest versions */
		if (!vitest.Snapshots) {
			throw new Error(
				"toMatchInlineCodeframe() requires vitest 4.1.3 or later. Please upgrade vitest.",
			);
		}

		/* Capture the call site synchronously before any await — vitest needs this
		 * to determine where to rewrite the inline snapshot in the source file. */
		vitest.chai.util.flag(this.assertion, "error", new Error("stacktrace"));

		const resolved = await received;

		let report: Report;
		if (typeof resolved === "string") {
			report = await htmlvalidate.validateString(resolved);
		} else {
			report = resolved;
		}

		const snapshot = codeframe(report.results).replaceAll(/\s+$/gm, "");

		return vitest.Snapshots.toMatchInlineSnapshot.call(this, snapshot, inlineSnapshot);
	}

	return toMatchInlineCodeframe;
}

export { createMatcher as toMatchInlineCodeframe };
