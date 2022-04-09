import kleur from "kleur";
import { toMatchInlineSnapshot } from "jest-snapshot";
import { codeframe, type CodeframeOptions } from "../../formatters/codeframe";
import { Report } from "../../reporter";

const options: CodeframeOptions = {
	showLink: false,
	showSummary: false,
	showSelector: true,
};

function toMatchInlineCodeframe(
	this: jest.MatcherContext,
	report: Report,
	...rest: Array<string | object>
): jest.CustomMatcherResult {
	const enabled = kleur.enabled;
	kleur.enabled = false;
	const snapshot = codeframe(report.results, options).replace(/\s+$/gm, "");
	kleur.enabled = enabled;
	return toMatchInlineSnapshot.call(this as any, snapshot, ...rest);
}

export default toMatchInlineCodeframe;
