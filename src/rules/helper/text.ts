import { HtmlElement, NodeType, TextNode } from "../../dom";

const CACHE_KEY = Symbol(classifyNodeText.name);

export enum TextClassification {
	EMPTY_TEXT,
	DYNAMIC_TEXT,
	STATIC_TEXT,
}

declare module "../../dom/cache" {
	export interface DOMNodeCache {
		[CACHE_KEY]: TextClassification;
	}
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
	if (node.cacheExists(CACHE_KEY)) {
		return node.cacheGet(CACHE_KEY) as TextClassification;
	}

	/* While I cannot find a reference about this in the standard the <select>
	 * element kinda acts as if there is no text content, most particularly it
	 * doesn't receive and accessible name. The `.textContent` property does
	 * however include the <option> childrens text. But for the sake of the
	 * validator it is probably best if the classification acts as if there is no
	 * text as I think that is what is expected of the return values. Might have
	 * to revisit this at some point or if someone could clarify what section of
	 * the standard deals with this. */
	if (node.is("select")) {
		return node.cacheSet(CACHE_KEY, TextClassification.EMPTY_TEXT);
	}

	const text = findTextNodes(node);

	/* if any text is dynamic classify as dynamic */
	if (text.some((cur) => cur.isDynamic)) {
		return node.cacheSet(CACHE_KEY, TextClassification.DYNAMIC_TEXT);
	}

	/* if any text has non-whitespace character classify as static */
	if (text.some((cur) => cur.textContent.match(/\S/) !== null)) {
		return node.cacheSet(CACHE_KEY, TextClassification.STATIC_TEXT);
	}

	/* default to empty */
	return node.cacheSet(CACHE_KEY, TextClassification.EMPTY_TEXT);
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
