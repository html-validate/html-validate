import { type HtmlElement } from "../../dom";

export function hasAltText(image: HtmlElement): boolean {
	const alt = image.getAttribute("alt");

	/* missing attribute */
	if (!alt) {
		return false;
	}

	/* (incorrectly) set as boolean value */
	if (alt.value === null) {
		return false;
	}

	return alt.isDynamic || alt.value.toString() !== "";
}
