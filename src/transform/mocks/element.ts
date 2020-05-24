import { HtmlElement, DynamicValue } from "../../dom";

export function processElement(node: HtmlElement): void {
	if (node.hasAttribute("bind-text")) {
		node.appendText(new DynamicValue(""));
	}
}
