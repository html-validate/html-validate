import { HtmlElement } from "../../dom";

/**
 * Tests if this element is present in the accessibility tree.
 *
 * In practice it tests whenever the element or its parents has
 * `role="presentation"` or `aria-hidden="false"`. Dynamic values counts as
 * visible since the element might be in the visibility tree sometimes.
 */
export function inAccessibilityTree(node: HtmlElement): boolean {
	do {
		const role = node.getAttribute("role");
		const ariaHidden = node.getAttribute("aria-hidden");

		/* role="presentation" */
		if (role && role.value === "presentation") {
			return false;
		}

		/* aria-hidden="true" */
		if (ariaHidden && ariaHidden.value === "true") {
			return false;
		}

		/* check parents */
		node = node.parent;
	} while (!node.isRootElement());

	return true;
}
