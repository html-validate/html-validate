import { LocationData, Token } from '../lexer';
import { DOMTokenList } from './domtokenlist';
import { MetaTable, MetaElement } from '../meta';

export enum NodeClosed {
	Open = 0,          /* element wasn't closed */
	EndTag = 1,        /* element closed with end tag <p>...</p> */
	Omitted = 2,       /* void element with omitted end tag <input> */
	Self = 3,          /* self-closed void element <input/> */
}

export class DOMNode {
	readonly tagName: string;
	readonly attr: { [key: string]: string; };
	readonly children: Array<DOMNode>;
	readonly location: LocationData;
	readonly meta: MetaElement;
	readonly parent: DOMNode
	readonly voidElement: boolean;
	closed: NodeClosed;

	constructor(tagName: string, parent?: DOMNode, closed: NodeClosed = NodeClosed.EndTag, meta?: MetaElement, location?: LocationData){
		this.children = [];
		this.tagName = tagName;
		this.parent = parent;
		this.attr = {};
		this.meta = meta;
		this.closed = closed;
		this.voidElement = this.meta ? this.meta.void : false;
		this.location = location;

		if (parent){
			parent.children.push(this);
		}
	}

	static rootNode() {
		return new DOMNode(undefined, undefined);
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

	setAttribute(key: string, value: any){
		key = key.toLowerCase();
		this.attr[key] = value;
	}

	hasAttribute(key: string){
		key = key.toLowerCase();
		return key in this.attr;
	}

	getAttribute(key: string){
		key = key.toLowerCase();
		if (key in this.attr){
			return this.attr[key];
		} else {
			return null;
		}
	}

	append(node: DOMNode){
		this.children.push(node);
	}

	get classList(){
		return new DOMTokenList(this.getAttribute('class'));
	}

	get id(){
		return this.getAttribute('id');
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
		closed = NodeClosed.Omitted;
	}

	if (endToken.data[0] === '/>'){
		closed = NodeClosed.Self;
	}

	return closed;
}
