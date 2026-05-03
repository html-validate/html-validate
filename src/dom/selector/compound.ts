import { type HtmlElement } from "../htmlelement";
import { type Combinator, parseCombinator } from "./combinator";
import {
	type Condition,
	createAttributeCondition,
	createClassCondition,
	createIdCondition,
	createPseudoClassCondition,
} from "./condition";
import { type SelectorContext } from "./selector-context";
import { splitCompound } from "./split-compound";

/**
 * @internal
 */
export class Compound {
	public readonly combinator: Combinator;
	public readonly tagName: string;
	private readonly selector: string;
	private readonly conditions: Condition[];

	public constructor(pattern: string) {
		const match = /^([+>~-]?)((?:\*|[^#.:[]+)?)([^]*)$/.exec(pattern);
		/* istanbul ignore next: should not happen but throw proper error if it still happens */
		if (!match) {
			throw new Error(`Failed to create selector pattern from "${pattern}"`);
		}
		match.shift(); /* remove full matched string */
		this.selector = pattern;
		this.combinator = parseCombinator(match.shift(), pattern);
		this.tagName = match.shift() || "*"; // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing -- empty string */
		this.conditions = Array.from(splitCompound(match[0]), (it) => this.createCondition(it));
	}

	public match(node: HtmlElement, context: SelectorContext): boolean {
		return node.is(this.tagName) && this.conditions.every((cur) => cur.match(node, context));
	}

	private createCondition(pattern: string): Condition {
		switch (pattern[0]) {
			case ".":
				return createClassCondition(pattern.slice(1));
			case "#":
				return createIdCondition(pattern.slice(1));
			case "[":
				return createAttributeCondition(pattern.slice(1, -1));
			case ":":
				return createPseudoClassCondition(pattern.slice(1), this.selector);
			default:
				/* istanbul ignore next: fallback solution, the switch cases should cover
				 * everything and there is no known way to trigger this fallback */
				throw new Error(`Failed to create selector condition for "${pattern}"`);
		}
	}
}
