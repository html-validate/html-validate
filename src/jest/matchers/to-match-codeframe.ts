import kleur from "kleur";
import { toMatchSnapshot } from "jest-snapshot";
import { codeframe, type CodeframeOptions } from "../../formatters/codeframe";
import { type Report } from "../../reporter";
import { getResults } from "./get-results";

const options: CodeframeOptions = {
	showLink: false,
	showSummary: false,
	showSelector: true,
};

function toMatchCodeframe(
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

	/* eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call --
	 * the implementation works but the declarations doesn't allow it */
	return (toMatchSnapshot as any).call(this, snapshot, ...rest);
}

export default toMatchCodeframe;
