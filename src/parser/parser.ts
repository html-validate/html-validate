import { type ResolvedConfig } from "../config";
import { type Location, type Source, sliceLocation } from "../context";
import { type ProcessAttributeCallback, type ProcessElementContext } from "../context/source";
import { DOMTree, HtmlElement, NodeClosed } from "../dom";
import {
	type AttributeEvent,
	type Event,
	type EventCallback,
	type ListenEventMap,
	type TagEndEvent,
	type TriggerEventMap,
	EventHandler,
} from "../event";
import {
	type Token,
	type TokenStream,
	type DirectiveToken,
	type TagOpenToken,
	type TagCloseToken,
	type CommentToken,
	type AttrNameToken,
	type AttrValueToken,
	type ConditionalToken,
	type DoctypeOpenToken,
	type DoctypeValueToken,
	Lexer,
	TokenType,
} from "../lexer";
import { type MetaTable, type MetaElement } from "../meta";
import { type AttributeData } from "./attribute-data";
import { parseConditionalComment } from "./conditional-comment";
import { ParserError } from "./parser-error";

function isAttrValueToken(token?: Token): token is AttrValueToken {
	return Boolean(token && token.type === TokenType.ATTR_VALUE);
}

function svgShouldRetainTag(foreignTagName: string, tagName: string): boolean {
	return foreignTagName === "svg" && ["title", "desc"].includes(tagName);
}

function isValidDirective(
	action: string,
): action is "enable" | "disable" | "disable-block" | "disable-next" {
	const validActions = ["enable", "disable", "disable-block", "disable-next"];
	return validActions.includes(action);
}

/**
 * Parse HTML document into a DOM tree.
 *
 * @public
 */
export class Parser {
	private readonly event: EventHandler;
	private readonly metaTable: MetaTable;
	private currentNamespace: string = "";
	private dom: DOMTree;

	/**
	 * Create a new parser instance.
	 *
	 * @public
	 * @param config - Configuration
	 */
	public constructor(config: ResolvedConfig) {
		this.event = new EventHandler();
		this.dom = null as unknown as DOMTree;
		this.metaTable = config.getMetaTable();
	}

	/**
	 * Parse HTML markup.
	 *
	 * @public
	 * @param source - HTML markup.
	 * @returns DOM tree representing the HTML markup.
	 */
	public parseHtml(source: string | Source): HtmlElement {
		if (typeof source === "string") {
			source = {
				data: source,
				filename: "inline",
				line: 1,
				column: 1,
				offset: 0,
			};
		}

		/* trigger starting event */
		this.trigger("parse:begin", {
			location: null,
		});

		/* reset DOM in case there are multiple calls in the same session */
		this.dom = new DOMTree({
			filename: source.filename,
			offset: source.offset,
			line: source.line,
			column: source.column,
			size: 0,
		});

		/* trigger any rules waiting for DOM load event */
		this.trigger("dom:load", {
			source,
			location: null,
		});

		const lexer = new Lexer();
		const tokenStream = lexer.tokenize(source);

		/* consume all tokens from the stream */
		let it = this.next(tokenStream);
		while (!it.done) {
			const token = it.value;
			this.consume(source, token, tokenStream);
			it = this.next(tokenStream);
		}

		/* resolve any dynamic meta element properties */
		this.dom.resolveMeta(this.metaTable);

		/* enable cache on root element, all children already have cached enabled */
		this.dom.root.cacheEnable();

		/* trigger any rules waiting for DOM ready */
		this.trigger("dom:ready", {
			document: this.dom,
			source,

			/* disable location for this event so rules can use implicit node location
			 * instead */
			location: null,
		});

		/* trigger ending event */
		this.trigger("parse:end", {
			location: null,
		});

		return this.dom.root;
	}

