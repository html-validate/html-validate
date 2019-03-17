import { ProcessAttributeCallback } from "context/source";
import { Config } from "../config";
import { Location, sliceLocation, Source } from "../context";
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
import { AttributeData } from "./attribute-data";

export class Parser {
	private readonly event: EventHandler;
	private readonly metaTable: MetaTable;
	private dom: DOMTree;

	constructor(config: Config) {
		this.event = new EventHandler();
		this.dom = undefined;
		this.metaTable = config.getMetaTable();
	}

	public parseHtml(source: string | Source): DOMTree {
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
					this.appendText(token.data[0], token.location);
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

				case TokenType.TEXT:
					this.appendText(token.data, token.location);
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
	protected consumeTag(
		source: Source,
		startToken: Token,
		tokenStream: TokenStream
	): void {
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
		const foreign = node.meta && node.meta.foreign;

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
		} else if (foreign) {
			/* consume the body of the foreign element so it won't be part of the
			 * document (only the root foreign element is).  */
			this.discardForeignBody(node.tagName, tokenStream);
		}
	}

	/**
	 * Discard tokens until the end tag for the foreign element is found.
	 */
	protected discardForeignBody(
		foreignTagName: string,
		tokenStream: TokenStream
	): void {
		/* consume elements until the end tag for this foreign element is found */
		let nested = 1;
		let startToken;
		let endToken;
		do {
			/* search for tags */
			const tokens = Array.from(
				this.consumeUntil(tokenStream, TokenType.TAG_OPEN)
			);
			const [last] = tokens.slice(-1);
			const [, tagClosed, tagName] = last.data;

			/* keep going unless the new tag matches the foreign root element */
			if (tagName !== foreignTagName) {
				continue;
			}

			/* locate end token and determine if this is a self-closed tag */
			const endTokens = Array.from(
				this.consumeUntil(tokenStream, TokenType.TAG_CLOSE)
			);
			endToken = endTokens.slice(-1)[0];
			const selfClosed = endToken.data[0] === "/>";

			/* since foreign element may be nested keep a count for the number of
			 * opened/closed elements */
			if (tagClosed) {
				startToken = last;
				nested--;
			} else if (!selfClosed) {
				nested++;
			}
		} while (nested > 0);

		const active = this.dom.getActive();
		const node = HtmlElement.fromTokens(
			startToken,
			endToken,
			active,
			this.metaTable
		);

		this.trigger("tag:close", {
			target: node,
			previous: active,
			location: endToken.location,
		});
		this.dom.popActive();
	}

	protected consumeAttribute(
		source: Source,
		node: HtmlElement,
		token: Token,
		next?: Token
	) {
		const keyLocation = token.location;
		const valueLocation = this.getAttributeValueLocation(next);
		const haveValue = next && next.type === TokenType.ATTR_VALUE;
		const attrData: AttributeData = {
			key: token.data[1],
		};

		if (haveValue) {
			attrData.value = next.data[1];
			attrData.quote = next.data[2];
		}

		/* get callback to process attributes, default is to just return attribute
		 * data right away but a transformer may override it to allow aliasing
		 * attributes, e.g ng-attr-foo or v-bind:foo */
		let processAttribute: ProcessAttributeCallback = (attr: AttributeData) => [
			attr,
		];
		if (source.hooks && source.hooks.processAttribute) {
			processAttribute = source.hooks.processAttribute;
		}

		/* handle deprecated callbacks */
		let iterator: Iterable<AttributeData>;
		const legacy = processAttribute(attrData);
		if (typeof (legacy as any)[Symbol.iterator] !== "function") {
			/* AttributeData */
			iterator = [attrData];
		} else {
			/* Iterable<AttributeData> */
			iterator = legacy as Iterable<AttributeData>;
		}

		/* process attribute(s) */
		for (const attr of iterator) {
			this.trigger("attr", {
				target: node,
				key: attr.key,
				value: attr.value,
				quote: attr.quote,
				originalAttribute: attr.originalAttribute,
				location: keyLocation,
				valueLocation,
			});

			node.setAttribute(
				attr.key,
				attr.value,
				keyLocation,
				valueLocation,
				attr.originalAttribute
			);
		}
	}

	/**
	 * Take attribute value token and return a new location referring to only the
	 * value.
	 *
	 * foo="bar"    foo='bar'    foo=bar    foo      foo=""
	 *      ^^^          ^^^         ^^^    (null)   (null)
	 */
	private getAttributeValueLocation(token: Token): Location {
		if (!token || token.type !== TokenType.ATTR_VALUE || token.data[1] === "") {
			return null;
		}
		const quote = token.data[2];
		if (quote) {
			return sliceLocation(token.location, 2, -1);
		} else {
			return sliceLocation(token.location, 1, 0);
		}
	}

	protected consumeDirective(token: Token) {
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
	protected consumeDoctype(startToken: Token, tokenStream: TokenStream) {
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
	protected *consumeUntil(
		tokenStream: TokenStream,
		search: TokenType
	): IterableIterator<Token> {
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
	public on(event: string, listener: EventCallback): () => void {
		return this.event.on(event, listener);
	}

	/**
	 * Listen on single event.
	 */
	public once(event: string, listener: EventCallback): () => void {
		return this.event.once(event, listener);
	}

	/**
	 * Defer execution. Will call function sometime later.
	 */
	public defer(cb: () => void): void {
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
	 * Appends a text node to the current element on the stack.
	 */
	private appendText(text: string, location: Location): void {
		this.dom.getActive().appendText(text, location);
	}

	/**
	 * Trigger close events for any still open elements.
	 */
	private closeTree(token: Token): void {
		let active;
		/* tslint:disable-next-line:no-conditional-assignment */
		while ((active = this.dom.getActive()) && !active.isRootElement()) {
			this.trigger("tag:close", {
				target: undefined,
				previous: active,
				location: token.location,
			});
			this.dom.popActive();
		}
	}
}
