'use strict';

const Lexer = require('./lexer');
const Token = require('./token');
const EventHandler = require('./eventhandler');
const DOM = require('./dom');
const Node = require('./node');

class Parser {
	constructor(config){
		this.config = config;
		this.lexer = new Lexer();
		this.event = new EventHandler();
		this.dom = new DOM();
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

		/* trigger close events for any still open elements */
		let active;
		while ( (active=this.dom.getActive()) && active.tagName ){
			this.trigger('tag:close', {
				target: undefined,
				previous: active,
				location: false,
			});
			this.dom.popActive();
		}

		return this.dom;
	}

	consumeTag(token, tokenStream){
		var node = Node.fromToken(token, this.dom.getActive(), this.config);
		var open = !token.data[1];
		var close = !open || node.selfClosed || node.voidElement;

		if ( open ){
			this.dom.pushActive(node);
			this.trigger('tag:open', {
				target: node,
				location: token.location,
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
			this.trigger('tag:close', {
				target: node,
				previous: this.dom.getActive(),
				location: token.location,
			});
			this.dom.popActive();
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
		this.trigger('attr', {
			target: node,
			key,
			value,
			quote,
			location: token.location,
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

	trigger(event, data){
		if ( typeof(data.location) === 'undefined' ){
			throw Error('Triggered event must contain location');
		}
		this.event.trigger(event, data);
	}
}

module.exports = Parser;
