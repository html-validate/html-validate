import { Location } from "../context";
import { DynamicValue } from "./dynamic-value";

export class Attribute {
	public readonly key: string;
	public readonly value: string | DynamicValue;
	public readonly location: Location;

	constructor(key: string, value: string | DynamicValue, location: Location) {
		this.key = key;
		this.value = value;
		this.location = location;
	}
}
