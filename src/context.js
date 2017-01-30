'use strict';

class Context {
	constructor(source){
		this.state = undefined;
		this.string = source.data;
		this.filename = source.filename;
		this.line = 1;
		this.column = 1;
	}

	consume(n, state){
		/* if "n" is an regex match the first value is the full matched
		 * string so consume that many characters. */
		if ( typeof(n) !== 'number' ){
			n = n[0].length; /* regex match */
		}

		/* poor mans line counter :( */
		let consumed = this.string.slice(0, n);
		let offset;
		while ( (offset=consumed.indexOf('\n')) >= 0 ){
			this.line++;
			this.column = 1;
			consumed = consumed.substr(offset + 1);
		}
		this.column += consumed.length;

		/* remove N chars */
		this.string = this.string.substr(n);

		/* change state */
		if ( typeof(state) !== 'undefined' ){
			this.state = state;
		}
	}

	getLocationData(){
		return {
			filename: this.filename,
			line: this.line,
			column: this.column,
		};
	}

	getLocationString(){
		return `${this.filename}:${this.line}:${this.column}`;
	}
}

module.exports = Context;
