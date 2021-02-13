import { ResolvedConfig } from "../config";
import { Location, sliceLocation, Source } from "../context";
import { ProcessAttributeCallback, ProcessElementContext } from "../context/source";
import { DOMTree, HtmlElement, NodeClosed } from "../dom";
import {
	AttributeEvent,
	Event,
	EventCallback,
	EventHandler,
	ListenEventMap,
	TagEndEvent,
	TriggerEventMap,
} from "../event";
import { Lexer, Token, TokenStream, TokenType } from "../lexer";
import { MetaTable, MetaElement } from "../meta";
import { AttributeData } from "./attribute-data";
import { parseConditionalComment } from "./conditional-comment";
import { ParserError } from "./parser-error";

/**
 * Parse HTML document into a DOM tree.
 */
export class Parser {
	private readonly event: EventHandler;
	private readonly metaTable: MetaTable;
	private dom: DOMTree;

	/**
	 * Create a new parser instance.
	 *
	 * @param config - Configuration
	 */
	public constructor(config: ResolvedConfig) {
		this.event = new EventHandler();
		this.dom = (null as unknown) as DOMTree;
		this.metaTable = config.getMetaTable();
	}

	/**
	 * Parse HTML markup.
	 *
	 * @param source - HTML markup.
	 * @returns DOM tree representing the HTML markup.
	 */
	// eslint-disable-next-line complexity
	public parseHtml(source: string | Source): DOMTree {
		if (typeof source === "string") {
			source = {
				data: source,
				filename: "inline",
				line: 1,
				column: 1,
				offset: 0,
			};
		}

		/* reset DOM in case there are multiple calls in the same session */
		this.dom = new DOMTree({
			filename: source.filename ?? "",
			offset: source.offset ?? 0,
			line: source.line ?? 1,
			column: source.column ?? 1,
			size: 0,
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

				case TokenType.COMMENT:
					this.consumeComment(token);
					break;

				case TokenType.DOCTYPE_OPEN:
					this.consumeDoctype(token, tokenStream);
					break;

				case TokenType.TEXT:
				case TokenType.TEMPLATING:
					this.appendText(token.data, token.location);
					break;

				case TokenType.EOF:
					this.closeTree(source, token.location);
					break;
			}

			it = this.next(tokenStream);
		}

		/* resolve any dynamic meta element properties */
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
			return meta.includes(tagName);
		} else {
			/* if we are explicitly closing the active element, ignore implicit */
			if (active.is(tagName)) {
				return false;
			}

			/* the parent element is closed, check if the active element would be
			 * implicitly closed when parent is. */
			return Boolean(active.parent && active.parent.is(tagName) && meta.includes(active.tagName));
		}
	}

	/* eslint-disable-next-line complexity, sonarjs/cognitive-complexity */
	protected consumeTag(source: Source, startToken: Token, tokenStream: TokenStream): void {
		const tokens = Array.from(
			this.consumeUntil(tokenStream, TokenType.TAG_CLOSE, startToken.location)
		);
		const endToken = tokens.slice(-1)[0];
		const closeOptional = this.closeOptional(startToken);
		const parent = closeOptional ? this.dom.getActive().parent : this.dom.getActive();
		const node = HtmlElement.fromTokens(startToken, endToken, parent, this.metaTable);
		const isStartTag = !startToken.data[1];
		const isClosing = !isStartTag || node.closed !== NodeClosed.Open;
		const isForeign = node.meta && node.meta.foreign;

		/* if the previous tag to be implicitly closed by the current tag we close
		 * it and pop it from the stack before continuing processing this tag */
		if (closeOptional) {
			const active = this.dom.getActive();
			active.closed = NodeClosed.ImplicitClosed;
			this.closeElement(source, node, active, startToken.location);
			this.dom.popActive();
		}

		if (isStartTag) {
			this.dom.pushActive(node);
			this.trigger("tag:start", {
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

		/* emit tag:ready unless this is a end tag */
		if (isStartTag) {
			this.trigger("tag:ready", {
				target: node,
				location: endToken.location,
			});
		}

		if (isClosing) {
			const active = this.dom.getActive();

			/* if this is not an open tag it is a close tag and thus we force it to be
			 * one, in case it is detected as void */
			if (!isStartTag) {
				node.closed = NodeClosed.EndTag;
			}

			this.closeElement(source, node, active, endToken.location);

			/* if this element is closed with an end tag but is would it will not be
			 * closed again (it is already closed automatically since it is
			 * void). Closing again will have side-effects as it will close the parent
			 * and cause a mess later. */
			const voidClosed = !isStartTag && node.voidElement;
			if (!voidClosed) {
				this.dom.popActive();
			}
		} else if (isForeign) {
			/* consume the body of the foreign element so it won't be part of the
			 * document (only the root foreign element is).  */
			this.discardForeignBody(source, node.tagName, tokenStream, startToken.location);
		}
	}

	protected closeElement(
		source: Source,
		node: HtmlElement | null,
		active: HtmlElement,
		location: Location
	): void {
		/* call processElement hook */
		this.processElement(active, source);

		/* trigger event for the closing of the element (the </> tag)*/
		const event: TagEndEvent = {
			target: node,
			previous: active,
			location,
		};
		this.trigger("tag:end", event);

		/* trigger event for for an element being fully constructed. Special care
		 * for void elements explicit closed <input></input> */
		if (active && !active.isRootElement()) {
			this.trigger("element:ready", {
				target: active,
				location: active.location,
			});
		}
	}

	private processElement(node: HtmlElement, source: Source): void {
		/* enable cache on node now that it is fully constructed */
		node.cacheEnable();

		if (source.hooks && source.hooks.processElement) {
			const processElement = source.hooks.processElement;
			const metaTable = this.metaTable;
			const context: ProcessElementContext = {
				getMetaFor(tagName: string): MetaElement | null {
					return metaTable.getMetaFor(tagName);
				},
			};
			processElement.call(context, node);
		}
	}

	/**
	 * Discard tokens until the end tag for the foreign element is found.
	 */
	protected discardForeignBody(
		source: Source,
		foreignTagName: string,
		tokenStream: TokenStream,
		errorLocation: Location
	): void {
		/* consume elements until the end tag for this foreign element is found */
		let nested = 1;
		let startToken;
		let endToken;
		do {
			/* search for tags */
			const tokens = Array.from(this.consumeUntil(tokenStream, TokenType.TAG_OPEN, errorLocation));
			const [last] = tokens.slice(-1);
			const [, tagClosed, tagName] = last.data;

			/* keep going unless the new tag matches the foreign root element */
			if (tagName !== foreignTagName) {
				continue;
			}

			/* locate end token and determine if this is a self-closed tag */
			const endTokens = Array.from(
				this.consumeUntil(tokenStream, TokenType.TAG_CLOSE, last.location)
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

		if (!startToken || !endToken) {
			return;
		}

		const active = this.dom.getActive();
		const node = HtmlElement.fromTokens(startToken, endToken, active, this.metaTable);

		this.closeElement(source, node, active, endToken.location);
		this.dom.popActive();
	}

	protected consumeAttribute(source: Source, node: HtmlElement, token: Token, next?: Token): void {
		const keyLocation = token.location;
		const valueLocation = this.getAttributeValueLocation(next);
		const haveValue = next && next.type === TokenType.ATTR_VALUE;
		const attrData: AttributeData = {
			key: token.data[1],
			value: null,
			quote: null,
		};

		if (next && haveValue) {
			attrData.value = next.data[1] ?? null;
			attrData.quote = next.data[2] ?? null;
		}

		/* get callback to process attributes, default is to just return attribute
		 * data right away but a transformer may override it to allow aliasing
		 * attributes, e.g ng-attr-foo or v-bind:foo */
		let processAttribute: ProcessAttributeCallback = (
			attr: AttributeData
		): Iterable<AttributeData> => [attr];
		if (source.hooks && source.hooks.processAttribute) {
			processAttribute = source.hooks.processAttribute;
		}

		/* handle deprecated callbacks */
		let iterator: Iterable<AttributeData>;
		const legacy = processAttribute.call({}, attrData);
		if (typeof (legacy as any)[Symbol.iterator] !== "function") {
			/* AttributeData */
			iterator = [attrData];
		} else {
			/* Iterable<AttributeData> */
			iterator = legacy as Iterable<AttributeData>;
		}

		/* process attribute(s) */
		for (const attr of iterator) {
			const event: AttributeEvent = {
				target: node,
				key: attr.key,
				value: attr.value,
				quote: attr.quote,
				originalAttribute: attr.originalAttribute,
				location: keyLocation,
				valueLocation,
			};
			this.trigger("attr", event);
			node.setAttribute(attr.key, attr.value, keyLocation, valueLocation, attr.originalAttribute);
		}
	}

	/**
	 * Take attribute value token and return a new location referring to only the
	 * value.
	 *
	 * foo="bar"    foo='bar'    foo=bar    foo      foo=""
	 *      ^^^          ^^^         ^^^    (null)   (null)
	 */
	private getAttributeValueLocation(token?: Token): Location | null {
		if (!token || token.type !== TokenType.ATTR_VALUE || token.data[1] === "") {
			return null;
		}
		const quote = token.data[2];
		if (quote) {
			return sliceLocation(token.location, 2, -1);
		} else {
			return sliceLocation(token.location, 1);
		}
	}

	protected consumeDirective(token: Token): void {
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
	 * Consumes comment token.
	 *
	 * Tries to find IE conditional comments and emits conditional token if found.
	 */
	protected consumeComment(token: Token): void {
		const comment = token.data[0];
		for (const conditional of parseConditionalComment(comment, token.location)) {
			this.trigger("conditional", {
				condition: conditional.expression,
				location: conditional.location,
			});
		}
	}

	/**
	 * Consumes doctype tokens. Emits doctype event.
	 */
	protected consumeDoctype(startToken: Token, tokenStream: TokenStream): void {
		const tokens = Array.from(
			this.consumeUntil(tokenStream, TokenType.DOCTYPE_CLOSE, startToken.location)
		);
		const doctype = tokens[0]; /* first token is the doctype, second is the closing ">" */
		const value = doctype.data[0];
		this.dom.doctype = value;
		this.trigger("doctype", {
			value,
			valueLocation: tokens[0].location,
			location: startToken.location,
		});
	}

	/**
	 * Return a list of tokens found until the expected token was found.
	 *
	 * @param errorLocation - What location to use if an error occurs
	 */
	protected *consumeUntil(
		tokenStream: TokenStream,
		search: TokenType,
		errorLocation: Location
	): IterableIterator<Token> {
		let it = this.next(tokenStream);
		while (!it.done) {
			const token = it.value;
			yield token;
			if (token.type === search) return;
			it = this.next(tokenStream);
		}
		throw new ParserError(
			errorLocation,
			`stream ended before ${TokenType[search]} token was found`
		);
	}

	private next(tokenStream: TokenStream): IteratorResult<Token> {
		const it = tokenStream.next();
		if (!it.done) {
			const token = it.value;
			this.trigger("token", {
				location: token.location,
				type: token.type,
				data: token.data ? Array.from(token.data) : undefined,
			});
		}
		return it;
	}

	/**
	 * Listen on events.
	 *
	 * @param event - Event name.
	 * @param listener - Event callback.
	 * @returns A function to unregister the listener.
	 */
	public on<K extends keyof ListenEventMap>(
		event: K,
		listener: (event: string, data: ListenEventMap[K]) => void
	): () => void;
	public on(event: string, listener: EventCallback): () => void;
	public on(event: string, listener: EventCallback): () => void {
		return this.event.on(event, listener);
	}

	/**
	 * Listen on single event. The listener is automatically unregistered once the
	 * event has been received.
	 *
	 * @param event - Event name.
	 * @param listener - Event callback.
	 * @returns A function to unregister the listener.
	 */
	public once<K extends keyof ListenEventMap>(
		event: K,
		listener: (event: string, data: ListenEventMap[K]) => void
	): () => void;
	public once(event: string, listener: EventCallback): () => void;
	public once(event: string, listener: EventCallback): () => void {
		return this.event.once(event, listener);
	}

	/**
	 * Defer execution. Will call function sometime later.
	 *
	 * @param cb - Callback to execute later.
	 */
	public defer(cb: () => void): void {
		this.event.once("*", cb);
	}

	/**
	 * Trigger event.
	 *
	 * @param event - Event name
	 * @param data - Event data
	 */
	public trigger<K extends keyof TriggerEventMap>(event: K, data: TriggerEventMap[K]): void;
	public trigger(event: string, data: Event): void {
		if (typeof data.location === "undefined") {
			throw Error("Triggered event must contain location");
		}
		this.event.trigger(event, data);
	}

	/**
	 * @hidden
	 */
	public getEventHandler(): EventHandler {
		return this.event;
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
	private closeTree(source: Source, location: Location): void {
		let active;
		while ((active = this.dom.getActive()) && !active.isRootElement()) {
			this.closeElement(source, null, active, location);
			this.dom.popActive();
		}
	}
}
