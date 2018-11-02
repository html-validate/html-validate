import { Location } from '../context';
import { Token } from '../lexer';
import { DOMTokenList } from './domtokenlist';
import { MetaTable, MetaElement } from '../meta';
import { Attribute } from './attribute';

export enum NodeClosed {
	Open = 0,            /* element wasn't closed */
	EndTag = 1,          /* element closed with end tag <p>...</p> */
	VoidOmitted = 2,     /* void element with omitted end tag <input> */
	VoidSelfClosed = 3,  /* self-closed void element <input/> */
	ImplicitClosed = 4,   /* element with optional end tag <li>foo<li>bar */
}

let counter = 0;

export function reset(){
	counter = 0;
}

export class DOMNode {
	readonly tagName: string;
	readonly attr: { [key: string]: Attribute; };
	readonly children: Array<DOMNode>;
	readonly location: Location;
	readonly meta: MetaElement;
	readonly parent: DOMNode
	readonly voidElement: boolean;
	readonly unique: number;
	readonly depth: number;
	closed: NodeClosed;

	constructor(tagName: string, parent?: DOMNode, closed: NodeClosed = NodeClosed.EndTag, meta?: MetaElement, location?: Location){
		this.children = [];
		this.tagName = tagName;
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
			let cur: DOMNode = parent;
			while (cur.parent){
				this.depth++;
				cur = cur.parent;
			}
		}
	}

	static rootNode(location: Location) {
		return new DOMNode(undefined, undefined, undefined, undefined, location);
	}

	static fromTokens(startToken: Token, endToken: Token, parent: DOMNode, metaTable: MetaTable){
		const tagName = startToken.data[2];
		if (!tagName){
			throw new Error("tagName cannot be empty");
		}

		const meta = metaTable ? metaTable.getMetaFor(tagName) : null;
		const open = startToken.data[1] !== '/';
		const closed = isClosed(endToken, meta);

		return new DOMNode(tagName, open ? parent : undefined, closed, meta, startToken.location);
	}

	is(tagName: string): boolean {
		return (this.tagName && tagName === '*') || this.tagName === tagName;
	}

	isRootElement(): boolean {
		return typeof this.tagName === 'undefined';
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

	append(node: DOMNode){
		this.children.push(node);
	}

	get classList(){
		return new DOMTokenList(this.getAttributeValue('class'));
	}

	get id(){
		return this.getAttributeValue('id');
	}

	get siblings(){
		return this.parent.children;
	}

	getElementsByTagName(tagName: string): Array<DOMNode> {
		return this.children.reduce(function(matches, node){
			return matches.concat(node.is(tagName) ? [node] : [], node.getElementsByTagName(tagName));
		}, []);
	}

	/**
	 * Visit all nodes from this node and down. Depth first.
	 */
	visitDepthFirst(callback: (node: DOMNode) => void): void {
		function visit(node: DOMNode): void {
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
	someChildren(callback: (node: DOMNode) => boolean){
		return this.children.some(visit);

		function visit(node: DOMNode): boolean {
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
	everyChildren(callback: (node: DOMNode) => boolean){
		return this.children.every(visit);

		function visit(node: DOMNode): boolean {
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
	find(callback: (node: DOMNode) => boolean): DOMNode {
		function visit(node: DOMNode): DOMNode {
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

	if (endToken.data[0] === '/>'){
		closed = NodeClosed.VoidSelfClosed;
	}

	return closed;
}
