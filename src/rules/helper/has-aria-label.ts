import { type HtmlElement } from "../../dom";

export function hasAriaLabel(node: HtmlElement): boolean {
	const label = node.getAttribute("aria-label");

	/* missing or boolean */
	if (label === null || label.value === null) {
		return false;
	}

	return label.isDynamic || label.value.toString() !== "";
}
