import { HtmlElement, NodeType, TextNode } from "../../dom";

export enum TextClassification {
	EMPTY_TEXT,
	DYNAMIC_TEXT,
	STATIC_TEXT,
}

/**
 * Checks text content of an element.
 *
 * Any text is considered including text from descendant elements. Whitespace is
 * ignored.
 *
 * If any text is dynamic `TextClassification.DYNAMIC_TEXT` is returned.
 */
export function classifyNodeText(node: HtmlElement): TextClassification {
	const text = findTextNodes(node);

	/* if any text is dynamic classify as dynamic */
	if (text.some((cur) => cur.isDynamic)) {
		return TextClassification.DYNAMIC_TEXT;
	}

	/* if any text has non-whitespace character classify as static */
	if (text.some((cur) => cur.textContent.match(/\S/) !== null)) {
		return TextClassification.STATIC_TEXT;
	}

	/* default to empty */
	return TextClassification.EMPTY_TEXT;
}

function findTextNodes(node: HtmlElement): TextNode[] {
	let text: TextNode[] = [];
	for (const child of node.childNodes) {
		switch (child.nodeType) {
			case NodeType.TEXT_NODE:
				text.push(child as TextNode);
				break;
			case NodeType.ELEMENT_NODE:
				text = text.concat(findTextNodes(child as HtmlElement));
				break;
			/* istanbul ignore next: provides a sane default, nothing to test */
			default:
				break;
		}
	}
	return text;
}
