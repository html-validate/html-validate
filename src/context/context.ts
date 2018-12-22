import { Location } from "./location";
import { Source } from "./source";

export enum ContentModel {
	TEXT = 1,
	SCRIPT,
}

export class Context {
	state: number;
	string: string;
	filename: string;
	offset: number;
	line: number;
	column: number;
	contentModel: ContentModel;
	scriptEnd: string;

	constructor(source: Source){
		this.state = undefined;
		this.string = source.data;
		this.filename = source.filename;
		this.offset = 0;
		this.line = source.line;
		this.column = source.column;
		this.contentModel = ContentModel.TEXT;
		this.scriptEnd = undefined;
	}

	consume(n: number|string[], state: number){
		/* if "n" is an regex match the first value is the full matched
		 * string so consume that many characters. */
		if (typeof n !== "number"){
			n = n[0].length; /* regex match */
		}

		/* poor mans line counter :( */
		let consumed = this.string.slice(0, n);
		let offset;
		while ((offset = consumed.indexOf("\n")) >= 0){ /* tslint:disable-line:no-conditional-assignment */
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

	getLocation(size?: number): Location {
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
