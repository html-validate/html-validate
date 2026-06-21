import { Compound } from "./compound";
import { splitSelectorElements } from "./split-selector-elements";

/**
 * Unescape codepoints.
 *
 * https://drafts.csswg.org/cssom/#escape-a-character-as-code-point
 */
function unescapeCodepoint(value: string): string {
	const replacement = {
		"\\\u{39} ": "\t",
		"\\\u{61} ": "\n",
		"\\\u{64} ": "\r",
	};
	return value.replaceAll(
		/(\\[9ad] )/g,
		(_, codepoint: "\\\u{39} " | "\\\u{61} " | "\\\u{64} ") => replacement[codepoint],
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
