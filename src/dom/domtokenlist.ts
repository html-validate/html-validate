import { type Location, sliceLocation } from "../context";
import { DynamicValue } from "./dynamic-value";

interface Result {
	tokens: string[];
	locations: Location[] | null;
}

function parse(text: string, baseLocation: Location | null): Result {
	const tokens: string[] = [];
	const locations: Location[] | null = baseLocation ? [] : null;
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
		if (locations && baseLocation) {
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
	private readonly locations: Location[] | null;

	public constructor(value: string | DynamicValue | null, location: Location | null) {
		if (value && typeof value === "string") {
			/* replace all whitespace with a single space for easier parsing */
			const normalized = value.replace(/[\t\r\n]/g, " ");
			const { tokens, locations } = parse(normalized, location);
			super(...tokens);
			this.locations = locations;
		} else {
			super(0);
			this.locations = null;
		}

		if (value instanceof DynamicValue) {
			this.value = value.expr;
		} else {
			this.value = value || "";
		}
	}

	public item(n: number): string | undefined {
		return this[n];
	}

	public location(n: number): Location | undefined {
		if (this.locations) {
			return this.locations[n];
		} else {
			throw new Error("Trying to access DOMTokenList location when base location isn't set");
		}
	}

	public contains(token: string): boolean {
		return this.includes(token);
	}

	public *iterator(): Generator<{ index: number; item: string; location: Location }> {
		for (let index = 0; index < this.length; index++) {
			/* eslint-disable @typescript-eslint/no-non-null-assertion -- as we loop over length this should always be set */
			const item = this.item(index)!;
			const location = this.location(index)!;
			/* eslint-enable @typescript-eslint/no-non-null-assertion */
			yield { index, item, location };
		}
	}
}
