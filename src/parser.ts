import Config from './config';
import { DOMNode, DOMTree, NodeClosed } from './dom';
import { Lexer, TokenStream } from './lexer';
import { Token, TokenType } from './token';
import { EventHandler, EventCallback } from './eventhandler';
import { Source } from './context';
import { MetaTable } from './meta';

class Parser {
	private readonly config: Config;
	private readonly event: EventHandler;
	private readonly dom: DOMTree;
	private readonly metaTable: MetaTable;
	private peeked?: IteratorResult<Token>;

	constructor(config: Config){
		this.config = config;
		this.event = new EventHandler();
		this.dom = new DOMTree();
		this.peeked = undefined;
		this.metaTable = config.getMetaTable();
	}

	on(event: string, listener: EventCallback){
		this.event.on(event, listener);
	}

	parseHtml(source: string|Source): DOMTree {
		if (typeof source === 'string'){
			source = {data: source, filename: 'inline'};
		}

		/* trigger any rules waiting for DOM load event */
		this.trigger('dom:load', {
			location: {

			},
		});

		const lexer = new Lexer();
		const tokenStream = lexer.tokenize(source);

		/* consume all tokens from the stream */
		let it = this.next(tokenStream);
		while (!it.done){
			const token = it.value;

			switch (token.type){
			case TokenType.TAG_OPEN:
				this.consumeTag(token, tokenStream);
				break;
			case TokenType.WHITESPACE:
				this.trigger('whitespace', {
					text: token.data[0],
					location: token.location,
				});
				break;
			case TokenType.EOF:
				this.closeTree(token);
				break;
			}

			it = this.next(tokenStream);
		}

		/* resolve and dynamic meta element properties */
		this.dom.resolveMeta(this.metaTable);

		/* trigger any rules waiting for DOM ready */
		this.trigger('dom:ready', {
			document: this.dom,
			location: false,
		});

		return this.dom;
	}

	consumeTag(startToken: Token, tokenStream: TokenStream){
		const tokens = Array.from(this.consumeUntil(tokenStream, TokenType.TAG_CLOSE));
		const endToken = tokens.slice(-1)[0];
		const node = DOMNode.fromTokens(startToken, endToken, this.dom.getActive(), this.metaTable);
		const open = !startToken.data[1];
		const close = !open || node.closed !== NodeClosed.Open;

		if (open){
			this.dom.pushActive(node);
			this.trigger('tag:open', {
				target: node,
				location: startToken.location,
			});
		}

		for (let i = 0; i < tokens.length; i++){
			const token = tokens[i];
			switch (token.type){
			case TokenType.WHITESPACE:
				break;
			case TokenType.ATTR_NAME:
				this.consumeAttribute(node, token, tokens[i + 1]);
				break;
			}
		}

		if (close){
			/* mark active element as closed unless it is void */
			const active = this.dom.getActive();
			if (!open && active.closed === NodeClosed.Open){
				active.closed = NodeClosed.EndTag;
			}

			this.trigger('tag:close', {
				target: node,
				previous: active,
				location: endToken.location,
			});

			this.dom.popActive();
		}
	}

	consumeAttribute(node: DOMNode, token: Token, next?: Token){
		const key = token.data[1];
		let value = undefined;
		let quote = undefined;
		if (next && next.type === TokenType.ATTR_VALUE){
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
	*consumeUntil(tokenStream: TokenStream, search: TokenType){
		let it = this.next(tokenStream);
		while (!it.done){
			const token = it.value;
			yield token;
			if (token.type === search) return;
			it = this.next(tokenStream);
		}
		throw Error('stream ended before consumeUntil finished');
	}

	private next(tokenStream: TokenStream): IteratorResult<Token> {
		if (this.peeked){
			const peeked = this.peeked;
			this.peeked = undefined;
			return peeked;
		} else {
			return tokenStream.next();
		}
	}

	/**
	 * Return the next token without removing it from the stream.
	 */
	private peek(tokenStream: TokenStream): IteratorResult<Token> {
		if (this.peeked){
			return this.peeked;
		} else {
			return this.peeked = tokenStream.next();
		}
	}

	/**
	 * Trigger event.
	 *
	 * @param {string} event - Event name
	 * @param {Event} data - Event data
	 */
	private trigger(event: string, data: any): void {
		if (typeof data.location === 'undefined'){
			throw Error('Triggered event must contain location');
		}
		this.event.trigger(event, data);
	}

	/**
	 * Trigger close events for any still open elements.
	 */
	private closeTree(token: Token): void {
		let active;
		while ((active = this.dom.getActive()) && active.tagName){
			this.trigger('tag:close', {
				target: undefined,
				previous: active,
				location: token.location,
			});
			this.dom.popActive();
		}
	}
}

export default Parser;
