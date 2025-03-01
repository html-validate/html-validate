import { type DynamicValue } from "../dynamic-value";
import { type HtmlElement } from "../htmlelement";
import { Combinator } from "./combinator";
import { Compound } from "./compound";
import { matchElement } from "./match-element";
import { type SelectorContext } from "./selector-context";
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
	return value.replace(
		/(\\[\u0039\u0061\u0064] )/g,
		(_, codepoint: "\\\u0039 " | "\\\u0061 " | "\\\u0064 ") => replacement[codepoint],
	);
}

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
	return text.toString().replace(/([\t\n\r]|[^a-z0-9_-])/gi, (_, ch: string) => {
		if (codepoints[ch]) {
			return codepoints[ch];
		} else {
			return `\\${ch}`;
		}
	});
}

/**
 * @internal
 */
export function generateIdSelector(id: string): string {
	const escaped = escapeSelectorComponent(id);
	return escaped.match(/^\d/) ? `[id="${escaped}"]` : `#${escaped}`;
}

/**
 * DOM Selector.
 */
export class Selector {
	private readonly pattern: Compound[];

	public constructor(selector: string) {
		this.pattern = Selector.parse(selector);
	}

	/**
	 * Match this selector against a HtmlElement.
	 *
	 * @param root - Element to match against.
	 * @returns Iterator with matched elements.
	 */
	public *match(root: HtmlElement): IterableIterator<HtmlElement> {
		const context: SelectorContext = { scope: root };
		yield* this.matchInternal(root, 0, context);
	}

	/**
	 * Returns `true` if the element matches this selector.
	 */
	public matchElement(element: HtmlElement): boolean {
		const context: SelectorContext = { scope: null };
		return matchElement(element, this.pattern, context);
	}

	private *matchInternal(
		root: HtmlElement,
		level: number,
		context: SelectorContext,
	): IterableIterator<HtmlElement> {
		if (level >= this.pattern.length) {
			yield root;
			return;
		}

		const pattern = this.pattern[level];
		const matches = Selector.findCandidates(root, pattern);

		for (const node of matches) {
			if (!pattern.match(node, context)) {
				continue;
			}

			yield* this.matchInternal(node, level + 1, context);
		}
	}

	private static parse(selector: string): Compound[] {
		/* strip whitespace before combinators, "ul > li" becomes "ul >li", for
		 * easier parsing */
		selector = selector.replace(/([+~>]) /g, "$1");

		/* split string on whitespace (excluding escaped `\ `) */
		return Array.from(splitSelectorElements(selector), (element) => {
			return new Compound(unescapeCodepoint(element));
		});
	}

	private static findCandidates(root: HtmlElement, pattern: Compound): HtmlElement[] {
		switch (pattern.combinator) {
			case Combinator.DESCENDANT:
				return root.getElementsByTagName(pattern.tagName);
			case Combinator.CHILD:
				return root.childElements.filter((node) => node.is(pattern.tagName));
			case Combinator.ADJACENT_SIBLING:
				return Selector.findAdjacentSibling(root);
			case Combinator.GENERAL_SIBLING:
				return Selector.findGeneralSibling(root);
			case Combinator.SCOPE:
				return [root];
		}
	}

	private static findAdjacentSibling(node: HtmlElement): HtmlElement[] {
		let adjacent = false;
		return node.siblings.filter((cur) => {
			if (adjacent) {
				adjacent = false;
				return true;
			}
			if (cur === node) {
				adjacent = true;
			}
			return false;
		});
	}

	private static findGeneralSibling(node: HtmlElement): HtmlElement[] {
		let after = false;
		return node.siblings.filter((cur) => {
			if (after) {
				return true;
			}
			if (cur === node) {
				after = true;
			}
			return false;
		});
	}
}
