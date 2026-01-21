import { type Location } from "../context";

/**
 * @internal
 */
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

/**
 * @internal
 */
export interface BaseToken {
	type: TokenType;
	location: Location;
}

/**
 * @internal
 */
export interface UnicodeBOMToken extends BaseToken {
	type: TokenType.UNICODE_BOM;
	data: [bom: string];
}

/**
 * @internal
 */
export interface WhitespaceToken extends BaseToken {
	type: TokenType.WHITESPACE;
	data: [text: string];
}

/**
 * @internal
 */
export interface DoctypeOpenToken extends BaseToken {
	type: TokenType.DOCTYPE_OPEN;
	data: [text: string, tag: string];
}

/**
 * @internal
 */
export interface DoctypeValueToken extends BaseToken {
	type: TokenType.DOCTYPE_VALUE;
	data: [text: string];
}

/**
 * @internal
 */
export interface DoctypeCloseToken extends BaseToken {
	type: TokenType.DOCTYPE_CLOSE;
	data: [text: ">"];
}

/**
 * @internal
 */
export interface TagOpenToken extends BaseToken {
	type: TokenType.TAG_OPEN;
	data: [text: string, close: "/" | "", tag: string];
}

/**
 * @internal
 */
export interface TagCloseToken extends BaseToken {
	type: TokenType.TAG_CLOSE;
	data: [text: ">" | "/>"];
}

/**
 * @internal
 */
export interface AttrNameToken extends BaseToken {
	type: TokenType.ATTR_NAME;
	data: [text: string, name: string];
}

/**
 * @internal
 */
export interface AttrValueToken extends BaseToken {
	type: TokenType.ATTR_VALUE;
	data: [text: string, delimiter: string, value: string, quote?: '"' | "'"];
}

/**
 * @internal
 */
export interface TextToken extends BaseToken {
	type: TokenType.TEXT;
	data: [text: string];
}

/**
 * @internal
 */
export interface TemplatingToken extends BaseToken {
	type: TokenType.TEMPLATING;
	data: [text: string];
}

/**
 * @internal
 */
export interface ScriptToken extends BaseToken {
	type: TokenType.SCRIPT;
	data: [text: string];
}

/**
 * @internal
 */
export interface StyleToken extends BaseToken {
	type: TokenType.STYLE;
	data: [text: string];
}

/**
 * @internal
 */
export interface CommentToken extends BaseToken {
	type: TokenType.COMMENT;
	data: [text: string, comment: string];
}

/**
 * @internal
 */
export interface ConditionalToken extends BaseToken {
	type: TokenType.CONDITIONAL;
	data: [text: string, condition: string];
}

/**
 * @internal
 */
export interface DirectiveToken extends BaseToken {
	type: TokenType.DIRECTIVE;
	data: [
		text: string,
		begin: "<!-- [",
		prefix: "html-validate-",
		action: string,
		delimiter: string,
		rest: string,
		end: "]" | "",
	];
}

/**
 * @internal
 */
export interface EOFToken extends BaseToken {
	type: TokenType.EOF;
	data: [];
}

/**
 * @internal
 */
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
