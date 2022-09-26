import { HtmlElement, isElementNode, isTextNode, TextNode } from "../../dom";
import { isAriaHidden, isHTMLHidden } from "./a11y";

const HTML_CACHE_KEY = Symbol(`${classifyNodeText.name}|html`);
const A11Y_CACHE_KEY = Symbol(`${classifyNodeText.name}|a11y`);

export enum TextClassification {
	EMPTY_TEXT,
	DYNAMIC_TEXT,
	STATIC_TEXT,
}

export interface TextClassificationOptions {
	/** If `true` only accessible text is considered (default false) */
	accessible?: boolean;
}

declare module "../../dom/cache" {
	export interface DOMNodeCache {
		[HTML_CACHE_KEY]: TextClassification;
		[A11Y_CACHE_KEY]: TextClassification;
	}
}

/* While I cannot find a reference about this in the standard the <select>
 * element kinda acts as if there is no text content, most particularly it
 * doesn't receive and accessible name. The `.textContent` property does
 * however include the <option> childrens text. But for the sake of the
 * validator it is probably best if the classification acts as if there is no
 * text as I think that is what is expected of the return values. Might have
 * to revisit this at some point or if someone could clarify what section of
 * the standard deals with this. */
function isSpecialEmpty(node: HtmlElement): boolean {
	return node.is("select") || node.is("textarea");
}

/**
 * Checks text content of an element.
 *
 * Any text is considered including text from descendant elements. Whitespace is
 * ignored.
 *
 * If any text is dynamic `TextClassification.DYNAMIC_TEXT` is returned.
 */
export function classifyNodeText(
	node: HtmlElement,
	options: TextClassificationOptions = {}
): TextClassification {
	const { accessible = false } = options;
	const cacheKey = accessible ? A11Y_CACHE_KEY : HTML_CACHE_KEY;

	if (node.cacheExists(cacheKey)) {
		return node.cacheGet(cacheKey) as TextClassification;
	}

	if (isHTMLHidden(node)) {
		return node.cacheSet(cacheKey, TextClassification.EMPTY_TEXT);
	}

	if (accessible && isAriaHidden(node)) {
		return node.cacheSet(cacheKey, TextClassification.EMPTY_TEXT);
	}

	if (isSpecialEmpty(node)) {
		return node.cacheSet(cacheKey, TextClassification.EMPTY_TEXT);
	}

	const text = findTextNodes(node, options);

	/* if any text is dynamic classify as dynamic */
	if (text.some((cur) => cur.isDynamic)) {
		return node.cacheSet(cacheKey, TextClassification.DYNAMIC_TEXT);
	}

	/* if any text has non-whitespace character classify as static */
	if (text.some((cur) => cur.textContent.match(/\S/) !== null)) {
		return node.cacheSet(cacheKey, TextClassification.STATIC_TEXT);
	}

	/* default to empty */
	return node.cacheSet(cacheKey, TextClassification.EMPTY_TEXT);
}

function findTextNodes(node: HtmlElement, options: TextClassificationOptions): TextNode[] {
	const { accessible = false } = options;
	let text: TextNode[] = [];
	for (const child of node.childNodes) {
		if (isTextNode(child)) {
			text.push(child);
		} else if (isElementNode(child)) {
			if (isHTMLHidden(child)) {
				continue;
			}
			if (accessible && isAriaHidden(child)) {
				continue;
			}
			text = text.concat(findTextNodes(child, options));
		}
	}
	return text;
}
