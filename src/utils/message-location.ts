import { type Message } from "../message";

/**
 * @internal
 */
export interface SourceLocation {
	line: number;
	column: number;
}

/**
 * @internal
 */
export function getStartLocation(message: Message): SourceLocation {
	return {
		line: message.line,
		column: message.column,
	};
}

/**
 * @internal
 */
export function getEndLocation(message: Message, source: string): SourceLocation {
	let line = message.line;
	let column = message.column;
	for (let i = 0; i < message.size; i++) {
		if (source.charAt(message.offset + i) === "\n") {
			line++;
			column = 0;
		} else {
			column++;
		}
	}
	return { line, column };
}
