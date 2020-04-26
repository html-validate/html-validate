import { Location, sliceLocation } from "../context";
import { DynamicValue } from "./dynamic-value";

interface Result {
	tokens: string[];
	locations: Location[];
}

function parse(text: string, baseLocation: Location): Result {
	const tokens: string[] = [];
	const locations: Location[] | undefined = baseLocation ? [] : undefined;
	for (let begin = 0; begin < text.length; ) {
		let end = text.indexOf(" ", begin);

		/* if the last space was found move the position to the last character
		 * in the string */
		if (end === -1) {
			end = text.length;
		}

		/* handle multiple spaces */
		const size = end - begin;
		if (size === 0) {
			begin++;
			continue;
		}

		/* extract token */
		const token = text.substring(begin, end);
		tokens.push(token);

		/* extract location */
		if (baseLocation) {
			const location = sliceLocation(baseLocation, begin, end);
			locations.push(location);
		}

		/* advance position to the character after the current end position */
		begin += size + 1;
	}
	return { tokens, locations };
}

export class DOMTokenList extends Array<string> {
	public readonly value: string;
	private readonly locations: Location[] | undefined;

	public constructor(value: string | DynamicValue, location?: Location) {
		if (value && typeof value === "string") {
			const { tokens, locations } = parse(value, location);
			super(...tokens);
			this.locations = locations;
		} else {
			super(0);
		}

		if (value instanceof DynamicValue) {
			this.value = value.expr;
		} else {
			this.value = value;
		}
	}

	public item(n: number): string | undefined {
		return this[n];
	}

	public location(n: number): Location | undefined {
		if (this.locations) {
			return this.locations[n];
		} else {
			throw new Error(
				"Trying to access DOMTokenList location when base location isn't set"
			);
		}
	}

	public contains(token: string): boolean {
		return this.indexOf(token) >= 0;
	}
}
