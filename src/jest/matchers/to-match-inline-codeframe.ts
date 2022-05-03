import kleur from "kleur";
import { toMatchInlineSnapshot } from "jest-snapshot";
import { Context } from "jest-snapshot/build/types";
import { codeframe, type CodeframeOptions } from "../../formatters/codeframe";
import { type Report } from "../../reporter";
import { getResults } from "./get-results";

const options: CodeframeOptions = {
	showLink: false,
	showSummary: false,
	showSelector: true,
};

function toMatchInlineCodeframe(
	this: jest.MatcherContext,
	actual: Report | string,
	...rest: Array<string | object>
): jest.CustomMatcherResult {
	const filename = this.testPath;
	const results = getResults(filename, actual);
	const enabled = kleur.enabled;
	kleur.enabled = false;
	const snapshot = codeframe(results, options).replace(/\s+$/gm, "");
	kleur.enabled = enabled;
	return toMatchInlineSnapshot.call(this as Context, snapshot, ...rest);
}

export default toMatchInlineCodeframe;
