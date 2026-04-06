import { type Location } from "../location";

export class ParserError extends Error {
	public location: Location;

	public constructor(location: Location, message: string) {
		super(message);
		this.name = "ParserError";
		this.location = location;
	}
}
