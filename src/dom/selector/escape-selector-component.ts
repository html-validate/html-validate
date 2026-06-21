import { type DynamicValue } from "../dynamic-value";

/* some characters requires extra care: https://drafts.csswg.org/cssom/#escape-a-character-as-code-point */
const codepoints: Record<string, string> = {
	"\t": "\\\u{39} ",
	"\n": "\\\u{61} ",
	"\r": "\\\u{64} ",
};

/**
 * @internal
 */
export function escapeSelectorComponent(text: string | DynamicValue): string {
	return text.toString().replaceAll(/([^\w-])/g, (_, ch: string) => {
		if (Object.hasOwn(codepoints, ch)) {
			return codepoints[ch];
		}
		return `\\${ch}`;
	});
}
