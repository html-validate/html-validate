import kleur from "kleur";
import { toMatchInlineSnapshot } from "jest-snapshot";
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
	/* istanbul ignore next: cant figure out when this would be unset */
	const filename = this.testPath ?? "inline";
	const results = getResults(filename, actual);
	const enabled = kleur.enabled;
	kleur.enabled = false;
	const snapshot = codeframe(results, options).replace(/\s+$/gm, "");
	kleur.enabled = enabled;

	/* eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */
	return (toMatchInlineSnapshot as any).call(this, snapshot, ...rest);
}

export default toMatchInlineCodeframe;
