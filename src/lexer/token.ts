import { Location } from "../context";

export enum TokenType {
	UNICODE_BOM = 1,
	WHITESPACE,
	NEWLINE,
	DOCTYPE_OPEN,
	DOCTYPE_VALUE,
	DOCTYPE_CLOSE,
	TAG_OPEN,
	TAG_CLOSE,
	ATTR_NAME,
	ATTR_VALUE,
	TEXT,
	TEMPLATING,
	SCRIPT,
	STYLE,
	COMMENT,
	CONDITIONAL,
	DIRECTIVE,
	EOF,
}

export interface Token {
	type: TokenType;
	location: Location;
	data?: any;
}

export interface DirectiveToken extends Token {
	type: TokenType.DIRECTIVE;
	data: [text: string, begin: "[", action: string, rest: string, end: "]" | ""];
}
