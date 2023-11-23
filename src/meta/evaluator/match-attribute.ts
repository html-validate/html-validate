import { type HtmlElement } from "../../dom";

/**
 * Matches attribute against value.
 */
export function matchAttribute(
	node: HtmlElement,
	key: string,
	op: "!=" | "=",
	value: string,
): boolean {
	const nodeValue = (node.getAttributeValue(key) ?? "").toLowerCase();
	switch (op) {
		case "!=":
			return nodeValue !== value;
		case "=":
			return nodeValue === value;
	}
}
