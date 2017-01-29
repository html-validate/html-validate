'use strict';

const Lexer = require('./lexer');
const Token = require('./token');
const EventHandler = require('./eventhandler');

class Parser {
	constructor(config){
		this.config = config;
		this.lexer = new Lexer();
		this.event = new EventHandler();
	}

	on(event, listener){
		this.event.on(event, listener);
	}

	parseHtml(str){
		let lexer = new Lexer();
		let tokenStream = lexer.tokenize({data: str, filename: 'missing'});

		let it = this.next(tokenStream);
		while ( !it.done ){
			const token = it.value;

			switch ( token.type ){
			case Token.TAG_OPEN:
				this.consumeTag(token, tokenStream);
				break;
			}

			it = this.next(tokenStream);
		}

		return true;
	}

	consumeTag(token, tokenStream){
		var open = !token.data[1];
		var tagName = token.data[2];
		var selfClosed = !!token.data[3];
		var voidElement = this.isVoidElement(tagName);
		var close = !open || selfClosed || voidElement;
		var node = {
			open,
			close,
			selfClosed,
			voidElement,
			tagName,
			attr: {},
		};

		if ( open ){
			this.event.trigger('tag:open', {
				target: node,
			});
		}

		for ( token of this.consumeUntil(tokenStream, Token.TAG_CLOSE) ){
			switch ( token.type ){
			case Token.WHITESPACE:
				break;
			case Token.ATTR_NAME:
				this.consumeAttribute(node, token, tokenStream);
				break;
			}
		}

		if ( close ){
			this.event.trigger('tag:close', {
				target: node,
			});
		}
	}

	consumeAttribute(node, token, tokenStream){
		const key = token.data[1];
		const next = this.peek(tokenStream);
		let value = undefined;
		let quote = undefined;
		if ( !next.done && next.value.type === Token.ATTR_VALUE ){
			value = next.value.data[1];
		}
		this.event.trigger('attr', {
			target: node,
			key,
			value,
			quote,
		});
	}

	/**
	 * Return a list of tokens found until the expected token was found.
	 */
	*consumeUntil(tokenStream, search){
		let it = this.next(tokenStream);
		while ( !it.done ){
			let token = it.value;
			yield token;
			if ( token.type === search ) return;
			it = this.next(tokenStream);
		}
		throw Error('stream ended before consumeUntil finished');
	}

	isVoidElement(tagName){
		return this.config.html.voidElements.indexOf(tagName.toLowerCase()) !== -1;
	}

	next(tokenStream){
		if ( this.peeked ){
			let peeked = this.peeked;
			this.peeked = undefined;
			return peeked;
		} else {
			return tokenStream.next();
		}
	}

	/**
	 * Return the next token without removing it from the stream.
	 */
	peek(tokenStream){
		if ( this.peeked ){
			return this.peeked;
		} else {
			return this.peeked = tokenStream.next();
		}
	}
}

module.exports = Parser;
