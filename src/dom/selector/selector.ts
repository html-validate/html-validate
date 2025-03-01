import { type DynamicValue } from "../dynamic-value";
import { type HtmlElement } from "../htmlelement";
import { Combinator, parseCombinator } from "./combinator";
import {
	type Condition,
	AttributeCondition,
	ClassCondition,
	IdCondition,
	PseudoClassCondition,
} from "./condition";
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
 * Returns true if the character is a delimiter for different kinds of selectors:
 *
 * - `.` - begins a class selector
 * - `#` - begins an id selector
 * - `[` - begins an attribute selector
 * - `:` - begins a pseudo class or element selector
 */
function isDelimiter(ch: string): boolean {
	return /[.#[:]/.test(ch);
}

/**
 * Returns true if the character is a quotation mark.
 */
function isQuotationMark(ch: string): ch is '"' | "'" {
	return /['"]/.test(ch);
}

function isPseudoElement(ch: string, buffer: string): boolean {
	return ch === ":" && buffer === ":";
}

/**
 * @internal
 */
export function* splitPattern(pattern: string): Generator<string> {
	if (pattern === "") {
		return;
	}

	const end = pattern.length;

	let begin = 0;
	let cur = 1;
	let quoted: false | '"' | "'" = false;

	while (cur < end) {
		const ch = pattern[cur];
		const buffer = pattern.slice(begin, cur);

		/* escaped character, ignore whatever is next */
		if (ch === "\\") {
			cur += 2;
			continue;
		}

		/* if inside quoted string we only look for the end quotation mark */
		if (quoted) {
			if (ch === quoted) {
				quoted = false;
			}
			cur += 1;
			continue;
		}

		/* if the character is a quotation mark we store the character and the above
		 * condition will look for a similar end quotation mark */
		if (isQuotationMark(ch)) {
			quoted = ch;
			cur += 1;
			continue;
		}

		/* special case when using :: pseudo element selector */
		if (isPseudoElement(ch, buffer)) {
			cur += 1;
			continue;
		}

		/* if the character is a delimiter we yield the string and reset the
		 * position */
		if (isDelimiter(ch)) {
			begin = cur;
			yield buffer;
		}

		cur += 1;
	}

	/* yield the rest of the string */
	const tail = pattern.slice(begin, cur);
	yield tail;
}

export class Pattern {
	public readonly combinator: Combinator;
	public readonly tagName: string;
	private readonly selector: string;
	private readonly conditions: Condition[];

	public constructor(pattern: string) {
		const match = pattern.match(/^([~+\->]?)((?:[*]|[^.#[:]+)?)([^]*)$/);
		/* istanbul ignore next: should not happen but throw proper error if it still happens */
		if (!match) {
			throw new Error(`Failed to create selector pattern from "${pattern}"`);
		}
		match.shift(); /* remove full matched string */
		this.selector = pattern;
		this.combinator = parseCombinator(match.shift(), pattern);
		this.tagName = match.shift() || "*"; // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing -- empty string */
		this.conditions = Array.from(splitPattern(match[0]), (it) => this.createCondition(it));
	}

	public match(node: HtmlElement, context: SelectorContext): boolean {
		return node.is(this.tagName) && this.conditions.every((cur) => cur.match(node, context));
	}

	private createCondition(pattern: string): Condition {
		switch (pattern[0]) {
			case ".":
				return new ClassCondition(pattern.slice(1));
			case "#":
				return new IdCondition(pattern.slice(1));
			case "[":
				return new AttributeCondition(pattern.slice(1, -1));
			case ":":
				return new PseudoClassCondition(pattern.slice(1), this.selector);
			default:
				/* istanbul ignore next: fallback solution, the switch cases should cover
				 * everything and there is no known way to trigger this fallback */
				throw new Error(`Failed to create selector condition for "${pattern}"`);
		}
	}
}

/**
 * DOM Selector.
 */
export class Selector {
	private readonly pattern: Pattern[];

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

	private static parse(selector: string): Pattern[] {
		/* strip whitespace before combinators, "ul > li" becomes "ul >li", for
		 * easier parsing */
		selector = selector.replace(/([+~>]) /g, "$1");

		/* split string on whitespace (excluding escaped `\ `) */
		return Array.from(splitSelectorElements(selector), (element) => {
			return new Pattern(unescapeCodepoint(element));
		});
	}

	private static findCandidates(root: HtmlElement, pattern: Pattern): HtmlElement[] {
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
