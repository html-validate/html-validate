import { Location } from "../context";

export enum TokenType {
	UNICODE_BOM = 1,
	WHITESPACE,
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

interface BaseToken {
	type: TokenType;
	location: Location;
}

export interface UnicodeBOMToken extends BaseToken {
	type: TokenType.UNICODE_BOM;
	data: [bom: string];
}

export interface WhitespaceToken extends BaseToken {
	type: TokenType.WHITESPACE;
	data: [text: string];
}

export interface DoctypeOpenToken extends BaseToken {
	type: TokenType.DOCTYPE_OPEN;
	data: [text: string, tag: string];
}

export interface DoctypeValueToken extends BaseToken {
	type: TokenType.DOCTYPE_VALUE;
	data: [text: string];
}

export interface DoctypeCloseToken extends BaseToken {
	type: TokenType.DOCTYPE_CLOSE;
	data: [text: ">"];
}

export interface TagOpenToken extends BaseToken {
	type: TokenType.TAG_OPEN;
	data: [text: string, close: "/" | "", tag: string];
}

export interface TagCloseToken extends BaseToken {
	type: TokenType.TAG_CLOSE;
	data: [text: ">" | "/>"];
}

export interface AttrNameToken extends BaseToken {
	type: TokenType.ATTR_NAME;
	data: [text: string, name: string];
}

export interface AttrValueToken extends BaseToken {
	type: TokenType.ATTR_VALUE;
	data: [text: string, delimiter: string, value: string, quote?: '"' | "'"];
}

export interface TextToken extends BaseToken {
	type: TokenType.TEXT;
	data: [text: string];
}

export interface TemplatingToken extends BaseToken {
	type: TokenType.TEMPLATING;
	data: [text: string];
}

export interface ScriptToken extends BaseToken {
	type: TokenType.SCRIPT;
	data: [text: string];
}

export interface StyleToken extends BaseToken {
	type: TokenType.STYLE;
	data: [text: string];
}

export interface CommentToken extends BaseToken {
	type: TokenType.COMMENT;
	data: [text: string, comment: string];
}

export interface ConditionalToken extends BaseToken {
	type: TokenType.CONDITIONAL;
	data: [text: string, condition: string];
}

export interface DirectiveToken extends BaseToken {
	type: TokenType.DIRECTIVE;
	data: [text: string, begin: "[", action: string, delimiter: string, rest: string, end: "]" | ""];
}

export interface EOFToken extends BaseToken {
	type: TokenType.EOF;
	data: [];
}

export type Token =
	| UnicodeBOMToken
	| WhitespaceToken
	| DoctypeOpenToken
	| DoctypeValueToken
	| DoctypeCloseToken
	| TagOpenToken
	| TagCloseToken
	| AttrNameToken
	| AttrValueToken
	| TextToken
	| TemplatingToken
	| ScriptToken
	| StyleToken
	| CommentToken
	| ConditionalToken
	| DirectiveToken
	| EOFToken;
