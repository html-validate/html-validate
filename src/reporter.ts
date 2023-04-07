import { Severity } from "./config";
import { type Location, type Source } from "./context";
import { type Rule } from "./rule";
import { type DOMNode } from "./dom";

/**
 * Reported error message.
 *
 * @public
 */
export interface Message {
	/** Rule that triggered this message */
	ruleId: string;

	/** URL to description of error */
	ruleUrl?: string;

	/** Severity of the message */
	severity: number;

	/** Message text */
	message: string;

	/** Offset (number of characters) into the source */
	offset: number;

	/** Line number */
	line: number;

	/** Column number */
	column: number;

	/** From start offset, how many characters is this message relevant for */
	size: number;

	/** DOM selector */
	selector: string | null;

	/**
	 * Optional error context used to provide context-aware documentation.
	 *
	 * This context can be passed to [[HtmlValidate#getRuleDocumentation]].
	 */
	context?: any;
}

/**
 * @internal
 */
export interface DeferredMessage extends Omit<Message, "selector"> {
	selector: () => string | null;
}

function freeze(src: DeferredMessage): Message {
	return {
		...src,
		selector: src.selector(),
	};
}

/**
 * @public
 */
export interface Result {
	messages: Message[];
	filePath: string;
	errorCount: number;
	warningCount: number;
	source: string | null;
}

/**
 * Report object returned by [[HtmlValidate]].
 *
 * @public
 */
export interface Report {
	/** `true` if validation was successful */
	valid: boolean;

	/** Detailed results per validated source */
	results: Result[];

	/** Total number of errors across all sources */
	errorCount: number;

	/** Total warnings of errors across all sources */
	warningCount: number;
}

/**
 * @internal
 */
export class Reporter {
	protected result: Record<string, DeferredMessage[]>;

	public constructor() {
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
				if (key in merged) {
					merged[key].messages = [...merged[key].messages, ...result.messages];
				} else {
					merged[key] = { ...result };
				}
			});
		});
		const results: Result[] = Object.values(merged).map((result: Result) => {
			/* recalculate error- and warning-count */
			result.errorCount = countErrors(result.messages);
			result.warningCount = countWarnings(result.messages);
			return result;
		});
		return {
			valid,
			results,
			errorCount: sumErrors(results),
			warningCount: sumWarnings(results),
		};
	}

	public add<ContextType, OptionsType>(
		rule: Rule<ContextType, OptionsType>,
		message: string,
		severity: number,
		node: DOMNode | null,
		location: Location,
		context?: ContextType
	): void {
		if (!(location.filename in this.result)) {
			this.result[location.filename] = [];
		}
		const ruleUrl = rule.documentation(context)?.url;
		const entry: DeferredMessage = {
			ruleId: rule.name,
			severity,
			message,
			offset: location.offset,
			line: location.line,
			column: location.column,
			size: location.size || 0,
			selector() {
				return node ? node.generateSelector() : null;
			},
		};
		if (ruleUrl) {
			entry.ruleUrl = ruleUrl;
		}
		if (context) {
			entry.context = context;
		}
		this.result[location.filename].push(entry);
	}

	public addManual(filename: string, message: DeferredMessage): void {
		if (!(filename in this.result)) {
			this.result[filename] = [];
		}
		this.result[filename].push(message);
	}

	public save(sources?: Source[]): Report {
		const report: Report = {
			valid: this.isValid(),
			results: Object.keys(this.result).map((filePath) => {
				const messages = Array.from(this.result[filePath], freeze).sort(messageSort);
				const source = (sources || []).find(
					(source: Source) => filePath === (source.filename ?? "")
				);
				return {
					filePath,
					messages,
					errorCount: countErrors(messages),
					warningCount: countWarnings(messages),
					source: source ? source.originalData || source.data : null,
				};
			}),
			errorCount: 0,
			warningCount: 0,
		};
		report.errorCount = sumErrors(report.results);
		report.warningCount = sumWarnings(report.results);
		return report;
	}

	protected isValid(): boolean {
		const numErrors = Object.values(this.result).reduce((sum, messages) => {
			return sum + countErrors(messages);
		}, 0);
		return numErrors === 0;
	}
}

function countErrors(messages: Array<Message | DeferredMessage>): number {
	return messages.filter((m) => m.severity === Severity.ERROR).length;
}

function countWarnings(messages: Array<Message | DeferredMessage>): number {
	return messages.filter((m) => m.severity === Severity.WARN).length;
}

function sumErrors(results: Result[]): number {
	return results.reduce((sum: number, result: Result) => {
		return sum + result.errorCount;
	}, 0);
}

function sumWarnings(results: Result[]): number {
	return results.reduce((sum: number, result: Result) => {
		return sum + result.warningCount;
	}, 0);
}

function messageSort(a: Message, b: Message): number {
	if (a.line < b.line) {
		return -1;
	}

	if (a.line > b.line) {
		return 1;
	}

	if (a.column < b.column) {
		return -1;
	}

	if (a.column > b.column) {
		return 1;
	}

	return 0;
}

export default Reporter;
