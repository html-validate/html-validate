import { Compound } from "./compound";
import { splitSelectorElements } from "./split-selector-elements";

/**
 * Unescape codepoints.
 *
 * https://drafts.csswg.org/cssom/#escape-a-character-as-code-point
 */
function unescapeCodepoint(value: string): string {
	const replacement = {
		"\\9 ": "\t",
		"\\a ": "\n",
		"\\d ": "\r",
	};
	return value.replaceAll(
		/(\\[9ad] )/g,
		(_, codepoint: "\\9 " | "\\a " | "\\d ") => replacement[codepoint],
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
