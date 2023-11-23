import { type HtmlElement } from "../htmlelement";
import { type SelectorContext } from "../selector-context";
import { firstChild } from "./first-child";
import { lastChild } from "./last-child";
import { nthChild } from "./nth-child";
import { scope } from "./scope";

type PseudoClassFunction = (this: SelectorContext, node: HtmlElement, args?: string) => boolean;
type PseudoClassTable = Record<string, PseudoClassFunction>;

const table: PseudoClassTable = {
	"first-child": firstChild,
	"last-child": lastChild,
	"nth-child": nthChild,
	scope,
};

export function factory(
	name: string,
	context: SelectorContext,
): OmitThisParameter<PseudoClassFunction> {
	const fn = table[name];
	if (fn) {
		return fn.bind(context);
	} else {
		throw new Error(`Pseudo-class "${name}" is not implemented`);
	}
}
