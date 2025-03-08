import { type HtmlElement, type TextNode, isElementNode, isTextNode } from "../../dom";
import { isAriaHidden, isHTMLHidden } from "./a11y";

const cachePrefix = classifyNodeText.name;
const HTML_CACHE_KEY = Symbol(`${cachePrefix}|html`);
const A11Y_CACHE_KEY = Symbol(`${cachePrefix}|a11y`);
const IGNORE_HIDDEN_ROOT_HTML_CACHE_KEY = Symbol(`${cachePrefix}|html|ignore-hidden-root`);
const IGNORE_HIDDEN_ROOT_A11Y_CACHE_KEY = Symbol(`${cachePrefix}|a11y|ignore-hidden-root`);

type CACHE_KEY =
	| typeof HTML_CACHE_KEY
	| typeof A11Y_CACHE_KEY
	| typeof IGNORE_HIDDEN_ROOT_HTML_CACHE_KEY
	| typeof IGNORE_HIDDEN_ROOT_A11Y_CACHE_KEY;

/**
 * @public
 */
export enum TextClassification {
	EMPTY_TEXT,
	DYNAMIC_TEXT,
	STATIC_TEXT,
}

/**
 * @public
 */
export interface TextClassificationOptions {
	/** If `true` only accessible text is considered (default false) */
	accessible?: boolean;

	/** If `true` the `hidden` and `aria-hidden` attribute is ignored on the root
	 * (and parents) elements (default false) */
	ignoreHiddenRoot?: boolean;
}

declare module "../../dom/cache" {
	export interface DOMNodeCache {
		[HTML_CACHE_KEY]: TextClassification;
		[A11Y_CACHE_KEY]: TextClassification;
		[IGNORE_HIDDEN_ROOT_HTML_CACHE_KEY]: TextClassification;
		[IGNORE_HIDDEN_ROOT_A11Y_CACHE_KEY]: TextClassification;
	}
}

/**
 * @internal
 */
export function getCachekey(options: TextClassificationOptions): CACHE_KEY {
	const { accessible = false, ignoreHiddenRoot = false } = options;
	if (accessible && ignoreHiddenRoot) {
		return IGNORE_HIDDEN_ROOT_A11Y_CACHE_KEY;
	} else if (ignoreHiddenRoot) {
		return IGNORE_HIDDEN_ROOT_HTML_CACHE_KEY;
	} else if (accessible) {
		return A11Y_CACHE_KEY;
	} else {
		return HTML_CACHE_KEY;
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
 *
 * @public
 */
export function classifyNodeText(
	node: HtmlElement,
	options: TextClassificationOptions = {},
): TextClassification {
	const { accessible = false, ignoreHiddenRoot = false } = options;
	const cacheKey = getCachekey(options);

	if (node.cacheExists(cacheKey)) {
		return node.cacheGet(cacheKey)!; // eslint-disable-line @typescript-eslint/no-non-null-assertion -- has/get combo
	}

	if (!ignoreHiddenRoot && isHTMLHidden(node)) {
		return node.cacheSet(cacheKey, TextClassification.EMPTY_TEXT);
	}

	if (!ignoreHiddenRoot && accessible && isAriaHidden(node)) {
		return node.cacheSet(cacheKey, TextClassification.EMPTY_TEXT);
	}

	if (isSpecialEmpty(node)) {
		return node.cacheSet(cacheKey, TextClassification.EMPTY_TEXT);
	}

	const text = findTextNodes(node, {
		...options,
		ignoreHiddenRoot: false,
	});

	/* if any text is dynamic classify as dynamic */
	if (text.some((cur) => cur.isDynamic)) {
		return node.cacheSet(cacheKey, TextClassification.DYNAMIC_TEXT);
	}

	/* if any text has non-whitespace character classify as static */
	if (text.some((cur) => /\S/.exec(cur.textContent) !== null)) {
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
			if (isHTMLHidden(child, true).bySelf) {
				continue;
			}
			if (accessible && isAriaHidden(child, true).bySelf) {
				continue;
			}
			text = text.concat(findTextNodes(child, options));
		}
	}
	return text;
}
