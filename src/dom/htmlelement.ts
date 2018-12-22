import { Location } from "../context";
import { Token } from "../lexer";
import { MetaElement, MetaTable } from "../meta";
import { Attribute } from "./attribute";
import { DOMNode } from "./domnode";
import { DOMTokenList } from "./domtokenlist";
import { Selector } from "./selector";

export enum NodeClosed {
	Open = 0,            /* element wasn't closed */
	EndTag = 1,          /* element closed with end tag <p>...</p> */
	VoidOmitted = 2,     /* void element with omitted end tag <input> */
	VoidSelfClosed = 3,  /* self-closed void element <input/> */
	ImplicitClosed = 4,  /* element with optional end tag <li>foo<li>bar */
}

const DOCUMENT_NODE_NAME = "#document";

let counter = 0;

export function reset(){
	counter = 0;
}

export class HtmlElement extends DOMNode {
	readonly tagName: string;
	readonly attr: { [key: string]: Attribute; };
	readonly children: Array<HtmlElement>;
	readonly location: Location;
	readonly meta: MetaElement;
	readonly parent: HtmlElement;
	readonly voidElement: boolean;
	readonly unique: number;
	readonly depth: number;
	closed: NodeClosed;

	constructor(tagName: string, parent?: HtmlElement, closed: NodeClosed = NodeClosed.EndTag, meta?: MetaElement, location?: Location){
		super(tagName || DOCUMENT_NODE_NAME);

		this.tagName = tagName;
		this.children = [];
		this.parent = parent;
		this.attr = {};
		this.meta = meta;
		this.closed = closed;
		this.voidElement = this.meta ? this.meta.void : false;
		this.location = location;
		this.unique = counter++;
		this.depth = 0;

		if (parent){
			parent.children.push(this);

			/* calculate depth in domtree */
			let cur: HtmlElement = parent;
			while (cur.parent){
				this.depth++;
				cur = cur.parent;
			}
		}
	}

	static rootNode(location: Location) {
		return new HtmlElement(undefined, undefined, undefined, undefined, location);
	}

	static fromTokens(startToken: Token, endToken: Token, parent: HtmlElement, metaTable: MetaTable){
		const tagName = startToken.data[2];
		if (!tagName){
			throw new Error("tagName cannot be empty");
		}

		const meta = metaTable ? metaTable.getMetaFor(tagName) : null;
		const open = startToken.data[1] !== "/";
		const closed = isClosed(endToken, meta);

		return new HtmlElement(tagName, open ? parent : undefined, closed, meta, startToken.location);
	}

	is(tagName: string): boolean {
		return (this.tagName && tagName === "*") || this.tagName === tagName;
	}

	isRootElement(): boolean {
		return this.nodeName === DOCUMENT_NODE_NAME;
	}

	setAttribute(key: string, value: string, location: Location): void {
		key = key.toLowerCase();
		this.attr[key] = new Attribute(key, value, location);
	}

	hasAttribute(key: string): boolean {
		key = key.toLowerCase();
		return key in this.attr;
	}

	getAttribute(key: string): Attribute {
		key = key.toLowerCase();
		if (key in this.attr){
			return this.attr[key];
		} else {
			return null;
		}
	}

	getAttributeValue(key: string): string {
		const attr = this.getAttribute(key);
		return attr ? attr.value : null;
	}

	append(node: HtmlElement){
		this.children.push(node);
	}

	get classList(){
		return new DOMTokenList(this.getAttributeValue("class"));
	}

	get id(){
		return this.getAttributeValue("id");
	}

	get siblings(){
		return this.parent.children;
	}

	get previousSibling(): HtmlElement {
		const i = this.siblings.findIndex((node) => node.unique === this.unique);
		return i >= 1 ? this.siblings[i - 1] : null;
	}

	get nextSibling(): HtmlElement {
		const i = this.siblings.findIndex((node) => node.unique === this.unique);
		return i <= (this.siblings.length - 2) ? this.siblings[i + 1] : null;
	}

	getElementsByTagName(tagName: string): Array<HtmlElement> {
		return this.children.reduce((matches, node) => {
			return matches.concat(node.is(tagName) ? [node] : [], node.getElementsByTagName(tagName));
		}, []);
	}

	querySelector(selector: string): HtmlElement {
		const it = this.querySelectorImpl(selector);
		return it.next().value || null;
	}

	querySelectorAll(selector: string): HtmlElement[] {
		const it = this.querySelectorImpl(selector);
		return Array.from(it);
	}

	private *querySelectorImpl(selector: string): IterableIterator<HtmlElement> {
		const pattern = new Selector(selector);
		yield* pattern.match(this);
	}

	/**
	 * Visit all nodes from this node and down. Depth first.
	 */
	visitDepthFirst(callback: (node: HtmlElement) => void): void {
		function visit(node: HtmlElement): void {
			node.children.forEach(visit);
			if (!node.isRootElement()){
				callback(node);
			}
		}

		visit(this);
	}

	/**
	 * Evaluates callbackk on all descendants, returning true if any are true.
	 */
	someChildren(callback: (node: HtmlElement) => boolean){
		return this.children.some(visit);

		function visit(node: HtmlElement): boolean {
			if (callback(node)){
				return true;
			} else {
				return node.children.some(visit);
			}
		}
	}

	/**
	 * Evaluates callbackk on all descendants, returning true if all are true.
	 */
	everyChildren(callback: (node: HtmlElement) => boolean){
		return this.children.every(visit);

		function visit(node: HtmlElement): boolean {
			if (!callback(node)){
				return false;
			}
			return node.children.every(visit);
		}
	}

	/**
	 * Visit all nodes from this node and down. Breadth first.
	 *
	 * The first node for which the callback evaluates to true is returned.
	 */
	find(callback: (node: HtmlElement) => boolean): HtmlElement {
		function visit(node: HtmlElement): HtmlElement {
			if (callback(node)){
				return node;
			}
			for (const child of node.children){
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

	if (meta && meta.void){
		closed = NodeClosed.VoidOmitted;
	}

	if (endToken.data[0] === "/>"){
		closed = NodeClosed.VoidSelfClosed;
	}

	return closed;
}
