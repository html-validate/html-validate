import { Location } from "../context";
import { DynamicValue } from "./dynamic-value";

/**
 * DOM Attribute.
 *
 * Represents a HTML attribute. Can contain either a fixed static value or a
 * placeholder for dynamic values (e.g. interpolated).
 */
export class Attribute {
	/** Attribute name */
	public readonly key: string;
	public readonly value: string | DynamicValue;
	public readonly keyLocation: Location;
	public readonly valueLocation: Location;
	public readonly originalAttribute?: string;

	/**
	 * @param key - Attribute name.
	 * @param value - Attribute value. Set to `null` for boolean attributes.
	 * @param keyLocation - Source location of attribute name.
	 * @param valueLocation - Source location of attribute value.
	 * @param originalAttribute - If this attribute was dynamically added via a
	 * transformation (e.g. vuejs `:id` generating the `id` attribute) this
	 * parameter should be set to the attribute name of the source attribute (`:id`).
	 */
	public constructor(
		key: string,
		value: null | string | DynamicValue,
		keyLocation?: Location,
		valueLocation?: Location,
		originalAttribute?: string
	) {
		this.key = key;
		this.value = value;
		this.keyLocation = keyLocation;
		this.valueLocation = valueLocation;
		this.originalAttribute = originalAttribute;

		/* force undefined to null */
		if (typeof this.value === "undefined") {
			this.value = null;
		}
	}

	/**
	 * Flag set to true if the attribute value is static.
	 */
	public get isStatic(): boolean {
		return !this.isDynamic;
	}

	/**
	 * Flag set to true if the attribute value is dynamic.
	 */
	public get isDynamic(): boolean {
		return this.value instanceof DynamicValue;
	}

	/**
	 * Test attribute value.
	 *
	 * @param {RegExp|string} pattern - Pattern to match value against. RegExp or
	 * a string (===)
	 * @param {boolean} [dynamicMatches=true] - If true `DynamicValue` will always
	 * match, if false it never matches.
	 * @returns {boolean} `true` if attribute value matches pattern.
	 */
	public valueMatches(pattern: RegExp, dynamicMatches?: boolean): boolean;
	public valueMatches(pattern: string, dynamicMatches?: boolean): boolean;
	public valueMatches(pattern: RegExp | string, dynamicMatches: boolean = true): boolean {
		/* dynamic values matches everything */
		if (this.value instanceof DynamicValue) {
			return dynamicMatches;
		}

		/* test value against pattern */
		if (pattern instanceof RegExp) {
			return this.value.match(pattern) !== null;
		} else {
			return this.value === pattern;
		}
	}
}
