import { type Location } from "./location";
import { type Source } from "./source";
import { State } from "./state";

export enum ContentModel {
	TEXT = 1,
	SCRIPT,
	STYLE,
}

/**
 * @internal
 */
export class Context {
	public contentModel: ContentModel;
	public state: State;
	public string: string;
	private filename: string;
	private offset: number;
	private line: number;
	private column: number;

	public constructor(source: Source) {
		this.state = State.INITIAL;
		this.string = source.data;
		this.filename = source.filename;
		this.offset = source.offset;
		this.line = source.line;
		this.column = source.column;
		this.contentModel = ContentModel.TEXT;
	}

	public getTruncatedLine(n: number = 13): string {
		return JSON.stringify(this.string.length > n ? `${this.string.slice(0, 10)}...` : this.string);
	}

	public consume(n: number | string[], state: State): void {
		/* if "n" is an regex match the first value is the full matched
		 * string so consume that many characters. */
		if (typeof n !== "number") {
			n = n[0].length; /* regex match */
		}

		/* poor mans line counter :( */
		let consumed = this.string.slice(0, n);
		let offset;
		while ((offset = consumed.indexOf("\n")) >= 0) {
			this.line++;
			this.column = 1;
			consumed = consumed.substr(offset + 1);
		}
		this.column += consumed.length;
		this.offset += n;

		/* remove N chars */
		this.string = this.string.substr(n);

		/* change state */
		this.state = state;
	}

	public getLocation(size: number): Location {
		return {
			filename: this.filename,
			offset: this.offset,
			line: this.line,
			column: this.column,
			size,
		};
	}
}

export default Context;
