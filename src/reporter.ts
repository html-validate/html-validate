import Config from './config';
import Context from './context'; // eslint-disable-line no-unused-vars
import DOMNode from './domnode'; // eslint-disable-line no-unused-vars

export interface Message {
	rule: string;
	severity: number;
	message: string;
	line: number;
	column: number;
}

export interface Report {
	valid: boolean;
	results: Array<{
		filePath: string;
		messages: Array<Message>;
	}>;
}

export class Reporter {
	result: { [filename: string]: Array<Message>; };

	constructor(){
		this.result = {};
	}

	add(node: DOMNode, rule, message: string, context: Context){
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

	save(): Report {
		return {
			valid: Object.keys(this.result).length === 0,
			results: Object.keys(this.result).map(filename => {
				return {
					filePath: filename,
					messages: this.result[filename],
				};
			}),
		};
	}
}

export default Reporter;
