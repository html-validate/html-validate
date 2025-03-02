import { type HtmlElement } from "../htmlelement";
import { Combinator } from "./combinator";
import { type Compound } from "./compound";
import { type SelectorContext } from "./selector-context";

function* ancestors(element: HtmlElement): Generator<HtmlElement> {
	let current = element.parent;
	while (current && !current.isRootElement()) {
		yield current;
		current = current.parent;
	}
}

function* parent(element: HtmlElement): Generator<HtmlElement> {
	const parent = element.parent;
	if (parent && !parent.isRootElement()) {
		yield parent;
	}
}

function* adjacentSibling(element: HtmlElement): Generator<HtmlElement> {
	const sibling = element.previousSibling;
	if (sibling) {
		yield sibling;
	}
}

function* generalSibling(element: HtmlElement): Generator<HtmlElement> {
	const siblings = element.siblings;
	const index = siblings.findIndex((it) => it.isSameNode(element));
	for (let i = 0; i < index; i++) {
		yield siblings[i];
	}
}

/* istanbul ignore next -- cannot really happen, the selector would be malformed */
function* scope(element: HtmlElement): Generator<HtmlElement> {
	yield element;
}

function candidatesFromCombinator(
	element: HtmlElement,
	combinator: Combinator,
): Generator<HtmlElement> {
	switch (combinator) {
		case Combinator.DESCENDANT:
			return ancestors(element);
		case Combinator.CHILD:
			return parent(element);
		case Combinator.ADJACENT_SIBLING:
			return adjacentSibling(element);
		case Combinator.GENERAL_SIBLING:
			return generalSibling(element);
		/* istanbul ignore next -- cannot really happen, the selector would be malformed */
		case Combinator.SCOPE:
			return scope(element);
	}
}

/**
 * @internal
 */
export function matchElement(
	element: HtmlElement,
	compounds: Compound[],
	context: SelectorContext,
): boolean {
	const last = compounds[compounds.length - 1];
	if (!last.match(element, context)) {
		return false;
	}

	const remainder = compounds.slice(0, -1);
	if (remainder.length === 0) {
		return true;
	}

	const candidates = candidatesFromCombinator(element, last.combinator);
	for (const candidate of candidates) {
		if (matchElement(candidate, remainder, context)) {
			return true;
		}
	}

	return false;
}
