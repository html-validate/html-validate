import { Config } from "./config";
import { Location } from "./context";
import { HtmlElement } from "./dom";
import { Rule } from "./rule";

export interface Message {
	ruleId: string;
	severity: number;
	message: string;
	offset: number;
	line: number;
	column: number;
	size: number;
}

export interface Result {
	messages: Message[];
	filePath: string;
	errorCount?: number;
	warningCount?: number;
}

export interface Report {
	valid: boolean;
	results: Result[];
}

export class Reporter {
	result: { [filename: string]: Message[]; };

	constructor(){
		this.result = {};
	}

	/**
	 * Merge two or more reports into a single one.
	 */
	public static merge(reports: Report[]): Report {
		const valid = reports.every((report) => report.valid);
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
		return {valid, results: Object.keys(merged).map((key) => merged[key])};
	}

	add(node: HtmlElement, rule: Rule, message: string, severity: number, location: Location){
		if (!this.result.hasOwnProperty(location.filename)){
			this.result[location.filename] = [];
		}
		this.result[location.filename].push({
			ruleId: rule.name,
			severity,
			message,
			offset: location.offset,
			line: location.line,
			column: location.column,
			size: location.size || 0,
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
			valid: this.isValid(),
			results: Object.keys(this.result).map((filePath) => {
				const messages = [].concat(this.result[filePath]).sort(messageSort);
				return {
					filePath,
					messages,
					errorCount: countErrors(messages),
					warningCount: countWarnings(messages),
				};
			}),
		};
	}

	protected isValid(): boolean {
		const numErrors = Object.values(this.result).reduce((sum, messages) => {
			return sum + countErrors(messages);
		}, 0);
		return numErrors === 0;
	}
}

function countErrors(messages: Message[]){
	return messages.filter((m) => m.severity === Config.SEVERITY_ERROR).length;
}

function countWarnings(messages: Message[]){
	return messages.filter((m) => m.severity === Config.SEVERITY_WARN).length;
}

function messageSort(a: Message, b: Message): number {
	if (a.line < b.line){
		return -1;
	}

	if (a.line > b.line){
		return 1;
	}

	if (a.column < b.column){
		return -1;
	}

	if (a.column > b.column){
		return 1;
	}

	return 0;
}

export default Reporter;
