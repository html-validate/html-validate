'use strict';

import {Context, Source} from './context'; // eslint-disable-line no-unused-vars
import Token from './token';

enum State {
	INITIAL = 1,
	DOCTYPE,
	TEXT,
	TAG,
	ATTR,
	CDATA,
}

type LexerTest = [RegExp | false, State, Token | false]; // eslint-disable-line no-unused-vars

const MATCH_WHITESPACE = /^\s+/;
const MATCH_DOCTYPE_OPEN = /^<!DOCTYPE\s/;
const MATCH_DOCTYPE_VALUE = /^[^>]+/;
const MATCH_DOCTYPE_CLOSE = /^>/;
const MATCH_XML_TAG = /^<\?xml.*?\?>\n/;
const MATCH_TAG_OPEN = /^<(\/?)([a-zA-Z0-9\-:]+)/;       // https://www.w3.org/TR/html/syntax.html#start-tags
const MATCH_TAG_CLOSE = /^\/?>/;
const MATCH_TAG_LOOKAHEAD = /^[^]*?(?=<|$)/;
const MATCH_ATTR_START = /^([^\t\n\f \/>"'=]+)/;         // https://www.w3.org/TR/html/syntax.html#elements-attributes
const MATCH_ATTR_SINGLE = /^='([^']*?)(')/;
const MATCH_ATTR_DOUBLE = /^="([^"]*?)(")/;
const MATCH_ATTR_UNQUOTED = /^=([a-z]+)/;
const MATCH_CDATA_BEGIN = /^<!\[CDATA\[/;
const MATCH_CDATA_END = /^[^]*?]]>/;

class Lexer {
	*tokenize(source: Source){
		const context = new Context(source);
		context.state = State.INITIAL;

		/* for sanity check */
		let previousState: State = context.state;
		let previousLength: number = context.string.length;

		while ( context.string.length > 0 ){
			switch ( context.state ){
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

			default:
				this.unhandled(context);
			}

			/* sanity check: state or string must change, if both are intact
			 * we are stuck in an endless loop. */
			if ( context.state === previousState && context.string.length === previousLength ){
				this.errorStuck(context);
			}

			previousState = context.state;
			previousLength = context.string.length;
		}
	}

	token(context: Context, type: Token, data?: any){
		if ( !type ) throw Error("Token must be set");
		return {
			type,
			location: context.getLocationData(),
			data,
		};
	}

	unhandled(context: Context){
		const truncated = JSON.stringify(context.string.length > 13 ? (context.string.slice(0, 10) + '...') : context.string);
		const message = `${context.getLocationString()}: failed to tokenize ${truncated}, unhandled state ${context.state}.`;
		throw Error(message);
	}

	errorStuck(context: Context){
		const truncated = JSON.stringify(context.string.length > 13 ? (context.string.slice(0, 10) + '...') : context.string);
		const message = `${context.getLocationString()}: failed to tokenize ${truncated}, state ${context.state} failed to consume data or change state.`;
		throw Error(message);
	}

	*match(context: Context, tests: Array<LexerTest>, error: string){
		let match;
		for ( let test of tests ){
			const regex = test[0];
			const nextState = test[1];
			const token = test[2];

			/* no regex -> just perform the state change */
			if ( regex === false ){
				if ( token !== false ) yield this.token(context, token);
				context.consume(0, nextState);
				return;
			}

			/* match regex */
			if ( (match=context.string.match(regex)) ){
				if ( token !== false ) yield this.token(context, token, match);
				context.consume(match, nextState);
				return;
			}
		}

		const truncated = JSON.stringify(context.string.length > 13 ? (context.string.slice(0, 10) + '...') : context.string);
		const message = `${context.getLocationString()}: failed to tokenize ${truncated}, ${error}.`;
		throw Error(message);
	}

	*tokenizeInitial(context: Context){
		yield* this.match(context, [
			[MATCH_XML_TAG, State.INITIAL, false],
			[MATCH_DOCTYPE_OPEN, State.DOCTYPE, Token.DOCTYPE_OPEN],
			[false, State.TEXT, false],
		], 'expected doctype');
	}

	*tokenizeDoctype(context: Context){
		yield* this.match(context, [
			[MATCH_WHITESPACE, State.DOCTYPE, Token.WHITESPACE],
			[MATCH_DOCTYPE_VALUE, State.DOCTYPE, Token.DOCTYPE_VALUE],
			[MATCH_DOCTYPE_CLOSE, State.TEXT, Token.DOCTYPE_CLOSE],
		], 'expected doctype name');
	}

	*tokenizeTag(context: Context){
		yield* this.match(context, [
			[MATCH_TAG_CLOSE, State.TEXT, Token.TAG_CLOSE],
			[MATCH_ATTR_START, State.ATTR, Token.ATTR_NAME],
			[MATCH_WHITESPACE, State.TAG, Token.WHITESPACE],
		], 'expected attribute, ">" or "/>"');
	}

	*tokenizeAttr(context: Context){
		yield* this.match(context, [
			[MATCH_ATTR_SINGLE, State.TAG, Token.ATTR_VALUE],
			[MATCH_ATTR_DOUBLE, State.TAG, Token.ATTR_VALUE],
			[MATCH_ATTR_UNQUOTED, State.TAG, Token.ATTR_VALUE],
			[false, State.TAG, false],
		], 'expected attribute, ">" or "/>"');
	}

	*tokenizeText(context: Context){
		yield* this.match(context, [
			[MATCH_WHITESPACE, State.TEXT, Token.WHITESPACE],
			[MATCH_CDATA_BEGIN, State.CDATA, false],
			[MATCH_TAG_OPEN, State.TAG, Token.TAG_OPEN],
			[MATCH_TAG_LOOKAHEAD, State.TEXT, Token.TEXT],
		], 'expected text or "<"');
	}

	*tokenizeCDATA(context){
		yield* this.match(context, [
			[MATCH_CDATA_END, State.TEXT, false],
		], 'expected ]]>');
	}
}

export default Lexer;
