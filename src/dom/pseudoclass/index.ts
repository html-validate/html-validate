import { HtmlElement } from "../htmlelement";

import { firstChild } from "./first-child";
import { lastChild } from "./last-child";
import { nthChild } from "./nth-child";

type PseudoClassFunction = (node: HtmlElement, args?: string) => boolean;
type PseudoClassTable = Record<string, PseudoClassFunction>;

const table: PseudoClassTable = {
	"first-child": firstChild,
	"last-child": lastChild,
	"nth-child": nthChild,
};

export function factory(name: string): PseudoClassFunction {
	const fn = table[name];
	if (fn) {
		return fn;
	} else {
		throw new Error(`Pseudo-class "${name}" is not implemented`);
	}
}
