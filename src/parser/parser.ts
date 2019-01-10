import { Config } from "../config";
import { Source } from "../context";
import { DOMTree, HtmlElement, NodeClosed } from "../dom";
import { EventCallback, EventHandler } from "../event";
import {
	AttributeEvent,
	ConditionalEvent,
	DirectiveEvent,
	DoctypeEvent,
	DOMReadyEvent,
	Event,
	TagCloseEvent,
	TagOpenEvent,
	WhitespaceEvent,
} from "../event";
import { Lexer, Token, TokenStream, TokenType } from "../lexer";
import { MetaTable } from "../meta";

export class Parser {
	private readonly event: EventHandler;
	private readonly metaTable: MetaTable;
	private dom: DOMTree;

	constructor(config: Config) {
		this.event = new EventHandler();
		this.dom = undefined;
		this.metaTable = config.getMetaTable();
	}

	parseHtml(source: string | Source): DOMTree {
		if (typeof source === "string") {
			source = {
				data: source,
				filename: "inline",
				line: 1,
				column: 1,
			};
		}

		/* reset DOM in case there are multiple calls in the same session */
		this.dom = new DOMTree({
			filename: source.filename,
			offset: 0,
			line: source.line,
			column: source.column,
		});

		/* trigger any rules waiting for DOM load event */
		this.trigger("dom:load", {
			location: null,
		});

		const lexer = new Lexer();
		const tokenStream = lexer.tokenize(source);

		/* consume all tokens from the stream */
		let it = this.next(tokenStream);
		while (!it.done) {
			const token = it.value;

			switch (token.type) {
				case TokenType.TAG_OPEN:
					this.consumeTag(source, token, tokenStream);
					break;

				case TokenType.WHITESPACE:
					this.trigger("whitespace", {
						text: token.data[0],
						location: token.location,
					});
					break;

				case TokenType.DIRECTIVE:
					this.consumeDirective(token);
					break;

				case TokenType.CONDITIONAL:
					this.trigger("conditional", {
						condition: token.data[1],
						location: token.location,
					});
					break;

				case TokenType.DOCTYPE_OPEN:
					this.consumeDoctype(token, tokenStream);
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
		this.trigger("dom:ready", {
			document: this.dom,

			/* disable location for this event so rules can use implicit node location
			 * instead */
			location: null,
		});

		return this.dom;
	}

	/**
	 * Detect optional end tag.
	 *
	 * Some tags have optional end tags (e.g. <ul><li>foo<li>bar</ul> is
	 * valid). The parser handles this by checking if the element on top of the
	 * stack when is allowed to omit.
	 */
	private closeOptional(token: Token): boolean {
		/* if the element doesn't have metadata it cannot have optional end
		 * tags. Period. */
		const active = this.dom.getActive();
		if (!(active.meta && active.meta.implicitClosed)) {
			return false;
		}

		const tagName = token.data[2];
		const open = !token.data[1];
		const meta = active.meta.implicitClosed;

		if (open) {
			/* a new element is opened, check if the new element should close the
			 * previous */
			return meta.indexOf(tagName) >= 0;
		} else {
			/* if we are explicitly closing the active element, ignore implicit */
			if (active.is(tagName)) {
				return false;
			}

			/* the parent element is closed, check if the active element would be
			 * implicitly closed when parent is. */
			return active.parent.is(tagName) && meta.indexOf(active.tagName) >= 0;
		}
	}

	// eslint-disable-next-line complexity
	private consumeTag(
		source: Source,
		startToken: Token,
		tokenStream: TokenStream
	) {
		const tokens = Array.from(
			this.consumeUntil(tokenStream, TokenType.TAG_CLOSE)
		);
		const endToken = tokens.slice(-1)[0];
		const closeOptional = this.closeOptional(startToken);
		const parent = closeOptional
			? this.dom.getActive().parent
			: this.dom.getActive();
		const node = HtmlElement.fromTokens(
			startToken,
			endToken,
			parent,
			this.metaTable
		);
		const open = !startToken.data[1];
		const close = !open || node.closed !== NodeClosed.Open;

		if (closeOptional) {
			const active = this.dom.getActive();
			active.closed = NodeClosed.ImplicitClosed;
			this.trigger("tag:close", {
				target: node,
				previous: active,
				location: startToken.location,
			});
			this.dom.popActive();
		}

		if (open) {
			this.dom.pushActive(node);
			this.trigger("tag:open", {
				target: node,
				location: startToken.location,
			});
		}

		for (let i = 0; i < tokens.length; i++) {
			const token = tokens[i];
			switch (token.type) {
				case TokenType.WHITESPACE:
					break;
				case TokenType.ATTR_NAME:
					this.consumeAttribute(source, node, token, tokens[i + 1]);
					break;
			}
		}

		if (close) {
			const active = this.dom.getActive();

			/* if this is not an open tag it is a close tag and thus we force it to be
			 * one, in case it is detected as void */
			if (!open) {
				node.closed = NodeClosed.EndTag;
			}

			this.trigger("tag:close", {
				target: node,
				previous: active,
				location: endToken.location,
			});

			/* if this element is closed with an end tag but is would it will not be
			 * closed again (it is already closed automatically since it is
			 * void). Closing again will have side-effects as it will close the parent
			 * and cause a mess later. */
			const voidClosed = !open && node.voidElement;
			if (!voidClosed) {
				this.dom.popActive();
			}
		}
	}

	consumeAttribute(
		source: Source,
		node: HtmlElement,
		token: Token,
		next?: Token
	) {
		const attr = {
			key: token.data[1],
			value: undefined as string,
			quote: undefined as any,
		};
		if (next && next.type === TokenType.ATTR_VALUE) {
			attr.value = next.data[1];
			attr.quote = next.data[2];
		}
		if (source.hooks && source.hooks.processAttribute) {
			source.hooks.processAttribute(attr);
		}
		this.trigger("attr", {
			target: node,
			key: attr.key,
			value: attr.value,
			quote: attr.quote,
			location: token.location,
		});
		node.setAttribute(attr.key, attr.value, token.location);
	}

	consumeDirective(token: Token) {
		const directive = token.data[1];
		const match = directive.match(/^([a-zA-Z0-9-]+)\s*(.*?)(?:\s*:\s*(.*))?$/);
		if (!match) {
			throw new Error(`Failed to parse directive "${directive}"`);
		}

		const [, action, data, comment] = match;
		this.trigger("directive", {
			action,
			data,
			comment: comment || "",
			location: token.location,
		});
	}

	/**
	 * Consumes doctype tokens. Emits doctype event.
	 */
	consumeDoctype(startToken: Token, tokenStream: TokenStream) {
		const tokens = Array.from(
			this.consumeUntil(tokenStream, TokenType.DOCTYPE_CLOSE)
		);
		const doctype =
			tokens[0]; /* first token is the doctype, second is the closing ">" */
		const value = doctype.data[0];
		this.dom.doctype = value;
		this.trigger("doctype", {
			value,
			location: startToken.location,
		});
	}

	/**
	 * Return a list of tokens found until the expected token was found.
	 */
	*consumeUntil(tokenStream: TokenStream, search: TokenType) {
		let it = this.next(tokenStream);
		while (!it.done) {
			const token = it.value;
			yield token;
			if (token.type === search) return;
			it = this.next(tokenStream);
		}
		throw Error("stream ended before consumeUntil finished");
	}

	private next(tokenStream: TokenStream): IteratorResult<Token> {
		return tokenStream.next();
	}

	/**
	 * Listen on events.
	 */
	on(event: string, listener: EventCallback): () => void {
		return this.event.on(event, listener);
	}

	/**
	 * Listen on single event.
	 */
	once(event: string, listener: EventCallback): () => void {
		return this.event.once(event, listener);
	}

	/**
	 * Defer execution. Will call function sometime later.
	 */
	defer(cb: () => void): void {
		this.event.once("*", cb);
	}

	/**
	 * Trigger event.
	 *
	 * @param {string} event - Event name
	 * @param {Event} data - Event data
	 */
	protected trigger(event: "tag:open", data: TagOpenEvent): void;
	protected trigger(event: "tag:close", data: TagCloseEvent): void;
	protected trigger(event: "dom:load", data: Event): void;
	protected trigger(event: "dom:ready", data: DOMReadyEvent): void;
	protected trigger(event: "doctype", data: DoctypeEvent): void;
	protected trigger(event: "attr", data: AttributeEvent): void;
	protected trigger(event: "whitespace", data: WhitespaceEvent): void;
	protected trigger(event: "conditional", data: ConditionalEvent): void;
	protected trigger(event: "directive", data: DirectiveEvent): void;
	protected trigger(event: any, data: any): void {
		if (typeof data.location === "undefined") {
			throw Error("Triggered event must contain location");
		}
		this.event.trigger(event, data);
	}

	/**
	 * Trigger close events for any still open elements.
	 */
	private closeTree(token: Token): void {
		let active;
		/* tslint:disable-next-line:no-conditional-assignment */
		while ((active = this.dom.getActive()) && active.tagName) {
			this.trigger("tag:close", {
				target: undefined,
				previous: active,
				location: token.location,
			});
			this.dom.popActive();
		}
	}
}
