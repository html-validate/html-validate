import { Compound } from "./compound";
import { splitSelectorElements } from "./split-selector-elements";

/**
 * Unescape codepoints.
 *
 * https://drafts.csswg.org/cssom/#escape-a-character-as-code-point
 */
function unescapeCodepoint(value: string): string {
	const replacement = {
		"\\\u0039 ": "\t",
		"\\\u0061 ": "\n",
		"\\\u0064 ": "\r",
	};
	return value.replaceAll(
		/(\\[9ad] )/g,
		(_, codepoint: "\\\u0039 " | "\\\u0061 " | "\\\u0064 ") => replacement[codepoint],
	);
}

/**
 * @internal
 */
export function getCompounds(selector: string): Compound[] {
	/* strip whitespace before combinators, "ul > li" becomes "ul >li", for
	 * easier parsing */
	selector = selector.replaceAll(/([+>~]) /g, "$1");

	/* split string on whitespace (excluding escaped `\ `) */
	return Array.from(splitSelectorElements(selector), (element) => {
		return new Compound(unescapeCodepoint(element));
	});
}
