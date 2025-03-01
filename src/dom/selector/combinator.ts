export enum Combinator {
	DESCENDANT = 1,
	CHILD,
	ADJACENT_SIBLING,
	GENERAL_SIBLING,

	/* special cases */
	SCOPE,
}

export function parseCombinator(
	combinator: string | undefined | null,
	pattern: string,
): Combinator {
	/* special case, when pattern is :scope [[Selector]] will handle this
	 * "combinator" to match itself instead of descendants */
	if (pattern === ":scope") {
		return Combinator.SCOPE;
	}

	switch (combinator) {
		case undefined:
		case null:
		case "":
			return Combinator.DESCENDANT;
		case ">":
			return Combinator.CHILD;
		case "+":
			return Combinator.ADJACENT_SIBLING;
		case "~":
			return Combinator.GENERAL_SIBLING;
		default:
			throw new Error(`Unknown combinator "${combinator}"`);
	}
}
