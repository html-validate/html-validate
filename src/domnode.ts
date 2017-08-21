/* eslint-disable no-unused-vars */
import { LocationData } from './context';
import Config from './config';
import { Token } from './token';
import { DOMTokenList } from './domtokenlist';
/* eslint-enable no-unused-vars */

class DOMNode {
	children: Array<DOMNode>;
	tagName: string;
	parent: DOMNode
	attr: { [key: string]: string; };
	open: boolean;
	closed: boolean;
	selfClosed: boolean;
	voidElement: boolean;
	location: LocationData;

	constructor(tagName: string, parent?: DOMNode, location?: LocationData){
		this.children = [];
		this.tagName = tagName;
		this.parent = parent;
		this.attr = {};
		this.open = true;
		this.closed = false;
		this.selfClosed = false;
		this.voidElement = false;
		this.location = location;

		if (parent){
			parent.children.push(this);
		}
	}

	static rootNode() {
		return new DOMNode(undefined, undefined);
	}

	static fromTokens(startToken: Token, endToken: Token, parent: DOMNode, config: Config){
		const tagName = startToken.data[2];
		if (!tagName){
			throw new Error("tagName cannot be empty");
		}
		const node = new DOMNode(tagName, undefined, startToken.location);
		node.selfClosed = endToken.data[0] === '/>';
		node.voidElement = config.isVoidElement(node.tagName);
		node.open = startToken.data[1] !== '/';
		node.closed = node.selfClosed || node.voidElement;

		/* deferring setting the parent until open/closed is resolved so
		 * close tags isn't added to the parent. */
		if (node.open && parent){
			node.parent = parent;
			parent.children.push(node);
		}

		return node;
	}

	is(tagName: string): boolean {
		return (this.tagName && tagName === '*') || this.tagName === tagName;
	}

	isRootElement(): boolean {
		return typeof this.tagName === 'undefined';
	}

	setAttribute(key: string, value: any){
		this.attr[key] = value;
	}

	getAttribute(key: string){
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
			callback(node);
		}

		visit(this);
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

export default DOMNode;
