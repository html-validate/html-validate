import { Location } from "../context";
import { DynamicValue } from "./dynamic-value";

interface StaticAttribute {
	readonly value: string | null;
}

interface DynamicAttribute {
	readonly value: DynamicValue;
}

/**
 * Type guard for [[Attribute]] testing if the value is static (missing value is
 * considered static as it is a fixed known value).
 *
 * @public
 */
export function isStaticAttribute(attr: Attribute | null): attr is Attribute & StaticAttribute {
	return Boolean(attr && attr.isStatic);
}

/**
 * Type guard for [[Attribute]] testing if the value is dynamic.
 *
 * @public
 */
export function isDynamicAttribute(attr: Attribute | null): attr is Attribute & DynamicAttribute {
	return Boolean(attr && attr.isDynamic);
}

/**
 * DOM Attribute.
 *
 * Represents a HTML attribute. Can contain either a fixed static value or a
 * placeholder for dynamic values (e.g. interpolated).
 */
export class Attribute {
	/** Attribute name */
	public readonly key: string;
	public readonly value: string | DynamicValue | null;
	public readonly keyLocation: Location;
	public readonly valueLocation: Location | null;
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
		value: null | string | DynamicValue | null,
		keyLocation: Location,
		valueLocation: Location | null,
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
	 * @param pattern - Pattern to match value against. RegExp or a string (===)
	 * @param dynamicMatches - If true `DynamicValue` will always match, if false
	 * it never matches.
	 * @returns `true` if attribute value matches pattern.
	 */
	public valueMatches(pattern: RegExp, dynamicMatches?: boolean): boolean;
	public valueMatches(pattern: string, dynamicMatches?: boolean): boolean;
	public valueMatches(pattern: RegExp | string, dynamicMatches: boolean = true): boolean {
		if (this.value === null) {
			return false;
		}

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
