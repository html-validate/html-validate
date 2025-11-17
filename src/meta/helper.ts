import { naturalJoin } from "../utils/natural-join";
import { type MetaAttributeAllowedCallback } from "./element";
import { type HtmlElementLike } from "./html-element-like";

/**
 * Helpers when writing element metadata.
 *
 * @public
 */
export interface MetadataHelper {
	/** Returns an error if another attribute is omitted, i.e. it requires another attribute to be present to pass. */
	allowedIfAttributeIsPresent(this: void, ...attr: string[]): MetaAttributeAllowedCallback;

	/** Returns an error if another attribute is present, i.e. it requires another attribute to be omitted to pass. */
	allowedIfAttributeIsAbsent(this: void, ...attr: string[]): MetaAttributeAllowedCallback;

	/** Returns an error if another attribute does not have one of the listed values */
	allowedIfAttributeHasValue(
		this: void,
		attr: string,
		value: string[],
		options?: { defaultValue?: string | null },
	): MetaAttributeAllowedCallback;

	/**
	 * Returns an error if the node doesn't have any of the given elements as parent
	 *
	 * @since 8.2.0
	 **/
	allowedIfParentIsPresent(this: void, ...tags: string[]): MetaAttributeAllowedCallback;

	/**
	 * Returns true if an attribute with space-separated tokens includes given
	 * keyword.
	 *
	 * @since %version%
	 * @param attr - Attribute value.
	 * @param keyword - Keyword to look for.
	 */
	hasKeyword(this: void, attr: string, keyword: string): boolean;
}

/**
 * @internal
 */
export function allowedIfAttributeIsPresent(...attr: string[]) {
	return (node: HtmlElementLike) => {
		if (attr.some((it) => node.hasAttribute(it))) {
			return null;
		}
		const expected = naturalJoin(attr.map((it) => `"${it}"`));
		return `requires ${expected} attribute to be present`;
	};
}

/**
 * @internal
 */
export function allowedIfAttributeIsAbsent(...attr: string[]): MetaAttributeAllowedCallback {
	return (node: HtmlElementLike) => {
		const present = attr.filter((it) => node.hasAttribute(it));
		if (present.length === 0) {
			return null;
		}
		const expected = naturalJoin(present.map((it) => `"${it}"`));
		return `cannot be used at the same time as ${expected}`;
	};
}

/**
 * @internal
 */
export function allowedIfAttributeHasValue(
	key: string,
	expectedValue: string[],
	{ defaultValue }: { defaultValue?: string | null } = {},
): MetaAttributeAllowedCallback {
	return (node: HtmlElementLike) => {
		const attr = node.getAttribute(key);
		if (attr && typeof attr !== "string") {
			return null;
		}
		const actualValue = attr ?? defaultValue;
		if (actualValue && expectedValue.includes(actualValue.toLocaleLowerCase())) {
			return null;
		}
		const expected = naturalJoin(expectedValue.map((it) => `"${it}"`));
		return `"${key}" attribute must be ${expected}`;
	};
}

/**
 * @internal
 */
export function allowedIfParentIsPresent(
	this: void,
	...tags: string[]
): MetaAttributeAllowedCallback {
	return (node: HtmlElementLike) => {
		const match = tags.some((it) => node.closest(it));
		if (match) {
			return null;
		}
		const expected = naturalJoin(tags.map((it) => `<${it}>`));
		return `requires ${expected} as parent`;
	};
}

/**
 * @internal
 */
export function hasKeyword(attr: string, keyword: string): boolean {
	return attr.toLowerCase().split(/\s+/).includes(keyword);
}

/**
 * @public
 */
export const metadataHelper: MetadataHelper = {
	allowedIfAttributeIsPresent,
	allowedIfAttributeIsAbsent,
	allowedIfAttributeHasValue,
	allowedIfParentIsPresent,
	hasKeyword,
};
