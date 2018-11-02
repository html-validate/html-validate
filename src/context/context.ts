import { Source } from './source';
import { Location } from './location';

export enum ContentModel {
	TEXT = 1,
	SCRIPT,
}

export class Context {
	state: number;
	string: string;
	filename: string;
	line: number;
	column: number;
	contentModel: ContentModel;
	scriptEnd: string;

	constructor(source: Source){
		this.state = undefined;
		this.string = source.data;
		this.filename = source.filename;
		this.line = source.line;
		this.column = source.column;
		this.contentModel = ContentModel.TEXT;
		this.scriptEnd = undefined;
	}

	consume(n: number|Array<string>, state?: number){
		/* if "n" is an regex match the first value is the full matched
		 * string so consume that many characters. */
		if (typeof n !== 'number'){
			n = n[0].length; /* regex match */
		}

		/* poor mans line counter :( */
		let consumed = this.string.slice(0, n);
		let offset;
		while ((offset = consumed.indexOf('\n')) >= 0){
			this.line++;
			this.column = 1;
			consumed = consumed.substr(offset + 1);
		}
		this.column += consumed.length;

		/* remove N chars */
		this.string = this.string.substr(n);

		/* change state */
		if (typeof state !== 'undefined'){
			this.state = state;
		}
	}

	getLocation(): Location {
		return {
			filename: this.filename,
			line: this.line,
			column: this.column,
		};
	}
}

export default Context;
