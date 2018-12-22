export enum Combinator {
	DESCENDANT,
	CHILD,
	ADJACENT_SIBLING,
	GENERAL_SIBLING,
}

export function parseCombinator(combinator: string): Combinator {
	switch (combinator){
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
