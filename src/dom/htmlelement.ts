import { type Location, sliceLocation } from "../context";
import { type TagCloseToken, type TagOpenToken } from "../lexer";
import { type MetaElement, MetaCopyableProperty, setMetaProperty } from "../meta/element";
import { type HtmlElementLike } from "../meta/html-element-like";
import { type MetaTable } from "../meta/table";
import { Attribute } from "./attribute";
import { type CSSStyleDeclaration, parseCssDeclaration } from "./css";
import { DOMNode } from "./domnode";
import { DOMTokenList } from "./domtokenlist";
import { DynamicValue } from "./dynamic-value";
import { NodeType } from "./nodetype";
import { generateIdSelector, Selector } from "./selector";
import { TextNode } from "./text";

const ROLE = Symbol("role");
const TABINDEX = Symbol("tabindex");

declare module "./cache" {
	export interface DOMNodeCache {
		[ROLE]: string;
		[TABINDEX]: number | null;
	}
}

interface HtmlElementDetails {
	nodeType: typeof NodeType.ELEMENT_NODE;
	tagName: string;
	parent: HtmlElement | null;
	closed: NodeClosed;
	meta: MetaElement | null;
	location: Location;
}

interface HtmlElementRootDetails {
	nodeType: typeof NodeType.DOCUMENT_NODE;
	location: Location;
}

/**
 * @public
 */
export enum NodeClosed {
	Open = 0, //            element wasn't closed
	EndTag = 1, //          element closed with end tag <p>...</p>
	VoidOmitted = 2, //     void element with omitted end tag <input>
	VoidSelfClosed = 3, //  self-closed void element <input/>
	ImplicitClosed = 4, //  element with optional end tag <li>foo<li>bar
}

/**
 * Returns true if the node is an element node.
 *
 * @public
 */
export function isElementNode(node: DOMNode | null | undefined): node is HtmlElement {
	return Boolean(node && node.nodeType === NodeType.ELEMENT_NODE);
}

function isInvalidTagName(tagName: string | undefined): tagName is "" | "*" {
	return Boolean(tagName === "" || tagName === "*");
}

function createAdapter(node: HtmlElement): HtmlElementLike {
	return {
		closest(selectors) {
			return node.closest(selectors)?._adapter;
		},
		getAttribute(name) {
			return node.getAttribute(name)?.value;
		},
		hasAttribute(name) {
			return node.hasAttribute(name);
		},
	};
}

/**
 * @public
 */
export class HtmlElement extends DOMNode {
	public readonly tagName: string;
	public readonly voidElement: boolean;
	public readonly depth: number;
	public closed: NodeClosed;
	protected readonly attr: Record<string, Attribute[]>;
	private metaElement: MetaElement | null;
	private annotation: string | null;
	private _parent: HtmlElement | null;

	/** @internal */
	public readonly _adapter: HtmlElementLike;

	private constructor(details: HtmlElementDetails | HtmlElementRootDetails);
	private constructor(details: {
		nodeType: NodeType;
		tagName?: string;
		parent?: HtmlElement | null;
		closed?: NodeClosed;
		meta?: MetaElement | null;
		location: Location;
	}) {
		const {
			nodeType,
			tagName,
			parent = null,
			closed = NodeClosed.EndTag,
			meta = null,
			location,
		} = details;
		super(nodeType, tagName, location);

		if (isInvalidTagName(tagName)) {
			throw new Error(`The tag name provided ("${tagName}") is not a valid name`);
		}

		this.tagName = tagName ?? "#document";
		this._parent = null;
		this.attr = {};
		this.metaElement = meta ?? null;
		this.closed = closed;
		this.voidElement = meta ? Boolean(meta.void) : false;
		this.depth = 0;
		this.annotation = null;
		this._adapter = createAdapter(this);

		if (parent) {
			parent.append(this);

			/* calculate depth in domtree */
			let cur: HtmlElement = parent;
			while (cur.parent) {
				this.depth++;
				cur = cur.parent;
			}
		}
	}

	/**
	 * Manually create a new element. This is primary useful for test-cases. While
	 * the API is public it is not meant for general consumption and is not
	 * guaranteed to be stable across versions.
	 *
	 * Use at your own risk. Prefer to use [[Parser]] to parse a string of markup
	 * instead.
	 *
	 * @public
	 * @since 8.22.0
	 * @param tagName - Element tagname.
	 * @param location - Element location.
	 * @param details - Additional element details.
	 */
	public static createElement(
		tagName: string,
		location: Location,
		details: { closed?: NodeClosed; meta?: MetaElement | null; parent?: HtmlElement } = {},
	): HtmlElement {
		const { closed = NodeClosed.EndTag, meta = null, parent = null } = details;
		return new HtmlElement({
			nodeType: NodeType.ELEMENT_NODE,
			tagName,
			parent,
			closed,
			meta,
			location,
		});
	}

