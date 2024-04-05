import { type DOMTree, type HtmlElement, DynamicValue, generateIdSelector } from "../../dom";
import { inAccessibilityTree } from "./a11y";
import { hasAltText } from "./has-alt-text";
import { classifyNodeText, TextClassification } from "./text";

declare module "../../dom/cache" {
	export interface DOMNodeCache {
		[HAS_ACCESSIBLE_TEXT_CACHE]: boolean;
	}
}

interface Context {
	document: DOMTree | HtmlElement;
	reference: HtmlElement | null;
}

const HAS_ACCESSIBLE_TEXT_CACHE = Symbol(hasAccessibleName.name);

function isHidden(node: HtmlElement, context: Context): boolean {
	const { reference } = context;
	if (reference?.isSameNode(node)) {
		return false;
	} else {
		return !inAccessibilityTree(node);
	}
}

function hasImgAltText(node: HtmlElement, context: Context): boolean {
	if (node.is("img")) {
		return hasAltText(node);
	} else if (node.is("svg")) {
		return node.textContent.trim() !== "";
	} else {
		for (const img of node.querySelectorAll("img, svg")) {
			const hasName = hasAccessibleNameImpl(img, context);
			if (hasName) {
				return true;
			}
		}
		return false;
	}
}

function hasLabel(node: HtmlElement): boolean {
	const value = node.getAttributeValue("aria-label") ?? "";
	return Boolean(value.trim());
}

function isLabelledby(node: HtmlElement, context: Context): boolean {
	const { document, reference } = context;

	/* if we already have resolved one level of reference we don't resolve another
	 * level (as per accname step 2B) */
	if (reference) {
		return false;
	}

	const ariaLabelledby = node.ariaLabelledby;

	/* consider dynamic aria-labelledby as having a name as we cannot resolve it
	 * so no way to prove correctness */
	if (ariaLabelledby instanceof DynamicValue) {
		return true;
	}

	/* ignore elements without aria-labelledby */
	if (ariaLabelledby === null) {
		return false;
	}

	return ariaLabelledby.some((id) => {
		const selector = generateIdSelector(id);
		return document.querySelectorAll(selector).some((child) => {
			return hasAccessibleNameImpl(child, {
				document,
				reference: child,
			});
		});
	});
}

/**
 * This algorithm is based on ["Accessible Name and Description Computation
 * 1.2"][accname] with some exceptions:
 *
 * It doesn't compute the actual name but only the presence of one, e.g. if a
 * non-empty flat string is present the algorithm terminates with a positive
 * result.
 *
 * It takes some optimization shortcuts such as starting with step F as it
 * would be more common usage and as there is no actual name being computed
 * the order wont matter.
 *
 * [accname]: https://w3c.github.io/accname
 */
function hasAccessibleNameImpl(current: HtmlElement, context: Context): boolean {
	const { reference } = context;

	/* if this element is hidden (see function for exceptions) it does not have an accessible name */
	if (isHidden(current, context)) {
		return false;
	}

	/* special case: when this element is directly referenced by aria-labelledby
	 * we ignore `hidden` */
	const ignoreHiddenRoot = Boolean(reference?.isSameNode(current));

	const text = classifyNodeText(current, { accessible: true, ignoreHiddenRoot });
	if (text !== TextClassification.EMPTY_TEXT) {
		return true;
	}

	if (hasImgAltText(current, context)) {
		return true;
	}

	if (hasLabel(current)) {
		return true;
	}

	if (isLabelledby(current, context)) {
		return true;
	}

	return false;
}

/**
 * Returns `true` if the element has an accessible name.
 *
 * It does not yet consider if the elements role prohibits naming, e.g. a `<p>`
 * element will still show up as having an accessible name.
 *
 * @public
 * @param document - Document element.
 * @param current - The element to get accessible name for
 * @returns `true` if the element has an accessible name.
 */
export function hasAccessibleName(document: DOMTree | HtmlElement, current: HtmlElement): boolean {
	/* istanbul ignore next: we're not testing cache */
	if (current.cacheExists(HAS_ACCESSIBLE_TEXT_CACHE)) {
		return Boolean(current.cacheGet(HAS_ACCESSIBLE_TEXT_CACHE));
	}

	const result = hasAccessibleNameImpl(current, {
		document,
		reference: null,
	});
	return current.cacheSet(HAS_ACCESSIBLE_TEXT_CACHE, result);
}
