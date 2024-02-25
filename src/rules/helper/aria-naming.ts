import { type HtmlElement, DynamicValue } from "../../dom";
import { type MetaElement } from "../../meta";

const cacheKey = Symbol("aria-naming");

declare module "../../dom/cache" {
	export interface DOMNodeCache {
		[cacheKey]: "allowed" | "prohibited";
	}
}

/* default value is also stored in [[normalizeAriaNaming]] */
const defaultValue = "allowed" as const;

/* WAI ARIA 5.2.8.6 Roles which cannot be named (Name prohibited) */
const prohibitedRoles = [
	"caption",
	"code",
	"deletion",
	"emphasis",
	"generic",
	"insertion",
	"paragraph",
	"presentation",
	"strong",
	"subscript",
	"superscript",
];

function byRole(role: string): "allowed" | "prohibited" {
	return prohibitedRoles.includes(role) ? "prohibited" : "allowed";
}

function byMeta(element: HtmlElement, meta: MetaElement): "allowed" | "prohibited" {
	return meta.aria.naming(element._adapter);
}

/**
 * Returns the normalized metadata property `aria.naming`.
 *
 * - Returns `allowed` if this element allows naming.
 * - Returns `prohibited` if this element does not allow naming.
 * - If the element doesn't have metadata `allowed` is returned.
 *
 * If the element contains an explicit `role` the role is used to determine
 * whenever the element allows naming or not. Otherwise it uses metadata to
 * determine.
 *
 * @public
 * @param element - Element to get `aria.naming` from.
 */
export function ariaNaming(element: HtmlElement): "allowed" | "prohibited" {
	const cached = element.cacheGet(cacheKey);
	if (cached) {
		return cached;
	}

	/* if the element contains an explicit role we use that to determine if naming
	 * is allowed or not */
	const role = element.getAttribute("role")?.value;
	if (role) {
		if (role instanceof DynamicValue) {
			return element.cacheSet(cacheKey, defaultValue);
		} else {
			return element.cacheSet(cacheKey, byRole(role));
		}
	}

	const meta = element.meta;
	if (!meta) {
		return element.cacheSet(cacheKey, defaultValue);
	}

	return element.cacheSet(cacheKey, byMeta(element, meta));
}
