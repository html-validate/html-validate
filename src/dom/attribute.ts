import { Location } from "../context";

export class Attribute {
	public readonly key: string;
	public readonly value: string;
	public readonly location: Location;

	constructor(key: string, value: string, location: Location) {
		this.key = key;
		this.value = value;
		this.location = location;
	}
}
