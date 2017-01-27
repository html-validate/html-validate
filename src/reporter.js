'use strict';

const Config = require('./config');

class Reporter {
	constructor(){
		this.result = {};
	}

	add(node, rule, message, context){
		if ( !this.result.hasOwnProperty(context.filename) ){
			this.result[context.filename] = [];
		}
		this.result[context.filename].push({
			rule: rule.name,
			severity: Config.SEVERITY_ERROR,
			message,
			line: context.line,
			column: context.column,
		});
	}

	save(dst){
		if ( typeof(dst) === 'undefined' ) return;
		if ( typeof(dst.valid) === 'undefined' ) dst.valid = true;
		if ( typeof(dst.results) === 'undefined' ) dst.results = [];
		dst.valid = dst.valid && Object.keys(this.result).length === 0;
		dst.results = dst.results.concat(Object.keys(this.result).map(filename => {
			return {
				filePath: filename,
				messages: this.result[filename],
			};
		}));
	}
}

module.exports = Reporter;
