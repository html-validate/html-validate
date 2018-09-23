import { Location } from '../context';

export enum TokenType {
	WHITESPACE = 1,
	NEWLINE,
	DOCTYPE_OPEN,
	DOCTYPE_VALUE,
	DOCTYPE_CLOSE,
	TAG_OPEN,
	TAG_CLOSE,
	ATTR_NAME,
	ATTR_VALUE,
	TEXT,
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
