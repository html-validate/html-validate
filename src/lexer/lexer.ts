import { ContentModel, Context, Location, Source, State } from "../context";
import { Token, TokenType } from "./token";

type NextStateCallback = (token: Token | null) => State;
type LexerTest = [RegExp | false, State | NextStateCallback, TokenType | false];
export type TokenStream = IterableIterator<Token>;

/* eslint-disable no-useless-escape */
const MATCH_UNICODE_BOM = /^\uFEFF/;
const MATCH_WHITESPACE = /^(?:\r\n|\r|\n|[ \t]+(?:\r\n|\r|\n)?)/;
const MATCH_DOCTYPE_OPEN = /^<!(DOCTYPE)\s/i;
const MATCH_DOCTYPE_VALUE = /^[^>]+/;
const MATCH_DOCTYPE_CLOSE = /^>/;
const MATCH_XML_TAG = /^<\?xml.*?\?>\n/;
const MATCH_TAG_OPEN = /^<(\/?)([a-zA-Z0-9\-:]+)/; // https://www.w3.org/TR/html/syntax.html#start-tags
const MATCH_TAG_CLOSE = /^\/?>/;
const MATCH_TEXT = /^[^]*?(?=(?:[ \t]*(?:\r\n|\r|\n)|<[^ ]|$))/;
const MATCH_TEMPLATING = /^(?:<%.*?%>|<\?.*?\?>|<\$.*?\$>)/;
const MATCH_TAG_LOOKAHEAD = /^[^]*?(?=<|$)/;
const MATCH_ATTR_START = /^([^\t\r\n\f \/><"'=]+)/; // https://www.w3.org/TR/html/syntax.html#elements-attributes
const MATCH_ATTR_SINGLE = /^\s*=\s*'([^']*?)(')/;
const MATCH_ATTR_DOUBLE = /^\s*=\s*"([^"]*?)(")/;
const MATCH_ATTR_UNQUOTED = /^\s*=\s*([^\t\r\n\f "'<>][^\t\r\n\f <>]*)/;
const MATCH_CDATA_BEGIN = /^<!\[CDATA\[/;
const MATCH_CDATA_END = /^[^]*?]]>/;
const MATCH_SCRIPT_DATA = /^[^]*?(?=<\/script)/;
const MATCH_SCRIPT_END = /^<(\/)(script)/;
const MATCH_DIRECTIVE = /^<!--\s\[html-validate-(.*?)]\s-->/;
const MATCH_COMMENT = /^<!--([^]*?)-->/;
const MATCH_CONDITIONAL = /^<!\[([^\]]*?)\]>/;

export class InvalidTokenError extends Error {
	public location: Location;

	public constructor(location: Location, message: string) {
		super(message);
		this.location = location;
	}
}

export class Lexer {
	// eslint-disable-next-line complexity
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

		yield this.token(context, TokenType.EOF);
	}

	private token(context: Context, type: TokenType, data?: RegExpMatchArray | null): Token {
		const size = data ? data[0].length : 0;
		const location = context.getLocation(size);
		return {
			type,
			location,
			data: data ? Array.from(data) : null,
		};
	}

	/* istanbul ignore next: used to provide a better error when an unhandled state happens */
	private unhandled(context: Context): void {
		const truncated = JSON.stringify(
			context.string.length > 13 ? `${context.string.slice(0, 15)}...` : context.string
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
		token: Token | null
	): State {
		if (typeof nextState === "function") {
			return nextState(token);
		} else {
			return nextState;
		}
	}

	private *match(context: Context, tests: LexerTest[], error: string): Iterable<Token> {
		let match: RegExpMatchArray | null = null;
		const n = tests.length;
		for (let i = 0; i < n; i++) {
			const [regex, nextState, tokenType] = tests[i];

			if (regex === false || (match = context.string.match(regex))) {
				let token: Token | null = null;
				if (tokenType !== false) {
					yield (token = this.token(context, tokenType, match));
				}
				const state = this.evalNextState(nextState, token);
				context.consume(match || 0, state);
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
	private enter(context: Context, state: State, data: RegExpMatchArray | null): void {
		/* script tags require a different content model */
		if (state === State.TAG && data && data[0][0] === "<") {
			if (data[0] === "<script") {
				context.contentModel = ContentModel.SCRIPT;
			} else {
				context.contentModel = ContentModel.TEXT;
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
				[MATCH_DIRECTIVE, State.INITIAL, TokenType.DIRECTIVE],
				[MATCH_COMMENT, State.INITIAL, TokenType.COMMENT],
				[false, State.TEXT, false],
			],
			"expected doctype"
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
			"expected doctype name"
		);
	}

	private *tokenizeTag(context: Context): Iterable<Token> {
		function nextState(token: Token | null): State {
			switch (context.contentModel) {
				case ContentModel.TEXT:
					return State.TEXT;
				case ContentModel.SCRIPT:
					if (token && token.data[0][0] !== "/") {
						return State.SCRIPT;
					} else {
						return State.TEXT; /* <script/> (not legal but handle it anyway so the lexer doesn't choke on it) */
					}
			}
			/* istanbul ignore next: not covered by a test as there is currently no
			 * way to trigger this unless new content models are added but this will
			 * add a saner default if anyone ever does */
			return context.contentModel !== ContentModel.SCRIPT ? State.TEXT : State.SCRIPT;
		}
		yield* this.match(
			context,
			[
				[MATCH_TAG_CLOSE, nextState, TokenType.TAG_CLOSE],
				[MATCH_ATTR_START, State.ATTR, TokenType.ATTR_NAME],
				[MATCH_WHITESPACE, State.TAG, TokenType.WHITESPACE],
			],
			'expected attribute, ">" or "/>"'
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
			'expected attribute, ">" or "/>"'
		);
	}

	private *tokenizeText(context: Context): Iterable<Token> {
		yield* this.match(
			context,
			[
				[MATCH_WHITESPACE, State.TEXT, TokenType.WHITESPACE],
				[MATCH_CDATA_BEGIN, State.CDATA, false],
				[MATCH_DIRECTIVE, State.TEXT, TokenType.DIRECTIVE],
				[MATCH_CONDITIONAL, State.TEXT, TokenType.CONDITIONAL],
				[MATCH_COMMENT, State.TEXT, TokenType.COMMENT],
				[MATCH_TEMPLATING, State.TEXT, TokenType.TEMPLATING],
				[MATCH_TAG_OPEN, State.TAG, TokenType.TAG_OPEN],
				[MATCH_TEXT, State.TEXT, TokenType.TEXT],
				[MATCH_TAG_LOOKAHEAD, State.TEXT, TokenType.TEXT],
			],
			'expected text or "<"'
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
			"expected </script>"
		);
	}
}
