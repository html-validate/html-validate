import { type Location } from "../location";
import { type Source } from "./source";
import { State } from "./state";

export enum ContentModel {
	TEXT = 1,
	SCRIPT,
	STYLE,
	TEXTAREA,
	TITLE,
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

	public consume(n: number, state: State): void {
		let lastNewline = -1;
		let newlines = 0;
		for (let i = 0; i < n; i++) {
			if (this.string[i] !== "\n") {
				continue;
			}

			newlines++;
			lastNewline = i;
		}
		if (newlines > 0) {
			this.line += newlines;
			this.column = n - lastNewline;
		} else {
			this.column += n;
		}
		this.offset += n;

		/* remove N chars */
		this.string = this.string.slice(n);

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
