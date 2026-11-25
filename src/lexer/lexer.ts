import { type Source, ContentModel, Context, State } from "../context";
import { type Location } from "../location";
import { type TagCloseToken, type Token, TokenType } from "./token";

type NextStateCallback = (token: Token | null) => State;

type LexerTest = [
	RegExp | ((input: string) => string[] | null) | false,
	State | NextStateCallback,
	TokenType | false,
];

type DirectiveMatch = [
	text: string,
	begin: string,
	prefix: string,
	action: string,
	delimiter: string,
	rest: string,
	end: string,
];

/**
 * @internal
 */
export type TokenStream = IterableIterator<Token>;

/* eslint-disable no-useless-escape -- false positives */
const MATCH_UNICODE_BOM = /^\uFEFF/;
const MATCH_WHITESPACE = /^(?:\r\n|\r|\n|[\t ]+(?:\r\n|\r|\n)?)/;
const MATCH_DOCTYPE_OPEN = /^<!(doctype)\s/i;
const MATCH_DOCTYPE_VALUE = /^[^>]+/;
const MATCH_DOCTYPE_CLOSE = /^>/;
const MATCH_XML_TAG = /^<\?xml.*?\?>\s+/;
const MATCH_TAG_OPEN = /^<(\/?)([\w:\-]+)/; // https://www.w3.org/TR/html/syntax.html#start-tags
const MATCH_TAG_CLOSE = /^\/?>/;
const MATCH_TEXT = /^[^]*?(?=(?:[\t ]*(?:\r\n|\r|\n)|<[^ ]|$))/;
const MATCH_TEMPLATING = /^(?:<%.*?%>|<\?.*?\?>|<\$.*?\$>)/s;
const MATCH_TAG_LOOKAHEAD = /^[^]*?(?=<|$)/;
const MATCH_ATTR_START = /^([^\t\n\f\r "'/<=>]+)/; // https://www.w3.org/TR/html/syntax.html#elements-attributes
const MATCH_ATTR_SINGLE = /^(\s*=\s*)'([^']*?)(')/;
const MATCH_ATTR_DOUBLE = /^(\s*=\s*)"([^"]*?)(")/;
const MATCH_ATTR_UNQUOTED = /^(\s*=\s*)([^\t\n\f\r "'<>][^\t\n\f\r <>]*)/;
const MATCH_CDATA_BEGIN = /^<!\[CDATA\[/;
const MATCH_CDATA_END = /^[^]*?]]>/;
const MATCH_SCRIPT_DATA = /^[^]*?(?=<\/script)/;
const MATCH_SCRIPT_END = /^<(\/)(script)/;
const MATCH_STYLE_DATA = /^[^]*?(?=<\/style)/;
const MATCH_STYLE_END = /^<(\/)(style)/;
const MATCH_TEXTAREA_DATA = /^[^]*?(?=<\/textarea)/;
const MATCH_TEXTAREA_END = /^<(\/)(textarea)/;
const MATCH_TITLE_DATA = /^[^]*?(?=<\/title)/;
const MATCH_TITLE_END = /^<(\/)(title)/;
const MATCH_DIRECTIVE_BEGIN = /^(<!--\s*\[?)(html-validate-)([\da-z-]+)(\s*)/;
const MATCH_COMMENT = /^<!--([^]*?)-->/;
const MATCH_CONDITIONAL = /^<!\[([^\]]*?)]>/;
/* eslint-enable no-useless-escape */

function matchDirective(input: string): DirectiveMatch | null {
	if (!input.startsWith("<!--")) {
		return null;
	}
	const endIndex = input.indexOf("-->", 4);
	if (endIndex === -1) {
		return null;
	}
	const body = input.slice(0, endIndex);
	const beginMatch = MATCH_DIRECTIVE_BEGIN.exec(body);
	if (!beginMatch) {
		return null;
	}
	const [matchedBegin, begin, prefix, action, delimiter] = beginMatch;
	const remaining = body.slice(matchedBegin.length);
	let rest = remaining.trimEnd();
	if (rest.endsWith("]")) {
		rest = rest.slice(0, -1);
	}
	if (/[\r\n\u{2028}\u{2029}]/u.test(rest)) {
		return null;
	}
	const text = input.slice(0, endIndex + 3);
	const end = `${remaining.slice(rest.length)}-->`;
	return [text, begin, prefix, action, delimiter, rest, end];
}

export class InvalidTokenError extends Error {
	public location: Location;

	public constructor(location: Location, message: string) {
		super(message);
		this.name = "InvalidTokenError";
		this.location = location;
	}
}

export class Lexer {
	/* eslint-disable-next-line complexity -- there isn't really a good way to refactor this while keeping readability */
	public *tokenize(source: Source): TokenStream {
		const context = new Context(source);

		/* for sanity check */
		let previousState: State = context.state;
		let previousLength: number = context.string.length;

		while (context.string.length > 0) {
			switch (context.state) {
				case State.INITIAL:
					yield* this.tokenizeInitial(context);
					break;

				case State.DOCTYPE:
					yield* this.tokenizeDoctype(context);
					break;

				case State.TAG:
					yield* this.tokenizeTag(context);
					break;

				case State.ATTR:
					yield* this.tokenizeAttr(context);
					break;

				case State.TEXT:
					yield* this.tokenizeText(context);
					break;

				case State.CDATA:
					yield* this.tokenizeCDATA(context);
					break;

				case State.SCRIPT:
					yield* this.tokenizeScript(context);
					break;

				case State.STYLE:
					yield* this.tokenizeStyle(context);
					break;

				case State.TEXTAREA:
					yield* this.tokenizeTextarea(context);
					break;

				case State.TITLE:
					yield* this.tokenizeTitle(context);
					break;

				/* istanbul ignore next: sanity check: should not happen unless adding new states */
				default:
					this.unhandled(context);
			}

			/* sanity check: state or string must change, if both are intact
			 * we are stuck in an endless loop. */
			/* istanbul ignore next: no easy way to test this as it is a condition which should never happen */
			if (context.state === previousState && context.string.length === previousLength) {
				this.errorStuck(context);
			}

			previousState = context.state;
			previousLength = context.string.length;
		}

		yield this.token(context, TokenType.EOF, []);
	}

	private token(context: Context, type: TokenType, data: string[]): Token {
		const size = data.length > 0 ? data[0].length : 0;
		const location = context.getLocation(size);
		return {
			type,
			location,
			data: Array.from(data),
		} as Token;
	}

	/* istanbul ignore next: used to provide a better error when an unhandled state happens */
	private unhandled(context: Context): void {
		const truncated = JSON.stringify(
			context.string.length > 13 ? `${context.string.slice(0, 15)}...` : context.string,
		);
		const state = State[context.state];
		const message = `failed to tokenize ${truncated}, unhandled state ${state}.`;
		throw new InvalidTokenError(context.getLocation(1), message);
	}

	/* istanbul ignore next: used to provide a better error when lexer is detected to be stuck, no known way to reproduce */
	private errorStuck(context: Context): void {
		const state = State[context.state];
		const message = `failed to tokenize ${context.getTruncatedLine()}, state ${state} failed to consume data or change state.`;
		throw new InvalidTokenError(context.getLocation(1), message);
	}

	private evalNextState(
		nextState: State | ((token: Token | null) => State),
		token: Token | null,
	): State {
		if (typeof nextState === "function") {
			return nextState(token);
		} else {
			return nextState;
		}
	}

	private *match(context: Context, tests: LexerTest[], error: string): Iterable<Token> {
		const n = tests.length;
		for (let i = 0; i < n; i++) {
			const [test, nextState, tokenType] = tests[i];

			let match: string[] | null;
			if (typeof test === "function") {
				match = test(context.string);
			} else {
				match = test ? context.string.match(test) : [""];
			}
			if (match) {
				let token: Token | null = null;
				if (tokenType !== false) {
					token = this.token(context, tokenType, match);
					yield token;
				}
				const state = this.evalNextState(nextState, token);
				context.consume(match[0].length, state);
				this.enter(context, state, match);
				return;
			}
		}

		const message = `failed to tokenize ${context.getTruncatedLine()}, ${error}.`;
		throw new InvalidTokenError(context.getLocation(1), message);
	}

	/**
	 * Called when entering a new state.
	 */
	private enter(context: Context, state: State, data: string[] | null): void {
		/* script/style tags require a different content model */
		if (state === State.TAG && data?.[0].startsWith("<")) {
			switch (data[0]) {
				case "<script": {
					context.contentModel = ContentModel.SCRIPT;
					break;
				}
				case "<style": {
					context.contentModel = ContentModel.STYLE;
					break;
				}
				case "<textarea": {
					context.contentModel = ContentModel.TEXTAREA;
					break;
				}
				case "<title": {
					context.contentModel = ContentModel.TITLE;
					break;
				}
				default: {
					context.contentModel = ContentModel.TEXT;
				}
			}
		}
	}

	private *tokenizeInitial(context: Context): Iterable<Token> {
		yield* this.match(
			context,
			[
				[MATCH_UNICODE_BOM, State.INITIAL, TokenType.UNICODE_BOM],
				[MATCH_XML_TAG, State.INITIAL, false],
				[MATCH_DOCTYPE_OPEN, State.DOCTYPE, TokenType.DOCTYPE_OPEN],
				[MATCH_WHITESPACE, State.INITIAL, TokenType.WHITESPACE],
				[matchDirective, State.INITIAL, TokenType.DIRECTIVE],
				[MATCH_CONDITIONAL, State.INITIAL, TokenType.CONDITIONAL],
				[MATCH_COMMENT, State.INITIAL, TokenType.COMMENT],
				[false, State.TEXT, false],
			],
			"expected doctype",
		);
	}

	private *tokenizeDoctype(context: Context): Iterable<Token> {
		yield* this.match(
			context,
			[
				[MATCH_WHITESPACE, State.DOCTYPE, TokenType.WHITESPACE],
				[MATCH_DOCTYPE_VALUE, State.DOCTYPE, TokenType.DOCTYPE_VALUE],
				[MATCH_DOCTYPE_CLOSE, State.TEXT, TokenType.DOCTYPE_CLOSE],
			],
			"expected doctype name",
		);
	}

	private *tokenizeTag(context: Context): Iterable<Token> {
		/* eslint-disable-next-line complexity -- technical debt, should be replaced with a lookup table */
		function nextState(token: Token | null): State {
			const tagCloseToken = token as TagCloseToken | null;
			const selfClosed = tagCloseToken && !tagCloseToken.data[0].startsWith("/");
			switch (context.contentModel) {
				case ContentModel.TEXT:
					return State.TEXT;
				case ContentModel.SCRIPT:
					if (selfClosed) {
						return State.SCRIPT;
					} else {
						return State.TEXT; /* <script/> (not legal but handle it anyway so the lexer doesn't choke on it) */
					}
				case ContentModel.STYLE:
					if (selfClosed) {
						return State.STYLE;
					} else {
						return State.TEXT; /* <style/> */
					}
				case ContentModel.TEXTAREA:
					if (selfClosed) {
						return State.TEXTAREA;
					} else {
						return State.TEXT; /* <textarea/> */
					}
				case ContentModel.TITLE:
					if (selfClosed) {
						return State.TITLE;
					} else {
						return State.TEXT; /* <title/> */
					}
			}
		}
		yield* this.match(
			context,
			[
				[MATCH_TAG_CLOSE, nextState, TokenType.TAG_CLOSE],
				[MATCH_ATTR_START, State.ATTR, TokenType.ATTR_NAME],
				[MATCH_WHITESPACE, State.TAG, TokenType.WHITESPACE],
			],
			'expected attribute, ">" or "/>"',
		);
	}

	private *tokenizeAttr(context: Context): Iterable<Token> {
		yield* this.match(
			context,
			[
				[MATCH_ATTR_SINGLE, State.TAG, TokenType.ATTR_VALUE],
				[MATCH_ATTR_DOUBLE, State.TAG, TokenType.ATTR_VALUE],
				[MATCH_ATTR_UNQUOTED, State.TAG, TokenType.ATTR_VALUE],
				[false, State.TAG, false],
			],
			'expected attribute, ">" or "/>"',
		);
	}

	private *tokenizeText(context: Context): Iterable<Token> {
		yield* this.match(
			context,
			[
				[MATCH_WHITESPACE, State.TEXT, TokenType.WHITESPACE],
				[MATCH_CDATA_BEGIN, State.CDATA, false],
				[matchDirective, State.TEXT, TokenType.DIRECTIVE],
				[MATCH_CONDITIONAL, State.TEXT, TokenType.CONDITIONAL],
				[MATCH_COMMENT, State.TEXT, TokenType.COMMENT],
				[MATCH_TEMPLATING, State.TEXT, TokenType.TEMPLATING],
				[MATCH_TAG_OPEN, State.TAG, TokenType.TAG_OPEN],
				[MATCH_TEXT, State.TEXT, TokenType.TEXT],
				[MATCH_TAG_LOOKAHEAD, State.TEXT, TokenType.TEXT],
			],
			'expected text or "<"',
		);
	}

	private *tokenizeCDATA(context: Context): Iterable<Token> {
		yield* this.match(context, [[MATCH_CDATA_END, State.TEXT, false]], "expected ]]>");
	}

	private *tokenizeScript(context: Context): Iterable<Token> {
		yield* this.match(
			context,
			[
				[MATCH_SCRIPT_END, State.TAG, TokenType.TAG_OPEN],
				[MATCH_SCRIPT_DATA, State.SCRIPT, TokenType.SCRIPT],
			],
			"expected </script>",
		);
	}

	private *tokenizeStyle(context: Context): Iterable<Token> {
		yield* this.match(
			context,
			[
				[MATCH_STYLE_END, State.TAG, TokenType.TAG_OPEN],
				[MATCH_STYLE_DATA, State.STYLE, TokenType.STYLE],
			],
			"expected </style>",
		);
	}

	private *tokenizeTextarea(context: Context): Iterable<Token> {
		yield* this.match(
			context,
			[
				[MATCH_TEXTAREA_END, State.TAG, TokenType.TAG_OPEN],
				[MATCH_TEXTAREA_DATA, State.TEXTAREA, TokenType.TEXT],
			],
			"expected </textarea>",
		);
	}

	private *tokenizeTitle(context: Context): Iterable<Token> {
		yield* this.match(
			context,
			[
				[MATCH_TITLE_END, State.TAG, TokenType.TAG_OPEN],
				[MATCH_TITLE_DATA, State.TITLE, TokenType.TEXT],
			],
			"expected </title>",
		);
	}
}