	/**
	 * @internal
	 */
	public static rootNode(location: Location): HtmlElement {
		const root = new HtmlElement({
			nodeType: NodeType.DOCUMENT_NODE,
			location,
		});
		root.setAnnotation("#document");
		return root;
	}

	/**
	 * @internal
	 *
	 * @param namespace - If given it is appended to the tagName.
	 */
	public static fromTokens(
		startToken: TagOpenToken,
		endToken: TagCloseToken,
		parent: HtmlElement | null,
		metaTable: MetaTable | null,
		namespace: string = "",
	): HtmlElement {
		const name = startToken.data[2];
		const tagName = namespace ? `${namespace}:${name}` : name;
		if (!name) {
			throw new Error("tagName cannot be empty");
		}

		const meta = metaTable ? metaTable.getMetaFor(tagName) : null;
		const open = startToken.data[1] !== "/";
		const closed = isClosed(endToken, meta);

		/* location contains position of '<' so strip it out */
		const location = sliceLocation(startToken.location, 1);

		return new HtmlElement({
			nodeType: NodeType.ELEMENT_NODE,
			tagName,
			parent: open ? parent : null,
			closed,
			meta,
			location,
		});
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
	 * Get list of IDs referenced by `aria-labelledby`.
	 *
	 * If the attribute is unset or empty this getter returns null.
	 * If the attribute is dynamic the original {@link DynamicValue} is returned.
	 *
	 * @public
	 */
	public get ariaLabelledby(): string[] | DynamicValue | null {
		const attr = this.getAttribute("aria-labelledby");
		if (!attr?.value) {
			return null;
		}
		if (attr.value instanceof DynamicValue) {
			return attr.value;
		}
		const list = new DOMTokenList(attr.value, attr.valueLocation);
		return list.length ? Array.from(list) : null;
	}

	/**
	 * Similar to childNodes but only elements.
	 */
	public get childElements(): HtmlElement[] {
		return this.childNodes.filter(isElementNode);
	}

	/**
	 * Find the first ancestor matching a selector.
	 *
	 * Implementation of DOM specification of Element.closest(selectors).
	 */
	public closest(selectors: string): HtmlElement | null {
		/* eslint-disable-next-line @typescript-eslint/no-this-alias -- false positive*/
		let node: HtmlElement | null = this;
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
		/* eslint-disable-next-line @typescript-eslint/no-this-alias -- false positive */
		for (root = this; root.parent; root = root.parent) {
			/* .. */
		}

		// eslint-disable-next-line @typescript-eslint/no-this-alias -- false positive
		for (let cur: HtmlElement = this; cur.parent; cur = cur.parent) {
			/* if a unique id is present, use it and short-circuit */
			if (cur.id) {
				const selector = generateIdSelector(cur.id);
				const matches = root.querySelectorAll(selector);
				if (matches.length === 1) {
					parts.push(selector);
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
			parts.push(`${cur.tagName.toLowerCase()}:nth-child(${String(index + 1)})`);
		}

		/* eslint-disable-next-line sonarjs/no-misleading-array-reverse -- technical debt */
		return parts.reverse().join(" > ");
	}

	/**
	 * Tests if this element has given tagname.
	 *
	 * If passing "*" this test will pass if any tagname is set.
	 */
	public is(tagName: string): boolean {
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
			const value = meta[key];
			if (typeof value !== "undefined") {
				setMetaProperty(this.metaElement, key, value);
			} else {
				/* eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- technical debt */
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
	public matches(selectorList: string): boolean {
		return selectorList.split(",").some((it) => {
			const selector = new Selector(it.trim());
			return selector.matchElement(this);
		});
	}

	public get meta(): MetaElement | null {
		return this.metaElement;
	}

	public get parent(): HtmlElement | null {
		return this._parent;
	}

	/**
	 * Get current role for this element (explicit with `role` attribute or mapped
	 * with implicit role).
	 *
	 * @since 8.9.1
	 */
	public get role(): string | DynamicValue | null {
		const cached = this.cacheGet(ROLE);
		if (cached !== undefined) {
			return cached;
		}

		const role = this.getAttribute("role");
		if (role) {
			return this.cacheSet(ROLE, role.value);
		}

		if (this.metaElement) {
			const { aria } = this.metaElement;
			const implicitRole = aria.implicitRole(this._adapter);
			return this.cacheSet(ROLE, implicitRole);
		}

		return this.cacheSet(ROLE, null);
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
		keyLocation: Location,
		valueLocation: Location | null,
		originalAttribute?: string,
	): void {
		key = key.toLowerCase();

		const attr = new Attribute(key, value, keyLocation, valueLocation, originalAttribute);
		const list = this.attr[key] as Attribute[] | undefined;
		if (list) {
			list.push(attr);
		} else {
			this.attr[key] = [attr];
		}
	}

	/**
	 * Get parsed tabindex for this element.
	 *
	 * - If `tabindex` attribute is not present `null` is returned.
	 * - If attribute value is omitted or the empty string `null` is returned.
	 * - If attribute value cannot be parsed `null` is returned.
	 * - If attribute value is dynamic `0` is returned.
	 * - Otherwise the parsed value is returned.
	 *
	 * This property does *NOT* take into account if the element have a default
	 * `tabindex` (such as `<input>` have). Instead use the `focusable` metadata
	 * property to determine this.
	 *
	 * @public
	 * @since 8.16.0
	 */
	public get tabIndex(): number | null {
		const cached = this.cacheGet(TABINDEX);
		if (cached !== undefined) {
			return cached;
		}

		const tabindex = this.getAttribute("tabindex");
		if (!tabindex) {
			return this.cacheSet(TABINDEX, null);
		}

		if (tabindex.value === null) {
			return this.cacheSet(TABINDEX, null);
		}

		if (tabindex.value instanceof DynamicValue) {
			return this.cacheSet(TABINDEX, 0);
		}

		const parsed = parseInt(tabindex.value, 10);
		if (isNaN(parsed)) {
			return this.cacheSet(TABINDEX, null);
		}

		return this.cacheSet(TABINDEX, parsed);
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
	 * @param key - Attribute name
	 * @param all - Return single or all attributes.
	 */
	public getAttribute(key: string): Attribute | null;
	public getAttribute(key: string, all: true): Attribute[];
	public getAttribute(key: string, all: boolean = false): Attribute | Attribute[] | null {
		key = key.toLowerCase();
		if (key in this.attr) {
			const matches = this.attr[key];
			return all ? matches : matches[0];
		} else {
			return all ? [] : null;
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
	 * @param key - Attribute name
	 * @returns Attribute value or null.
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
	public appendText(text: string | DynamicValue, location: Location): void {
		this.childNodes.push(new TextNode(text, location));
	}

	/**
	 * Return a list of all known classes on the element. Dynamic values are
	 * ignored.
	 */
	public get classList(): DOMTokenList {
		if (!this.hasAttribute("class")) {
			return new DOMTokenList(null, null);
		}
		const classes = this.getAttribute("class", true)
			.filter((attr) => attr.isStatic)
			.map((attr) => attr.value)
			.join(" ");
		return new DOMTokenList(classes, null);
	}

	/**
	 * Get element ID if present.
	 */
	public get id(): string | null {
		return this.getAttributeValue("id");
	}

	public get style(): CSSStyleDeclaration {
		const attr = this.getAttribute("style");
		return parseCssDeclaration(attr?.value);
	}

	/**
	 * Returns the first child element or null if there are no child elements.
	 */
	public get firstElementChild(): HtmlElement | null {
		const children = this.childElements;
		return children.length > 0 ? children[0] : null;
	}

	/**
	 * Returns the last child element or null if there are no child elements.
	 */
	public get lastElementChild(): HtmlElement | null {
		const children = this.childElements;
		return children.length > 0 ? children[children.length - 1] : null;
	}

	public get siblings(): HtmlElement[] {
		return this.parent ? this.parent.childElements : [this];
	}

	public get previousSibling(): HtmlElement | null {
		const i = this.siblings.findIndex((node) => node.unique === this.unique);
		return i >= 1 ? this.siblings[i - 1] : null;
	}

	public get nextSibling(): HtmlElement | null {
		const i = this.siblings.findIndex((node) => node.unique === this.unique);
		return i <= this.siblings.length - 2 ? this.siblings[i + 1] : null;
	}

	public getElementsByTagName(tagName: string): HtmlElement[] {
		return this.childElements.reduce<HtmlElement[]>((matches, node) => {
			return matches.concat(node.is(tagName) ? [node] : [], node.getElementsByTagName(tagName));
		}, []);
	}

	public querySelector(selector: string): HtmlElement | null {
		const it = this.querySelectorImpl(selector);
		const next = it.next();
		if (next.done) {
			return null;
		} else {
			return next.value;
		}
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
	 * Evaluates callbackk on all descendants, returning true if any are true.
	 *
	 * @internal
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
	 *
	 * @internal
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
	 *
	 * @internal
	 */
	public find(callback: (node: HtmlElement) => boolean): HtmlElement | null {
		function visit(node: HtmlElement): HtmlElement | null {
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

	/**
	 * @internal
	 */
	public override _setParent(node: DOMNode | null): DOMNode | null {
		const oldParent = this._parent;
		this._parent = node instanceof HtmlElement ? node : null;
		return oldParent;
	}
}

function isClosed(endToken: TagCloseToken, meta: MetaElement | null): NodeClosed {
	let closed = NodeClosed.Open;

	if (meta?.void) {
		closed = NodeClosed.VoidOmitted;
	}

	if (endToken.data[0] === "/>") {
		closed = NodeClosed.VoidSelfClosed;
	}

	return closed;
}