	/**
	 * Detect optional end tag.
	 *
	 * Some tags have optional end tags (e.g. <ul><li>foo<li>bar</ul> is
	 * valid). The parser handles this by checking if the element on top of the
	 * stack when is allowed to omit.
	 */
	private closeOptional(token: TagOpenToken): boolean {
		/* if the element doesn't have metadata it cannot have optional end
		 * tags. Period. */
		const active = this.dom.getActive();
		if (!active.meta?.implicitClosed) {
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

	/**
	 * @internal
	 */
	/* eslint-disable-next-line complexity -- there isn't really a good other way to structure this method (that is still readable) */
	private consume(source: Source, token: Token, tokenStream: TokenStream): void {
		switch (token.type) {
			case TokenType.UNICODE_BOM:
				/* ignore */
				break;

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
				this.consumeConditional(token);
				break;

			case TokenType.COMMENT:
				this.consumeComment(token);
				break;

			case TokenType.DOCTYPE_OPEN:
				this.consumeDoctype(token, tokenStream);
				break;

			case TokenType.TEXT:
			case TokenType.TEMPLATING:
				this.appendText(token.data[0], token.location);
				break;

			case TokenType.EOF:
				this.closeTree(source, token.location);
				break;
		}
	}

	/**
	 * @internal
	 */
	/* eslint-disable-next-line complexity -- technical debt, chould be refactored a bit */
	protected consumeTag(source: Source, startToken: TagOpenToken, tokenStream: TokenStream): void {
		const tokens = Array.from(
			this.consumeUntil(tokenStream, TokenType.TAG_CLOSE, startToken.location),
		);
		const endToken = tokens.slice(-1)[0] as TagCloseToken;
		const closeOptional = this.closeOptional(startToken);
		const parent = closeOptional ? this.dom.getActive().parent : this.dom.getActive();
		const node = HtmlElement.fromTokens(
			startToken,
			endToken,
			parent,
			this.metaTable,
			this.currentNamespace,
		);
		const isStartTag = !startToken.data[1];
		const isClosing = !isStartTag || node.closed !== NodeClosed.Open;
		const isForeign = node.meta?.foreign;

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

	/**
	 * @internal
	 */
	private closeElement(
		source: Source,
		node: HtmlElement | null,
		active: HtmlElement,
		location: Location,
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
		if (!active.isRootElement()) {
			this.trigger("element:ready", {
				target: active,
				location: active.location,
			});
		}
	}

	private processElement(node: HtmlElement, source: Source): void {
		/* enable cache on node now that it is fully constructed */
		node.cacheEnable();

		if (source.hooks?.processElement) {
			const processElement = source.hooks.processElement;
			const metaTable = this.metaTable;
			const context: ProcessElementContext = {
				getMetaFor(this: void, tagName: string): MetaElement | null {
					return metaTable.getMetaFor(tagName);
				},
			};
			processElement.call(context, node);
		}
	}

	/**
	 * Discard tokens until the end tag for the foreign element is found.
	 *
	 * @internal
	 */
	private discardForeignBody(
		source: Source,
		foreignTagName: string,
		tokenStream: TokenStream,
		errorLocation: Location,
	): void {
		/* consume elements until the end tag for this foreign element is found */
		let nested = 1;
		let startToken: TagOpenToken | undefined;
		let endToken: TagCloseToken | undefined;
		do {
			/* search for tags */
			const tokens = Array.from(this.consumeUntil(tokenStream, TokenType.TAG_OPEN, errorLocation));
			const [last] = tokens.slice(-1) as [TagOpenToken];
			const [, tagClosed, tagName] = last.data;

			/* special case: svg <title> and <desc> should be intact as it affects accessibility */
			if (!tagClosed && svgShouldRetainTag(foreignTagName, tagName)) {
				const oldNamespace = this.currentNamespace;
				this.currentNamespace = "svg";
				this.consumeTag(source, last, tokenStream);
				this.consumeUntilMatchingTag(source, tokenStream, tagName);
				this.currentNamespace = oldNamespace;
				continue;
			}

			/* keep going unless the new tag matches the foreign root element */
			if (tagName !== foreignTagName) {
				continue;
			}

			/* locate end token and determine if this is a self-closed tag */
			const endTokens = Array.from(
				this.consumeUntil(tokenStream, TokenType.TAG_CLOSE, last.location),
			);
			endToken = endTokens.slice(-1)[0] as TagCloseToken;
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

		/* istanbul ignore next: this should never happen because `consumeUntil`
		 * would have thrown errors however typescript does not know that */
		if (!startToken || !endToken) {
			return;
		}

		const active = this.dom.getActive();
		const node = HtmlElement.fromTokens(startToken, endToken, active, this.metaTable);

		this.closeElement(source, node, active, endToken.location);
		this.dom.popActive();
	}

	/**
	 * @internal
	 */
	private consumeAttribute(
		source: Source,
		node: HtmlElement,
		token: AttrNameToken,
		next?: Token,
	): void {
		const { meta } = node;
		const keyLocation = this.getAttributeKeyLocation(token);
		const valueLocation = this.getAttributeValueLocation(next);
		const location = this.getAttributeLocation(token, next);
		const haveValue = isAttrValueToken(next);
		const attrData: AttributeData = {
			key: token.data[1],
			value: null,
			quote: null,
		};

		if (haveValue) {
			const [, , value, quote] = next.data;
			attrData.value = value;
			attrData.quote = quote ?? null;
		}

		/* get callback to process attributes, default is to just return attribute
		 * data right away but a transformer may override it to allow aliasing
		 * attributes, e.g ng-attr-foo or v-bind:foo */
		let processAttribute: ProcessAttributeCallback = (
			attr: AttributeData,
		): Iterable<AttributeData> => [attr];
		if (source.hooks?.processAttribute) {
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
			iterator = legacy;
		}

		/* process attribute(s) */
		for (const attr of iterator) {
			const event: AttributeEvent = {
				target: node,
				key: attr.key,
				value: attr.value,
				quote: attr.quote,
				originalAttribute: attr.originalAttribute,
				location,
				keyLocation,
				valueLocation,
				meta: meta?.attributes[attr.key] ?? null,
			};
			this.trigger("attr", event);
			node.setAttribute(attr.key, attr.value, keyLocation, valueLocation, attr.originalAttribute);
		}
	}

	/**
	 * Takes attribute key token an returns location.
	 */
	private getAttributeKeyLocation(token: AttrNameToken): Location {
		return token.location;
	}

	/**
	 * Take attribute value token and return a new location referring to only the
	 * value.
	 *
	 * foo="bar"    foo='bar'    foo=bar    foo      foo=""
	 *      ^^^          ^^^         ^^^    (null)   (null)
	 */
	private getAttributeValueLocation(token?: Token): Location | null {
		if (!token || token.type !== TokenType.ATTR_VALUE || token.data[2] === "") {
			return null;
		}
		const quote = token.data[3];
		if (quote) {
			return sliceLocation(token.location, 2, -1);
		} else {
			return sliceLocation(token.location, 1);
		}
	}

	/**
	 * Take attribute key and value token an returns a new location referring to
	 * an aggregate location covering key, quotes if present and value.
	 */
	private getAttributeLocation(key: AttrNameToken, value?: Token): Location {
		const begin = key.location;
		const end = value && value.type === TokenType.ATTR_VALUE ? value.location : undefined;
		return {
			filename: begin.filename,
			line: begin.line,
			column: begin.column,
			size: begin.size + (end?.size ?? 0),
			offset: begin.offset,
		};
	}

	/**
	 * @internal
	 */
	protected consumeDirective(token: DirectiveToken): void {
		const [text, preamble, action, separator1, directive, postamble] = token.data;
		if (!postamble.startsWith("]")) {
			throw new ParserError(token.location, `Missing end bracket "]" on directive "${text}"`);
		}
		const match = directive.match(/^(.*?)(?:(\s*(?:--|:)\s*)(.*))?$/);

		/* istanbul ignore next: should not be possible, would be emitted as comment token */
		if (!match) {
			throw new Error(`Failed to parse directive "${text}"`);
		}

		if (!isValidDirective(action)) {
			throw new ParserError(token.location, `Unknown directive "${action}"`);
		}

		const [, data, separator2, comment] = match;
		const prefix = "html-validate-";

		/* <!-- [html-validate-action options -- comment] -->
		 *                     ^      ^          ^--------------- comment offset
		 *                     |      \-------------------------- options offset
		 *                     \--------------------------------- action offset
		 */
		const actionOffset = preamble.length;
		const optionsOffset = actionOffset + action.length + separator1.length;
		const commentOffset = optionsOffset + data.length + (separator2 || "").length;

		const location = sliceLocation(
			token.location,
			preamble.length - prefix.length - 1,
			-postamble.length + 1,
		);
		const actionLocation = sliceLocation(
			token.location,
			actionOffset,
			actionOffset + action.length,
		);
		const optionsLocation = data
			? sliceLocation(token.location, optionsOffset, optionsOffset + data.length)
			: undefined;
		const commentLocation = comment
			? sliceLocation(token.location, commentOffset, commentOffset + comment.length)
			: undefined;

		this.trigger("directive", {
			action,
			data,
			comment: comment || "",
			location,
			actionLocation,
			optionsLocation,
			commentLocation,
		});
	}

	/**
	 * Consumes conditional comment in tag form.
	 *
	 * See also the related [[consumeCommend]] method.
	 *
	 * @internal
	 */
	private consumeConditional(token: ConditionalToken): void {
		const element = this.dom.getActive();
		this.trigger("conditional", {
			condition: token.data[1],
			location: token.location,
			parent: element,
		});
	}

	/**
	 * Consumes comment token.
	 *
	 * Tries to find IE conditional comments and emits conditional token if
	 * found. See also the related [[consumeConditional]] method.
	 *
	 * @internal
	 */
	private consumeComment(token: CommentToken): void {
		const comment = token.data[0];
		const element = this.dom.getActive();
		for (const conditional of parseConditionalComment(comment, token.location)) {
			this.trigger("conditional", {
				condition: conditional.expression,
				location: conditional.location,
				parent: element,
			});
		}
	}

	/**
	 * Consumes doctype tokens. Emits doctype event.
	 *
	 * @internal
	 */
	private consumeDoctype(startToken: DoctypeOpenToken, tokenStream: TokenStream): void {
		const tokens = Array.from(
			this.consumeUntil(tokenStream, TokenType.DOCTYPE_CLOSE, startToken.location),
		);
		/* first token is the doctype, second is the closing ">" */
		const doctype: DoctypeValueToken = tokens[0] as DoctypeValueToken;
		const value = doctype.data[0];
		this.dom.doctype = value;
		this.trigger("doctype", {
			tag: startToken.data[1],
			value,
			valueLocation: tokens[0].location,
			location: startToken.location,
		});
	}

	/**
	 * Return a list of tokens found until the expected token was found.
	 *
	 * @internal
	 * @param errorLocation - What location to use if an error occurs
	 */
	protected *consumeUntil(
		tokenStream: TokenStream,
		search: TokenType,
		errorLocation: Location,
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
			`stream ended before ${TokenType[search]} token was found`,
		);
	}

	/**
	 * Consumes tokens until a matching close-tag is found. Tags are appended to
	 * the document.
	 *
	 * @internal
	 */
	private consumeUntilMatchingTag(
		source: Source,
		tokenStream: TokenStream,
		searchTag: string,
	): void {
		let numOpen = 1;
		let it = this.next(tokenStream);
		while (!it.done) {
			const token = it.value;
			this.consume(source, token, tokenStream);
			if (token.type === TokenType.TAG_OPEN) {
				const [, close, tagName] = token.data;
				if (tagName === searchTag) {
					if (close) {
						numOpen--;
					} else {
						numOpen++;
					}
					if (numOpen === 0) {
						return;
					}
				}
			}
			it = this.next(tokenStream);
		}
	}

	private next(tokenStream: TokenStream): IteratorResult<Token> {
		const it = tokenStream.next();
		if (!it.done) {
			const token = it.value;
			this.trigger("token", {
				location: token.location,
				type: token.type,
				data: Array.from(token.data),
				token,
			});
		}
		return it;
	}

	/**
	 * Listen on events.
	 *
	 * @public
	 * @param event - Event name.
	 * @param listener - Event callback.
	 * @returns A function to unregister the listener.
	 */
	public on<K extends keyof ListenEventMap>(
		event: K,
		listener: (event: string, data: ListenEventMap[K]) => void,
	): () => void;
	public on(event: string, listener: EventCallback): () => void;
	public on(event: string, listener: EventCallback): () => void {
		return this.event.on(event, listener);
	}

	/**
	 * Listen on single event. The listener is automatically unregistered once the
	 * event has been received.
	 *
	 * @public
	 * @param event - Event name.
	 * @param listener - Event callback.
	 * @returns A function to unregister the listener.
	 */
	public once<K extends keyof ListenEventMap>(
		event: K,
		listener: (event: string, data: ListenEventMap[K]) => void,
	): () => void;
	public once(event: string, listener: EventCallback): () => void;
	public once(event: string, listener: EventCallback): () => void {
		return this.event.once(event, listener);
	}

	/**
	 * Defer execution. Will call function sometime later.
	 *
	 * @internal
	 * @param cb - Callback to execute later.
	 */
	public defer(cb: () => void): void {
		this.event.once("*", cb);
	}

	/**
	 * Trigger event.
	 *
	 * @internal
	 * @param event - Event name
	 * @param data - Event data
	 */
	public trigger<K extends keyof TriggerEventMap>(event: K, data: TriggerEventMap[K]): void;
	public trigger(event: string, data: Event): void {
		if (typeof data.location === "undefined") {
			throw new Error("Triggered event must contain location");
		}
		this.event.trigger(event, data);
	}

	/**
	 * @internal
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
		/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- the condition is not unnecessary, it performs an assignment */
		while ((active = this.dom.getActive()) && !active.isRootElement()) {
			this.closeElement(source, null, active, location);
			this.dom.popActive();
		}
	}
}
