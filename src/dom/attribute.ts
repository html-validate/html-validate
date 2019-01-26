import { Location } from "../context";
import { DynamicValue } from "./dynamic-value";

export class Attribute {
	public readonly key: string;
	public readonly value: string | DynamicValue;
	public readonly location: Location;

	public constructor(
		key: string,
		value: string | DynamicValue,
		location: Location
	) {
		this.key = key;
		this.value = value;
		this.location = location;

		/* force undefined to null */
		if (typeof this.value === "undefined") {
			this.value = null;
		}
	}

	/**
	 * Test attribute value.
	 *
	 * @param {RegExp|string} pattern - Pattern to match value against. RegExp or
	 * a string (===)
	 * @returns {boolean} `true` if attribute value matches pattern.
	 */
	public valueMatches(pattern: RegExp): boolean;
	public valueMatches(pattern: string): boolean;
	public valueMatches(pattern: any): boolean {
		/* dynamic values matches everything */
		if (this.value instanceof DynamicValue) {
			return true;
		}

		/* test value against pattern */
		if (pattern instanceof RegExp) {
			return this.value.match(pattern) !== null;
		} else {
			return this.value === pattern;
		}
	}
}
