import { type Location } from "../context";

export class ParserError extends Error {
	public location: Location;

	public constructor(location: Location, message: string) {
		super(message);
		this.name = "ParserError";
		this.location = location;
	}
}
