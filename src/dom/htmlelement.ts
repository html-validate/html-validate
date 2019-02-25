import { Location, sliceLocation } from "../context";
import { Token } from "../lexer";
import { MetaElement, MetaTable } from "../meta";
import { Attribute } from "./attribute";
import { DOMNode, NodeType } from "./domnode";
import { DOMTokenList } from "./domtokenlist";
import { DynamicValue } from "./dynamic-value";
import { Selector } from "./selector";

export enum NodeClosed {
	Open = 0, //            element wasn't closed
	EndTag = 1, //          element closed with end tag <p>...</p>
	VoidOmitted = 2, //     void element with omitted end tag <input>
	VoidSelfClosed = 3, //  self-closed void element <input/>
	ImplicitClosed = 4, //  element with optional end tag <li>foo<li>bar
}

export class HtmlElement extends DOMNode {
	public readonly tagName: string;
	public readonly meta: MetaElement;
	public readonly parent: HtmlElement;
	public readonly voidElement: boolean;
	public readonly depth: number;
	public closed: NodeClosed;
	protected readonly attr: { [key: string]: Attribute[] };

	constructor(
		tagName: string,
		parent?: HtmlElement,
		closed: NodeClosed = NodeClosed.EndTag,
		meta?: MetaElement,
		location?: Location
	) {
		super(tagName, location);

		this.tagName = tagName;
		this.parent = parent;
		this.attr = {};
		this.meta = meta;
		this.closed = closed;
		this.voidElement = this.meta ? this.meta.void : false;
		this.depth = 0;

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

	public static rootNode(location: Location) {
		return new HtmlElement(
			undefined,
			undefined,
			undefined,
			undefined,
			location
		);
	}

	public static fromTokens(
		startToken: Token,
		endToken: Token,
		parent: HtmlElement,
		metaTable: MetaTable
	) {
		const tagName = startToken.data[2];
		if (!tagName) {
			throw new Error("tagName cannot be empty");
		}

		const meta = metaTable ? metaTable.getMetaFor(tagName) : null;
		const open = startToken.data[1] !== "/";
		const closed = isClosed(endToken, meta);

		/* location contains position of '<' so strip it out */
		const location = sliceLocation(startToken.location, 1);

		return new HtmlElement(
			tagName,
			open ? parent : undefined,
			closed,
			meta,
			location
		);
	}

	/**
	 * Similar to childNodes but only elements.
	 */
	public get childElements(): HtmlElement[] {
		return this.childNodes.filter(
			node => node.nodeType === NodeType.ELEMENT_NODE
		) as HtmlElement[];
	}

	public is(tagName: string): boolean {
		return (this.tagName && tagName === "*") || this.tagName === tagName;
	}

	public setAttribute(
		key: string,
		value: string | DynamicValue,
		keyLocation: Location,
		valueLocation: Location,
		originalAttribute?: string
	): void {
		key = key.toLowerCase();

		if (!this.attr[key]) {
			this.attr[key] = [];
		}

		this.attr[key].push(
			new Attribute(key, value, keyLocation, valueLocation, originalAttribute)
		);
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
	public getAttribute(
		key: string,
		all: boolean = false
	): Attribute | Attribute[] {
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
	public getAttributeValue(key: string): string {
		const attr = this.getAttribute(key);
		if (attr) {
			return attr.value !== null ? attr.value.toString() : null;
		} else {
			return null;
		}
	}

	/**
	 * Return a list of all known classes on the element. Dynamic values are
	 * ignored.
	 */
	get classList(): DOMTokenList {
		if (!this.hasAttribute("class")) {
			return new DOMTokenList(null);
		}
		const classes = this.getAttribute("class", true)
			.filter(attr => attr.isStatic)
			.map(attr => attr.value)
			.join(" ");
		return new DOMTokenList(classes);
	}

	get id() {
		return this.getAttributeValue("id");
	}

	get siblings(): HtmlElement[] {
		return this.parent.childElements;
	}

	get previousSibling(): HtmlElement {
		const i = this.siblings.findIndex(node => node.unique === this.unique);
		return i >= 1 ? this.siblings[i - 1] : null;
	}

	get nextSibling(): HtmlElement {
		const i = this.siblings.findIndex(node => node.unique === this.unique);
		return i <= this.siblings.length - 2 ? this.siblings[i + 1] : null;
	}

	public getElementsByTagName(tagName: string): HtmlElement[] {
		return this.childElements.reduce((matches, node) => {
			return matches.concat(
				node.is(tagName) ? [node] : [],
				node.getElementsByTagName(tagName)
			);
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

	private *querySelectorImpl(
		selectorList: string
	): IterableIterator<HtmlElement> {
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
	public someChildren(callback: (node: HtmlElement) => boolean) {
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
	public everyChildren(callback: (node: HtmlElement) => boolean) {
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
