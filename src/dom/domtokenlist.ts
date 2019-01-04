import { DynamicValue } from "./dynamic-value";

export class DOMTokenList extends Array<string> {
	public readonly value: string;

	constructor(value: string | DynamicValue) {
		if (value && typeof value === "string") {
			super(...value.trim().split(/ +/));
		} else {
			super(0);
		}

		if (value instanceof DynamicValue) {
			this.value = value.expr;
		} else {
			this.value = value;
		}
	}

	public item(n: number): string {
		return this[n];
	}

	public contains(token: string): boolean {
		return this.indexOf(token) >= 0;
	}
}
