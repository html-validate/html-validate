import { Attribute } from "./attribute";
import { Combinator, parseCombinator } from "./combinator";
import { DynamicValue } from "./dynamic-value";
import { HtmlElement } from "./htmlelement";
import { factory as pseudoClassFunction } from "./pseudoclass";
import { SelectorContext } from "./selector-context";

/**
 * Homage to PHP: unescapes slashes.
 *
 * E.g. "foo\:bar" becomes "foo:bar"
 */
function stripslashes(value: string): string {
	return value.replace(/\\(.)/g, "$1");
}

export function escapeSelectorComponent(text: string | DynamicValue): string {
	return text.toString().replace(/([:[\] ])/g, "\\$1");
}

abstract class Matcher {
	/**
	 * Returns `true` if given node matches.
	 */
	public abstract match(node: HtmlElement, context: SelectorContext): boolean;
}

class ClassMatcher extends Matcher {
	private readonly classname: string;

	public constructor(classname: string) {
		super();
		this.classname = classname;
	}

	public match(node: HtmlElement): boolean {
		return node.classList.contains(this.classname);
	}
}

class IdMatcher extends Matcher {
	private readonly id: string;

	public constructor(id: string) {
		super();
		this.id = stripslashes(id);
	}

	public match(node: HtmlElement): boolean {
		return node.id === this.id;
	}
}

class AttrMatcher extends Matcher {
	private readonly key: string;
	private readonly op: string;
	private readonly value: string;

	public constructor(attr: string) {
		super();
		const [, key, op, value] = attr.match(/^(.+?)(?:([~^$*|]?=)"([^"]+?)")?$/) as RegExpMatchArray;
		this.key = key;
		this.op = op;
		this.value = value;
	}

	public match(node: HtmlElement): boolean {
		const attr = node.getAttribute(this.key, true) || [];
		return attr.some((cur: Attribute) => {
			switch (this.op) {
				case undefined:
					return true; /* attribute exists */
				case "=":
					return cur.value === this.value;
				default:
					throw new Error(`Attribute selector operator ${this.op} is not implemented yet`);
			}
		});
	}
}

class PseudoClassMatcher extends Matcher {
	private readonly name: string;
	private readonly args: string;

	public constructor(pseudoclass: string, context: string) {
		super();
		const match = pseudoclass.match(/^([^(]+)(?:\((.*)\))?$/);
		if (!match) {
			throw new Error(`Missing pseudo-class after colon in selector pattern "${context}"`);
		}
		const [, name, args] = match;
		this.name = name;
		this.args = args;
	}

	public match(node: HtmlElement, context: SelectorContext): boolean {
		const fn = pseudoClassFunction(this.name, context);
		return fn(node, this.args);
	}
}

export class Pattern {
	public readonly combinator: Combinator;
	public readonly tagName: string;
	private readonly selector: string;
	private readonly pattern: Matcher[];

	public constructor(pattern: string) {
		const match = pattern.match(/^([~+\->]?)((?:[*]|[^.#[:]+)?)(.*)$/) as RegExpMatchArray;
		match.shift(); /* remove full matched string */
		this.selector = pattern;
		this.combinator = parseCombinator(match.shift(), pattern);
		this.tagName = match.shift() || "*";
		const p = match[0] ? match[0].split(/(?=(?<!\\)[.#[:])/) : [];
		this.pattern = p.map((cur: string) => this.createMatcher(cur));
	}

	public match(node: HtmlElement, context: SelectorContext): boolean {
		return node.is(this.tagName) && this.pattern.every((cur: Matcher) => cur.match(node, context));
	}

	private createMatcher(pattern: string): Matcher {
		switch (pattern[0]) {
			case ".":
				return new ClassMatcher(pattern.slice(1));
			case "#":
				return new IdMatcher(pattern.slice(1));
			case "[":
				return new AttrMatcher(pattern.slice(1, -1));
			case ":":
				return new PseudoClassMatcher(pattern.slice(1), this.selector);
			default:
				/* istanbul ignore next: fallback solution, the switch cases should cover
				 * everything and there is no known way to trigger this fallback */
				throw new Error(`Failed to create matcher for "${pattern}"`);
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
		context: SelectorContext
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

		const pattern = selector.split(/(?:(?<!\\) )+/);
		return pattern.map((part: string) => new Pattern(part));
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
		/* istanbul ignore next: fallback solution, the switch cases should cover
		 * everything and there is no known way to trigger this fallback */
		return [];
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
