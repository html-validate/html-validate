import { Location, sliceLocation } from "../context";
import { Token } from "../lexer";
import { MetaCopyableProperty, MetaElement, MetaTable } from "../meta";
import { Attribute } from "./attribute";
import { DOMNode } from "./domnode";
import { DOMTokenList } from "./domtokenlist";
import { DynamicValue } from "./dynamic-value";
import { NodeType } from "./nodetype";
import { Selector } from "./selector";
import { TextNode } from "./text";

export enum NodeClosed {
	Open = 0, //            element wasn't closed
	EndTag = 1, //          element closed with end tag <p>...</p>
	VoidOmitted = 2, //     void element with omitted end tag <input>
	VoidSelfClosed = 3, //  self-closed void element <input/>
	ImplicitClosed = 4, //  element with optional end tag <li>foo<li>bar
}

export class HtmlElement extends DOMNode {
	public readonly tagName: string;
	public readonly parent: HtmlElement;
	public readonly voidElement: boolean;
	public readonly depth: number;
	public closed: NodeClosed;
	protected readonly attr: { [key: string]: Attribute[] };
	private metaElement: MetaElement;
	private annotation: string | null;

	public constructor(
		tagName: string,
		parent?: HtmlElement,
		closed: NodeClosed = NodeClosed.EndTag,
		meta?: MetaElement,
		location?: Location
	) {
		const nodeType = tagName ? NodeType.ELEMENT_NODE : NodeType.DOCUMENT_NODE;
		super(nodeType, tagName, location);

		this.tagName = tagName;
		this.parent = parent;
		this.attr = {};
		this.metaElement = meta;
		this.closed = closed;
		this.voidElement = meta ? Boolean(meta.void) : false;
		this.depth = 0;
		this.annotation = null;

		if (parent) {
			parent.childNodes.push(this);

			/* calculate depth in domtree */
			let cur: HtmlElement = parent;
			while (cur.parent) {
				this.depth++;
				cur = cur.parent;
			}
		}
	}

	public static rootNode(location: Location): HtmlElement {
		return new HtmlElement(undefined, undefined, undefined, undefined, location);
	}

	public static fromTokens(
		startToken: Token,
		endToken: Token,
		parent: HtmlElement,
		metaTable: MetaTable
	): HtmlElement {
		const tagName = startToken.data[2];
		if (!tagName) {
			throw new Error("tagName cannot be empty");
		}

		const meta = metaTable ? metaTable.getMetaFor(tagName) : null;
		const open = startToken.data[1] !== "/";
		const closed = isClosed(endToken, meta);

		/* location contains position of '<' so strip it out */
		const location = sliceLocation(startToken.location, 1);

		return new HtmlElement(tagName, open ? parent : undefined, closed, meta, location);
	}

	/**
	 * Returns annotated name if set or defaults to `<tagName>`.
	 *
	 * E.g. `my-annotation` or `<div>`.
	 */
	public get annotatedName(): string {
		if (this.annotation) {
			return this.annotation;
		} else {
			return `<${this.tagName}>`;
		}
	}

	/**
	 * Similar to childNodes but only elements.
	 */
	public get childElements(): HtmlElement[] {
		return this.childNodes.filter(
			(node) => node.nodeType === NodeType.ELEMENT_NODE
		) as HtmlElement[];
	}

	/**
	 * Find the first ancestor matching a selector.
	 *
	 * Implementation of DOM specification of Element.closest(selectors).
	 */
	public closest(selectors: string): HtmlElement {
		/* eslint-disable-next-line @typescript-eslint/no-this-alias */
		let node: HtmlElement = this;
		while (node) {
			if (node.matches(selectors)) {
				return node;
			}
			node = node.parent;
		}
		return null;
	}

	/**
	 * Generate a DOM selector for this element. The returned selector will be
	 * unique inside the current document.
	 */
	public generateSelector(): string | null {
		/* root element cannot have a selector as it isn't a proper element */
		if (this.isRootElement()) {
			return null;
		}

		const parts = [];

		let root: HtmlElement;
		for (root = this; root.parent; root = root.parent) {
			/* .. */
		}

		// eslint-disable-next-line @typescript-eslint/no-this-alias
		for (let cur: HtmlElement = this; cur.parent; cur = cur.parent) {
			/* if a unique id is present, use it and short-circuit */
			if (cur.id) {
				const matches = root.querySelectorAll(`#${cur.id}`);
				if (matches.length === 1) {
					parts.push(`#${cur.id}`);
					break;
				}
			}

			const parent = cur.parent;
			const child = parent.childElements;
			const index = child.findIndex((it) => it.unique === cur.unique);
			const numOfType = child.filter((it) => it.is(cur.tagName)).length;
			const solo = numOfType === 1;

			/* if this is the only tagName in this level of siblings nth-child isn't needed */
			if (solo) {
				parts.push(cur.tagName.toLowerCase());
				continue;
			}

			/* this will generate the worst kind of selector but at least it will be accurate (optimizations welcome) */
			parts.push(`${cur.tagName.toLowerCase()}:nth-child(${index + 1})`);
		}
		return parts.reverse().join(" > ");
	}

