'use strict';

const Lexer = require('../build/src/lexer').default;
const Token = require('../build/src/token').default;
const EventHandler = require('./eventhandler');
const DOM = require('./dom');
const DOMNode = require('../build/src/domnode').default;

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

	parseHtml(source){
		if ( typeof(source) === 'string' ){
			source = {data: source, filename: 'inline'};
		}

		let lexer = new Lexer();
		let tokenStream = lexer.tokenize(source);

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
				location: {
					filename: source.filename,
				},
			});
			this.dom.popActive();
		}

		return this.dom;
	}

	consumeTag(startToken, tokenStream){
		const tokens = Array.from(this.consumeUntil(tokenStream, Token.TAG_CLOSE));
		const endToken = tokens.slice(-1)[0];

		const node = DOMNode.fromTokens(startToken, endToken, this.dom.getActive(), this.config);
		const open = !startToken.data[1];
		const close = !open || node.selfClosed || node.voidElement;

		if ( open ){
			this.dom.pushActive(node);
			this.trigger('tag:open', {
				target: node,
				location: startToken.location,
			});
		}

		for ( let i = 0; i < tokens.length; i++ ){
			let token = tokens[i];
			switch ( token.type ){
			case Token.WHITESPACE:
				break;
			case Token.ATTR_NAME:
				this.consumeAttribute(node, token, tokens[i+1]);
				break;
			}
		}

		if ( close ){
			this.trigger('tag:close', {
				target: node,
				previous: this.dom.getActive(),
				location: endToken.location,
			});
			this.dom.popActive();
		}
	}

	consumeAttribute(node, token, next){
		const key = token.data[1];
		let value = undefined;
		let quote = undefined;
		if ( next && next.type === Token.ATTR_VALUE ){
			value = next.data[1];
			quote = next.data[2];
		}
		this.trigger('attr', {
			target: node,
			key,
			value,
			quote,
			location: token.location,
		});
		node.setAttribute(key, value);
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
