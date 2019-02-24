import { Location } from "../context";
import { DynamicValue } from "./dynamic-value";

export class Attribute {
	public readonly key: string;
	public readonly value: string | DynamicValue;
	public readonly keyLocation: Location;
	public readonly valueLocation: Location;
	public readonly originalAttribute: string;

	public constructor(
		key: string,
		value: string | DynamicValue,
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
	get isStatic() {
		return !this.isDynamic;
	}

	/**
	 * Flag set to true if the attribute value is dynamic.
	 */
	get isDynamic() {
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
	public valueMatches(pattern: any, dynamicMatches: boolean = true): boolean {
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