	/**
	 * Tests if this element has given tagname.
	 *
	 * If passing "*" this test will pass if any tagname is set.
	 */
	public is(tagName: string): boolean {
		if (!this.tagName) {
			return false;
		}
		return tagName === "*" || this.tagName.toLowerCase() === tagName.toLowerCase();
	}

	/**
	 * Load new element metadata onto this element.
	 *
	 * Do note that semantics such as `void` cannot be changed (as the element has
	 * already been created). In addition the element will still "be" the same
	 * element, i.e. even if loading meta for a `<p>` tag upon a `<div>` tag it
	 * will still be a `<div>` as far as the rest of the validator is concerned.
	 *
	 * In fact only certain properties will be copied onto the element:
	 *
	 * - content categories (flow, phrasing, etc)
	 * - required attributes
	 * - attribute allowed values
	 * - permitted/required elements
	 *
	 * Properties *not* loaded:
	 *
	 * - inherit
	 * - deprecated
	 * - foreign
	 * - void
	 * - implicitClosed
	 * - scriptSupporting
	 * - deprecatedAttributes
	 *
	 * Changes to element metadata will only be visible after `element:ready` (and
	 * the subsequent `dom:ready` event).
	 */
	public loadMeta(meta: MetaElement): void {
		if (!this.metaElement) {
			this.metaElement = {} as MetaElement;
		}
		for (const key of MetaCopyableProperty) {
			if (typeof meta[key] !== "undefined") {
				this.metaElement[key] = meta[key];
			} else {
				delete this.metaElement[key];
			}
		}
	}

	/**
	 * Match this element against given selectors. Returns true if any selector
	 * matches.
	 *
	 * Implementation of DOM specification of Element.matches(selectors).
	 */
	public matches(selector: string): boolean {
		/* find root element */
		/* eslint-disable-next-line @typescript-eslint/no-this-alias */
		let root: HtmlElement = this;
		while (root.parent) {
			root = root.parent;
		}

		/* a bit slow implementation as it finds all candidates for the selector and
		 * then tests if any of them are the current element. A better
		 * implementation would be to walk the selector right-to-left and test
		 * ancestors. */
		for (const match of root.querySelectorAll(selector)) {
			if (match.unique === this.unique) {
				return true;
			}
		}

		return false;
	}

	public get meta(): MetaElement {
		return this.metaElement;
	}

	/**
	 * Set annotation for this element.
	 */
	public setAnnotation(text: string): void {
		this.annotation = text;
	}

	/**
	 * Set attribute. Stores all attributes set even with the same name.
	 *
	 * @param key - Attribute name
	 * @param value - Attribute value. Use `null` if no value is present.
	 * @param keyLocation - Location of the attribute name.
	 * @param valueLocation - Location of the attribute value (excluding quotation)
	 * @param originalAttribute - If attribute is an alias for another attribute
	 * (dynamic attributes) set this to the original attribute name.
	 */
	public setAttribute(
		key: string,
		value: string | DynamicValue | null,
		keyLocation: Location | null,
		valueLocation: Location | null,
		originalAttribute?: string
	): void {
		key = key.toLowerCase();

		if (!this.attr[key]) {
			this.attr[key] = [];
		}

		this.attr[key].push(new Attribute(key, value, keyLocation, valueLocation, originalAttribute));
	}

	/**
	 * Get a list of all attributes on this node.
	 */
	public get attributes(): Attribute[] {
		return Object.values(this.attr).reduce((result, cur) => {
			return result.concat(cur);
		}, []);
	}

	public hasAttribute(key: string): boolean {
		key = key.toLowerCase();
		return key in this.attr;
	}

	/**
	 * Get attribute.
	 *
	 * By default only the first attribute is returned but if the code needs to
	 * handle duplicate attributes the `all` parameter can be set to get all
	 * attributes with given key.
	 *
	 * This usually only happens when code contains duplicate attributes (which
	 * `no-dup-attr` will complain about) or when a static attribute is combined
	 * with a dynamic, consider:
	 *
	 * <p class="foo" dynamic-class="bar">
	 *
	 * @param {string} key - Attribute name
	 * @param {boolean} [all=false] - Return single or all attributes.
	 */
	public getAttribute(key: string): Attribute;
	public getAttribute(key: string, all: true): Attribute[];
	public getAttribute(key: string, all: boolean = false): Attribute | Attribute[] {
		key = key.toLowerCase();
		if (key in this.attr) {
			const matches = this.attr[key];
			return all ? matches : matches[0];
		} else {
			return null;
		}
	}

