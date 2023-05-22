import kleur from "kleur";
import { toMatchInlineSnapshot } from "jest-snapshot";
import { codeframe, type CodeframeOptions } from "../../formatters/codeframe";
import { type Report } from "../../reporter";
import { isThenable } from "../utils";
import { getResults } from "./get-results";

const options: CodeframeOptions = {
	showLink: false,
	showSummary: false,
	showSelector: true,
};

function toMatchInlineCodeframeImpl(
	context: jest.MatcherContext,
	actual: Report | string,
	...rest: Array<string | object>
): jest.CustomMatcherResult {
	/* istanbul ignore next: cant figure out when this would be unset */
	const filename = context.testPath ?? "inline";
	const results = getResults(filename, actual);
	const enabled = kleur.enabled;
	kleur.enabled = false;
	const snapshot = codeframe(results, options).replace(/\s+$/gm, "");
	kleur.enabled = enabled;

	/* eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call --
	 * the implementation works but the declarations doesn't allow it */
	return (toMatchInlineSnapshot as any).call(context, snapshot, ...rest);
}

function toMatchInlineCodeframe(
	this: jest.MatcherContext,
	actual: Report | string,
	...rest: Array<string | object>
): jest.CustomMatcherResult;
function toMatchInlineCodeframe(
	this: jest.MatcherContext,
	actual: Promise<Report>,
	...rest: Array<string | object>
): Promise<jest.CustomMatcherResult>;
function toMatchInlineCodeframe(
	this: jest.MatcherContext,
	actual: Report | Promise<Report> | string,
	...rest: Array<string | object>
): jest.CustomMatcherResult | Promise<jest.CustomMatcherResult> {
	const context = {
		...this,

		/* Capture the original stack frames as they are needed by "jest-snapshot"
		 * to determine where to write the inline snapshots. When resolving the
		 * promise the original stack frames are lost and the snapshot will be
		 * written in this files instaed. */
		error: new Error(),
	};

	if (isThenable(actual)) {
		return actual.then((resolved) => toMatchInlineCodeframeImpl(context, resolved, ...rest));
	} else {
		return toMatchInlineCodeframeImpl(context, actual, ...rest);
	}
}

export default toMatchInlineCodeframe;
