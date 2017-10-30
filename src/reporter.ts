import { Config } from './config';
import { Context } from './context';
import { DOMNode } from 'dom';
import { Rule } from './rule';

export interface Message {
	ruleId: string;
	severity: number;
	message: string;
	line: number;
	column: number;
}

export interface Result {
	messages: Message[];
	filePath: string;
}

export interface Report {
	valid: boolean;
	results: Result[];
}

export class Reporter {
	result: { [filename: string]: Array<Message>; };

	constructor(){
		this.result = {};
	}

	/**
	 * Merge two or more reports into a single one.
	 */
	public static merge(reports: Report[]): Report {
		const valid = reports.every(report => report.valid);
		const merged: { [key: string]: Result } = {};
		reports.forEach((report: Report) => {
			report.results.forEach((result: Result) => {
				const key = result.filePath;
				if (merged.hasOwnProperty(key)){
					merged[key].messages = [].concat(merged[key].messages, result.messages);
				} else {
					merged[key] = Object.assign({}, result);
				}
			});
		});
		return {valid, results: Object.keys(merged).map(key => merged[key])};
	}

	add(node: DOMNode, rule: Rule, message: string, severity: number, context: Context){
		if (!this.result.hasOwnProperty(context.filename)){
			this.result[context.filename] = [];
		}
		this.result[context.filename].push({
			ruleId: rule.name,
			severity,
			message,
			line: context.line,
			column: context.column,
		});
	}

	addManual(filename: string, message: Message): void {
		if (!this.result.hasOwnProperty(filename)){
			this.result[filename] = [];
		}
		this.result[filename].push(message);
	}

	save(): Report {
		return {
			valid: Object.keys(this.result).length === 0,
			results: Object.keys(this.result).map(filePath => {
				const messages = this.result[filePath];
				return {
					filePath,
					messages,
					errorCount: messages.filter(m => m.severity === Config.SEVERITY_ERROR).length,
					warningCount: messages.filter(m => m.severity === Config.SEVERITY_WARN).length,
				};
			}),
		};
	}
}

export default Reporter;