	/**
	 * Get attribute value.
	 *
	 * Returns the attribute value if present.
	 *
	 * - Missing attributes return `null`.
	 * - Boolean attributes return `null`.
	 * - `DynamicValue` returns attribute expression.
	 *
	 * @param {string} key - Attribute name
	 * @return Attribute value or null.
	 */
	public getAttributeValue(key: string): string | null {
		const attr = this.getAttribute(key);
		if (attr) {
			return attr.value !== null ? attr.value.toString() : null;
		} else {
			return null;
		}
	}

	/**
	 * Add text as a child node to this element.
	 *
	 * @param text - Text to add.
	 * @param location - Source code location of this text.
	 */
	public appendText(text: string | DynamicValue, location?: Location): void {
		this.childNodes.push(new TextNode(text, location));
	}

	/**
	 * Return a list of all known classes on the element. Dynamic values are
	 * ignored.
	 */
	public get classList(): DOMTokenList {
		if (!this.hasAttribute("class")) {
			return new DOMTokenList(null);
		}
		const classes = this.getAttribute("class", true)
			.filter((attr) => attr.isStatic)
			.map((attr) => attr.value)
			.join(" ");
		return new DOMTokenList(classes);
	}

	/**
	 * Get element ID if present.
	 */
	public get id(): string | null {
		return this.getAttributeValue("id");
	}

	public get siblings(): HtmlElement[] {
		return this.parent.childElements;
	}

	public get previousSibling(): HtmlElement {
		const i = this.siblings.findIndex((node) => node.unique === this.unique);
		return i >= 1 ? this.siblings[i - 1] : null;
	}

	public get nextSibling(): HtmlElement {
		const i = this.siblings.findIndex((node) => node.unique === this.unique);
		return i <= this.siblings.length - 2 ? this.siblings[i + 1] : null;
	}

	public getElementsByTagName(tagName: string): HtmlElement[] {
		return this.childElements.reduce((matches, node) => {
			return matches.concat(node.is(tagName) ? [node] : [], node.getElementsByTagName(tagName));
		}, []);
	}

	public querySelector(selector: string): HtmlElement {
		const it = this.querySelectorImpl(selector);
		return it.next().value || null;
	}

	public querySelectorAll(selector: string): HtmlElement[] {
		const it = this.querySelectorImpl(selector);
		const unique = new Set(it);
		return Array.from(unique.values());
	}

	private *querySelectorImpl(selectorList: string): IterableIterator<HtmlElement> {
		if (!selectorList) {
			return;
		}
		for (const selector of selectorList.split(/,\s*/)) {
			const pattern = new Selector(selector);
			yield* pattern.match(this);
		}
	}

	/**
	 * Visit all nodes from this node and down. Depth first.
	 */
	public visitDepthFirst(callback: (node: HtmlElement) => void): void {
		function visit(node: HtmlElement): void {
			node.childElements.forEach(visit);
			if (!node.isRootElement()) {
				callback(node);
			}
		}

		visit(this);
	}

	/**
	 * Evaluates callbackk on all descendants, returning true if any are true.
	 */
	public someChildren(callback: (node: HtmlElement) => boolean): boolean {
		return this.childElements.some(visit);

		function visit(node: HtmlElement): boolean {
			if (callback(node)) {
				return true;
			} else {
				return node.childElements.some(visit);
			}
		}
	}

	/**
	 * Evaluates callbackk on all descendants, returning true if all are true.
	 */
	public everyChildren(callback: (node: HtmlElement) => boolean): boolean {
		return this.childElements.every(visit);

		function visit(node: HtmlElement): boolean {
			if (!callback(node)) {
				return false;
			}
			return node.childElements.every(visit);
		}
	}

	/**
	 * Visit all nodes from this node and down. Breadth first.
	 *
	 * The first node for which the callback evaluates to true is returned.
	 */
	public find(callback: (node: HtmlElement) => boolean): HtmlElement {
		function visit(node: HtmlElement): HtmlElement {
			if (callback(node)) {
				return node;
			}
			for (const child of node.childElements) {
				const match = child.find(callback);
				if (match) {
					return match;
				}
			}
			return null;
		}

		return visit(this);
	}
}

function isClosed(endToken: Token, meta: MetaElement): NodeClosed {
	let closed = NodeClosed.Open;

	if (meta && meta.void) {
		closed = NodeClosed.VoidOmitted;
	}

	if (endToken.data[0] === "/>") {
		closed = NodeClosed.VoidSelfClosed;
	}

	return closed;
}
