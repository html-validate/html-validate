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
