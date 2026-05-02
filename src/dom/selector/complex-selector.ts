import { type HtmlElement } from "../htmlelement";
import { Combinator } from "./combinator";
import { type Compound } from "./compound";
import { getCompounds } from "./get-compounds";
import { matchElement } from "./match-element";
import { type Selector } from "./selector";
import { type SelectorContext } from "./selector-context";

/**
 * DOM Selector.
 *
 * @internal
 */
export class ComplexSelector implements Selector {
	private readonly compounds: Compound[];

	private constructor(compounds: Compound[]) {
		this.compounds = compounds;
	}

	public static fromString(selector: string): ComplexSelector {
		return new ComplexSelector(getCompounds(selector));
	}

	public static fromCompounds(compounds: Compound[]): ComplexSelector {
		return new ComplexSelector(compounds);
	}

	/**
	 * Match this selector against a HtmlElement.
	 *
	 * @param root - Element to match against.
	 * @returns Iterator with matched elements.
	 */
	public *match(root: HtmlElement): Generator<HtmlElement> {
		const context: SelectorContext = { scope: root };
		yield* this.matchInternal(root, 0, context);
	}

	/**
	 * Returns `true` if the element matches this selector.
	 */
	public matchElement(element: HtmlElement): boolean {
		const context: SelectorContext = { scope: null };
		return matchElement(element, this.compounds, context);
	}

	private *matchInternal(
		root: HtmlElement,
		level: number,
		context: SelectorContext,
	): IterableIterator<HtmlElement> {
		if (level >= this.compounds.length) {
			yield root;
			return;
		}

		const pattern = this.compounds[level];
		const matches = ComplexSelector.findCandidates(root, pattern);

		for (const node of matches) {
			if (!pattern.match(node, context)) {
				continue;
			}

			yield* this.matchInternal(node, level + 1, context);
		}
	}

	private static findCandidates(root: HtmlElement, pattern: Compound): HtmlElement[] {
		switch (pattern.combinator) {
			case Combinator.DESCENDANT:
				/* eslint-disable-next-line unicorn/prefer-query-selector -- this is part of the implementation of querySelectorAll() */
				return root.getElementsByTagName(pattern.tagName);
			case Combinator.CHILD:
				return root.childElements.filter((node) => node.is(pattern.tagName));
			case Combinator.ADJACENT_SIBLING:
				return ComplexSelector.findAdjacentSibling(root);
			case Combinator.GENERAL_SIBLING:
				return ComplexSelector.findGeneralSibling(root);
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
			if (cur.isSameNode(node)) {
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
			if (cur.isSameNode(node)) {
				after = true;
			}
			return false;
		});
	}
}
