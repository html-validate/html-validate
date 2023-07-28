import { type HtmlElement } from "../../dom";

export function hasAriaLabel(node: HtmlElement): boolean {
	const label = node.getAttribute("aria-label");

	/* missing attribute */
	if (!label) {
		return false;
	}

	/* (incorrectly) set as boolean value */
	if (label.value === null) {
		return false;
	}

	return label.isDynamic || label.value.toString() !== "";
}
