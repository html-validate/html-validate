import { type HtmlElement } from "../htmlelement";
import { type SelectorContext } from "../selector";

export function scope(this: SelectorContext, node: HtmlElement): boolean {
	return node.isSameNode(this.scope);
}
