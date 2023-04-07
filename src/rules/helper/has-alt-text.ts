import { type HtmlElement } from "../../dom";

export function hasAltText(image: HtmlElement): boolean {
	const alt = image.getAttribute("alt");

	/* missing or boolean */
	if (alt === null || alt.value === null) {
		return false;
	}

	return alt.isDynamic || alt.value.toString() !== "";
}
