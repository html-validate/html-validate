import { type DynamicValue } from "../dynamic-value";

/**
 * @internal
 */
export function escapeSelectorComponent(text: string | DynamicValue): string {
	/* some characters requires extra care: https://drafts.csswg.org/cssom/#escape-a-character-as-code-point */
	const codepoints: Record<string, string> = {
		"\t": "\\\u0039 ",
		"\n": "\\\u0061 ",
		"\r": "\\\u0064 ",
	};
	return text.toString().replaceAll(/([\t\n\r]|[^\w-])/gi, (_, ch: string) => {
		if (codepoints[ch]) {
			return codepoints[ch];
		} else {
			return `\\${ch}`;
		}
	});
}
