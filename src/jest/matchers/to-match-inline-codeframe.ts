import { toMatchInlineSnapshot } from "jest-snapshot";
import { type Report } from "../../reporter";
import { type MatcherContext, type MatcherResult, codeframe, isThenable } from "../utils";
import { getResults } from "./get-results";

function toMatchInlineCodeframeImpl(
	context: MatcherContext,
	actual: Report | string,
	...rest: Array<string | object>
): MatcherResult {
	/* istanbul ignore next: cant figure out when this would be unset */
	const filename = context.testPath ?? "inline";
	const results = getResults(filename, actual);
	const snapshot = codeframe(results).replaceAll(/\s+$/gm, "");

	/* eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call --
	 * the implementation works but the declarations doesn't allow it */
	return (toMatchInlineSnapshot as any).call(context, snapshot, ...rest);
}

type ToMatchInlineCodeframeMatcher = (
	this: MatcherContext,
	actual: Report | Promise<Report> | string,
	...rest: Array<string | object>
) => MatcherResult | Promise<MatcherResult>;

function toMatchInlineCodeframe(
	this: MatcherContext,
	actual: Report | Promise<Report> | string,
	...rest: Array<string | object>
): MatcherResult | Promise<MatcherResult> {
	const context = {
		...this,

		/* Capture the original stack frames as they are needed by "jest-snapshot"
		 * to determine where to write the inline snapshots. When resolving the
		 * promise the original stack frames are lost and the snapshot will be
		 * written in this files instaed. */
		error: new Error("stacktrace"),
	};

	if (isThenable(actual)) {
		return actual.then((resolved) => toMatchInlineCodeframeImpl(context, resolved, ...rest));
	} else {
		return toMatchInlineCodeframeImpl(context, actual, ...rest);
	}
}

function createMatcher(): ToMatchInlineCodeframeMatcher {
	return toMatchInlineCodeframe;
}

export { createMatcher as toMatchInlineCodeframe };
